# Guide: så gör du vid datorn

Skriven 2026-11-13 från molnsessionen. Gäller kanalen Sir Digsworth och repot `a23jesja/dig-deeper-videos`.

## Del 1 – Engångsuppsättning (cirka 10 minuter)

Gör detta en gång. Allt sker i Claude Code på datorn, i mappen där `dig-deeper-videos` ligger.

### Steg 1: Öppna Claude Code i projektmappen
Starta Claude Code och kontrollera att den står i mappen `dig-deeper-videos`.

### Steg 2: Klistra in den här texten

```
Hämta grenen claude/emu-short-cloud från origin och ta in de här delarna i main:
DAILY-RULES.md, GUIDE-datorn.md, .claude/skills/ och skills-lock.json och tillägget i .gitignore.
Ta INTE in mappen emu-short/ (den är en äldre molnversion av emu-shorten som redan är klar här).
Kör sedan: npx skills add remotion-dev/skills --yes --agent claude-code
(de skillsen ska bara ligga lokalt och inte committas, de står i .gitignore).
Kontrollera att faster-whisper är installerat, annars: pip install faster-whisper
Läs DAILY-RULES.md, README.md och GROWTH.md och bekräfta kort vilka regler som gäller.
Committa och pusha till main. Publicera ingenting.
```

### Steg 3: Kontrollera svaret
Claude ska bekräfta fyra saker. Stämmer någon inte, be den rätta det innan du går vidare.
- Ett ämne: bisarr och bortglömd historia. Nyheter och trender väljer bara vilken historia som berättas.
- Långa videor på 7–12 minuter är huvudsaken, shorts är reklam för dem (3–5 i veckan).
- Ingenting publiceras utan att du har godkänt just den videon.
- Inga klipp, ljud, loggor eller manus från andra (strejkregeln).
- Inga betaltjänster: inte ElevenLabs, RunPod, Atlabs eller Higgsfield.

### Steg 4: Kontrollera Metricool och YouTube själv
- Metricool, Planering: inga gamla utkast ska ligga kvar.
- Det schemalagda jobbet "Sir Digsworth – video + Short (Tue/Sat)" ska vara pausat.
- YouTube Studio: ta bort gamla shorts som inte håller nivån, om du vill.

## Del 2 – Varje vecka (din del tar ungefär en timme)

### Steg 1: Välj ämne för nästa långa video
Öppna Claude Code i projektmappen och skriv:

```
Följ DAILY-RULES.md. Sök upp veckans nyheter och vad som trendar på YouTube, och ge mig 10 förslag på
historiska berättelser som speglar dem eller som många söker efter. Skriv för varje: titel, krok i en mening,
varför den kan gå bra, och 3 shorts som kan klippas ur den. Vänta på mitt val.
```

Välj ett ämne genom att svara med numret.

### Steg 2: Godkänn manuset
Du får manuset med källor innan något byggs. Läs det högt för dig själv:
- Vill jag veta fortsättningen efter de första 15 sekunderna?
- Finns det ställen där jag tappar intresset? Säg var.
- Är något svårt att förstå eller onödigt?
Svara "Manus godkänt" eller säg vad som ska ändras. Ett bra manus är viktigare än allt annat.

### Steg 3: Vänta på videon och shortsen
Claude spelar in rösten, bygger scenerna, renderar och granskar den långa videon och 3–5 shorts ur den.
Det tar flera dagar för en lång video. Du behöver inte göra något under tiden.

### Steg 4: Granska varje video innan du godkänner
Titta på hela videon med ljud och gå igenom listan:
- Stämmer allt som sägs med det som syns i bild?
- Är något utanför bild, hackigt eller konstigt animerat?
- Låter rösten och musiken bra? Musiken ska ligga lågt.
- Fångar de första 3 sekunderna?
- Nyheter om verkliga personer: sägs det "enligt" en namngiven källa?
- Finns något som ser ut eller låter som det kommer från någon annans video?

### Steg 4b: Välj thumbnail
Du får tre förslag per video. Titta på dem i liten storlek (som i mobilens flöde) och fråga dig:
- Förstår jag på en sekund vad videon handlar om?
- Går orden att läsa när bilden är pytteliten?
- Skulle jag själv klicka på den här bland tio andra?
- Visar den något som faktiskt finns i videon?
Duger ingen: säg vad som saknas ("större ansikte", "färre ord", "mer kontrast") och be om tre nya.

### Steg 5: Godkänn eller skicka tillbaka
- Godkänd: skriv "Godkänd, publicera med thumbnail 2". Du behöver inte ange tid: Claude väljer den bästa tiden
  för visningar och berättar vilken den valde (normalt tisdag–fredag kl 16:00 svensk tid).
- Inte godkänd: skriv vad som är fel så konkret du kan ("emun i scen 3 går genom staketet"). Claude rättar och skickar en ny version.

### Steg 6: Kontrollera att den gick ut
Titta i Metricool eller på kanalen efter publiceringstiden.

## Del 3 – En gång i månaden

```
Gå igenom hur månadens videor har gått: visningar, genomsnittlig tittartid, hur många som är kvar efter 30 sekunder
och efter halva videon, klickfrekvens och nya prenumeranter. Uppdatera GROWTH.md, säg vad vi ska göra mer och mindre av,
och hur långt vi är från 500 prenumeranter, 1 000 prenumeranter och 4 000 tittartimmar.
```

Milstolpar:
- 500 prenumeranter: slå på medlemskap.
- 1 000 prenumeranter och 4 000 tittartimmar: ansök till partnerprogrammet. Kravet uppges fördubblas 1 februari 2027, så vänta inte.

## Viktigt att känna till

- **Metricools gratisplan räcker ungefär.** Den tillåter 20 inlägg per månad. Med 2–4 långa videor och 12–20 shorts
  i månaden kan du hamna strax över; ladda då upp de sista själv i YouTube Studio.
- **Målet är cirka 1 miljon visningar i månaden på långa videor**, vilket uppskattningsvis ger minst 50 000 kr.
  Shorts ger nästan inga pengar; de ska locka folk till de långa videorna.
- **Rösten är bestämd:** Kokoro-rösten behålls. Allt annat i planen görs fullt ut.
- **Remotion är gratis bara för privatpersoner och företag med högst 3 anställda.**
- **Tittarstatistik med tittartid och retention** kräver att YouTube Analytics API kopplas in (skillen `youtube-stats`
  beskriver hur). Utan den får du bara visningar, gillningar och kommentarer.
- **Rendera alltid på datorn.** Molnsessioner saknar grafikkort och tar cirka fem timmar per short.
- **Om något krånglar:** skriv vad som hände med egna ord i Claude Code. Du behöver inte kunna kommandona själv.
