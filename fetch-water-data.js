// Fetch water level data from DMI and Esbjerg Havn
// Runs via GitHub Actions

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Fetch data from Esbjerg Havn
async function fetchEsbjergHavn() {
    try {
        const response = await axios.get('https://portesbjerg.dk/havneservice/vejrforhold', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WaterLevelBot/1.0)'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        // Parse water level data
        // Note: Selectors may need adjustment based on actual HTML structure
        const waterLevelText = $('td:contains("Vandstand - Havnen")').next().text();
        const waterLevelDVR = $('td:contains("DVR")').next().text();
        
        return {
            source: 'Esbjerg Havn',
            timestamp: new Date().toISOString(),
            waterLevel: {
                value: parseFloat(waterLevelText) || null,
                unit: 'DVR',
                dvr: parseFloat(waterLevelDVR) || null
            }
        };
    } catch (error) {
        console.error('Error fetching Esbjerg Havn data:', error.message);
        return null;
    }
}

// Try to fetch from DMI API endpoint
async function fetchDMIData() {
    try {
        // DMI public data endpoint for Esbjerg
        const response = await axios.get('https://www.dmi.dk/NinJo2DmiDk/ninjo2dmidk', {
            params: {
                cmd: 'obj',
                serviceid: 'oceanobs',
                id: '25149' // Esbjerg Havn station ID
            },
            timeout: 10000
        });
        
        if (response.data && response.data.properties) {
            return {
                source: 'DMI',
                timestamp: new Date().toISOString(),
                waterLevel: {
                    value: response.data.properties.sealev_dvr || null,
                    unit: 'cm DVR90',
                    observed: response.data.properties.observed || null
                }
            };
        }
    } catch (error) {
        console.error('Error fetching DMI data:', error.message);
    }
    return null;
}

// Generate tide prediction based on current data
function generateTidePrediction(currentLevel) {
    const predictions = [];
    const now = new Date();
    
    // Semi-diurnal tide cycle (12.42 hours)
    const tideCycle = 12.42;
    
    for (let i = 0; i < 48; i++) {
        const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hour = futureTime.getHours() + futureTime.getMinutes() / 60;
        const tidePhase = (hour / tideCycle) * 2 * Math.PI;
        
        // Simple tide model adjusted to current level
        const amplitude = 85; // cm
        const predictedLevel = currentLevel + amplitude * Math.sin(tidePhase);
        
        predictions.push({
            time: futureTime.toISOString(),
            value: Math.round(predictedLevel)
        });
    }
    
    return predictions;
}

// Main function
async function main() {
    console.log('Fetching water level data...');
    
    // Try to fetch from both sources
    let esbjergData = null;
    let dmiData = null;
    
    try {
        [esbjergData, dmiData] = await Promise.all([
            fetchEsbjergHavn(),
            fetchDMIData()
        ]);
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
    
    // Use best available data
    let currentLevel = 0;
    let dataSource = 'Simulated';
    
    if (esbjergData && esbjergData.waterLevel && esbjergData.waterLevel.dvr !== null) {
        currentLevel = esbjergData.waterLevel.dvr * 100; // Convert to cm
        dataSource = 'Esbjerg Havn';
    } else if (dmiData && dmiData.waterLevel && dmiData.waterLevel.value !== null) {
        currentLevel = dmiData.waterLevel.value;
        dataSource = 'DMI';
    } else {
        // Use simulated data if no real data available
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60;
        const tidePhase = (hour / 12.42) * 2 * Math.PI;
        currentLevel = Math.round(85 * Math.sin(tidePhase));
        console.log('Using simulated data as fallback');
    }
    
    // Create data object
    const waterData = {
        lastUpdate: new Date().toISOString(),
        source: dataSource,
        current: {
            value: currentLevel,
            unit: 'cm',
            reference: 'DVR90'
        },
        predictions: generateTidePrediction(currentLevel),
        metadata: {
            esbjergHavn: esbjergData,
            dmi: dmiData
        }
    };
    
    // Save to public directory for GitHub Pages
    try {
        if (!fs.existsSync('public/data')) {
            fs.mkdirSync('public/data', { recursive: true });
        }
        
        fs.writeFileSync('public/data/water-level.json', JSON.stringify(waterData, null, 2));
        
        console.log(`✅ Data saved. Current level: ${currentLevel} cm (${dataSource})`);
    } catch (error) {
        console.error('Error saving data:', error.message);
        process.exit(1);
    }
}

// Run
main().catch(console.error);
