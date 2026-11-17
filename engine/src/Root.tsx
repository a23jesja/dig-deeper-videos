import React from "react";
import { Composition } from "remotion";
import { Sheet } from "./videos/emu/Sheet";
import { SirLook } from "./videos/emu/SirLook";
import { PuppetCompositions } from "./videos/puppet";
import { Titanic3Test, TITANIC3_TEST_FRAMES } from "./videos/emu/Titanic3Test";
import { Titanic3, TITANIC3_FRAMES } from "./videos/emu/Titanic3Film";
import { Titanic3Thumb, TITANIC3_THUMB_FRAMES } from "./videos/emu/Titanic3Thumb";
import { Pompeii1, POMPEII1_FRAMES } from "./videos/emu/Pompeii1Film";
import { Pompeii1Thumb, POMPEII1_THUMB_FRAMES } from "./videos/emu/Pompeii1Thumb";
import { PompCast, POMP_CAST_FRAMES } from "./videos/emu/PompCast";
import { SirChainStill, SIR_CHAIN_FRAMES } from "./videos/emu/SirChainStill";
import { PompMoves, POMP_MOVES_FRAMES } from "./videos/emu/PompMoves";
import { SirViews, SIR_VIEWS_FRAMES } from "./craft/SirViews";
import { SirDesigns, SirDesign, SIR_DESIGN_FRAMES, PW, PH } from "./craft/SirDesigns";
import { MotionTest, MOTION_FRAMES, MW, MH, MFPS } from "./craft/MotionTest";
import { CastViews, CAST_VIEW_FRAMES, CW, CH } from "./craft/CastViews";
import { FaceSheet, FACE_SHEET_FRAMES, FW, FH } from "./craft/FaceSheet";
import { SirTest, SirMoves, SIR_TEST_FRAMES, TW, TH, TFPS, MVW, MVH } from "./craft/SirMotion";
import { SetViews, SET_VIEWS } from "./craft/world/SetViews";
import { RomePee, ROME_PEE_FRAMES, PiratePlank, PIRATE_PLANK_FRAMES, PiratePlankThumbs, RomePeeThumbs } from "./craft/shorts/comps";
import { PompeiiStills, POMPEII_STILLS } from "./craft/world/PompeiiStills";
import { BostonStills, BOSTON_STILLS } from "./craft/world/BostonStills";
import { EnvKit, ENV_PARTS } from "./videos/emu/env/EnvKit";
import { ThreeWay3 } from "./videos/three3d/ThreeWay3";
import { StyleSheet } from "./videos/style/StyleSheet";
import { StyleScene } from "./videos/style/StyleScene";
import { Dance, DanceThumb, Mona2D, Mona2DThumb, Titanic1, Titanic1Thumb } from "./videos/style2d/Mona2D";
import { DANCE_TOTAL } from "./videos/style2d/dance";
import { TITANIC1_TOTAL } from "./videos/style2d/titanic1";
import { TOTAL as MONA2D_TOTAL } from "./videos/style2d/scenes";
import { MonaShort, MonaShortThumb, MONA_SHORT_TOTAL } from "./videos/style/MonaShort";
import { EmuShort, EmuLong, WojtekShort, WojtekLong, PigShort, PigLong, LustigShort, LustigLong, MonaLong, MonaThumb, MonaFlat, MONA_LONG_FRAMES, EMU_FRAMES, EMU_LONG_FRAMES, WOJTEK_FRAMES, WOJTEK_LONG_FRAMES, PIG_FRAMES, PIG_LONG_FRAMES, LUSTIG_FRAMES, LUSTIG_LONG_FRAMES } from "./videos/emu/Emu";

export const Root: React.FC = () => (
  <>
    <Composition id="EmuShort" component={EmuShort} durationInFrames={EMU_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="EmuLong" component={EmuLong} durationInFrames={EMU_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="WojtekShort" component={WojtekShort} durationInFrames={WOJTEK_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="WojtekLong" component={WojtekLong} durationInFrames={WOJTEK_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="PigShort" component={PigShort} durationInFrames={PIG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PigLong" component={PigLong} durationInFrames={PIG_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="LustigShort" component={LustigShort} durationInFrames={LUSTIG_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="LustigLong" component={LustigLong} durationInFrames={LUSTIG_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MonaLong" component={MonaLong} durationInFrames={MONA_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MonaFlat" component={MonaFlat} durationInFrames={MONA_LONG_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="MonaThumb" component={MonaThumb} durationInFrames={14} fps={30} width={1920} height={1080} />
    <Composition id="Sheet" component={Sheet} durationInFrames={120} fps={30} width={2400} height={2400} />
    <Composition id="SirLook" component={SirLook} durationInFrames={2} fps={30} width={1920} height={1080} />
    <Composition id="StyleSheet" component={StyleSheet} durationInFrames={7} fps={30} width={1920} height={1080} />
    <Composition id="MonaShort" component={MonaShort} durationInFrames={MONA_SHORT_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="MonaShortThumb" component={MonaShortThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Mona2D" component={Mona2D} durationInFrames={MONA2D_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Mona2DThumb" component={Mona2DThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1" component={Titanic1} durationInFrames={TITANIC1_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Titanic1Thumb" component={Titanic1Thumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="Dance" component={Dance} durationInFrames={DANCE_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="DanceThumb" component={DanceThumb} durationInFrames={3} fps={30} width={1080} height={1920} />
    <Composition id="StyleScene" component={StyleScene} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="ThreeWay3" component={ThreeWay3} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="Titanic3" component={Titanic3} durationInFrames={TITANIC3_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Titanic3Thumb" component={Titanic3Thumb} durationInFrames={TITANIC3_THUMB_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Pompeii1" component={Pompeii1} durationInFrames={POMPEII1_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="Pompeii1Thumb" component={Pompeii1Thumb} durationInFrames={POMPEII1_THUMB_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PompCast" component={PompCast} durationInFrames={POMP_CAST_FRAMES} fps={30} width={2240} height={1000} />
    <Composition id="PompMoves" component={PompMoves} durationInFrames={POMP_MOVES_FRAMES} fps={30} width={2400} height={1300} />
    <Composition id="SirViews" component={SirViews} durationInFrames={SIR_VIEWS_FRAMES} fps={30} width={2600} height={1400} />
    <Composition id="SirDesigns" component={SirDesigns} durationInFrames={1} fps={30} width={PW * 2} height={PH * 3} />
    <Composition id="SirDesign" component={SirDesign} durationInFrames={SIR_DESIGN_FRAMES} fps={30} width={PW} height={PH} />
    <Composition id="MotionTest" component={MotionTest} durationInFrames={MOTION_FRAMES} fps={MFPS} width={MW} height={MH} />
    <Composition id="PompeiiStills" component={PompeiiStills} durationInFrames={POMPEII_STILLS} fps={30} width={1080} height={1920} />
    <Composition id="CastViews" component={CastViews} durationInFrames={CAST_VIEW_FRAMES} fps={30} width={CW} height={CH} />
    <Composition id="FaceSheet" component={FaceSheet} durationInFrames={FACE_SHEET_FRAMES} fps={30} width={FW} height={FH} />
    <Composition id="SirTest" component={SirTest} durationInFrames={SIR_TEST_FRAMES} fps={TFPS} width={TW} height={TH} />
    <Composition id="SirMoves" component={SirMoves} durationInFrames={1} fps={30} width={MVW} height={MVH} />
    <Composition id="RomePee" component={RomePee} durationInFrames={ROME_PEE_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PiratePlank" component={PiratePlank} durationInFrames={PIRATE_PLANK_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="PiratePlankThumbs" component={PiratePlankThumbs} durationInFrames={3} fps={30} width={1280} height={720} />
    <Composition id="RomePeeThumbs" component={RomePeeThumbs} durationInFrames={3} fps={30} width={1280} height={720} />
    <Composition id="SetViews" component={SetViews} durationInFrames={SET_VIEWS} fps={30} width={1080} height={1920} />
    <Composition id="BostonStills" component={BostonStills} durationInFrames={BOSTON_STILLS} fps={30} width={1080} height={1920} />
    <Composition id="SirChainStill" component={SirChainStill} durationInFrames={SIR_CHAIN_FRAMES} fps={30} width={1600} height={1250} />
    <Composition id="Titanic3Test" component={Titanic3Test} durationInFrames={TITANIC3_TEST_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="EnvKit" component={EnvKit} durationInFrames={ENV_PARTS} fps={30} width={1920} height={1080} />
    <PuppetCompositions />
  </>
);
