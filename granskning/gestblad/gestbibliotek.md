# Gestbiblioteket (byggsessionen, 19 november)

**Koden** ligger i engine/src/craft/stage/gestures.ts, och bladet i engine/src/craft/shorts/gestureSheet.ts (kompositionen GestureSheet).

**Inget används i någon film förrän Jesper har godkänt bladet.**

## Bladen

Bladen finns i den här mappen. Varje bild i full storlek, 1080x1920, ligger i full-storlek/.

- **gestblad-1-sir-och-bybo.jpg och gestblad-2-sir-och-bybo.jpg:** varje gest på Sir och en bybo. Framifrån är gesten riktad åt sidan, i bildens plan. Från sidan är den riktad framåt, som också är bildens plan när figuren står i profil.
- **gestblad-3-par.jpg:** gesterna som görs mot någon, som ett par i profil. Stopp, handslag och ge och ta har armbågarna böjda och händerna i brösthöjd, som granskningen bad om.
  - Handen på axeln visas framifrån, som två som står bredvid varandra.
  - Händerna läggs på varandra av motorns räckviddslösare.
  - Kontakten anges för kontrollerna (handshake, handOn, carry), så att de vet att händerna möts med avsikt.
- **hattblad-blackbeard.jpg:** Blackbeards trekantiga hatt vriden 0 till 330° i steg om 30°, ovanifrån och underifrån.

## Ljuset: utomhusvarianten av standarden

Bladet står utomhus i dagsljus.
- Solen är ljuskällan: varm, högt till vänster framifrån.
- Himlen är fyllnadsljuset: det svala ljuset över allt, skuggsidan.
- På figurerna ligger solen varm på sin sida och som en tunn ljuskant (CardLight, dayLight() i gestureSheet.ts).

## Kontroller

Alla kontroller går på varje ruta av bladet, med 0 fel.
- Kroppskontrollen, med ledgränserna, människotesten, dammet och ljuset över ansikten.
- Greppgranskningen.

Bladets bilder är 0,4 s långa. Testet för raka armar kräver 0,5 s och kan därför inte slå här, så de bilderna har jag granskat för hand.

## Det jag vill att Jesper ser särskilt

- **Undvik:** handslag, dra upp någon och hand på axel är byggda, men markerade (undvik). Det är punkt 1 i "Lessons from the best reference Shorts": de visas bara när berättelsen är just den handlingen, och då som närbild på händerna.
  - I gladiatorerna v5 ersätts de av närbilder och resultat, enligt Jesper.
- **Stav mot axeln** läses bara framifrån. Från sidan syns staven ovanför och nedanför huvudet bakom det, så den ser ut att gå genom huvudet. Snett framifrån ligger den över bröstet. Från sidan bär domaren därför staven nedåt.
- **Handen för ögonen** läses i profil, där huvudet böjs ned i handen. Framifrån och snett framifrån ligger handen över munnen och näsan, som "handen för munnen", en chock. Kortet kan inte visa att huvudet böjs mot linsen.
- **Knäböja, på ett knä, resa sig och handen för ögonen** visas snett framifrån, 35°, i stället för rakt framifrån. Rakt framifrån pekar det upplyfta knät och händerna mot linsen och ritas över kroppen.
- **Stopp:** handen är öppen och vänd mot den andre, men ritas längs armen. Fingrarna pekar inte rakt upp.
- **Hand på axel:** Sirs arm räcker långt tvärs över till bybons axel.

## Blackbeards hatt

Jesper: "så att spetsen inte blir en platt svart kil".

Hattens brätte ritades som en enda platt svart form med vassa hörn. Hattbandet var lika svart som hatten, så ingen kant syntes.

Nu, i engine/src/craft/cast.ts, tricorn:
- hörnens spetsar är rundade;
- brättets närmaste, uppvikta sidor är en ton ljusare än den bortre sidan, så varje hörn läses som ett vikt brätte med kropp;
- brättets kant ritas också när bandet är lika svart som hatten.

Formen och färgerna är desamma. Ändringen gäller alla med trekantig hatt i nya renderingar. Levererade filer är orörda.

## Gesterna, som en människa gör dem

- **Peka** (`point`): The body turns a little toward the target and the eyes go to it. The pointing arm is raised toward it, a little under shoulder height, the elbow bent (about 30 degrees, never locked), the index finger out and the other fingers curled. The other arm hangs at ease.
- **Förklara** (`explain`): Both hands in front of the chest at waist height, palms up and open, the elbows bent about 60 degrees close to the body. On the stressed words the hands open outward a little and come back. The eyes on the listener.
- **Rycka på axlarna** (`shrug`): The elbows stay close to the body and bend about 60 degrees, the forearms open outward with the palms up, the head tilts to one side. \"I don't know.\"
- **Armar i kors** (`crossed`): The forearms lie over each other across the lower chest, the hands tucked at the other side, the upper arms down along the body. Never at shoulder height.
- **Stopp** (`stop`): One arm forward toward the other person, the elbow bent about 60 degrees, the hand at chest height with the palm out toward him and the fingers up. The body leans back a little; the eyes on him.
- **Hand på axel** (`shoulder`): Standing beside him, the near arm goes up and across to his shoulder, the elbow bent about 70 degrees, the hand resting on top of the shoulder, palm down. The heads turn toward each other.
- **Handslag** (`handshake`): Facing each other close (less than a metre between the chests), the right hands meet at waist height between them, the elbows bent about 55 degrees, the thumbs up. Eyes on each other.
- **Dra upp någon** (`pullup`): The one who pulls stands with his feet apart, the knees bent and the body leaning back, the pulling arm bent about 30 degrees; the one on the ground reaches up and the hands hold each other.
- **Ge och ta** (`give`): Facing each other, the giver holds the thing out at chest height with the elbow bent about 50 degrees; the taker's hand comes to the same thing, his elbow bent too. Eyes on the thing, then on each other.
- **Knäböja** (`kneel`): Down on the right knee, the left foot planted ahead with the shin upright, the body upright or leaning a little forward. One hand rests on the raised knee, the other hangs.
- **På ett knä med en hand i marken** (`kneelhand`): The beaten man: down on one knee with one hand on the ground beside him, the body leaning over it, the head down.
- **Sitta** (`sit`): Sitting on the front half of a seat, the thighs level, the shins down, the feet flat. The hands rest on the thighs, the back upright.
- **Fallen (sitter på marken)** (`fallen`): Fallen on his back side: sitting on the ground, the legs out in front, the body leaning back on both hands planted behind him, the head up.
- **Resa sig** (`getup`): Getting up from one knee: the front foot planted, the body leaning forward over it, both hands pushing on the raised knee, the eyes ahead.
- **Händerna om huvudet** (`head`): Both hands on the sides of the head, the elbows up and out to the sides, bent about 130 degrees, the eyes wide. \"Oh no.\"
- **Handen för ögonen** (`eyes`): One hand over the eyes, palm in, the elbow bent and forward, the head bowed down into the hand (the eyes come to the hand); the other arm hangs.
- **Jubla** (`cheer`): Both arms up over the head in a V, the elbows almost straight (bent about 20 degrees), the hands open or in fists, the head up.
- **Spänna musklerna** (`flex`): Both upper arms out to the sides at shoulder height, the forearms straight up, bent 90 degrees at the elbow, the fists tight, the chest out, a grin.
- **Stav mot axeln (domaren)** (`stickShoulder`): A stick in one hand, the hand up at the front of the shoulder, the elbow bent and forward, the stick leaning back against the shoulder. The other arm hangs. (The referee's stick: never level across the body in two hands.)
- **Stav nedåt (domaren)** (`stickDown`): A stick in one hand at the side, the arm hanging with the elbow a little bent, the stick pointing down and a little forward.
