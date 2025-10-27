// Simplified server for Render.com Free Tier
// Uses simulated tide data with realistic patterns

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Tidal Model Configuration - Justeret til aktuelle forhold
const TIDE_CONFIG = {
    cycle: 12.42,           // Semi-diurnal tide cycle in hours
    amplitude: 120,         // Reduceret amplitude for mere realistiske værdier
    meanLevel: 10,          // Justeret mean level tættere på aktuelle målinger
    springTideBoost: 1.15,  // Mindre boost
    neapTideReduction: 0.85, // Mindre reduktion
    weatherVariation: 20    // Mindre variation
};

// Calculate water level at specific time
function calculateWaterLevel(time, tideFactor = 1) {
    const hour = time.getHours() + time.getMinutes() / 60;
    
    // Primary tidal component
    const tidePhase = (hour / TIDE_CONFIG.cycle) * 2 * Math.PI;
    const primaryTide = TIDE_CONFIG.amplitude * Math.sin(tidePhase) * tideFactor;
    
    // Secondary harmonic (M4 - shallow water effect)
    const secondaryTide = (TIDE_CONFIG.amplitude * 0.15) * 
        Math.sin(2 * tidePhase + Math.PI / 4);
    
    // Diurnal inequality
    const diurnalPhase = (hour / 24) * 2 * Math.PI;
    const diurnalEffect = (TIDE_CONFIG.amplitude * 0.1) * Math.sin(diurnalPhase);
    
    // Weather effect (slowly varying)
    const weatherSeed = Math.floor(time.getTime() / (1000 * 60 * 60 * 6));
    const weatherEffect = Math.sin(weatherSeed) * TIDE_CONFIG.weatherVariation;
    
    // Storm surge simulation (occasional)
    let stormSurge = 0;
    if (Math.sin(weatherSeed * 0.1) > 0.8) {
        stormSurge = Math.abs(Math.sin(weatherSeed * 0.2)) * 50;
    }
    
    return Math.round(
        TIDE_CONFIG.meanLevel + 
        primaryTide + 
        secondaryTide + 
        diurnalEffect + 
        weatherEffect + 
        stormSurge
    );
}

// Get moon phase for spring/neap tides
function getMoonPhase(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const c = Math.floor(365.25 * year);
    const e = Math.floor(30.6 * month);
    const jd = c + e + day - 694039.09;
    const phase = (jd / 29.53059) % 1;
    
    return phase;
}

// Generate tide data
function generateTideData() {
    const now = new Date();
    const moonPhase = getMoonPhase(now);
    const tideFactor = moonPhase < 0.25 || moonPhase > 0.75 ? 
        TIDE_CONFIG.springTideBoost : TIDE_CONFIG.neapTideReduction;
    
    const data = {
        measured: [],
        forecast: []
    };
    
    // Generate historical data (48 hours back)
    for (let i = 48; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        data.measured.push({
            time: time.toISOString(),
            value: calculateWaterLevel(time, tideFactor)
        });
    }
    
    // Generate forecast (48 hours forward)
    for (let i = 1; i <= 48; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        data.forecast.push({
            time: time.toISOString(),
            value: calculateWaterLevel(time, tideFactor)
        });
    }
    
    return data;
}

// Root endpoint - serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint - water level data
app.get('/api/waterlevel/:station?', (req, res) => {
    const station = req.params.station || 'Esbjerg Havn I';
    const now = new Date();
    const tideData = generateTideData();
    const currentValue = calculateWaterLevel(now, 1);
    
    res.json({
        station: station,
        current: {
            value: currentValue,
            time: now.toISOString(),
            station: station
        },
        measured: tideData.measured,
        forecast: tideData.forecast,
        highlightPoint: {
            time: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            value: tideData.forecast[5]?.value || currentValue,
            label: '6 timer frem'
        },
        metadata: {
            unit: 'cm',
            reference: 'DVR90',
            lastUpdate: now.toISOString(),
            source: 'SIMULERET DATA - Tidevandsmodel',
            model: 'Semi-diurnal (12.42t cyklus)',
            note: 'Dette er simuleret data. For live målinger se:',
            liveDataLinks: {
                dmi: 'https://www.dmi.dk/hav/vandstand/',
                esbjergHavn: 'https://portesbjerg.dk/havneservice/vejrforhold'
            },
            disclaimer: 'Brug IKKE til navigation eller sikkerhedskritiske beslutninger'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        model: 'Tidal simulation active'
    });
});

// List available stations
app.get('/api/stations', (req, res) => {
    res.json({
        stations: [
            { name: 'Esbjerg Havn I', id: '25149', status: 'simulated' },
            { name: 'Nordby', id: '30336', status: 'simulated' },
            { name: 'Havneby', id: '31573', status: 'simulated' }
        ],
        defaultStation: 'Esbjerg Havn I'
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`✅ Fanø Vandstand Server running on ${HOST}:${PORT}`);
    console.log(`🌊 Tidevandsmodel aktiv - Realistisk simulering`);
    console.log(`📊 Endpoints:`);
    console.log(`  GET  / - Hovedapplikation`);
    console.log(`  GET  /api/waterlevel - Vandstandsdata`);
    console.log(`  GET  /health - Server status`);
    console.log(`\n⚠️  Simuleret data baseret på typiske tidevandsmønstre`);
    console.log(`    For live data, check DMI.dk eller Esbjerg Havn`);
});
