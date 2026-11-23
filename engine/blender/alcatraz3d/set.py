# Alcatraz in the new style: the cell block built in Blender, rendered as background plates for the flat Knopp figures.
# Everything is made here from primitives and procedural materials (no downloaded models or textures, so no licences to keep).
# The light follows the approved cabin v5 (fore-platt-2d: engine/src/craft/shorts/cabinTest.ts cabinV5): a warm lamp (#ffa95e)
# falling off with the distance, a thin cold edge from the moon's window (#8fb0ff), a dark ground light (#3f3a45); here the guard's
# torch is the warm light that moves.
#
#   blender -b --factory-startup --python set.py -- <shot id|all> [--draft] [--frames a-b] [--map-only]
# Writes public/alc3d/<id>/NNNN.jpg (the plate), out/alc3d/<id>/cam.json (each frame's projection world -> pixel) and
# out/alc3d/<id>/map.npz (each frame's floor and solid map: a ray per 10 x 10 pixels, the thing it hits and how far).
import bpy, bmesh, json, math, os, sys, time
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__)); ENGINE = os.path.normpath(os.path.join(HERE, "..", ".."))
SPEC = json.load(open(os.environ.get("A3D_SPEC") or os.path.join(ENGINE, "src", "craft", "alcatraz3d", "shots.json")))      # (A3D_SPEC: the whole film's plan, film.json)
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
WHICH = argv[0] if argv else "all"; DRAFT = "--draft" in argv; MAP_ONLY = "--map-only" in argv
FR = None
if "--frames" in argv: a, b = argv[argv.index("--frames") + 1].split("-"); FR = (int(a), int(b))
W, H, FPS = SPEC["W"], SPEC["H"], SPEC["fps"]
PLACE = next((x.get("place", "block") for x in SPEC["shots"] if x["id"] == WHICH), "block")      # each shot names its place; only that place is built
AREA = PLACE
if WHICH == "all": raise SystemExit("render one shot at a time: each shot builds only its own place (the tiers, the roof, the bay)")
TIERS = PLACE == "tiers"      # the view across the cellhouse at the block's three tiers: built only for that shot (the others are inside a tier)
GRID = 10      # the map: one ray per GRID x GRID pixels

def hexc(h, a=1.0): h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c] + [a]

# ------------------------------------------------------------------ scene ------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS; sc.render.resolution_x = W; sc.render.resolution_y = H
sc.render.resolution_percentage = 50 if DRAFT else 100
sc.render.engine = "CYCLES"; sc.cycles.samples = 24 if DRAFT else (64 if TIERS else 96); sc.cycles.use_denoising = True
sc.cycles.seed = 7; sc.cycles.use_animated_seed = False      # the same noise every frame, so a still picture does not crawl (the flicker rule)
sc.cycles.max_bounces = 6; sc.cycles.caustics_reflective = False; sc.cycles.caustics_refractive = False
pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "HIP"; pr.get_devices()
for d in pr.devices: d.use = d.type == "HIP"
sc.cycles.device = "GPU" if any(d.use for d in pr.devices) else "CPU"
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast" if "AgX - Medium High Contrast" in [i.identifier for i in sc.view_settings.bl_rna.properties["look"].enum_items] else "None"
sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 94
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs[0].default_value = hexc("#3f3a45"); bg.inputs[1].default_value = 0.35

MATS = {}
def mat(name, col, rough=0.8, scale=6.0, var=0.12, bump=0.25, metal=0.0, col2=None):
    """a material with visible texture: a noise varying the colour and roughness, and a bump"""
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links
    b = N["Principled BSDF"]; b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    tc = N.new("ShaderNodeTexCoord"); no = N.new("ShaderNodeTexNoise"); no.inputs["Scale"].default_value = scale; no.inputs["Detail"].default_value = 8
    L.new(tc.outputs["Object"], no.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB"); c1 = hexc(col); c2 = hexc(col2) if col2 else [max(0, x * (1 - var)) for x in c1[:3]] + [1]
    ramp.color_ramp.elements[0].color = c2; ramp.color_ramp.elements[1].color = c1; ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[1].position = 0.7
    L.new(no.outputs["Fac"], ramp.inputs["Fac"]); L.new(ramp.outputs["Color"], b.inputs["Base Color"])
    bp = N.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = bump; bp.inputs["Distance"].default_value = 0.02
    L.new(no.outputs["Fac"], bp.inputs["Height"]); L.new(bp.outputs["Normal"], b.inputs["Normal"])
    MATS[name] = m; return m

OBJ = {}      # name -> the kind the map reports ("floor", "wall", "bars", "bed", ...)
def box(name, kind, x0, x1, y0, y1, z0, z1, m, bevel=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    o.scale = ((x1 - x0), (y1 - y0), (z1 - z0)); o.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    o.data.materials.append(m)
    if bevel > 0: bv = o.modifiers.new("b", "BEVEL"); bv.width = bevel; bv.segments = 3; bv.affect = "EDGES"
    OBJ[name] = kind; return o
def cyl(name, kind, x, y, z0, z1, r, m, verts=16, axis="z"):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r, depth=1.0); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    if axis == "z": o.scale = (1, 1, z1 - z0); o.location = (x, y, (z0 + z1) / 2)
    else: o.rotation_euler = (0, math.pi / 2, 0); o.scale = (1, 1, z1 - z0); o.location = ((z0 + z1) / 2, x, y)      # along x: x,y = (y, z) here
    o.data.materials.append(m); sm = o.modifiers.new("s", "WEIGHTED_NORMAL"); OBJ[name] = kind
    for p in o.data.polygons: p.use_smooth = True
    return o
def sphere(name, kind, c, r, m, sx=1, sy=1, sz=1):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=r); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.location = c; o.scale = (sx, sy, sz); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    OBJ[name] = kind; return o

# palette: the flat look's colours, deepened and textured
CONC = mat("concrete", "#7b8088", 0.92, 9, 0.18, 0.35)
WALL_LO = mat("wall low", "#3f5a5e", 0.75, 7, 0.14, 0.18)       # the old prison two-tone: a deep green-blue below
WALL_HI = mat("wall high", "#c9c2ae", 0.85, 6, 0.10, 0.15)      # and a worn cream above
STEEL = mat("bars", "#5d6573", 0.38, 30, 0.08, 0.05, metal=0.85)
BED_M = mat("bed frame", "#4b5568", 0.45, 20, 0.08, 0.05, metal=0.6)
MATT = mat("mattress", "#9c9a8e", 0.95, 14, 0.10, 0.2)
PILL = mat("pillow", "#e8e4da", 0.9, 12, 0.06, 0.25)
BLANK = mat("blanket", "#6b7a5e", 0.97, 22, 0.16, 0.45)
SKIN = mat("head skin", "#e2b48e", 0.55, 18, 0.06, 0.08)
HAIR = mat("head hair", "#3a2a20", 0.85, 60, 0.25, 0.6)
HAIR2 = mat("head hair 2", "#6b4a2e", 0.85, 60, 0.25, 0.6)
HAIR3 = mat("head hair 3", "#2e2a26", 0.85, 60, 0.25, 0.6)
WOOD = mat("wood", "#7a5a3c", 0.7, 3, 0.25, 0.2, col2="#5a4029")
VENTM = mat("vent", "#555b62", 0.5, 25, 0.1, 0.1, metal=0.7)
DARK = mat("vent hole", "#0d0f12", 1.0, 5, 0.0, 0.0)

def point(name, at, col, power, radius=0.05):
    L = bpy.data.lights.new(name, "POINT"); L.color = hexc(col)[:3]; L.energy = power; L.shadow_soft_size = radius
    o = bpy.data.objects.new(name, L); sc.collection.objects.link(o); o.location = at; return o
# ------------------------------------------------------------------ the tier ------------------------------------------------------------------
CW, CD, CH, WT = 2.5, 2.9, 2.6, 0.2      # a cell's width, depth, height; the walls between
CELLS = [-2.7, 0.0, 2.7, 5.4]           # cell centres along x: Frank's cell at 0
box("floor", "floor", -5.0, 9.0, -3.2, CD + 0.3, -0.1, 0.0, CONC)
if not TIERS: box("ceiling", "ceiling", -5.0, 9.0, -3.2, CD + 0.3, CH, CH + 0.1, WALL_HI)
if not TIERS: box("tier wall", "wall", -5.0, 9.0, -3.3, -3.2, 0.0, CH, WALL_LO)                  # the wall across the tier
if not TIERS: box("tier wall hi", "wall", -5.0, 9.0, -3.21, -3.19, 1.25, CH, WALL_HI)
def cell(i, cx, z0=0.0, tag=""):
    """one cell: walls, the bars, the bed with the fake head, the table, the vent; z0 lifts it to a tier above"""
    def box_(name, kind, x0, x1, y0, y1, za, zb, m, bevel=0.0): return box(name + tag, kind, x0, x1, y0, y1, za + z0, zb + z0, m, bevel)
    def cyl_(name, kind, x, y, za, zb, r, m, verts=16): return cyl(name + tag, kind, x, y, za + z0, zb + z0, r, m, verts)
    def sphere_(name, kind, c, r, m, sx=1, sy=1, sz=1): return sphere(name + tag, kind, (c[0], c[1], c[2] + z0), r, m, sx, sy, sz)
    box_(f"back{i}", "wall", cx - CW / 2, cx + CW / 2, CD, CD + 0.1, 0, CH, WALL_LO)
    box_(f"back{i} hi", "wall", cx - CW / 2, cx + CW / 2, CD - 0.01, CD, 1.25, CH, WALL_HI)
    for sx in (-1, 1):
        x = cx + sx * (CW / 2 + WT / 2)
        box_(f"side{i}{sx}", "wall", x - WT / 2, x + WT / 2, 0, CD, 0, CH, WALL_LO)
        box_(f"side{i}{sx} hi", "wall", x - WT / 2 - 0.005, x + WT / 2 + 0.005, 0.0, CD, 1.25, CH, WALL_HI)
    # the bars: round uprights 0.13 m apart from the floor to a header, flat bands across
    n = int(CW / 0.13)
    for k in range(n + 1): cyl_(f"bar{i}_{k}", "bars", cx - CW / 2 + 0.06 + k * (CW - 0.12) / n, -0.02, 0.0, CH - 0.25, 0.011, STEEL, 10)
    for zb in (0.12, 1.05, 2.0): box_(f"band{i}_{zb}", "bars", cx - CW / 2, cx + CW / 2, -0.035, -0.005, zb, zb + 0.05, STEEL, 0.004)
    box_(f"header{i}", "bars", cx - CW / 2 - WT, cx + CW / 2 + WT, -0.05, 0.0, CH - 0.25, CH, STEEL, 0.01)
    # the bed along the left wall: a steel frame on legs to the floor, a mattress, the pillow, the blanket, the fake head
    bx0, bx1, by0, by1, bz = cx - 1.2, cx - 0.42, 0.55, 2.75, 0.42
    box_(f"bedframe{i}", "bed", bx0, bx1, by0, by1, bz - 0.05, bz, BED_M, 0.01)
    for lx, ly in ((bx0 + 0.03, by0 + 0.03), (bx1 - 0.03, by0 + 0.03), (bx0 + 0.03, by1 - 0.03), (bx1 - 0.03, by1 - 0.03)): cyl_(f"bedleg{i}{lx:.2f}{ly:.2f}", "bed", lx, ly, 0.0, bz - 0.05, 0.018, BED_M, 10)
    box_(f"mattress{i}", "bed", bx0 + 0.01, bx1 - 0.01, by0 + 0.01, by1 - 0.01, bz, bz + 0.12, MATT, 0.04)
    sphere_(f"pillow{i}", "bed", (cx - 0.81, by0 + 0.30, bz + 0.17), 0.21, PILL, 1.6, 0.9, 0.42)
    # the blanket over a body-shaped lump (the raincoats and towels under it), from the shoulders to the foot
    # (the blanket drapes over the mattress's sides and is turned down at the head in a pale fold: with a rounded top edge the bed read as a
    #  bathtub, the review of the style test point 4)
    box_(f"blanket{i}", "bed", bx0 - 0.035, bx1 + 0.035, by0 + 0.40, by1 + 0.02, bz - 0.06, bz + 0.2, BLANK, 0.03)
    box_(f"turndown{i}", "bed", bx0 - 0.04, bx1 + 0.04, by0 + 0.40, by0 + 0.52, bz - 0.06, bz + 0.215, mat("sheet", "#e4e0d4", 0.9, 12, 0.06, 0.2), 0.03)
    sphere_(f"lump{i}", "bed", (cx - 0.81, by0 + 1.15, bz + 0.2), 0.22, BLANK, 1.45, 2.6, 0.42)
    # the fake head on the pillow, turned up: soap and plaster painted skin, real hair, the eyes shut
    hx, hy, hz = cx - 0.81, by0 + 0.27, bz + 0.31      # (sunk into the pillow, the blanket to the chin: no hard dark band under it, point 14)
    # (only the three who got out have a fake head, in the column of cells at x 0, one per tier; every other bed has a sleeper's lump under
    #  the blanket and no head: identical dummies everywhere said every prisoner was a dummy, the independent review point 22)
    if i == 1:
        # the face turned up and toward the bed's foot (into the cell), the hair at the back toward the bars
        sphere_(f"head{i}", "head", (hx, hy, hz), 0.105, SKIN, 0.92, 1.0, 1.0)
        sphere_(f"hair{i}", "head", (hx, hy - 0.04, hz + 0.01), 0.108, [HAIR, HAIR2, HAIR3][int(z0 // 2.8) % 3], 0.98, 0.95, 1.0)
        sphere_(f"nose{i}", "head", (hx, hy + 0.06, hz + 0.08), 0.02, SKIN)
        # the shut eyes painted on: a thin dark line set into the surface, inside the face (3D discs stood out over the edge into the hair, point 20)
        for ex in (-0.034, 0.034):
            d = Vector((ex, 0.055, 0.08)).normalized() * 0.103; c = (hx + d.x / 0.92 * 0.92, hy + d.y, hz + d.z)
            o = cyl(f"lid{i}{ex}{tag}", "head", c[1], c[2] + z0, c[0] - 0.014, c[0] + 0.014, 0.0035, DARK, 8, axis="x")
    else:
        sphere_(f"sleeper{i}", "bed", (cx - 0.81, hy + 0.12, bz + 0.2), 0.16, BLANK, 1.3, 1.2, 0.6)      # the blanket pulled over a sleeper's head
    # the fold-down table on the right wall, a tin cup and a book on it
    box_(f"table{i}", "furniture", cx + 0.80, cx + 1.24, 1.55, 2.15, 0.70, 0.74, WOOD, 0.005)
    cyl_(f"cup{i}", "furniture", cx + 1.05, 1.72, 0.74, 0.84, 0.035, STEEL, 16)
    box_(f"book{i}", "furniture", cx + 0.92, cx + 1.14, 1.88, 2.05, 0.74, 0.77, mat("book", "#7a2f2a", 0.7, 10, 0.1, 0.05), 0.003)
    # the air vent low in the back wall, its grille
    vx = cx + 0.88
    if PLACE == "dug" and i == 1 and not tag:      # (shot 6: the vent dug out, its grille off; see below)
        box_(f"venthole{i}", "vent", vx - 0.19, vx + 0.19, CD - 0.02, CD - 0.005, 0.12, 0.47, DARK); return
    box_(f"venthole{i}", "vent", vx - 0.15, vx + 0.15, CD - 0.02, CD - 0.005, 0.18, 0.42, DARK)
    box_(f"ventframe{i}", "vent", vx - 0.17, vx + 0.17, CD - 0.03, CD - 0.02, 0.16, 0.44, VENTM, 0.004)
    for k in range(6): box_(f"ventslat{i}{k}", "vent", vx - 0.15, vx + 0.15, CD - 0.035, CD - 0.03, 0.2 + k * 0.04, 0.215 + k * 0.04, VENTM)


for i, cx in enumerate(CELLS): cell(i, cx)
if TIERS:
    # the two tiers above (Alcatraz's cell blocks are three tiers high): the same cells, a slab between, a gallery with a railing, a roof
    TH = 2.85
    for k in (1, 2):
        box(f"slab{k}", "floor", -5.0, 9.0, -1.25, CD + 0.3, k * TH - 0.25, k * TH, CONC)
        for i, cx in enumerate(CELLS): cell(i, cx, k * TH, f"_t{k}")
        for xr in np.arange(-5.0, 9.0, 0.16): cyl(f"rail{k}_{xr:.2f}", "bars", float(xr), -1.2, k * TH, k * TH + 0.95, 0.009, STEEL, 8)
        box(f"railtop{k}", "bars", -5.0, 9.0, -1.23, -1.17, k * TH + 0.93, k * TH + 0.99, STEEL, 0.005)
    fl = bpy.data.lights.new("cellhouse windows", "AREA"); fl.color = hexc("#9fb4ff")[:3]; fl.energy = 900; fl.size = 8.0
    flo = bpy.data.objects.new("cellhouse windows", fl); sc.collection.objects.link(flo); flo.location = (0.0, -7.5, 5.0); flo.rotation_euler = (math.radians(80), 0, 0)
    box("block roof", "ceiling", -5.0, 9.0, -1.25, CD + 0.3, 3 * TH - 0.25, 3 * TH, CONC)
    for k in (0, 1, 2): point(f"gallery lamp{k}", (-0.4, -0.75, k * TH + 2.3), "#ffa95e", 260, 0.06)      # (over the three cells with the dummies: they are the lit ones)
# the lamps of the tier: caged bulbs on the ceiling, warm, falling off with the distance (cabin v5's lamp)
for lx in (-3.6, 1.35, 6.3):
    point(f"lamp{lx}", (lx, -1.7, CH - 0.25), "#ffa95e", 260, 0.06)
    if not TIERS: sphere(f"bulb{lx}", "lamp", (lx, -1.7, CH - 0.2), 0.04, mat("bulb glow", "#ffd9a0", 0.2, 1, 0, 0))      # (in the view of the tiers there is no ceiling for it to hang from: no bulb in the air)
    if "bulb glow" in MATS: MATS["bulb glow"].node_tree.nodes["Principled BSDF"].inputs["Emission Color"].default_value = hexc("#ffc27a")
    if "bulb glow" in MATS: MATS["bulb glow"].node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 30
# the moon through the high windows across the tier: a thin cold light (cabin v5's window), an area light
mo = bpy.data.lights.new("moon", "AREA"); mo.color = hexc("#8fb0ff")[:3]; mo.energy = 420; mo.size = 1.2
mobj = bpy.data.objects.new("moon", mo); sc.collection.objects.link(mobj); mobj.location = (1.0, -3.1, 2.3); mobj.rotation_euler = (math.radians(70), 0, 0)
# the guard's torch: a warm spot with a soft edge
tl = bpy.data.lights.new("torch", "SPOT"); tl.color = hexc("#ffe2b0")[:3]; tl.spot_size = math.radians(15); tl.spot_blend = 0.45; tl.shadow_soft_size = 0.02
torch = bpy.data.objects.new("torch", tl); sc.collection.objects.link(torch)
tgt = bpy.data.objects.new("torch target", None); sc.collection.objects.link(tgt)
c = torch.constraints.new("TRACK_TO"); c.target = tgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"

camd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", camd); sc.collection.objects.link(cam); sc.camera = cam
camd.sensor_fit = "VERTICAL"; camd.sensor_height = 24.0
ctgt = bpy.data.objects.new("cam target", None); sc.collection.objects.link(ctgt)
c = cam.constraints.new("TRACK_TO"); c.target = ctgt; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
foc = bpy.data.objects.new("focus", None); sc.collection.objects.link(foc); camd.dof.use_dof = True; camd.dof.focus_object = foc

# ------------------------------------------------------------------ the rest of the film's places ------------------------------------------------------------------
def emis(name, col, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = hexc(col)
    b.inputs["Emission Color"].default_value = hexc(col); b.inputs["Emission Strength"].default_value = strength; return m
def city(x0, x1, y, rnd, night=True):
    """San Francisco across the bay: low blocks with lit windows (night) or pale in the haze (morning)"""
    import random; R = random.Random(rnd)
    wall = mat("city wall", "#2a3046" if night else "#b9a99a", 0.9, 4, 0.1, 0.0); win = emis("city window", "#ffcf8a", 6.0 if night else 0.0)
    x = x0
    while x < x1:
        w, h = R.uniform(1.5, 4.0), R.uniform(2.0, 12.0); box(f"city{x:.1f}", "far", x, x + w, y, y + 3, 0, h, wall)
        if night:
            for k in range(int(h / 1.4)):
                if R.random() < 0.55: box(f"cwin{x:.1f}_{k}", "far", x + R.uniform(0.2, w - 0.6), x + R.uniform(0.4, w - 0.2), y - 0.05, y, 0.6 + k * 1.4, 1.1 + k * 1.4, win)
        x += w + R.uniform(0.2, 1.5)
if AREA in ("roof", "bay", "baymorning"):
    night = AREA != "baymorning"
    bg.inputs[0].default_value = hexc("#22305e" if night else "#f2c9a0"); bg.inputs[1].default_value = 1.4 if night else 1.2
    ox = 100.0 if AREA == "roof" else 200.0
    moon = sphere("moon disc", "far", (ox + 22, 160, 30), 4.0, emis("moon glow", "#f4f0d6", 12.0)) if night else None
    sun = bpy.data.lights.new("sky light", "SUN"); sun.color = hexc("#8fb0ff" if night else "#ffd2a0")[:3]; sun.energy = 1.4 if night else 3.0; sun.angle = math.radians(3)
    so = bpy.data.objects.new("sky light", sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(70 if night else 80), 0, math.radians(165 if night else -40))      # (the moon's light from behind the city, toward the lens)
if AREA == "roof":
    RO = 100.0      # the roof of the cellhouse, built at x 100 (far from the cells)
    box("roof", "floor", RO - 15, RO + 15, -8, 25, -0.3, 0.0, mat("roof tar", "#3d4148", 0.85, 6, 0.2, 0.3))
    box("parapet", "wall", RO - 15, RO + 15, -8.3, -8.0, 0, 0.6, CONC)
    for i, (vx, vy) in enumerate([(-3.5, 4.0), (2.5, 6.0), (-6, 9), (5.5, 2.5), (0.5, 12)]):
        cyl(f"vent stack{i}", "solid", RO + vx, vy, 0, 1.1, 0.35, mat("vent metal", "#6a6f78", 0.45, 18, 0.1, 0.1, metal=0.6), 24)
        cyl(f"vent cap{i}", "solid", RO + vx, vy, 1.15, 1.3, 0.55, MATS["vent metal"], 24)
    box("chimney", "solid", RO + 7, RO + 8.2, 14, 15.2, 0, 7, mat("brick", "#7a4a3a", 0.9, 20, 0.2, 0.4))
    city(RO - 60, RO + 60, 220, 3, True)
    sl = bpy.data.lights.new("searchlight", "SPOT"); sl.color = hexc("#fff2c8")[:3]; sl.energy = 60000; sl.spot_size = math.radians(6); sl.spot_blend = 0.3
    slo = bpy.data.objects.new("searchlight", sl); sc.collection.objects.link(slo); slo.location = (RO - 30, 20, 18)
    stg = bpy.data.objects.new("searchlight target", None); sc.collection.objects.link(stg); c = slo.constraints.new("TRACK_TO"); c.target = stg; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
if AREA in ("bay", "baymorning"):
    BO = 200.0      # the bay, built at x 200
    me = bpy.data.meshes.new("sea"); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=300, y_segments=300, size=60); bm.to_mesh(me); bm.free()
    sea = bpy.data.objects.new("sea", me); sc.collection.objects.link(sea); sea.location = (BO, 40, 0)
    oc = sea.modifiers.new("ocean", "OCEAN"); oc.geometry_mode = "DISPLACE"; oc.size = 1.0; oc.spatial_size = 40; oc.wave_scale = 0.35; oc.choppiness = 0.6; oc.resolution = 10; oc.random_seed = 4
    water = mat("water", "#13263c" if AREA == "bay" else "#4f6f86", 0.08, 2, 0.05, 0.0); water.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.8
    sea.data.materials.append(water); OBJ["sea"] = "floor"
    for p in sea.data.polygons: p.use_smooth = True
    city(BO - 80, BO + 80, 150, 7, AREA == "bay")
if AREA == "board":
    BD = 300.0      # the board in the guards' office with the three wanted posters, built at x 300
    box("office wall", "wall", BD - 4, BD + 4, 2.0, 2.1, 0, 3, WALL_HI)
    box("cork board", "wall", BD - 1.2, BD + 1.2, 1.97, 2.0, 0.9, 2.2, mat("cork", "#9a7448", 0.9, 30, 0.25, 0.5))
    box("office floor", "floor", BD - 4, BD + 4, -4, 2.1, -0.1, 0, CONC)
    point("office lamp", (BD + 0.8, 0.5, 2.6), "#ffd9a0", 120, 0.1)

if PLACE == "dug":
    vx = 0.88
    gr = box("grille off", "furniture", vx - 0.52, vx - 0.18, CD - 0.09, CD - 0.07, 0.0, 0.28, VENTM, 0.004); gr.rotation_euler = (math.radians(-14), 0, 0)      # leaning on the wall beside the hole
    for k in range(6): sl = box(f"grille slat{k}", "furniture", vx - 0.5, vx - 0.2, CD - 0.105, CD - 0.095, 0.03 + k * 0.04, 0.045 + k * 0.04, VENTM); sl.rotation_euler = (math.radians(-14), 0, 0)
    DUST = mat("concrete dust", "#bdb8ad", 0.95, 30, 0.1, 0.3)
    sphere("dust pile", "furniture", (vx, CD - 0.18, 0.0), 0.16, DUST, 1.4, 0.8, 0.22)
    import random; R = random.Random(5)
    for k in range(40): sphere(f"grit{k}", "furniture", (vx + R.uniform(-0.45, 0.45), CD - R.uniform(0.05, 0.6), 0.004), R.uniform(0.006, 0.014), DUST)
    sh = box("spoon handle", "furniture", -0.11, 0.11, -0.008, 0.008, 0.004, 0.012, STEEL); sh.location = (vx - 0.33, CD - 0.42, 0.008); sh.rotation_euler = (0, 0, math.radians(25))
    sphere("spoon bowl", "furniture", (vx - 0.2, CD - 0.37, 0.012), 0.03, STEEL, 1.4, 0.9, 0.3)
if PLACE == "top":
    TO = 400.0      # on top of the cell block, under the pipes, where the raft was made: built at x 400
    box("top floor", "floor", TO - 4, TO + 4, -4, 3, -0.1, 0, CONC); box("top ceiling", "ceiling", TO - 4, TO + 4, -4, 3, 2.3, 2.4, CONC)
    box("top wall", "wall", TO - 4, TO + 4, 2.0, 2.1, 0, 2.3, WALL_LO); box("top wall l", "wall", TO - 4, TO - 3.9, -4, 3, 0, 2.3, WALL_LO)
    for k, (py, pz, r) in enumerate([(1.7, 2.05, 0.06), (1.85, 1.75, 0.04), (1.5, 2.15, 0.035)]): cyl(f"pipe{k}", "solid", py, pz, TO - 4, TO + 4, r, mat("pipe", "#6f6152", 0.6, 15, 0.15, 0.15, metal=0.4), 16, axis="x")
    cyl("lamp cord", "solid", TO - 0.6, 0.4, 1.75, 2.3, 0.006, DARK, 6); sphere("lamp bulb", "lamp", (TO - 0.6, 0.4, 1.72), 0.04, emis("top bulb", "#ffd9a0", 25))
    point("top lamp", (TO - 0.6, 0.4, 1.66), "#ffa95e", 140, 0.04)
    COAT = mat("raincoat", "#b8a65c", 0.55, 10, 0.12, 0.25)
    for k, (dx, dy) in enumerate([(-0.45, 0.0), (0.45, 0.0), (0.0, 0.3), (0.0, -0.3)]): o = sphere(f"raft panel{k}", "raft", (TO - 0.1 + dx, 0.6 + dy, 0.05), 0.5, COAT, 0.95, 0.55, 0.1)
    for k, dy in enumerate([-0.5, 0.5]): cyl(f"raft tube{k}", "raft", 0.6 + dy, 0.09, TO - 1.0, TO + 0.8, 0.09, COAT, 20, axis="x")
if PLACE in ("bay",):
    COAT = mat("raincoat", "#b8a65c", 0.55, 10, 0.12, 0.25)
    RAFT = [sphere("raft body", "raft", (0, 0, 0.08), 0.5, COAT, 1.8, 1.0, 0.18)] + [sphere(f"raft man{k}", "raft", (dx, 0, 0.32), 0.16, mat("silhouette", "#141820", 0.9, 4, 0.0, 0.0), 1.0, 1.0, 1.6) for k, dx in enumerate([-0.45, 0.0, 0.45])]
    RAFT0 = [o.location.copy() for o in RAFT]
if PLACE == "morning":
    bg.inputs[0].default_value = hexc("#ffd8b0"); bg.inputs[1].default_value = 0.6
    win = bpy.data.lights.new("morning window", "AREA"); win.color = hexc("#ffb878")[:3]; win.energy = 900; win.size = 4.0
    wo = bpy.data.objects.new("morning window", win); sc.collection.objects.link(wo); wo.location = (1.0, -3.0, 2.3); wo.rotation_euler = (math.radians(75), 0, 0)
if PLACE == "board":
    import os as _os
    texdir = _os.path.join(HERE, "tex")
    for k, px_ in enumerate([-0.62, 0.0, 0.62]):
        m = bpy.data.materials.new(f"poster{k}"); m.use_nodes = True; nt = m.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.85
        im = nt.nodes.new("ShaderNodeTexImage"); im.image = bpy.data.images.load(_os.path.join(texdir, f"poster{k}.png")); nt.links.new(im.outputs["Color"], b.inputs["Base Color"])
        me = bpy.data.meshes.new(f"poster{k}"); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5); bm.to_mesh(me); bm.free()
        uv = me.uv_layers.new(); 
        for poly in me.polygons:
            for li in poly.loop_indices: v = me.vertices[me.loops[li].vertex_index].co; uv.data[li].uv = (v.x + 0.5, v.y + 0.5)
        o = bpy.data.objects.new(f"poster{k}", me); sc.collection.objects.link(o); o.data.materials.append(m); OBJ[f"poster{k}"] = "board"
        o.location = (300.0 + px_, 1.96, 1.55 + (0.03 if k == 1 else 0)); o.rotation_euler = (math.radians(90), 0, math.radians(180 + (2 if k != 1 else -1.5) * (k - 1))); o.scale = (0.48, 0.64, 1)
        sphere(f"pin{k}", "board", (300.0 + px_, 1.94, 1.55 + 0.3 + (0.03 if k == 1 else 0)), 0.015, mat("pin", "#c0392b", 0.4, 5, 0.0, 0.0))

def ease(u): u = min(1, max(0, u)); return u * u * (3 - 2 * u)      # in and out, never linear (the smoothness of the order)
def lerp3(a, b, u): return Vector(a).lerp(Vector(b), u)
def fig_point(shot, name):
    for f in shot["figs"]:
        if f["name"] == name: return (f["at"][0], f["at"][1], 1.45)
    return None
FOCUS = {"head": (CELLS[1] - 0.81, 0.55 + 0.27, 0.42 + 0.31)}

def pose_shot(shot, t):
    """camera, focus and torch at the time t (seconds into the shot)"""
    u = ease(t / (shot["t1"] - shot["t0"])); C = shot["cam"]
    cam.location = lerp3(C["from"][0], C["from"][1], u); ctgt.location = Vector(C["at"]); camd.lens = C["lens"]; camd.dof.aperture_fstop = C["fstop"]
    f = C["focus"]; foc.location = Vector(FOCUS[f]) if isinstance(f, str) and f in FOCUS else Vector(fig_point(shot, f)) if isinstance(f, str) else Vector(f)
    if "raft" in shot and PLACE == "bay":
        R0, R1 = shot["raft"]["from"], shot["raft"]["to"]; rx, ry = R0[0] + (R1[0] - R0[0]) * u, R0[1] + (R1[1] - R0[1]) * u
        for o, l0 in zip(RAFT, RAFT0): o.location = (l0.x + rx, l0.y + ry, l0.z + 0.03 * math.sin(t * 2.1))
    T = shot["torch"]; torch.location = lerp3(T["from"][0], T["from"][1], u); tgt.location = lerp3(T["at"][0], T["at"][1], u); tl.energy = T["power"] * 9

def projection():
    """the 3 x 4 matrix taking a world point to (pixel x, pixel y, depth along the lens) * w"""
    dg = bpy.context.evaluated_depsgraph_get(); co = cam.evaluated_get(dg); Mw = co.matrix_world.inverted()
    f = camd.lens / camd.sensor_height * H      # pixels per unit at depth 1 (sensor fitted to the height)
    K = Matrix(((f, 0, W / 2), (0, -f, H / 2), (0, 0, 1)))
    P = []
    R = Mw.to_3x3(); tr = Mw.to_translation()
    # camera looks down -z: x_pix = W/2 + f * x/(-z), y_pix = H/2 - f * y/(-z)
    for row in range(3):
        if row == 0: a = [f * R[0][j] - (W / 2) * R[2][j] for j in range(3)]; b = f * tr[0] - (W / 2) * tr[2]
        elif row == 1: a = [-f * R[1][j] - (H / 2) * R[2][j] for j in range(3)]; b = -f * tr[1] - (H / 2) * tr[2]
        else: a = [-R[2][j] for j in range(3)]; b = -tr[2]
        P.append(a + [b])
    return P, co.matrix_world.copy()

def ray_map(Mwc):
    """one ray per GRID x GRID pixels through the lens: the kind of thing it hits first and its depth along the lens (inf: nothing)"""
    dg = bpy.context.evaluated_depsgraph_get(); f = camd.lens / camd.sensor_height * H
    origin = Mwc.to_translation(); R = Mwc.to_3x3(); fwd = -(R @ Vector((0, 0, 1)))
    nx, ny = W // GRID, H // GRID; depth = np.full((ny, nx), np.inf, np.float32); kind = np.zeros((ny, nx), np.uint8)
    kinds = sorted(set(OBJ.values())); kid = {k: i + 1 for i, k in enumerate(kinds)}
    for j in range(ny):
        for i in range(nx):
            px, py = (i + 0.5) * GRID, (j + 0.5) * GRID
            d = R @ Vector(((px - W / 2) / f, -(py - H / 2) / f, -1.0)); d.normalize()
            hit, loc, nor, idx, ob, _ = sc.ray_cast(dg, origin, d)
            if hit:
                depth[j, i] = (loc - origin).dot(fwd); kind[j, i] = kid.get(OBJ.get(ob.name.split(".")[0], "other"), 0)
    return depth, kind, kinds

shots = SPEC["shots"] if WHICH == "all" else [s for s in SPEC["shots"] if s["id"] == WHICH]
for shot in shots:
    n = round((shot["t1"] - shot["t0"]) * FPS); f0, f1 = (0, n - 1) if FR is None else FR
    outp = os.path.join(ENGINE, "public", "alc3d", shot["id"]); outd = os.path.join(ENGINE, "out", "alc3d", shot["id"]); os.makedirs(outp, exist_ok=True); os.makedirs(outd, exist_ok=True)
    cams, depths, kinds_ = [], [], []; t_start = time.time(); kinds = None
    for fr in range(f0, f1 + 1):
        pose_shot(shot, fr / FPS); sc.frame_set(0); bpy.context.view_layer.update()
        P, Mwc = projection(); cams.append({"f": fr, "P": P, "cam": list(Mwc.to_translation())})
        dep, kin, kinds = ray_map(Mwc); depths.append(dep); kinds_.append(kin)
        if not MAP_ONLY:
            sc.render.filepath = os.path.join(outp, f"{fr + 1:04d}.jpg"); bpy.ops.render.render(write_still=True)
    secs = time.time() - t_start
    camdir = os.path.join(ENGINE, "src", "craft", "alcatraz3d", "cam"); os.makedirs(camdir, exist_ok=True)
    if FR is None: json.dump({"id": shot["id"], "frames": [c["P"] for c in cams]}, open(os.path.join(camdir, shot["id"] + ".json"), "w"))
    json.dump({"id": shot["id"], "W": W, "H": H, "grid": GRID, "frames": cams, "render_s": secs, "render_s_per_frame": secs / max(1, f1 - f0 + 1), "draft": DRAFT,
               "device": sc.cycles.device}, open(os.path.join(outd, "cam.json" if FR is None else f"cam-{f0}-{f1}.json"), "w"))
    np.savez_compressed(os.path.join(outd, "map.npz" if FR is None else f"map-{f0}-{f1}.npz"), depth=np.stack(depths), kind=np.stack(kinds_), kinds=np.array(kinds))
    print(f"SHOT {shot['id']}: {f1 - f0 + 1} frames in {secs:.1f} s ({secs / max(1, f1 - f0 + 1):.2f} s a frame, {sc.cycles.device})", flush=True)
