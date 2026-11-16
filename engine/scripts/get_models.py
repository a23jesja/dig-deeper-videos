# Downloads CC0 models from Poly Haven (polyhaven.com/license: CC0, any use, no credit needed) as glTF with 1k textures.
#   python scripts/get_models.py [name ...] -> public/env/models/<name>/
import json, os, sys, urllib.request
NAMES = sys.argv[1:] or ["lifebuoy", "Lantern_01", "vintage_suitcase", "wooden_crate_02", "Barrel_01", "covered_car", "painted_wooden_bench"]
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "asset-fetch"}), timeout=120).read()
for n in NAMES:
    files = json.loads(get(f"https://api.polyhaven.com/files/{n}"))
    g = files["gltf"]["1k"]["gltf"]; d = f"public/env/models/{n}"; os.makedirs(d, exist_ok=True)
    open(f"{d}/{n}_1k.gltf", "wb").write(get(g["url"])); total = g["size"]
    for rel, inc in g.get("include", {}).items():
        p = os.path.join(d, rel); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "wb").write(get(inc["url"])); total += inc["size"]
    print(n, round(total / 1e6, 1), "MB")
