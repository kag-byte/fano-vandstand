# Fanø Vandstand Live Integration

## Oversigt
Dette system integrerer live vandstandsdata fra DMI's API med en brugervenlig grænseflade til at vurdere sejladsmuligheder mellem Esbjerg og Fanø.

## Filer
- **Fano_Vandstand_Live.html** - Den nye integrerede version med live data
- **dmi-api-client.js** - Node.js API server der henter data fra DMI
- **package.json** - NPM dependencies
- **Fano_Stram_Design.html** - Original statisk version (bevaret)
- **Fano_DMI_Match.html** - Tidligere version (bevaret)

## Installation og Kørsel

### 1. Installer Node.js dependencies
```bash
npm install
```

### 2. Konfigurer DMI API nøgle (valgfrit)
For at få rigtige live data fra DMI:
1. Hent en API nøgle fra https://www.dmi.dk/friedata/
2. Sæt miljøvariablen:
```bash
export DMI_API_KEY="din-api-nøgle-her"
```

Eller rediger direkte i `dmi-api-client.js` linje 15.

### 3. Start API serveren
```bash
npm start
```

Serveren kører nu på http://localhost:3001

### 4. Åbn HTML siden
Åbn `Fano_Vandstand_Live.html` i din browser.

## Funktioner

### Live Vandstandsdata
- **Aktuel vandstand** - Viser nuværende vandstand i Esbjerg Havn I
- **Trend indikator** - Viser om vandstanden er stigende, faldende eller stabil
- **6-timers prognose** - Forudsigelse af vandstand de næste 6 timer
- **24-timers kritiske tidspunkter** - Advarsler om kritiske vandstande

### Status Vurdering
Systemet vurderer automatisk sejladsforhold baseret på vandstand:

#### Farlige niveauer (Rød advarsel)
- **+240 cm og over** - Sejlads truet, P-pladser skal ryddes
- **-152 cm og under** - Biloverførsel usikker eller umulig

#### Advarselsniveauer (Gul advarsel)  
- **+200 til +239 cm** - Hold øje med udviklingen
- **-140 til -151 cm** - Vær forsigtig ved ilandkørsel

#### Normal drift (Grøn status)
- **-139 til +199 cm** - Normal sejlads mulig

### Automatiske Anbefalinger
Baseret på vandstand og prognose giver systemet konkrete anbefalinger:
- Hvornår P-pladser skal ryddes
- Om man skal overveje tidligere/senere afgang
- Advarsler om bundkar-berøring for lave biler
- Kontakt til Fanølinjen ved kritiske situationer

### Visuelle Indikatorer
- **Aktive vandstandsniveauer** markeres med blå kant
- **Farvekoder** for hurtig vurdering (rød/gul/grøn)
- **Live status indikator** viser om data er opdateret
- **Trend pile** viser vandstandsudvikling

## Demo Mode
Hvis API serveren ikke kører, skifter siden automatisk til demo mode med simulerede tidevands-data. Dette er markeret med "Offline (demo data)" i headeren.

## Opdateringsfrekvens
- Data opdateres automatisk hvert 5. minut
- Manuel opdatering mulig via opdateringsknappen
- Sidste opdateringstidspunkt vises i headeren

## Browser Kompatibilitet
- Chrome/Edge (anbefalet)
- Firefox
- Safari
- Fungerer på desktop, tablet og mobil

## Sikkerhed
⚠️ **VIGTIGT**: Dette system er kun til informativ brug og må IKKE anvendes til sikkerhedskritiske beslutninger. Kontakt altid Fanølinjen direkte for officiel status.

## Support
Ved problemer:
1. Tjek at API serveren kører (http://localhost:3001/health)
2. Tjek browser konsollen for fejlmeddelelser
3. Verificer at DMI API nøglen er konfigureret korrekt
4. Prøv at genindlæse siden (Ctrl+F5)

## Teknisk Information
- **Frontend**: Vanilla JavaScript, ingen eksterne dependencies
- **Backend**: Node.js med Express
- **Data kilde**: DMI OceanObs API (DVR90 reference)
- **Stations ID**: Esbjerg Havn I (25149)
