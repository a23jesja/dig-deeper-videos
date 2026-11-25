#!/bin/bash
# The Short "The captain's dinner" v6: the cameras (shots.json -> cams.json), the seat for Blender, the plates (DRAFT=1: half size, 16 samples).
# One job: nothing else may run beside it.   bash scripts/dinner_v6_plates.sh [shot|all]      (from engine/)
cd "$(dirname "$0")/.."
B="/c/Program Files/Blender Foundation/Blender 5.2/blender.exe"
(cd blender/dinner && timeout 600 "$B" -b --factory-startup --disable-autoexec --python set.py -- all --cams-only 2>&1 | grep -E "Traceback|Error:")
node -e "const fs=require('fs');const S=JSON.parse(fs.readFileSync('src/craft/dinner3d/shots.json'));const o={};for(const s of S.shots){o[s.id]=JSON.parse(fs.readFileSync('src/craft/dinner3d/cam/'+s.id+'.json')).frames}fs.writeFileSync('src/craft/dinner3d/cams.json',JSON.stringify(o));"
node scripts/dinner_props.mjs || exit 1
(cd blender/dinner && timeout 3000 "$B" -b --factory-startup --disable-autoexec --python set.py -- ${1:-all} $([ -n "$DRAFT" ] && echo --draft) 2>&1 | grep -E "Traceback|Error:|SHOT" | tail -16)
