const express = require('express');
const { requireUser } = require('../middleware/auth');
const router = express.Router();

// Tüm dashboard route'ları için authentication gerekli
router.use(requireUser);

// Ana dashboard sayfası
router.get('/', (req, res) => {
    // Örnek veri (gerçek projede Arduino'dan gelecek)
    const sampleData = {
        regions: [
            {
                id: 1,
                name: 'Bölge 1',
                temperature: 24.5,
                humidity: 65,
                soilMoisture: 45,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 2,
                name: 'Bölge 2',
                temperature: 26.2,
                humidity: 58,
                soilMoisture: 32,
                valveOpen: true,
                lastUpdate: new Date()
            },
            {
                id: 3,
                name: 'Bölge 3',
                temperature: 25.1,
                humidity: 62,
                soilMoisture: 55,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 4,
                name: 'Bölge 4',
                temperature: 23.8,
                humidity: 70,
                soilMoisture: 48,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 5,
                name: 'Bölge 5',
                temperature: 27.3,
                humidity: 55,
                soilMoisture: 28,
                valveOpen: true,
                lastUpdate: new Date()
            },
            {
                id: 6,
                name: 'Bölge 6',
                temperature: 24.9,
                humidity: 63,
                soilMoisture: 42,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 7,
                name: 'Bölge 7',
                temperature: 25.7,
                humidity: 59,
                soilMoisture: 38,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 8,
                name: 'Bölge 8',
                temperature: 26.8,
                humidity: 52,
                soilMoisture: 35,
                valveOpen: true,
                lastUpdate: new Date()
            },
            {
                id: 9,
                name: 'Bölge 9',
                temperature: 24.2,
                humidity: 68,
                soilMoisture: 51,
                valveOpen: false,
                lastUpdate: new Date()
            },
            {
                id: 10,
                name: 'Bölge 10',
                temperature: 25.4,
                humidity: 61,
                soilMoisture: 44,
                valveOpen: false,
                lastUpdate: new Date()
            }
        ],
        weeklyData: {
            labels: ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'],
            temperature: [22.5, 24.1, 25.3, 23.8, 26.2, 25.7, 24.9],
            humidity: [65, 62, 58, 70, 55, 59, 63],
            soilMoisture: [45, 42, 38, 48, 35, 41, 44]
        }
    };
    
    res.render('dashboard/index', {
        title: 'Dashboard - Sulama Sistemi',
        user: req.session.user,
        data: sampleData
    });
});

// Bölge detay sayfası
router.get('/region/:id', (req, res) => {
    const regionId = parseInt(req.params.id);
    
    // Örnek detaylı veri
    const regionData = {
        id: regionId,
        name: `Bölge ${regionId}`,
        temperature: 24.5 + Math.random() * 3,
        humidity: 60 + Math.random() * 15,
        soilMoisture: 40 + Math.random() * 20,
        valveOpen: Math.random() > 0.5,
        lastUpdate: new Date(),
        hourlyData: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            temperature: Array.from({length: 24}, () => 20 + Math.random() * 10),
            humidity: Array.from({length: 24}, () => 50 + Math.random() * 30),
            soilMoisture: Array.from({length: 24}, () => 30 + Math.random() * 40)
        }
    };
    
    res.render('dashboard/region-detail', {
        title: `${regionData.name} - Detay`,
        user: req.session.user,
        region: regionData
    });
});

module.exports = router;