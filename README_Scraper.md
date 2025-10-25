# Fanø Vandstand - Web Scraper Version

## 🌊 Oversigt
Dette system henter live vandstandsdata direkte fra DMI's hjemmeside og Esbjerg Havns vejrside gennem web scraping. Det kræver ingen API-nøgler og giver realtidsdata om vandstand i Esbjerg Havn.

## 📁 Filer

### Nye scraper-filer:
- **`vandstand-scraper.js`** - Web scraper server der henter data fra DMI og Esbjerg Havn
- **`package-scraper.json`** - NPM dependencies for scraper version
- **`Fano_Vandstand_Live.html`** - Frontend der viser live data (fungerer med begge servere)

### Originale filer (bevaret):
- **`dmi-api-client.js`** - Original API-baseret server (kræver API nøgle)
- **`Fano_Stram_Design.html`** - Statisk version uden live data
- **`package.json`** - Dependencies for API version

## 🚀 Installation og Kørsel

### Metode 1: Web Scraper (Anbefalet - ingen API nøgle nødvendig)

#### 1. Installer dependencies
```bash
npm install --save express cors puppeteer cheerio axios
# eller brug package-scraper.json:
npm install --package-lock-only --package=package-scraper.json
```

#### 2. Start scraper serveren
```bash
node vandstand-scraper.js
```

Serveren kører nu på http://localhost:3001

#### 3. Åbn HTML siden
Åbn `Fano_Vandstand_Live.html` i din browser.

### Metode 2: DMI API (Kræver API nøgle)
Se `README_Vandstand.md` for instruktioner.

## 📊 Data Kilder

Systemet henter data fra følgende kilder (i prioriteret rækkefølge):

1. **Esbjerg Havn** (https://portesbjerg.dk/havneservice/vejrforhold)
   - Vandstand i havnen (DVR90)
   - Vindhastighed og retning
   - Bølgehøjde

2. **DMI Vandstand** (https://www.dmi.dk/hav/vandstand/)
   - Aktuel vandstand for Esbjerg
   - Prognoser hvis tilgængelige

3. **DMI Public Data** (Fallback)
   - Offentligt tilgængelige data endpoints

4. **Simuleret tidevand** (Sidste udvej)
   - Realistisk tidevandsmodel baseret på tid
   - 12.42 timers cyklus (semi-diurnal)
   - Amplitude på 165 cm (typisk for Esbjerg)

## 🔄 Cache og Opdatering

- **Cache TTL**: 5 minutter (minimerer server-belastning)
- **Auto-opdatering**: Frontend opdaterer hvert 5. minut
- **Manuel refresh**: POST til `/api/refresh` for at rydde cache
- **Smart fallback**: Hvis live data fejler, bruges simuleret data

## 📡 API Endpoints

### GET `/api/waterlevel`
Returnerer komplet vandstandsdata:
```json
{
  "station": "Esbjerg Havn I",
  "current": {
    "value": 125,
    "time": "2025-10-25T10:00:00Z",
    "station": "Esbjerg Havn I"
  },
  "measured": [...],
  "forecast": [...],
  "metadata": {
    "source": "Esbjerg Havn",
    "wind": {
      "speed": 12.5,
      "direction": "SV"
    }
  }
}
```

### GET `/health`
Server status og cache information

### GET `/api/stations`
Liste over tilgængelige stationer

### POST `/api/refresh`
Tvinger cache refresh

## ⚙️ Tekniske Detaljer

### Web Scraping
- **Puppeteer**: Håndterer JavaScript-rendered sider
- **Cheerio**: Parser HTML data
- **Axios**: Henter simple HTTP endpoints

### Tidevandsmodel
Systemet bruger en realistisk tidevandsmodel når live data ikke er tilgængelig:
- Semi-diurnal tidevand (2 høj- og lavvande per døgn)
- 12.42 timers cyklus
- Amplitude justeret for Vadehavet
- Vejreffekter simuleret

### Performance
- Caching reducerer server requests
- Parallel data fetching for hurtigere respons
- Fallback sikrer altid tilgængelige data

## 🛠️ Fejlfinding

### Problem: "Cannot find module 'puppeteer'"
```bash
npm install puppeteer
```

### Problem: Puppeteer Chrome fejler
```bash
# På Linux/Mac:
sudo apt-get install chromium-browser

# Eller kør headless:
# Sæt i vandstand-scraper.js linje 31:
headless: true
```

### Problem: Ingen data fra websites
- Websites kan have ændret struktur
- Check browser console for fejl
- Prøv `/api/refresh` endpoint
- Fallback til simuleret data aktiveres automatisk

### Problem: Port 3001 er optaget
```bash
# Kør på anden port:
PORT=3002 node vandstand-scraper.js
```

## 📈 Vandstands Niveauer

### Kritiske højvande niveauer:
- **+300 cm**: Forpladser oversvømmet
- **+290 cm**: Tilkørselsveje lukket  
- **+240 cm**: P-plads skal ryddes
- **+200 cm**: Sejlads kan stoppes

### Kritiske lavvande niveauer:
- **-140 cm**: Bundkar-berøring mulig
- **-152 cm**: Biloverførsel usikker
- **-172 cm**: Sejlads indstilles

## 🔒 Sikkerhed og Ansvarsfraskrivelse

⚠️ **VIGTIGT**: 
- Dette system er KUN til informativ brug
- MÅ IKKE bruges til sikkerhedskritiske beslutninger
- Kontakt altid Fanølinjen for officiel status
- Data accuracy kan ikke garanteres

## 📝 Licens

Dette projekt er til uddannelsesmæssige og informative formål. Brug på eget ansvar.

## 🤝 Support

Ved problemer:
1. Check server logs i terminal
2. Verificer at websites er tilgængelige
3. Test med `/health` endpoint
4. Genstart server
5. Check browser console for frontend fejl

---

**Udviklet til**: Fanø færgeoverfart monitorering  
**Data kilder**: DMI.dk, Esbjerg Havn  
**Reference**: DVR90 (Dansk Vertikal Reference)
