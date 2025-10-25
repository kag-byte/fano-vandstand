# 🚀 Fanø Vandstand - Implementerings Guide

## 📋 Oversigt
Denne guide viser hvordan du kan hoste Fanø Vandstand løsningen gratis med forskellige metoder.

## 🎯 Hosting Strategier

### Option 1: Frontend-Only (Nemmest) 
**Hosting**: GitHub Pages, Netlify, Vercel  
**Fordele**: Gratis, nemt, ingen server vedligeholdelse  
**Ulemper**: Kun simuleret data (ingen live scraping)

### Option 2: Full Stack (Anbefalet)
**Hosting**: Render.com, Railway.app, Fly.io  
**Fordele**: Live data fra DMI/Esbjerg Havn  
**Ulemper**: Kan kræve kreditkort (selv om gratis)

### Option 3: Hybrid Løsning
**Frontend**: GitHub Pages  
**Backend**: Render.com  
**Fordele**: Bedste af begge verdener

---

## 🌐 Option 1: Frontend-Only Deployment

### A. GitHub Pages (Anbefalet for simpelhed)

#### 1. Forbered filen
Opret en ny fil `index.html` baseret på `Fano_Vandstand_Live.html` men med simuleret data:

```html
<!-- Kopier indholdet fra Fano_Vandstand_Live.html -->
<!-- Modificer JavaScript delen til kun at bruge fallback data -->
```

#### 2. Upload til GitHub
```bash
# Opret nyt repository på GitHub
git init
git add index.html
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DIT-BRUGERNAVN/fano-vandstand.git
git push -u origin main
```

#### 3. Aktiver GitHub Pages
- Gå til Settings → Pages
- Source: Deploy from branch
- Branch: main, folder: / (root)
- Vent 5 minutter
- Din side er live på: `https://DIT-BRUGERNAVN.github.io/fano-vandstand/`

### B. Netlify (Drop & Deploy)

#### 1. Forbered filer
Opret en mappe med:
- `index.html` (din Fano_Vandstand_Live.html)
- `netlify.toml`:
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

#### 2. Deploy
- Gå til https://app.netlify.com
- Træk mappen ind på siden
- Færdig! Din side er live med et tilfældigt URL
- Du kan ændre URL'en gratis

### C. Vercel

#### 1. Installer Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
vercel --prod
```

---

## 🔧 Option 2: Full Stack Deployment (Med Live Data)

### A. Render.com (Bedste gratis option)

#### 1. Forbered projektet
Opret følgende struktur:
```
fano-vandstand/
├── public/
│   └── index.html (Fano_Vandstand_Live.html)
├── vandstand-scraper.js
├── package.json
└── render.yaml
```

#### 2. Opret `package.json`:
```json
{
  "name": "fano-vandstand",
  "version": "1.0.0",
  "main": "vandstand-scraper.js",
  "scripts": {
    "start": "node vandstand-scraper.js",
    "build": "echo 'No build needed'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "puppeteer": "^21.5.0",
    "cheerio": "^1.0.0-rc.12",
    "axios": "^1.6.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 3. Modificer `vandstand-scraper.js`:
Tilføj static file serving:
```javascript
// Tilføj efter cors setup (linje 11)
app.use(express.static('public'));

// Tilføj root endpoint
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
```

#### 4. Opret `render.yaml`:
```yaml
services:
  - type: web
    name: fano-vandstand
    env: docker
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /health
```

#### 5. Deploy til Render
```bash
# Push til GitHub først
git init
git add .
git commit -m "Ready for deployment"
git push

# På Render.com:
# 1. New → Web Service
# 2. Connect GitHub repo
# 3. Vælg Free tier
# 4. Deploy!
```

**URL**: `https://fano-vandstand.onrender.com`

### B. Railway.app

#### 1. Installer Railway CLI
```bash
npm install -g @railway/cli
```

#### 2. Deploy
```bash
railway login
railway init
railway up
railway domain
```

### C. Fly.io (Kræver kreditkort, men gratis tier)

#### 1. Opret `fly.toml`:
```toml
app = "fano-vandstand"
primary_region = "ams"

[http_service]
  internal_port = 3001
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
```

#### 2. Deploy
```bash
fly launch
fly deploy
```

---

## 🔀 Option 3: Hybrid Deployment (Bedste Performance)

### Frontend på GitHub Pages + Backend på Render

#### 1. Modificer `index.html` for GitHub Pages:
```javascript
// Skift API URL til Render backend
const API_URL = 'https://fano-vandstand-api.onrender.com/api/waterlevel/Esbjerg%20Havn%20I';
```

#### 2. Deploy Backend til Render
Følg Option 2.A, men uden public folder

#### 3. Deploy Frontend til GitHub Pages
Følg Option 1.A med den modificerede index.html

#### 4. Konfigurer CORS i backend:
```javascript
app.use(cors({
    origin: ['https://DIT-BRUGERNAVN.github.io', 'http://localhost:*'],
    credentials: true
}));
```

---

## 📱 Progressive Web App (PWA) Version

### Gør siden installérbar på mobil

#### 1. Opret `manifest.json`:
```json
{
  "name": "Fanø Vandstand",
  "short_name": "Vandstand",
  "description": "Live vandstandsdata for Fanø overfart",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0066CC",
  "background_color": "#FBFBFD",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### 2. Tilføj til `index.html`:
```html
<link rel="manifest" href="manifest.json">
<meta name="theme-color" content="#0066CC">
<link rel="apple-touch-icon" href="icon-192.png">
```

#### 3. Opret Service Worker `sw.js`:
```javascript
const CACHE_NAME = 'fano-vandstand-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

#### 4. Registrer Service Worker i `index.html`:
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

---

## 🔐 Miljøvariabler og Sikkerhed

### For Render.com:
```bash
# I Render Dashboard → Environment
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### For lokal udvikling:
Opret `.env`:
```
NODE_ENV=development
PORT=3001
```

---

## 📊 Overvågning og Vedligeholdelse

### 1. Uptime Monitoring (Gratis)
- **UptimeRobot**: https://uptimerobot.com
- **Cronitor**: https://cronitor.io
- Checker hvert 5. minut
- Email alerts hvis siden er nede

### 2. Error Tracking (Gratis tier)
- **Sentry**: https://sentry.io
- **LogRocket**: https://logrocket.com

### 3. Analytics (Valgfrit)
- **Plausible**: Privacy-friendly
- **SimpleAnalytics**: GDPR compliant
- **Google Analytics**: Mest features

---

## 🚦 Performance Optimering

### 1. Minifier HTML/JS
```bash
npm install -g html-minifier terser

html-minifier --collapse-whitespace index.html -o index.min.html
terser vandstand-scraper.js -o vandstand-scraper.min.js
```

### 2. Brug CDN for assets
```html
<!-- Brug jsDelivr for hurtigere loading -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
```

### 3. Lazy Loading
Indlæs kun kritiske ressourcer først

---

## 🆘 Fejlfinding

### Problem: Puppeteer fejler på Render
**Løsning**: Brug Puppeteer buildpack
```yaml
# render.yaml
services:
  - type: web
    env: docker
    dockerfilePath: ./Dockerfile
```

Opret `Dockerfile`:
```dockerfile
FROM ghcr.io/puppeteer/puppeteer:21.5.0

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

USER pptruser

CMD ["node", "vandstand-scraper.js"]
```

### Problem: Timeout på gratis hosting
**Løsning**: Implementer keep-alive
```javascript
// Ping endpoint hver 14. minut
setInterval(() => {
  https.get('https://din-app.onrender.com/health');
}, 14 * 60 * 1000);
```

### Problem: CORS fejl
**Løsning**: Whitelist specifikke domæner
```javascript
const allowedOrigins = [
  'https://dit-domæne.github.io',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  }
}));
```

---

## 📝 Deployment Checklist

- [ ] Test lokalt først
- [ ] Minifier HTML/CSS/JS
- [ ] Konfigurer CORS korrekt
- [ ] Sæt op environment variables
- [ ] Test på mobil
- [ ] Verificer alle endpoints virker
- [ ] Sæt op monitoring
- [ ] Dokumenter API endpoints
- [ ] Backup kode på GitHub
- [ ] Test fallback mekanismer

---

## 🎉 Anbefalede Kombinationer

### Til Hobby Projekt:
**Frontend**: GitHub Pages (gratis, nemt)  
**Data**: Simuleret (ingen server nødvendig)  
**Domæne**: `brugernavn.github.io/fano-vandstand`

### Til Semi-Professionel:
**Frontend**: Netlify (gratis, custom domæne)  
**Backend**: Render.com (gratis, live data)  
**Domæne**: `fano-vandstand.netlify.app`

### Til Produktion:
**Frontend**: Vercel (gratis, hurtig)  
**Backend**: Railway (gratis start, skalérbar)  
**Domæne**: Køb eget (fx `fanovandstand.dk`)

---

## 🔗 Nyttige Links

- [GitHub Pages Docs](https://pages.github.com/)
- [Render.com Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Puppeteer Troubleshooting](https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)

---

**Held og lykke med deployment! 🚀**
