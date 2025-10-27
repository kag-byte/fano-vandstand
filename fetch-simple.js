// Simplified water level data fetcher
const fs = require('fs');

// Generate realistic tide data
function generateTideData() {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    
    // Semi-diurnal tide (12.42 hour cycle)
    const tidePhase = (hour / 12.42) * 2 * Math.PI;
    const currentLevel = Math.round(85 * Math.sin(tidePhase) + 10);
    
    // Generate predictions
    const predictions = [];
    for (let i = 0; i < 48; i++) {
        const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const futureHour = futureTime.getHours() + futureTime.getMinutes() / 60;
        const futureTidePhase = (futureHour / 12.42) * 2 * Math.PI;
        const futureLevel = Math.round(85 * Math.sin(futureTidePhase) + 10);
        
        predictions.push({
            time: futureTime.toISOString(),
            value: futureLevel
        });
    }
    
    return {
        lastUpdate: now.toISOString(),
        source: 'Tidevandsmodel',
        current: {
            value: currentLevel,
            unit: 'cm',
            reference: 'DVR90'
        },
        predictions: predictions,
        metadata: {
            note: 'Simuleret data baseret på typisk tidevandsmønster for Vadehavet'
        }
    };
}

// Main
try {
    const data = generateTideData();
    
    // Create directory if it doesn't exist
    if (!fs.existsSync('public/data')) {
        fs.mkdirSync('public/data', { recursive: true });
    }
    
    // Save data
    fs.writeFileSync('public/data/water-level.json', JSON.stringify(data, null, 2));
    
    console.log(`✅ Data saved. Current level: ${data.current.value} cm`);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
