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
- 2 shorts per dag: en om dagens nyhet, en på ett trendande ämne.
- Ingenting publiceras utan att du har godkänt just den videon.
- Inga klipp, ljud, loggor eller manus från andra (strejkregeln).
- Inga betaltjänster: inte ElevenLabs, RunPod, Atlabs eller Higgsfield.

### Steg 4: Kontrollera Metricool och YouTube själv
- Metricool, Planering: inga gamla utkast ska ligga kvar.
- Det schemalagda jobbet "Sir Digsworth – video + Short (Tue/Sat)" ska vara pausat.
- YouTube Studio: ta bort gamla shorts som inte håller nivån, om du vill.

## Del 2 – Varje dag (din del tar 10–20 minuter)

### Steg 1: Starta dagens körning
Öppna Claude Code i projektmappen och skriv:

```
Kör dagens körning enligt DAILY-RULES.md. Sök upp dagens nyheter och vad som trendar på YouTube Shorts i dag,
och ge mig 5 förslag: 2–3 om dagens händelser och 2–3 på trendande ämnen. Vänta på mitt val.
```

### Steg 2: Välj två ämnen
Svara med numren, till exempel "1 och 4". Välj ett nyhetsämne och ett trendämne.
Har inget stort hänt den dagen: välj två trendämnen eller ett historieämne.

### Steg 3: Vänta på videorna
Claude skriver manus, kontrollerar fakta mot källor, bygger scenerna, renderar och granskar.
Du behöver inte göra något under tiden.

### Steg 4: Granska varje video innan du godkänner
Titta på hela videon med ljud och gå igenom listan:
- Stämmer allt som sägs med det som syns i bild?
- Är något utanför bild, hackigt eller konstigt animerat?
- Låter rösten och musiken bra? Musiken ska ligga lågt.
- Fångar de första 3 sekunderna?
- Nyheter om verkliga personer: sägs det "enligt" en namngiven källa?
- Finns något som ser ut eller låter som det kommer från någon annans video?

### Steg 5: Godkänn eller skicka tillbaka
- Godkänd: skriv "Godkänd, publicera" och vilken tid, till exempel "i dag 18:00".
- Inte godkänd: skriv vad som är fel så konkret du kan ("emun i scen 3 går genom staketet"). Claude rättar och skickar en ny version.

### Steg 6: Kontrollera att den gick ut
Titta i Metricool eller på kanalen efter publiceringstiden.

## Del 3 – En gång i veckan

```
Gå igenom hur veckans videor har gått (visningar, tittartid, vilka ämnen och titlar som fungerade),
uppdatera GROWTH.md och föreslå vad vi ska göra mer och mindre av.
```

## Viktigt att känna till

- **Metricools gratisplan räcker inte för 2 shorts per dag.** Den tillåter 20 inlägg per månad, och 2 per dag blir
  cirka 60. Välj ett av tre: publicera 20 per månad via Metricool, ladda upp resten själv i YouTube Studio,
  eller uppgradera Metricool (kostar pengar).
- **Remotion är gratis bara för privatpersoner och företag med högst 3 anställda.**
- **Tittarstatistik med tittartid och retention** kräver att YouTube Analytics API kopplas in (skillen `youtube-stats`
  beskriver hur). Utan den får du bara visningar, gillningar och kommentarer.
- **Rendera alltid på datorn.** Molnsessioner saknar grafikkort och tar cirka fem timmar per short.
- **Om något krånglar:** skriv vad som hände med egna ord i Claude Code. Du behöver inte kunna kommandona själv.
