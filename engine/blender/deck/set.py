# Roberts' bedtime (pirate week, Short 1): the ship's deck, night to dawn, as background plates for the flat Knopp figures (the plan b3ccac2).
# Built here from boxes and cylinders with Poly Haven's CC0 plank and wood textures; the things on it are Poly Haven's CC0 glTF models, the same
# set the cabin uses (../cabin/assets, licences in granskning/3d/licenser.md). No .blend files, no scripts from any pack.
# The light: night (the lanterns along the rail lit, the moon low over the sea, cool) or dawn (the lanterns out, a grey sky brightening).
#   blender -b --factory-startup --disable-autoexec --python set.py -- --look night|dawn [--draft]      (a look still for the STOPP)
import bpy, json, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__)); ENGINE = os.path.abspath(os.path.join(HERE, "..", ".."))
A = os.path.join(HERE, "..", "cabin", "assets"); T = os.path.join(HERE, "..", "cabin", "tex")
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
LOOK = argv[argv.index("--look") + 1] if "--look" in argv else "night"; DRAFT = "--draft" in argv
W, H = 1080, 1920

def hexc(h, a=1.0): h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]; return [((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c] + [a]

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.resolution_x = W; sc.render.resolution_y = H; sc.render.resolution_percentage = 50 if DRAFT else 100
sc.render.engine = "CYCLES"; sc.cycles.samples = 16 if DRAFT else 64; sc.cycles.use_denoising = True; sc.cycles.seed = 7; sc.cycles.use_animated_seed = False
pr = bpy.context.preferences.addons["cycles"].preferences; pr.compute_device_type = "HIP"; pr.get_devices()
for d in pr.devices: d.use = d.type == "HIP"
sc.cycles.device = "GPU" if any(d.use for d in pr.devices) else "CPU"
sc.view_settings.view_transform = "AgX"; sc.view_settings.exposure = 1.6 if LOOK == "night" else 0.7
sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 94
world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True; wn = world.node_tree.nodes; wl = world.node_tree.links; bg = wn["Background"]
# the sky: a gradient from the horizon up (night: deep blue over a lighter blue haze, with stars; dawn: a warm band at the horizon under grey)
tc = wn.new("ShaderNodeTexCoord"); sep = wn.new("ShaderNodeSeparateXYZ"); wl.new(tc.outputs["Generated"], sep.inputs[0])
ramp = wn.new("ShaderNodeValToRGB"); wl.new(sep.outputs["Z"], ramp.inputs["Fac"]); el = ramp.color_ramp.elements
if LOOK == "night": el[0].position = 0.0; el[0].color = hexc("#243a66"); el[1].position = 0.35; el[1].color = hexc("#070d1e")
else: el[0].position = 0.0; el[0].color = hexc("#e6b48a"); el[1].position = 0.22; el[1].color = hexc("#9aa3b0"); e2 = el.new(0.06); e2.color = hexc("#d8b8a0")
sky = ramp.outputs["Color"]
if LOOK == "night":      # (stars: small bright points where a Voronoi cell's distance is tiny, above the horizon only)
    vo = wn.new("ShaderNodeTexVoronoi"); vo.inputs["Scale"].default_value = 260.0; wl.new(tc.outputs["Generated"], vo.inputs["Vector"])
    st = wn.new("ShaderNodeMapRange"); st.inputs["From Min"].default_value = 0.0; st.inputs["From Max"].default_value = 0.035; st.inputs["To Min"].default_value = 1.0; st.inputs["To Max"].default_value = 0.0; st.clamp = True; wl.new(vo.outputs["Distance"], st.inputs["Value"])
    up = wn.new("ShaderNodeMath"); up.operation = "GREATER_THAN"; up.inputs[1].default_value = 0.08; wl.new(sep.outputs["Z"], up.inputs[0])
    m1 = wn.new("ShaderNodeMath"); m1.operation = "MULTIPLY"; wl.new(st.outputs[0], m1.inputs[0]); wl.new(up.outputs[0], m1.inputs[1])
    mx = wn.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "ADD"; wl.new(m1.outputs[0], mx.inputs["Factor"]); wl.new(ramp.outputs["Color"], mx.inputs[6]); mx.inputs[7].default_value = (0.9, 0.92, 1.0, 1); sky = mx.outputs[2]
wl.new(sky, bg.inputs[0]); bg.inputs[1].default_value = 1.0

def pbr(name, scale=1.0, tint=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links; bsdf = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (scale, scale, scale); L.new(tc.outputs["Object"], mp.inputs["Vector"])
    def img(kind, nc):
        t = n.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(os.path.join(A, name, f"{name}_{kind}_2k.jpg")); t.projection = "BOX"; t.projection_blend = 0.25
        if nc: t.image.colorspace_settings.name = "Non-Color"
        L.new(mp.outputs["Vector"], t.inputs["Vector"]); return t
    d = img("diff", False)
    if tint: mx = n.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs["Factor"].default_value = 1.0; L.new(d.outputs["Color"], mx.inputs[6]); mx.inputs[7].default_value = hexc(tint); L.new(mx.outputs[2], bsdf.inputs["Base Color"])
    else: L.new(d.outputs["Color"], bsdf.inputs["Base Color"])
    L.new(img("rough", True).outputs["Color"], bsdf.inputs["Roughness"])
    nm = n.new("ShaderNodeNormalMap"); nm.inputs["Strength"].default_value = 0.8; L.new(img("nor_gl", True).outputs["Color"], nm.inputs["Color"]); L.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return m
def flat(name, col, rough=0.6, metal=0.0, emit=None, estr=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = hexc(col); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit: b.inputs["Emission Color"].default_value = hexc(emit); b.inputs["Emission Strength"].default_value = estr
    return m
def box(name, x0, x1, y0, y1, z0, z1, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); o = bpy.context.active_object; o.name = name; o.scale = (x1 - x0, y1 - y0, z1 - z0)
    bpy.ops.object.transform_apply(scale=True); o.data.materials.append(mat); return o
def cyl(name, x, y, z0, z1, r, mat, rot=None):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=z1 - z0, location=(x, y, (z0 + z1) / 2), vertices=24); o = bpy.context.active_object; o.name = name; o.data.materials.append(mat)
    if rot: o.rotation_euler = rot
    return o
def imp(asset, loc, rotz=0.0, s=1.0):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=os.path.join(A, asset, f"{asset}_1k.gltf"))
    new = [o for o in bpy.data.objects if o not in before]; root = bpy.data.objects.new(asset + " root", None); sc.collection.objects.link(root)
    for o in new:
        if o.parent is None: o.parent = root
    root.location = loc; root.rotation_euler = (0, 0, math.radians(rotz)); root.scale = (s, s, s); return root

PLANK = pbr("old_wooden_floor_02", 0.8, "#b89a7a"); RAIL = pbr("rough_wood", 1.5, "#7a5a40"); DARK = pbr("dark_wooden_planks", 1.0)
# the deck: 12 m along the ship (x), 4.4 m across (y), the port rail at y = -2.2 (nearest the usual lens), starboard at +2.2
X0, X1, Y0, Y1 = -6.0, 6.0, -2.2, 2.2
box("deck", X0, X1, Y0, Y1, -0.12, 0.0, PLANK)
for side, y in (("port", Y0), ("starboard", Y1)):
    box(f"{side} bulwark", X0, X1, y - 0.06, y + 0.06, 0.0, 0.72, DARK)
    box(f"{side} rail", X0, X1, y - 0.1, y + 0.1, 0.72, 0.8, RAIL)
    for k in range(int((X1 - X0) / 1.2) + 1): box(f"{side} post{k}", X0 + k * 1.2 - 0.06, X0 + k * 1.2 + 0.06, y - 0.09, y + 0.09, 0.0, 0.8, RAIL)
# the mast with a yard, the articles nailed to it (our own sheet), the hatch, the bell on its post with its rope
cyl("mast", 0.6, 0.2, 0.0, 9.0, 0.17, RAIL); cyl("yard", 0.6, 0.2, 3.0, 10.0, 0.07, RAIL, rot=(math.radians(90), 0, 0))
art = bpy.data.materials.new("articles"); art.use_nodes = True; tn = art.node_tree.nodes; ti = tn.new("ShaderNodeTexImage"); ti.image = bpy.data.images.load(os.path.join(T, "paper1.png")); art.node_tree.links.new(ti.outputs["Color"], tn["Principled BSDF"].inputs["Base Color"])
bpy.ops.mesh.primitive_plane_add(size=1, location=(0.6, 0.2 - 0.172, 1.5)); ap = bpy.context.active_object; ap.name = "articles"; ap.scale = (0.3, 0.42, 1); ap.rotation_euler = (math.radians(90), 0, 0); ap.data.materials.append(art)
box("hatch coaming", -2.2, -1.2, -0.5, 0.4, 0.0, 0.22, RAIL); box("hatch hole", -2.1, -1.3, -0.4, 0.3, 0.05, 0.225, flat("hole", "#050403", 0.9))
BRASS = flat("brass", "#b08a3a", 0.3, 1.0)
box("bell post", 2.2, 2.32, -1.2, -1.08, 0.0, 1.9, RAIL); box("bell beam", 2.0, 2.5, -1.2, -1.08, 1.86, 1.94, RAIL)
bpy.ops.mesh.primitive_cone_add(radius1=0.14, radius2=0.08, depth=0.22, location=(2.38, -1.14, 1.72)); bpy.context.active_object.data.materials.append(BRASS); bpy.context.active_object.name = "bell"
cyl("bell rope", 2.38, -1.14, 0.7, 1.6, 0.012, flat("rope", "#c9b48a", 0.9))
# the shrouds: ropes from the mast's top down to each rail (the rigging that makes it a ship)
ROPE = flat("rope dark", "#3a2e22", 0.9)
for side, y in (("port", Y0 + 0.1), ("starboard", Y1 - 0.1)):
    for dx in (-0.9, -0.3, 0.3, 0.9):
        a = Vector((0.6, 0.2, 8.6)); b = Vector((0.6 + dx, y, 0.8)); d = b - a; bpy.ops.mesh.primitive_cylinder_add(radius=0.018, depth=d.length, location=(a + b) / 2, vertices=8)
        r = bpy.context.active_object; r.name = f"shroud {side} {dx}"; r.rotation_euler = d.to_track_quat("Z", "Y").to_euler(); r.data.materials.append(ROPE)
# things on deck (Poly Haven CC0)
imp("barrel_03", (-3.2, 1.6, 0), 0, 1.0); imp("barrel_03", (-3.7, 1.2, 0), 40, 0.95); imp("wine_barrel_01", (-0.8, -1.6, 0), 15, 1.0)
imp("wooden_crate_01", (3.6, 1.7, 0), 10, 1.0); imp("barrel_03", (-2.6, 1.75, 0), 20, 0.9); imp("wine_barrel_01", (4.6, -1.6, 0), 70, 1.0); imp("wooden_crate_01", (-5.0, 1.5, 0), 30, 1.0); imp("wooden_crate_01", (3.6, 1.7, 0.36), 70, 0.9)
LAMPS = []
for k, (x, y) in enumerate(((-4.2, Y0), (-1.8, Y0), (1.2, Y0), (3.6, Y0), (-3.0, Y1), (0.0, Y1), (3.0, Y1))):      # the lanterns along both rails (night: lit)
    lr = imp("wooden_lantern_01", (x, y, 0.8), 0, 0.9)
    if LOOK == "night":      # (the glass glows warm: lit, the lantern reads from across the deck)
        for o in lr.children_recursive:
            if o.type == "MESH":
                for ms in o.material_slots:
                    if ms.material and "glass" in ms.material.name and "glow" not in ms.material.name:
                        gm = ms.material.copy(); gm.name = ms.material.name + " glow"; b = gm.node_tree.nodes.get("Principled BSDF")
                        if b: b.inputs["Emission Color"].default_value = hexc("#ffb060"); b.inputs["Emission Strength"].default_value = 18.0; b.inputs["Alpha"].default_value = 1.0
                        ms.material = gm
    if LOOK == "night":
        L = bpy.data.lights.new(f"lantern{k}", "POINT"); L.energy = 260; L.color = (1.0, 0.58, 0.26); L.shadow_soft_size = 0.06; o = bpy.data.objects.new(f"lantern{k}", L); sc.collection.objects.link(o); o.location = (x, y + (0.02 if y < 0 else -0.02), 1.0); LAMPS.append(o)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.045, location=(x, y, 0.98)); gl = bpy.context.active_object; gl.name = f"flame{k}"; gl.data.materials.append(flat(f"flame{k}", "#ffb060", emit="#ffa040", estr=40.0)); gl.visible_shadow = False
# the sea all round and the far horizon
sea = bpy.data.materials.new("sea"); sea.use_nodes = True; sn = sea.node_tree.nodes; sb = sn["Principled BSDF"]; sb.inputs["Base Color"].default_value = hexc("#0a1a2c" if LOOK == "night" else "#5a6a78"); sb.inputs["Roughness"].default_value = 0.12
nz = sn.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 18.0; bm = sn.new("ShaderNodeBump"); bm.inputs["Strength"].default_value = 0.25; sea.node_tree.links.new(nz.outputs["Fac"], bm.inputs["Height"]); sea.node_tree.links.new(bm.outputs["Normal"], sb.inputs["Normal"])
bpy.ops.mesh.primitive_plane_add(size=600, location=(0, 0, -1.4)); bpy.context.active_object.data.materials.append(sea); bpy.context.active_object.name = "sea"
# the light
if LOOK == "night":
    moon = bpy.data.lights.new("moon", "SUN"); moon.color = hexc("#9fb8ff")[:3]; moon.energy = 0.9; moon.angle = math.radians(1.0)
    mo = bpy.data.objects.new("moon", moon); sc.collection.objects.link(mo); mo.rotation_euler = Vector((-0.95, -0.25, -0.45)).to_track_quat("-Z", "Y").to_euler()
    bpy.ops.mesh.primitive_uv_sphere_add(radius=4, location=(150, 18, 52)); m = bpy.context.active_object; m.name = "moon disc"; m.data.materials.append(flat("moonlight", "#f4eed8", emit="#f4eed8", estr=2.5)); m.visible_shadow = False
else:
    mist = bpy.data.materials.new("mist"); mist.use_nodes = True; mn = mist.node_tree.nodes; mn.remove(mn["Principled BSDF"]); vs = mn.new("ShaderNodeVolumePrincipled"); vs.inputs["Density"].default_value = 0.012; vs.inputs["Color"].default_value = hexc("#d6cfc8")
    mist.node_tree.links.new(vs.outputs[0], mn["Material Output"].inputs["Volume"]); bpy.ops.mesh.primitive_cube_add(size=1, location=(60, 0, 3)); mb = bpy.context.active_object; mb.name = "mist"; mb.scale = (100, 140, 10); mb.data.materials.append(mist)
    dawn = bpy.data.lights.new("dawn", "SUN"); dawn.color = hexc("#d9c8b8")[:3]; dawn.energy = 1.6; dawn.angle = math.radians(6)
    do = bpy.data.objects.new("dawn", dawn); sc.collection.objects.link(do); do.rotation_euler = Vector((-0.3, -1.0, -0.15)).to_track_quat("-Z", "Y").to_euler()
# the look camera: from aft, port side, over the hatch toward the mast and the bell
camd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", camd); sc.collection.objects.link(cam); sc.camera = cam; camd.sensor_fit = "VERTICAL"; camd.sensor_height = 24.0; camd.lens = 18
cam.location = (-5.2, -1.3, 1.6); tg = bpy.data.objects.new("tg", None); sc.collection.objects.link(tg); tg.location = (1.2, 0.5, 1.5)
c = cam.constraints.new("TRACK_TO"); c.target = tg; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
out = os.path.join(ENGINE, "out", "deck"); os.makedirs(out, exist_ok=True); sc.render.filepath = os.path.join(out, f"look-{LOOK}.jpg"); bpy.ops.render.render(write_still=True); print("LOOK", LOOK, flush=True)
