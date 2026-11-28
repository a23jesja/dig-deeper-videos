import React from "react";
import { Composition } from "remotion";
// The video code after the look was frozen (Jesper, 21 Nov 2026: "Riktning A Knopp är godkänd och fryst"): flat 2D, direction A Knopp.
// Directions B and C, the 3D card figures, the 3D sets and every film built on them are removed; git tag fore-platt-2d builds them all.
import { FlatStyle, FSW, FSH, FLAT_FRAMES } from "./craft/FlatStyle";
import { FlatMotionA, FLAT_MOTION_FRAMES } from "./craft/FlatMotion";
import { FlatClip, CLIP_IDS, clipFrames } from "./craft/clips/FlatClip";
import { AlcatrazFilm, AlcatrazShot, SHOT_IDS, shotFrames, FILM_S } from "./craft/alcatraz/AlcatrazFilm";
import { EiffelFilm, EiffelHook, EiffelShot, EIFFEL_IDS, eiffelFrames, FILM_S as EIFFEL_S } from "./craft/eiffel/EiffelFilm";
import { Cabin3D, CABIN_S } from "./craft/cabin3d/Cabin3D";
import { Moves3D, MOVES_S } from "./craft/moves3d/Moves3D";
import { Dinner3D, DINNER_S } from "./craft/dinner3d/Dinner3D";
import { Roberts3D, ROBERTS_S } from "./craft/roberts3d/Roberts3D";
import { KitSheet, KSW, KSH, KIT_FRAMES } from "./craft/wardrobe/KitSheet";
import { SleeveSheet, SSW, SSH } from "./craft/wardrobe/SleeveSheet";
import { PirateSheet, PSW, PSH, PIRATE_FRAMES } from "./craft/wardrobe/PirateSheet";
import { RumSheet, RSW, RSH } from "./craft/roberts3d/RumSheet";
import { PropSheet, PRSW, PRSH } from "./craft/roberts3d/PropSheet";
import { Alcatraz3D, PROV_S, Alcatraz3DFilm, FILM_S as FILM3D_S, DummyCard } from "./craft/alcatraz3d/Alcatraz3D";
// the older flat films (style2d: no 3D, no card figures)
import { Dance, DanceThumb, Mona2D, Mona2DThumb, Titanic1, Titanic1Thumb } from "./videos/style2d/Mona2D";
import { DANCE_TOTAL } from "./videos/style2d/dance";
import { TITANIC1_TOTAL } from "./videos/style2d/titanic1";
import { TOTAL as MONA2D_TOTAL } from "./videos/style2d/scenes";

export const Root: React.FC = () => (
  <>
    <Composition id="KitSheet" component={KitSheet} durationInFrames={KIT_FRAMES} fps={30} width={KSW} height={KSH} />
    <Composition id="SleeveSheet" component={SleeveSheet} durationInFrames={2} fps={30} width={SSW} height={SSH} />
    <Composition id="PirateSheet" component={PirateSheet} durationInFrames={PIRATE_FRAMES} fps={30} width={PSW} height={PSH} />
    <Composition id="RumSheet" component={RumSheet} durationInFrames={3} fps={30} width={RSW} height={RSH} />
    <Composition id="PropSheet" component={PropSheet} durationInFrames={6} fps={30} width={PRSW} height={PRSH} />
    <Composition id="FlatStyle" component={FlatStyle} durationInFrames={FLAT_FRAMES} fps={30} width={FSW} height={FSH} />
    <Composition id="FlatMotionA" component={FlatMotionA} durationInFrames={FLAT_MOTION_FRAMES} fps={30} width={1080} height={1920} />
    {/* the eight shot types of the library in flat 2D, one clip each (Bildtyp-c01 ... c08) */}
    {CLIP_IDS.map((id) => <Composition key={id} id={`Bildtyp-${id}`} component={FlatClip} defaultProps={{ id }} durationInFrames={clipFrames(id)} fps={30} width={1080} height={1920} />)}
    {/* Alcatraz in the new style, the style test (22-23 Nov): Blender plates, the flat figures on their floor */}
    {/* the Short "The captain's dinner" (24 Nov evening) */}
    <Composition id="Dinner3D" component={Dinner3D} defaultProps={{ muted: true }} durationInFrames={Math.round(DINNER_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Roberts3D" component={Roberts3D} defaultProps={{ muted: true }} durationInFrames={Math.round(ROBERTS_S * 30)} fps={30} width={1080} height={1920} />
    {/* 3D step 2, the movement sheet (24 Nov) */}
    <Composition id="Moves3D" component={Moves3D} durationInFrames={Math.round(MOVES_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Cabin3D" component={Cabin3D} defaultProps={{ muted: true }} durationInFrames={Math.round(CABIN_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Alcatraz3D" component={Alcatraz3DFilm} defaultProps={{ muted: true }} durationInFrames={Math.round(FILM3D_S * 30)} fps={30} width={1080} height={1920} />
    <Composition id="A3D-dummy" component={DummyCard} defaultProps={{ hair: "#5a3a24" }} durationInFrames={1} fps={30} width={640} height={660} />
    <Composition id="Alcatraz3D-prov" component={Alcatraz3D} defaultProps={{ muted: true }} durationInFrames={Math.round(PROV_S * 30)} fps={30} width={1080} height={1920} />
    {/* Who Sold the Eiffel Tower in 1925 (flat 2D, 23 Nov): the film and each shot alone */}
    <Composition id="Eiffel" component={EiffelFilm} defaultProps={{ muted: true }} durationInFrames={Math.round(EIFFEL_S * 30)} fps={30} width={1080} height={1920} />
    {["B", "D"].map((o) => <Composition key={o} id={`EiffelHook-${o}`} component={EiffelHook} defaultProps={{ opening: o, muted: true }} durationInFrames={150} fps={30} width={1080} height={1920} />)}
    {EIFFEL_IDS.map((id) => <Composition key={id} id={`EiffelShot-${id}`} component={EiffelShot} defaultProps={{ id }} durationInFrames={eiffelFrames(id)} fps={30} width={1080} height={1920} />)}
    {/* Alcatraz 1962 (flat 2D, 22 Nov): the film, its three hook-lab openings (0-5 s) and each shot alone */}
    <Composition id="Alcatraz" component={AlcatrazFilm} defaultProps={{ opening: "A" }} durationInFrames={Math.round(FILM_S * 30)} fps={30} width={1080} height={1920} />
    {["A", "B", "C"].map((o) => <Composition key={o} id={`AlcatrazHook-${o}`} component={AlcatrazFilm} defaultProps={{ opening: o }} durationInFrames={150} fps={30} width={1080} height={1920} />)}
    {SHOT_IDS.map((id) => <Composition key={id} id={`AlcatrazShot-${id}`} component={AlcatrazShot} defaultProps={{ id }} durationInFrames={shotFrames(id)} fps={30} width={1080} height={1920} />)}
    <Composition id="Mona2D" component={Mona2D} durationInFrames={MONA2D_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Mona2DThumb" component={Mona2DThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1" component={Titanic1} durationInFrames={TITANIC1_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1Thumb" component={Titanic1Thumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Dance" component={Dance} durationInFrames={DANCE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="DanceThumb" component={DanceThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
  </>
);
