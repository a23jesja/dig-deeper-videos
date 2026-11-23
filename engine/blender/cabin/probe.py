import bpy, os, sys, json
from mathutils import Vector
A = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
out = {}
for d in sorted(os.listdir(A)):
    gl = [f for f in os.listdir(os.path.join(A, d)) if f.endswith(".gltf")]
    if not gl: continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    try: bpy.ops.import_scene.gltf(filepath=os.path.join(A, d, gl[0]))
    except Exception as e: out[d] = 'FAILED ' + str(e).splitlines()[-1][:80]; continue
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in bpy.context.scene.objects:
        if o.type != "MESH": continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    out[d] = [round(v, 3) for v in (mx - mn)] + [round(mn.z, 3)]
print("DIMS " + json.dumps(out))
