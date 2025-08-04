const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Tüm admin route'ları için admin authentication gerekli
router.use(requireAdmin);

// Admin dashboard
router.get('/dashboard', (req, res) => {
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
        },
        scheduledTasks: [
            {
                id: 1,
                regionId: 1,
                regionName: 'Bölge 1',
                action: 'open',
                scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 saat sonra
                duration: 30, // dakika
                status: 'pending'
            },
            {
                id: 2,
                regionId: 3,
                regionName: 'Bölge 3',
                action: 'open',
                scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 saat sonra
                duration: 45,
                status: 'pending'
            }
        ]
    };
    
    res.render('admin/dashboard', {
        title: 'Admin Dashboard - Sulama Sistemi',
        user: req.session.user,
        data: sampleData
    });
});

// Valf kontrol sayfası
router.get('/valve-control', (req, res) => {
    res.render('admin/valve-control', {
        title: 'Valf Kontrolü - Admin Panel',
        user: req.session.user
    });
});

// Zamanlayıcı sayfası
router.get('/scheduler', (req, res) => {
    // Mevcut zamanlanmış görevler
    const scheduledTasks = [
        {
            id: 1,
            regionId: 1,
            regionName: 'Bölge 1',
            action: 'open',
            scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            duration: 30,
            status: 'pending'
        },
        {
            id: 2,
            regionId: 3,
            regionName: 'Bölge 3',
            action: 'open',
            scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
            duration: 45,
            status: 'pending'
        }
    ];
    
    res.render('admin/scheduler', {
        title: 'Zamanlayıcı - Admin Panel',
        user: req.session.user,
        scheduledTasks: scheduledTasks
    });
});

// Zamanlayıcı görevi ekleme
router.post('/scheduler/add', (req, res) => {
    const { regionId, action, scheduledDate, scheduledTime, duration } = req.body;
    
    // Burada gerçek projede veritabanına kayıt yapılacak
    console.log('Yeni zamanlayıcı görevi:', {
        regionId,
        action,
        scheduledDate,
        scheduledTime,
        duration
    });
    
    res.json({ success: true, message: 'Zamanlayıcı görevi başarıyla eklendi.' });
});

// Zamanlayıcı görevi silme
router.delete('/scheduler/:id', (req, res) => {
    const taskId = req.params.id;
    
    // Burada gerçek projede veritabanından silme işlemi yapılacak
    console.log('Zamanlayıcı görevi silindi:', taskId);
    
    res.json({ success: true, message: 'Zamanlayıcı görevi başarıyla silindi.' });
});

module.exports = router;