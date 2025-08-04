const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Tüm API route'ları için authentication gerekli
router.use(requireAuth);

// Geçici valf durumları (gerçek projede Arduino'dan gelecek)
let valveStates = {
    1: false, 2: true, 3: false, 4: false, 5: true,
    6: false, 7: false, 8: true, 9: false, 10: false
};

// Tüm bölgelerin verilerini getir
router.get('/regions', (req, res) => {
    // Örnek veri (gerçek projede Arduino'dan gelecek)
    const regions = Array.from({length: 10}, (_, i) => ({
        id: i + 1,
        name: `Bölge ${i + 1}`,
        temperature: Math.round((20 + Math.random() * 10) * 10) / 10,
        humidity: Math.round((50 + Math.random() * 30) * 10) / 10,
        soilMoisture: Math.round((30 + Math.random() * 40) * 10) / 10,
        valveOpen: valveStates[i + 1],
        lastUpdate: new Date()
    }));
    
    res.json({ success: true, regions: regions });
});

// Belirli bir bölgenin verilerini getir
router.get('/regions/:id', (req, res) => {
    const regionId = parseInt(req.params.id);
    
    if (regionId < 1 || regionId > 10) {
        return res.status(404).json({ success: false, message: 'Bölge bulunamadı.' });
    }
    
    const regionData = {
        id: regionId,
        name: `Bölge ${regionId}`,
        temperature: Math.round((20 + Math.random() * 10) * 10) / 10,
        humidity: Math.round((50 + Math.random() * 30) * 10) / 10,
        soilMoisture: Math.round((30 + Math.random() * 40) * 10) / 10,
        valveOpen: valveStates[regionId],
        lastUpdate: new Date()
    };
    
    res.json({ success: true, region: regionData });
});

// Haftalık grafik verilerini getir
router.get('/weekly-data', (req, res) => {
    const weeklyData = {
        labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
        datasets: {
            temperature: Array.from({length: 7}, () => 20 + Math.random() * 10),
            humidity: Array.from({length: 7}, () => 50 + Math.random() * 30),
            soilMoisture: Array.from({length: 7}, () => 30 + Math.random() * 40)
        }
    };
    
    res.json({ success: true, data: weeklyData });
});

// Admin only routes
router.use(requireAdmin);

// Tek valf kontrolü
router.post('/valve/:id/toggle', (req, res) => {
    const regionId = parseInt(req.params.id);
    
    if (regionId < 1 || regionId > 10) {
        return res.status(404).json({ success: false, message: 'Bölge bulunamadı.' });
    }
    
    // Valf durumunu değiştir
    valveStates[regionId] = !valveStates[regionId];
    
    // Burada gerçek projede Arduino'ya komut gönderilecek
    console.log(`Bölge ${regionId} valf durumu: ${valveStates[regionId] ? 'AÇIK' : 'KAPALI'}`);
    
    res.json({ 
        success: true, 
        message: `Bölge ${regionId} valfi ${valveStates[regionId] ? 'açıldı' : 'kapatıldı'}.`,
        valveOpen: valveStates[regionId]
    });
});

// Belirli valf açma/kapama
router.post('/valve/:id/:action', (req, res) => {
    const regionId = parseInt(req.params.id);
    const action = req.params.action;
    
    if (regionId < 1 || regionId > 10) {
        return res.status(404).json({ success: false, message: 'Bölge bulunamadı.' });
    }
    
    if (action !== 'open' && action !== 'close') {
        return res.status(400).json({ success: false, message: 'Geçersiz işlem.' });
    }
    
    valveStates[regionId] = action === 'open';
    
    // Burada gerçek projede Arduino'ya komut gönderilecek
    console.log(`Bölge ${regionId} valfi ${action === 'open' ? 'açıldı' : 'kapatıldı'}`);
    
    res.json({ 
        success: true, 
        message: `Bölge ${regionId} valfi ${action === 'open' ? 'açıldı' : 'kapatıldı'}.`,
        valveOpen: valveStates[regionId]
    });
});

// Tüm valfleri aç
router.post('/valves/open-all', (req, res) => {
    for (let i = 1; i <= 10; i++) {
        valveStates[i] = true;
    }
    
    // Burada gerçek projede Arduino'ya komut gönderilecek
    console.log('Tüm valfler açıldı');
    
    res.json({ 
        success: true, 
        message: 'Tüm valfler açıldı.',
        valveStates: valveStates
    });
});

// Tüm valfleri kapat
router.post('/valves/close-all', (req, res) => {
    for (let i = 1; i <= 10; i++) {
        valveStates[i] = false;
    }
    
    // Burada gerçek projede Arduino'ya komut gönderilecek
    console.log('Tüm valfler kapatıldı');
    
    res.json({ 
        success: true, 
        message: 'Tüm valfler kapatıldı.',
        valveStates: valveStates
    });
});

// Valf durumlarını getir
router.get('/valves/status', (req, res) => {
    res.json({ 
        success: true, 
        data: valveStates 
    });
});

// Acil durdurma - tüm valfleri kapat
router.post('/emergency-stop', (req, res) => {
    for (let i = 1; i <= 10; i++) {
        valveStates[i] = false;
    }
    
    // Burada gerçek projede Arduino'ya acil durdurma komutu gönderilecek
    console.log('ACİL DURDURMA: Tüm valfler kapatıldı');
    
    res.json({ 
        success: true, 
        message: 'Acil durdurma işlemi tamamlandı. Tüm valfler kapatıldı.',
        valveStates: valveStates
    });
});

// Arduino'dan veri alma endpoint'i (POST)
router.post('/arduino/data', (req, res) => {
    const { regionId, temperature, humidity, soilMoisture } = req.body;
    
    // Burada gerçek projede veritabanına kayıt yapılacak
    console.log('Arduino\'dan gelen veri:', {
        regionId,
        temperature,
        humidity,
        soilMoisture,
        timestamp: new Date()
    });
    
    res.json({ success: true, message: 'Veri başarıyla alındı.' });
});

module.exports = router;