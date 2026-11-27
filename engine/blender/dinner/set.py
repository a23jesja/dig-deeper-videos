# The Short "The captain's dinner" (24 Nov 2026, evening): the step-1 cabin (built exactly as blender/cabin/set.py, via blender/moves/set.py's
# copy), with the captain's low stool at his seat (placed and sized from the rig's own seat, props/seat.json), his dinner plate on the table's
# right end and on it a pudding of our own (a dome, cream and a cherry, built here), which a crewman takes: its place every frame comes from the
# hand that holds it (props/<shot>.json, scripts/dinner_props.mjs). A shot marked "static" renders its first frame only (the camera holds).
# 3D step 2 (24 Nov 2026): the movement sheet's plates. The cabin is built exactly as blender/cabin/set.py builds it for step 1 (the same
# room, the same Poly Haven CC0 models and textures from blender/cabin/, the same evening light), without step 1's flying papers; the
# movement pieces add their own things below. blender/cabin/set.py itself is not changed (v57 stays reproducible).
#   blender -b --factory-startup --disable-autoexec --python set.py -- <shot|all> [--draft] [--frames a-b] [--cams-only] [--maps-only]
# Writes public/mov3d/<id>/NNNN.jpg, src/craft/moves3d/cam/<id>.json and out/mov3d/<id>/map.npz.
# 3D step 1 (23 Nov 2026, night): the captain's cabin at sunset, rendered as background plates for the flat Knopp figures.
# The room is built here from boxes with Poly Haven's CC0 plank and wood textures; the things in it are Poly Haven's CC0 glTF models
# (assets/<id>/, each with its file list; licences in granskning/3d/licenser.md). No .blend files, no scripts from any pack.
# One motivated light: the low evening sun through the three stern windows (warm, from behind, toward the lens), the sky's warm bounce off
# the windows, a dark warm ground light. The treasure map (our own drawing) lies on the floor under the captain's boot.
#   blender -b --factory-startup --disable-autoexec --python set.py -- <A|B|C|all> [--draft] [--frames a-b] [--cams-only] [--maps-only]
# Writes public/cab3d/<id>/NNNN.jpg (the plate), src/craft/cabin3d/cam/<id>.json (each frame's projection world -> pixel) and
# out/cab3d/<id>/map.npz (each frame's floor and solid map: a ray per 20 x 20 pixels, what it hits first and how far).
import bpy, bmesh, bisect, json, math, os, sys, time
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__)); ENGINE = os.path.abspath(os.path.join(HERE, "..", ".."))
CAB = os.path.join(HERE, "..", "cabin"); A = os.path.join(CAB, "assets"); T = os.path.join(CAB, "tex")      # (the cabin's own CC0 models and textures, shared)
SPEC = json.load(open(os.path.join(ENGINE, "src", "craft", "dinner3d", "shots.json")))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
WHICH = argv[0] if argv else "all"; DRAFT = "--draft" in argv; CAMS_ONLY = "--cams-only" in argv; FR = None
if "--frames" in argv: a, b = argv[argv.index("--frames") + 1].split("-"); FR = (int(a), int(b))
W, H, FPS = SPEC["W"], SPEC["H"], SPEC["fps"]; GRID = 20; MAPS_ONLY = "--maps-only" in argv      # (a ray per 20 x 20 px: enough to find a thing nearer than a figure)

def hexc(h, a=1.0): h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c] + [a]

# ------------------------------------------------------------------ the scene ------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS; sc.render.resolution_x = W; sc.render.resolution_y = H
sc.render.resolution_percentage = 50 if DRAFT else 100
sc.render.engine = "CYCLES"; sc.cycles.samples = 16 if DRAFT else int(os.environ.get("CAB_SAMPLES", 80)); sc.cycles.use_denoising = True
sc.cycles.seed = 7; sc.cycles.use_animated_seed = False      # the same noise every frame, so a still picture does not crawl (the flicker rule)
sc.cycles.max_bounces = 6; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "HIP"; pr.get_devices()
for d in pr.devices: d.use = d.type == "HIP"
sc.cycles.device = "GPU" if any(d.use for d in pr.devices) else "CPU"
sc.view_settings.view_transform = "AgX"
looks = [i.identifier for i in sc.view_settings.bl_rna.properties["look"].enum_items]
if "AgX - Medium High Contrast" in looks: sc.view_settings.look = "AgX - Medium High Contrast"
sc.view_settings.exposure = 1.25
sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 94
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs[0].default_value = hexc("#3b2a26"); bg.inputs[1].default_value = 0.35
OBJ = {}      # object name -> kind, for the solid map ("floor", "wall", "prop", "paper", "map")

# ------------------------------------------------------------------ materials ------------------------------------------------------------------
def pbr(name, scale=1.0, tint=None, rough_mul=1.0):
    """a Poly Haven texture set (diff, nor_gl, rough) on box projection in object space, repeated every 1/scale metres"""
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links; bsdf = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale, scale, scale); L.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(kind, non_color):
        p = os.path.join(A, name, f"{name}_{kind}_2k.jpg"); t = n.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(p); t.projection = "BOX"; t.projection_blend = 0.25
        if non_color: t.image.colorspace_settings.name = "Non-Color"
        L.new(mp.outputs["Vector"], t.inputs["Vector"]); return t
    d = img("diff", False)
    if tint:
        mix = n.new("ShaderNodeMix"); mix.data_type = "RGBA"; mix.blend_type = "MULTIPLY"; mix.inputs["Factor"].default_value = 1.0
        L.new(d.outputs["Color"], mix.inputs[6]); mix.inputs[7].default_value = hexc(tint); L.new(mix.outputs[2], bsdf.inputs["Base Color"])
    else: L.new(d.outputs["Color"], bsdf.inputs["Base Color"])
    r = img("rough", True); rm = n.new("ShaderNodeMath"); rm.operation = "MULTIPLY"; rm.inputs[1].default_value = rough_mul; L.new(r.outputs["Color"], rm.inputs[0]); L.new(rm.outputs[0], bsdf.inputs["Roughness"])
    nm = img("nor_gl", True); nmap = n.new("ShaderNodeNormalMap"); nmap.inputs["Strength"].default_value = 0.8; L.new(nm.outputs["Color"], nmap.inputs["Color"]); L.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    return m

def flat_img(name, path, emit=0.0, rough=0.85, glow=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links; bsdf = n["Principled BSDF"]
    t = n.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(path); L.new(t.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = rough
    if glow:      # (a little light of its own on top of the lit surface: the papers read bright against the dark table, v29)
        L.new(t.outputs["Color"], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = glow
    if emit:      # (a picture that only shines: no light falls on it, so the sun does not wash it out)
        em = n.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = emit; L.new(t.outputs["Color"], em.inputs["Color"]); L.new(em.outputs[0], n["Material Output"].inputs["Surface"])
    return m

FLOOR = pbr("old_wooden_floor_02", 0.55); WALL = pbr("dark_wooden_planks", 0.8, "#e0b486"); BEAM = pbr("rough_wood", 1.2, "#8a6040"); FRAME = pbr("beam_wall_01", 1.6, "#a07850")

def box(name, kind, x0, x1, y0, y1, z0, z1, m):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); o.scale = (x1 - x0, y1 - y0, z1 - z0); o.data.materials.append(m)
    bpy.context.view_layer.update(); o.data.transform(Matrix.Diagonal((x1 - x0, y1 - y0, z1 - z0, 1))); o.scale = (1, 1, 1)      # (the size in the mesh, so the texture's object space is in metres)
    OBJ[name] = kind; return o

def plane(name, kind, c, w, d, rotz, m, z=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops: co = l.vert.co; l[uv].uv = (co.x + 0.5, co.y + 0.5)
    bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.location = (c[0], c[1], z); o.scale = (w, d, 1); o.rotation_euler = (0, 0, math.radians(rotz)); o.data.materials.append(m); OBJ[name] = kind; return o

# ------------------------------------------------------------------ the room ------------------------------------------------------------------
X0, X1, Y0, Y1, ZT = -2.4, 2.4, -4.4, 3.2, 2.45      # (v6: the cabin 1.2 m longer toward the lens, so a camera can stand back far enough for a waist-up 9:16 shot of a Knopp head; the stern end as step 1)
box("floor", "floor", X0, X1, Y0, Y1, -0.06, 0.0, FLOOR)
box("wall L", "wall", X0 - 0.1, X0, Y0, Y1, 0, ZT, WALL); box("wall R", "wall", X1, X1 + 0.1, Y0, Y1, 0, ZT, WALL)
box("ceiling", "wall", X0, X1, Y0, Y1 + 0.1, ZT, ZT + 0.08, WALL)
for k in range(13): y = Y0 + 0.3 + k * 0.6; box(f"beam{k}", "wall", X0, X1, y - 0.07, y + 0.07, ZT - 0.16, ZT, BEAM)
# the back wall with three stern windows (openings x -1.6..-0.7, -0.45..0.45, 0.7..1.6, z 0.95..1.85) and their frames and mullions
WIN = [(-1.6, -0.7), (-0.45, 0.45), (0.7, 1.6)]; WZ = (0.95, 1.85); YB = Y1
box("back low", "wall", X0, X1, YB, YB + 0.12, 0, WZ[0], WALL); box("back high", "wall", X0, X1, YB, YB + 0.12, WZ[1], ZT, WALL)
xs = [X0] + [v for w in WIN for v in w] + [X1]
for k in range(0, len(xs), 2): box(f"back pier{k}", "wall", xs[k], xs[k + 1], YB, YB + 0.12, WZ[0], WZ[1], WALL)
for i, (a, b) in enumerate(WIN):
    for (u0, u1, v0, v1) in [(a - 0.05, a, WZ[0] - 0.05, WZ[1] + 0.05), (b, b + 0.05, WZ[0] - 0.05, WZ[1] + 0.05), (a, b, WZ[0] - 0.05, WZ[0]), (a, b, WZ[1], WZ[1] + 0.05)]:
        box(f"win{i} frame{u0:.2f}{v0:.2f}", "wall", u0, u1, YB - 0.04, YB + 0.02, v0, v1, FRAME)
    m = (a + b) / 2; box(f"win{i} mull v", "wall", m - 0.02, m + 0.02, YB - 0.03, YB + 0.01, WZ[0], WZ[1], FRAME)
    for zz in (WZ[0] + 0.3, WZ[0] + 0.6): box(f"win{i} mull h{zz:.2f}", "wall", a, b, YB - 0.03, YB + 0.01, zz - 0.018, zz + 0.018, FRAME)
    box(f"win{i} sill", "wall", a - 0.1, b + 0.1, YB - 0.16, YB, WZ[0] - 0.06, WZ[0] - 0.01, BEAM)
# the evening sky and sea beyond (an emitting picture, our own)
sky = plane("sky", "wall", (0.0, YB + 3.0), 7.0, 2.4, 0, flat_img("sky", os.path.join(T, "sky.png"), emit=1.0, rough=1.0)); sky.visible_shadow = False      # (seen through the windows, but it does not shade the sun)
sky.rotation_euler = (math.radians(90), 0, 0); sky.location = (0.2, YB + 2.2, 1.55)      # (the horizon at about 1.26 m, in the windows, the sun and its path on the sea seen through them)

# ------------------------------------------------------------------ the things (Poly Haven CC0 glTF) ------------------------------------------------------------------
def imp(asset, loc, rotz=0.0, s=1.0, kind="prop"):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(A, asset, f"{asset}_1k.gltf"))
    new = [o for o in bpy.data.objects if o not in before]; root = bpy.data.objects.new(asset + " root", None); sc.collection.objects.link(root)
    for o in new:
        if o.parent is None: o.parent = root
        if o.type == "MESH": OBJ[o.name.split(".")[0]] = kind
    root.location = loc; root.rotation_euler = (0, 0, math.radians(rotz)); root.scale = (s, s, s); return root

TABLE = (-1.015, 1.11);      # (its front edge just behind the captain, its right end beside him: the flat figure is never behind any part of it)
TS = 1.0; TOP = 0.488 * TS      # (the table at its own size, 0.49 m: at the waist of our figures, whose big heads make their hips low)
imp("gallinera_table", (TABLE[0], TABLE[1], 0), 4, TS)
pass      # (v6: no compass at the table's right front, where the captain's plate now lies)
imp("dutch_ship_medium", (TABLE[0] - 0.22, TABLE[1] + 0.12, TOP + 0.03), 70, 0.0145)
imp("wooden_candlestick", (TABLE[0] + 0.1, TABLE[1] + 0.2, TOP), 0, 1.0)
imp("carved_wooden_plate", (TABLE[0] + 0.32, TABLE[1] + 0.16, TOP), 0, 1.0)
imp("jug_01", (TABLE[0] - 0.42, TABLE[1] - 0.1, TOP), 120, 1.0)
imp("vintage_oil_lamp", (TABLE[0] - 0.05, TABLE[1] + 0.26, TOP), 0, 0.55)
CHEST = imp("treasure_chest", (1.55, 2.45, 0), -18, 1.0); CHEST_HOME = (CHEST.location.copy(), CHEST.rotation_euler.copy(), CHEST.scale.copy())      # (step 2: carried in piece S2, moved by props/S2.json)
imp("wine_barrel_01", (-1.85, 2.55, 0), 20, 1.0); imp("barrel_03", (-1.95, 1.95, 0), 0, 0.95); imp("barrel_03", (-1.4, 2.75, 0), 40, 0.9)
imp("wooden_crate_01", (1.95, 1.3, 0), 88, 1.0); imp("wooden_crate_01", (1.95, 1.3, 0.35), 80, 0.9)
pass      # (no bookshelf in the Short: at the left wall it stood in front of the boy and the crewman, the depth check)
STOOL = imp("wooden_stool_01", (0.25, 2.15, 0), 15, 1.0, kind="seat");      # (its own kind in the depth map: the captain sits on it, his legs round its legs: contact, as step 1's papers at a hand)
STOOL_HOME = STOOL.location.copy()      # (moved out of S2: behind the carried chest its legs read as the chest's own, the first full-size still)
lantern = imp("wooden_lantern_01", (-1.15, 1.55, 1.62), 0, 1.0)      # (over the table, off the top of his cap: at x -0.62 it sat on his head in A and D1, v45)
imp("wooden_lantern_01", (1.93, 1.24, 0.66), 25, 1.0)      # (a second lantern standing on the crates by the boy, lit: the side wall behind him read as an empty dark wall, v39)
LL = bpy.data.lights.new("crate lantern", "POINT"); LL.energy = 48; LL.color = (1.0, 0.66, 0.34); LL.shadow_soft_size = 0.05; LLo = bpy.data.objects.new("crate lantern", LL); sc.collection.objects.link(LLo); LLo.location = (1.86, 1.14, 0.84)      # (a little in front of the lantern's glass, so its glow reaches the wall and the crates)
# a warm beam from the stern windows' side across the boy and the side wall behind him (B1, B2): v39's boy stood against a near-black wall
BS = bpy.data.lights.new("boy beam", "SPOT"); BS.energy = 260; BS.color = (1.0, 0.72, 0.42); BS.spot_size = math.radians(34); BS.spot_blend = 0.8; BS.shadow_soft_size = 0.3
BSo = bpy.data.objects.new("boy beam", BS); sc.collection.objects.link(BSo); BSo.location = (0.7, 2.9, 1.7); BSo.rotation_euler = (Vector((1.6, 0.55, 0.5)) - Vector((0.7, 2.9, 1.7))).to_track_quat("-Z", "Y").to_euler()
box("lantern chain", "prop", -1.155, -1.145, 1.545, 1.555, 2.14, ZT - 0.16, BEAM)
# the treasure map flat on the floor, under the captain's boot (our own drawing)
# the dinner: a plate on the table's right end, and on it the pudding (our own: a dark dome, cream over its top, a cherry)
DPLATE = imp("carved_wooden_plate", tuple(SPEC["plate"]) + (TOP,), 0, 0.9)
def mat(name, col, rough=0.5, spec=0.3):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = hexc(col); b.inputs["Roughness"].default_value = rough; return m
PUD = bpy.data.objects.new("pudding", None); sc.collection.objects.link(PUD)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24); dome = bpy.context.object; dome.name = "pudding dome"; dome.scale = (0.07, 0.07, 0.062); dome.data.materials.append(mat("pud", "#8a4320", 0.5))
bm = bmesh.new(); bm.from_mesh(dome.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.02], context="VERTS"); bm.to_mesh(dome.data); bm.free()
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=48, ring_count=24); cream = bpy.context.object; cream.name = "pudding cream"; cream.scale = (0.052, 0.052, 0.03); cream.location = (0, 0, 0.05); cream.data.materials.append(mat("cream", "#f4ecd8", 0.35))
bm = bmesh.new(); bm.from_mesh(cream.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 0.1], context="VERTS"); bm.to_mesh(cream.data); bm.free()
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.016, segments=24, ring_count=12); cherry = bpy.context.object; cherry.name = "pudding cherry"; cherry.location = (0, 0, 0.088); cherry.data.materials.append(mat("cherry", "#b3121c", 0.25))
for o in (dome, cream, cherry): o.parent = PUD; OBJ[o.name] = "food"
PUD_HOME = (SPEC["plate"][0], SPEC["plate"][1], TOP + 0.022 * 1.8)
PUD.location = (0, 50, -5); PUD.scale = (2.3, 2.3, 2.3)      # (v6: the pudding is drawn flat in the sailor's ink, held in his two-layer hand (the reviewer, 25 Nov): the 3D one is never in the picture)
# v6: the book from 1724 on the table beside the sailor (our own: worn dark leather covers, the cream block of its pages, no title, no text)
BK = SPEC["book"]; book = bpy.data.objects.new("book", None); sc.collection.objects.link(book)
LEATHER = mat("leather", "#4a2a18", 0.62); PAGES = mat("pages", "#e6d6b0", 0.9)
for nm, (x0, x1, y0, y1, z0, z1, m_) in {"book cover low": (-0.13, 0.13, -0.095, 0.095, 0, 0.012, LEATHER), "book pages": (-0.122, 0.126, -0.088, 0.088, 0.012, 0.047, PAGES),
                                        "book cover top": (-0.13, 0.13, -0.095, 0.095, 0.047, 0.059, LEATHER), "book spine": (-0.136, -0.122, -0.095, 0.095, 0, 0.059, LEATHER)}.items():
    o = box(nm, "book", x0, x1, y0, y1, z0, z1, m_); o.parent = book
book.location = (BK[0], BK[1], TOP); book.rotation_euler = (0, 0, math.radians(14))
# v6: the captain's seat, a low sea chest wider than his hips (the figure sheet's review: on the stool his broad seat hung off its edge), its
# top at the rig's seat, its long side across his way (props/seat.json "chest": x, y, top, the turn in degrees)
IRON = mat("iron", "#2a2522", 0.45)
SEATC = json.load(open(os.path.join(ENGINE, "src", "craft", "dinner3d", "props", "seat.json")))["things"]
CH = next((t["frames"][0] for t in SEATC if t["name"] == "chest"), None)
if CH:
    chest = bpy.data.objects.new("sea chest", None); sc.collection.objects.link(chest); top = CH[2]
    for nm, (x0, x1, y0, y1, z0, z1, m_) in {"sea chest body": (-0.27, 0.27, -0.19, 0.19, 0.0, top - 0.04, BEAM), "sea chest lid": (-0.28, 0.28, -0.2, 0.2, top - 0.04, top, BEAM),
                                            "sea chest band L": (-0.2, -0.17, -0.2, 0.2, 0.0, top + 0.002, IRON), "sea chest band R": (0.17, 0.2, -0.2, 0.2, 0.0, top + 0.002, IRON)}.items():
        o = box(nm, "seat", x0, x1, y0, y1, z0, z1, m_); o.parent = chest
    chest.location = (CH[0], CH[1], 0); chest.rotation_euler = (0, 0, math.radians(CH[3]))
    SEAT_HOME = chest.location.copy()      # (the cheat per shot moves it with the captain: shots.json "cheat")
MP = SPEC["map"]; plane("treasure map", "map", MP["at"], MP["w"], MP["d"], MP["rot"], flat_img("map", os.path.join(T, "map.png"), rough=0.9, glow=0.0), z=0.002)      # (a little light of its own: the red X read pale in the boot's shade, v31)

# ------------------------------------------------------------------ the light ------------------------------------------------------------------
sun = bpy.data.lights.new("evening sun", "SUN"); sun.color = hexc("#ffb36e")[:3]; sun.energy = 7.5; sun.angle = math.radians(2.5)
so = bpy.data.objects.new("evening sun", sun); sc.collection.objects.link(so)
so.rotation_euler = Vector((0, -1.0, -0.42)).to_track_quat("-Z", "Y").to_euler()      # (from the sky behind the stern windows, low, toward the lens)
for i, (a, b) in enumerate(WIN):      # the warm sky's bounce through each window, into the room
    L = bpy.data.lights.new(f"window glow{i}", "AREA"); L.shape = "RECTANGLE"; L.size = b - a; L.size_y = WZ[1] - WZ[0]; L.color = hexc("#ffc890")[:3]; L.energy = 160
    o = bpy.data.objects.new(f"window glow{i}", L); sc.collection.objects.link(o); o.visible_camera = False; o.location = ((a + b) / 2, YB - 0.08, (WZ[0] + WZ[1]) / 2); o.rotation_euler = (math.radians(90), 0, 0)
fill = bpy.data.lights.new("ground bounce", "AREA"); fill.size = 3.0; fill.color = hexc("#6a4a3a")[:3]; fill.energy = 110
fo = bpy.data.objects.new("ground bounce", fill); sc.collection.objects.link(fo); fo.visible_camera = False; fo.location = (0, -1.0, 0.3); fo.rotation_euler = (math.radians(-80), 0, 0)
cool = bpy.data.lights.new("cool fill", "AREA"); cool.size = 2.5; cool.color = hexc("#8a9ccc")[:3]; cool.energy = 55      # (the shadow side cool against the warm sun: magic hour)
co_ = bpy.data.objects.new("cool fill", cool); sc.collection.objects.link(co_); co_.visible_camera = False; co_.location = (-1.6, -2.2, 1.8); co_.rotation_euler = Vector((1.2, 2.6, -0.6)).to_track_quat("-Z", "Y").to_euler()
lamp = bpy.data.lights.new("lantern", "POINT"); lamp.color = hexc("#ffa95e")[:3]; lamp.energy = 30; lamp.shadow_soft_size = 0.05
lo = bpy.data.objects.new("lantern", lamp); sc.collection.objects.link(lo); lo.location = (-0.62, 1.55, 1.82)

# a faint haze in the cabin's air, so the low sun through the windows shows as shafts (dust in the evening light)
hz = box("haze", "air", X0 + 0.01, X1 - 0.01, Y0, YB - 0.01, 0.01, ZT - 0.17, bpy.data.materials.new("haze"))
hm = hz.data.materials[0]; hm.use_nodes = True; hn = hm.node_tree.nodes; hn.remove(hn["Principled BSDF"]); pv = hn.new("ShaderNodeVolumePrincipled")
pv.inputs["Density"].default_value = 0.016; pv.inputs["Color"].default_value = hexc("#ffe2c0"); hm.node_tree.links.new(pv.outputs[0], hn["Material Output"].inputs["Volume"]); OBJ["haze"] = "air"
# ------------------------------------------------------------------ the camera ------------------------------------------------------------------
camd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", camd); sc.collection.objects.link(cam); sc.camera = cam
camd.sensor_fit = "VERTICAL"; camd.sensor_height = 24.0; camd.clip_start = 0.05; camd.dof.use_dof = True
ctgt = bpy.data.objects.new("cam target", None); sc.collection.objects.link(ctgt); foc = bpy.data.objects.new("focus", None); sc.collection.objects.link(foc)
c = cam.constraints.new("TRACK_TO"); c.target = ctgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"; camd.dof.focus_object = foc

def ease(u): u = min(1, max(0, u)); return u * u * (3 - 2 * u)
def lerp3(a, b, u): return Vector(a).lerp(Vector(b), u)

def pose_cam(shot, t):
    C = shot["cam"]
    if "keys" in C:      # (a move in steps: [t, where, looking at], eased between each pair (or straight, "lin": a dolly at a steady speed); held after the last)
        K = C["keys"]; i = 0
        while i + 1 < len(K) and t >= K[i + 1][0]: i += 1
        if i + 1 < len(K): u = (lambda v: v if C.get("lin") else ease(v))(min(1.0, max(0.0, (t - K[i][0]) / (K[i + 1][0] - K[i][0])))); cam.location = lerp3(K[i][1], K[i + 1][1], u); ctgt.location = lerp3(K[i][2], K[i + 1][2], u)
        else: cam.location = Vector(K[-1][1]); ctgt.location = Vector(K[-1][2])
    else:
        u = ease(t / (shot["t1"] - shot["t0"])); cam.location = lerp3(C["from"][0], C["from"][1], u); ctgt.location = Vector(C["at"])
    camd.lens = C["lens"]; camd.dof.aperture_fstop = C["fstop"]
    fx, fy = SPEC["figs"][C["focus"]]; foc.location = Vector(C["focusPoint"]) if "focusPoint" in C else Vector((fx, fy, 0.8 * SPEC["heights"][C["focus"]]))      # (the head of the figure in focus, or a point: E focuses on the boot)

# the sunlit floor's bounce: the sun's patches on the floor in front of the carriers throw warm light up onto the near face of what they hold
# (S2: the carried chest read as a dark shape against the dark wall, the first stills); on only in the shots that ask for it ("bounce")
BOUNCE = bpy.data.lights.new("floor bounce", "AREA"); BOUNCE.shape = "RECTANGLE"; BOUNCE.size = 1.6; BOUNCE.size_y = 0.8; BOUNCE.color = hexc("#ffbf80")[:3]; BOUNCE.energy = 0
BO = bpy.data.objects.new("floor bounce", BOUNCE); sc.collection.objects.link(BO); BO.visible_camera = False; BO.location = (0.4, -0.35, 0.05); BO.rotation_euler = (math.radians(-35), 0, 0)
PROPS = {}
def props_of(sid):
    if sid not in PROPS:
        p = os.path.join(ENGINE, "src", "craft", "dinner3d", "props", sid + ".json")
        PROPS[sid] = {th["name"]: th["frames"] for th in json.load(open(p))["things"]} if os.path.exists(p) else {}
    return PROPS[sid]

# v6c (the reviewer on the v6c stills: the sun's strip on the floor ran from the sailor's shoes toward the lens, through him, where his shadow should
# lie): each figure drawn in a shot has a stand-in here, a body and Knopp's big head, seen by nothing but the shadow rays, so the plate has the
# figure's shadow in the sun (out/din3d/who.json from dinner_check: who is drawn in each shot and where, his cheat included)
WHO_P = os.path.join(ENGINE, "out", "din3d", "who.json"); WHOJ = json.load(open(WHO_P)) if os.path.exists(WHO_P) else {}
STAND = {}
for nm, (rb, zb, rh, zh) in {"crew": (0.2, 0.95, 0.45, 1.45), "boy": (0.16, 0.71, 0.34, 1.07), "captain": (0.24, 0.7, 0.42, 0.98)}.items():
    root = bpy.data.objects.new("stand-in " + nm, None); sc.collection.objects.link(root); parts = []
    for kind, (rad, z) in (("body", (rb, zb)), ("head", (rh, zh))):
        me = bpy.data.meshes.new(f"stand-in {nm} {kind}"); bm = bmesh.new()
        if kind == "body": bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=rad, radius2=rad, depth=z); bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, z / 2))
        else: bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=rad); bmesh.ops.translate(bm, verts=bm.verts, vec=(0, 0, z))
        bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(f"stand-in {nm} {kind}", me); sc.collection.objects.link(o); o.parent = root
        o.visible_camera = False; o.visible_diffuse = False; o.visible_glossy = False; o.visible_transmission = False; o.visible_volume_scatter = False; o.visible_shadow = True
        parts.append(o)
    root.location = (0, 0, -50); STAND[nm] = root
def place_standins(shot):
    here = {w["name"]: w["at"] for w in WHOJ.get(shot["id"], [])}
    for nm, root in STAND.items(): root.location = (here[nm][0], here[nm][1], 0) if nm in here else (0, 0, -50)
def park_standins():
    for root in STAND.values(): root.location = (0, 0, -50)

def pose_shot(shot, t):
    pose_cam(shot, t)
    # the carried chest (piece S2): its place every frame from the figures' code (scripts/moves_props.mjs), at 0.55 of its size, its long
    # axis along the way (x), its lock toward the lens; elsewhere it stands in its corner as in step 1
    BOUNCE.energy = shot.get("bounce", 0)
    STOOL.location = Vector((0.25, 5.0, 0)) if "stool" in shot.get("hide", []) else STOOL_HOME.copy()
    fr = int(math.floor(t * FPS + 0.5)); P = {}
    STOOL.location = Vector((0.25, 5.0, 0))      # (v6: the captain sits on the sea chest; the stool is out of the room)
    if CH: cc = shot.get("cheat", {}).get("captain", [0, 0]); chest.location = SEAT_HOME + Vector((cc[0], cc[1], 0))      # (the captain's chest goes where he is cheated to)
    if "chest" in P:
        q = P["chest"][max(0, min(len(P["chest"]) - 1, fr))]; CHEST.location = Vector(q); CHEST.rotation_euler = (0, 0, 0); CHEST.scale = (0.55, 0.55, 0.55); BO.location.x = q[0]      # (the bounce under it, moving with it)
    else: CHEST.location, CHEST.rotation_euler, CHEST.scale = CHEST_HOME[0].copy(), CHEST_HOME[1].copy(), CHEST_HOME[2].copy()

def trap(u, a=0.3):
    """0..1 with a steady middle: speeding up over the first a, slowing over the last a (its top speed 1 / (1 - a) of the mean)"""
    u = min(1.0, max(0.0, u)); vm = 1 / (1 - a)
    if u < a: return vm * u * u / (2 * a)
    if u > 1 - a: return 1 - vm * (1 - u) ** 2 / (2 * a)
    return vm * (u - a / 2)


def projection():
    dg = bpy.context.evaluated_depsgraph_get(); co = cam.evaluated_get(dg); Mw = co.matrix_world.inverted(); f = camd.lens / camd.sensor_height * H
    R = Mw.to_3x3(); tr = Mw.to_translation(); P = []
    for row in range(3):
        if row == 0: a = [f * R[0][j] - (W / 2) * R[2][j] for j in range(3)]; b = f * tr[0] - (W / 2) * tr[2]
        elif row == 1: a = [-f * R[1][j] - (H / 2) * R[2][j] for j in range(3)]; b = -f * tr[1] - (H / 2) * tr[2]
        else: a = [-R[2][j] for j in range(3)]; b = -tr[2]
        P.append(a + [b])
    return P, co.matrix_world.copy()

def ray_map(Mwc):
    dg = bpy.context.evaluated_depsgraph_get(); f = camd.lens / camd.sensor_height * H
    origin = Mwc.to_translation(); R = Mwc.to_3x3(); fwd = -(R @ Vector((0, 0, 1)))
    nx, ny = W // GRID, H // GRID; depth = np.full((ny, nx), np.inf, np.float32); kind = np.zeros((ny, nx), np.uint8)
    kinds = sorted(set(OBJ.values())); kid = {k: i + 1 for i, k in enumerate(kinds)}
    for j in range(ny):
        for i in range(nx):
            px, py = (i + 0.5) * GRID, (j + 0.5) * GRID; d = R @ Vector(((px - W / 2) / f, -(py - H / 2) / f, -1.0)); d.normalize()
            hit, loc, nor, idx, ob, _ = sc.ray_cast(dg, origin, d)
            if hit: depth[j, i] = (loc - origin).dot(fwd); kind[j, i] = kid.get(OBJ.get(ob.name.split(".")[0], "prop"), 0)
    return depth, kind, kinds

shots = SPEC["shots"] if WHICH == "all" else [s for s in SPEC["shots"] if s["id"] == WHICH]
for shot in shots:
    n = int(math.floor((shot["t1"] - shot["t0"]) * FPS + 0.5)); f0, f1 = ((0, 0 if shot.get("static") else n - 1) if FR is None else FR)      # (half up, as the compositor rounds: Python's round() halves to even and left B1 and B2 a plate short, v40)
    outp = os.path.join(ENGINE, "public", "din3d", shot["id"]); outd = os.path.join(ENGINE, "out", "din3d", shot["id"]); os.makedirs(outp, exist_ok=True); os.makedirs(outd, exist_ok=True)
    cams, depths, kinds_, t0 = [], [], [], time.time(); kinds = None
    for fr in range(f0, f1 + 1):
        pose_shot(shot, fr / FPS); sc.frame_set(0); bpy.context.view_layer.update()
        P, Mwc = projection(); cams.append({"f": fr, "P": P, "cam": list(Mwc.to_translation())})
        if CAMS_ONLY: continue
        park_standins(); bpy.context.view_layer.update(); dep, kin, kinds = ray_map(Mwc); depths.append(dep); kinds_.append(kin)      # (the depth map without the stand-ins)
        place_standins(shot); bpy.context.view_layer.update()
        if not MAPS_ONLY: sc.render.filepath = os.path.join(outp, f"{fr + 1:04d}.jpg"); bpy.ops.render.render(write_still=True)
    secs = time.time() - t0; camdir = os.path.join(ENGINE, "src", "craft", "dinner3d", "cam"); os.makedirs(camdir, exist_ok=True)
    if FR is None: json.dump({"id": shot["id"], "frames": [c["P"] for c in cams]}, open(os.path.join(camdir, shot["id"] + ".json"), "w"))
    json.dump({"id": shot["id"], "W": W, "H": H, "grid": GRID, "frames": cams, "render_s": secs, "draft": DRAFT, "device": sc.cycles.device}, open(os.path.join(outd, "cam.json" if FR is None else f"cam-{f0}-{f1}.json"), "w"))
    if CAMS_ONLY: print(f"CAMS {shot['id']}", flush=True); continue
    np.savez_compressed(os.path.join(outd, "map.npz" if FR is None else f"map-{f0}-{f1}.npz"), depth=np.stack(depths), kind=np.stack(kinds_), kinds=np.array(kinds))
    print(f"SHOT {shot['id']}: {f1 - f0 + 1} frames in {secs:.1f} s ({secs / max(1, f1 - f0 + 1):.2f} s a frame, {sc.cycles.device})", flush=True)
