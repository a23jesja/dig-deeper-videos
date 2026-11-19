# Målad kajuta: test (Jesper 19 nov), byggsessionens anteckning

Det här är ett test och ingen film. Inget av det används i någon film förrän Jesper har valt. Allt kördes lokalt på den här datorn: ComfyUI på port 8188 och Python i ComfyUI:s venv. Inga betaltjänster, inga krediter och inget moln användes.

## Vad som laddades ned, varifrån och med vilken licens

**Nedladdat i dag** (bara detta). Depth Anything V2 Small, transformers-versionen, från https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf. Licensen är Apache-2.0, enligt modellkortet och Hugging Face-API:ts fält `license`, som jag läste före nedladdningen. Base och Large (CC-BY-NC) laddades inte ned.

| Fil | Byte | SHA-256 |
|---|---|---|
| config.json | 950 | c56698d3643dde1f83ea2212759e6b31a22b8f827246a36dd007ee8a22b3ff75 |
| preprocessor_config.json | 775 | d41175c0d889477ca8fc67191e540faef14baf6275157b3fdecf78469e6bbf84 |
| model.safetensors | 99 173 660 | 3152477ce0d8d6978d76b995120de97cb5b928701fd0f817769f59e249a16b70 |

Filerna ligger i C:\Users\sweje\ComfyUI\models\geometry_estimation\depth-anything-v2-small-hf\.

**Fanns redan på datorn,** så inget av detta laddades ned:
- SDXL base 1.0, `sd_xl_base_1.0.safetensors` (6 938 078 334 byte, SHA-256 31e35c80…3f7e5b).
  - Det är samma SHA-256 som Stabilitys officiella fil på https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0.
  - Licensen är CreativeML Open RAIL++-M (API-fältet: `openrail++`), som tillåter kommersiellt bruk.
- Real-ESRGAN x4plus anime 6B (BSD-3-Clause), för förstoringen 4x. Motorn har använt den förut (scripts/comfy_upscale.py).

## SDXL: prompt, seed och inställningar

Jobbet ligger i engine/scripts/paint-jobs/cabin-night.json. De exakta inställningarna för den valda bilden står i `sdxl-installningar-seed-7322.json` här bredvid.

**Prompt:**
> interior of a pirate captain's great cabin on an old wooden sailing ship at night, straight-on view at standing eye level from the open front of the room, dark wooden plank walls and heavy ceiling beams, three square stern windows in the back wall showing a deep blue moonlit sea and stars, a wooden table on the right with a glowing oil lantern, a rolled sea chart and a bottle, a wooden sea chest, warm orange lantern glow and cool blue moonlight, open empty plank floor in the middle of the room, hand-painted cartoon animation background, flat colours with soft painted shading, clean bold shapes, storybook painterly style, no people

**Negativ prompt:**
> people, person, figure, character, man, woman, face, hands, text, letters, writing, words, numbers, watermark, signature, logo, frame, border, photo, photorealistic, 3d render, blurry, noisy, grainy, cluttered floor, fisheye, distorted perspective

**Inställningar:**
- 768 x 1344
- 32 steg
- CFG 6,0
- sampler dpmpp_2m, schemaläggare karras
- denoise 1,0

**Seed:**
- Fyra prövades: 1718, 2611, 4051 och 7322 (`0-fyra-seeds-1718-2611-4051-7322.jpg`).
- **7322 valdes.** Den har ett öppet plankgolv i mitten där två figurer kan stå. Möblerna står vid sidorna och fönstret med månen syns bakom.
- I de andra står ett bord eller en lykta mitt på golvet, och det skulle skära figurerna.

**Efter SDXL:**
1. Real-ESRGAN anime 4x gav 3072 x 5376.
2. Bilden skalades ned till höjden 2880 och beskars i mitten till 1620 x 2880, alltså 9:16, 1,5 gånger bildrutan.

## De tre djuplagren

Det gjordes med engine/scripts/depth_layers.py och Depth Anything V2 Small.

- **Djupet** skalas 0–1, där 1 är närmast. Se `1-djupkarta-vitt-ar-nara.jpg`.
- **Bakgrunden** (`2-lager-far.jpg`) är hela målningen. Den ligger bakom de andra, så det som ett närmare lager avtäcker när linsen går in är ändå målat.
- **Mitten** (`2-lager-mid.jpg`, magenta = genomskinligt) är allt med djup ≥ 0,45: takets kant, lyktan, skåpet, bänken och golvremsan närmast.
- **Förgrunden** (`2-lager-near.jpg`) är allt med djup ≥ 0,70, utom rutan där figurerna står (x 20–72 %, y från 30 %). Där blir bara bänkens armstöd kvar vid högerkanten.
  - Ett golv går från långt bort till nära mot nederkanten. Ett förgrundslager över figurernas fötter skulle skära dem, och regeln är att ingen förgrund får ligga över en figur.
- **Kanterna** mjukas med några pixlar.

## Uppställningen (engine/src/craft/shorts/cabinTest.ts)

- **Lagren** är plan rakt mot linsen, 2,4 m (förgrund), 3,9 m (mitt) och 7 m (bakgrund) framför den. Vart och ett fyller bilden exakt från startpunkten. Lagren tar inget ljus, eftersom målningen har sitt eget.
- **Ett osynligt golv** tar figurernas skuggor på de målade plankorna.
- **Linsen** står på 1,35 m höjd, synfält 50°, och glider rakt in 0,30 m på 5 s.
- **Figurerna:** Sir till vänster och Blackbeard till höger, 3,4 m från linsen, båda i viloställning. De vrider huvudet lite mot varandra. Det finns inga gester, eftersom gestbiblioteket inte är godkänt än.
- **Samma ljus i båda:**
  - ett varmt lågt ljus framifrån vänster, 17° högt;
  - ett blått nattljus från himlen;
  - samma färgton över bilden, blå mot kanterna och varm där de två står.
  - Ljuset ligger lågt, eftersom ett högre ljus i 3D-kajutan föll genom takbjälkarna och gjorde ansiktena grå. Då hade de två versionerna inte belyst figurerna lika.
- **3D-versionen:**
  - Det är vår vanliga kajuta (world/cabin.ts) med natthav, måne och stjärnor bakom fönstren, och lyktan tänd på bordet.
  - Linsen och figurerna står 0,8 m åt höger i rummet, så att Blackbeard inte står i pallen.

**Kontroller:** kroppskontrollen ger 0 fel i båda versionerna, med de nya människotesten, och greppen är OK.
- Kontrollen ser inte det som är målat, så jag gick igenom lagren själv.
- Förgrunden ligger bara vid högerkanten, och ingen figur skärs.

## Vad jag ser (för Jespers val)

**Det som talar för den målade:**
- Rummet blir rikare: trä, lyktsken och månljus på havet.
- Det kostar en bild i stället för att modellera.

**Det som talar emot den målade:**
- **Stilen:** målningen är mer detaljerad och texturerad än figurerna, som är platta. De skiljer sig i stil.
- **Djupet:**
  - Linsen kan bara glida in rakt fram. En sidorörelse skulle visa att lagren är platta.
  - Figurerna kan inte gå in i rummet eller bakom möblerna, eftersom de bara får stå mellan mitt- och förgrundslagret.
- **Kontrollerna** kan inte se vad som är målat, så varje målad bild måste granskas för hand mot regeln om förgrund och om ingenting som går igenom något.
- **Från bild till bild:** varje ny vy av samma rum är en ny målning. Den blir inte exakt likadan.

**3D-versionen:** den är mörkare och enklare, men linsen kan röra sig fritt. Figurerna kan gå i rummet, och alla kontroller ser allt.
