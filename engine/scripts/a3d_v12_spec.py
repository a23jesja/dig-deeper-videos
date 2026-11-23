# v12 (round 4) of the style test: the shots n01-n05 written the same into shots.json and film.json (the film's first 9.5 s are the style test).
import json
HEAD = [-0.75, 0.82, 0.75]      # the fake head card's face centre (set.py DUMMY, the face 4 mm under the card's centre)
def edit(s):
    i = s["id"]
    if i == "n01":      # the hook as clear as the flat v4: through the gap between two bars, the head and the pillow filling the picture, the guard's
                        # hand and torch at the lower right with the whole cone to the head; night (the lamps down, the moon cold)
        s["what"] = "the fake head (flat, v4's drawing) on the pillow, close, through a gap in the bars; the guard's hand and torch at the lower right, the whole cone on the head from frame 1"
        # (the lens just in front of the bars and above their middle band, looking down 29 degrees between bars 3 and 4: the pillow seen from
        #  above round the head; the bars and the band stay out of the picture. The torch's light from the guard's hand just below the lens)
        s["cam"] = {"from": [[-0.751, -0.085, 1.25], [-0.751, -0.075, 1.245]], "at": [-0.80, 0.95, 0.66], "lens": 19, "focus": "head", "fstop": 4}      # (v12b: wide, so the pillow's edges, the blanket and the bunk read, the independent review)
        s["cardScale"] = 1.45
        s["torch"] = {"from": [[-0.735, -0.03, 1.19], [-0.735, -0.03, 1.19]], "at": [HEAD, [HEAD[0] - 0.02, HEAD[1], HEAD[2]]], "power": 80, "cone": 22, "blend": 0.9}
        s["lamps"] = 0.25; s["moon"] = 1.0; s["cardGlow"] = 1.6; s["hand"] = {"lens": [800, 1480], "s": 2.2}
    if i == "n03":      # simpler: close on the fake head while it is named, whole and with nothing in front of it, the torch's cone still on it
        s["what"] = "close on the fake head on the pillow while the narrator says it was fake: whole, nothing in front of it, the torch's cone on it"
        s["cam"] = {"from": [[-0.751, -0.085, 1.25], [-0.751, -0.075, 1.245]], "at": [-0.76, 0.88, 0.70], "lens": 27, "focus": "head", "fstop": 4}
        s["cardScale"] = 1.45
        s["torch"] = {"from": [[-0.735, -0.03, 1.19], [-0.735, -0.03, 1.19]], "at": [[HEAD[0] - 0.02, HEAD[1], HEAD[2]], [HEAD[0] - 0.03, HEAD[1], HEAD[2]]], "power": 80, "cone": 22, "blend": 0.9}
        s["figs"] = []; s["lamps"] = 0.25; s["moon"] = 1.0; s["cardGlow"] = 1.6; s["hand"] = {"lens": [820, 1500], "s": 2.4}      # (v12b: the fist whole inside the picture, the independent review)
    if i == "n02":      # simpler: the lamp held still on the head (no sweep); the cone whole from the lens to the head
        # (the lens moved left, so the guard stands right and the dummy far left of his lamp: the lamp covered the dummy in the first draft)
        s["torch"]["at"] = [HEAD, HEAD]; s["torch"]["blend"] = 0.9; s["cardGlow"] = 0.7; s["lamps"] = 0.45      # (v12b: night, the lit ceiling read as day)
        s["cam"] = {"from": [[-0.30, -3.0, 1.35], [-0.27, -2.95, 1.34]], "at": [0.25, 0, 1.0], "lens": 16, "focus": "guard", "fstop": 3.2}
    if i == "n04":      # the three heads readable at phone size: the cards glow a little more, the spots on their faces
        for k, sp in enumerate(s["spots"]): sp["at"] = [HEAD[0], HEAD[1], HEAD[2] + k * 2.85]
        s["cardGlow"] = 1.3; s["cardScale"] = 1.5; s["lamps"] = 0.5; s["cardFront"] = 0.12; s["cam"]["lens"] = 19; s["cam"]["from"] = [[0.2, -6.5, 5.95], [0, -6.4, 5.92]]      # (further back: the gallery slab cut the bottom dummy's head)
    if i == "n05":      # no stepped edge on the spot: a soft edge all round
        s["torch"]["blend"] = 1.0; s["torch"]["cone"] = 11; s["noDummy"] = True; s["torch"]["soft"] = 0.25      # (v12b: soft shadows: the shelf cut a hard stepped edge in the spot)      # (before the night: no dummy in his bed yet)
    return s
for f in ["src/craft/alcatraz3d/shots.json", "src/craft/alcatraz3d/film.json"]:
    d = json.load(open(f, encoding="utf-8")); d["shots"] = [edit(s) if s["id"] in ("n01", "n02", "n03", "n04", "n05") else s for s in d["shots"]]
    json.dump(d, open(f, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("ok")
