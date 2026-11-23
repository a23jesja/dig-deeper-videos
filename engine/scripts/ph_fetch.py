# Fetch CC0 assets from Poly Haven's own site (api.polyhaven.com / dl.polyhaven.org), one folder per asset with a file list, model and image
# files only (glTF, its .bin, and .jpg/.png textures), and note the licence with URL and date in granskning/3d/licenser.md before use.
# Only environments and objects: never figures.
#   python scripts/ph_fetch.py model <id> [res]     python scripts/ph_fetch.py texture <id> [res]
import json, os, sys, urllib.request, datetime, hashlib
KIND, ID = sys.argv[1], sys.argv[2]
RES = sys.argv[3] if len(sys.argv) > 3 else ("1k" if KIND == "model" else "2k")
ROOT = os.path.join("blender", "cabin", "assets", ID)
LIC = os.path.join("..", "granskning", "3d", "licenser.md")
OK = (".gltf", ".bin", ".jpg", ".jpeg", ".png")
UA = {"User-Agent": "dig-deeper-videos asset fetch"}
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r: return r.read()
info = json.loads(get(f"https://api.polyhaven.com/info/{ID}"))
files = json.loads(get(f"https://api.polyhaven.com/files/{ID}"))
todo = []
if KIND == "model":
    g = files["gltf"][RES]["gltf"]; todo.append((g["url"], os.path.basename(g["url"])))
    for rel, f in g["include"].items(): todo.append((f["url"], rel))
else:
    for m in ("Diffuse", "nor_gl", "Rough", "AO", "arm", "Displacement"):
        if m in files and RES in files[m]:
            f = files[m][RES].get("jpg") or files[m][RES].get("png")
            if f: todo.append((f["url"], os.path.basename(f["url"])))
os.makedirs(ROOT, exist_ok=True); lines = []
for url, rel in todo:
    if not rel.lower().endswith(OK): print("skipped (not a model or image file):", rel); continue
    if not url.startswith("https://dl.polyhaven.org/"): print("skipped (not Poly Haven's own host):", url); continue
    p = os.path.join(ROOT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); b = get(url); open(p, "wb").write(b)
    lines.append(f"{rel}\t{len(b)}\t{hashlib.md5(b).hexdigest()}\t{url}")
open(os.path.join(ROOT, "filelist.txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
os.makedirs(os.path.dirname(LIC), exist_ok=True)
if not os.path.exists(LIC): open(LIC, "w", encoding="utf-8").write("# Licences of the 3D assets\n\nEvery asset is noted here (URL, licence, date) before it is used. Only environments and objects, never figures.\n\n| Asset | Kind | Authors | Licence | URL | Fetched |\n|---|---|---|---|---|---|\n")
lic = open(LIC, encoding="utf-8").read()
if f"/a/{ID})" not in lic:
    authors = ", ".join(info.get("authors", {}).keys())
    open(LIC, "a", encoding="utf-8").write(f"| {ID} | {KIND} {RES} | {authors} | CC0 1.0 (polyhaven.com/license) | [polyhaven.com/a/{ID}](https://polyhaven.com/a/{ID}) | {datetime.date.today().isoformat()} |\n")
print(f"{ID}: {len(lines)} files, {sum(int(l.split(chr(9))[1]) for l in lines) / 1e6:.1f} MB")
