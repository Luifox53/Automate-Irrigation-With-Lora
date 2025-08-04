const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Geçici kullanıcı veritabanı (gerçek projede veritabanından gelecek)
const users = [
    {
        id: 1,
        username: 'admin',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        name: 'Sistem Yöneticisi'
    },
    {
        id: 2,
        username: 'user1',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        name: 'Kullanıcı 1'
    },
    {
        id: 3,
        username: 'user2',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'user',
        name: 'Kullanıcı 2'
    }
];

// Login sayfası
router.get('/login', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/dashboard');
        }
    }
    res.render('auth/login', { 
        title: 'Giriş Yap',
        error: null 
    });
});

// Login işlemi
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Kullanıcıyı bul
        const user = users.find(u => u.username === username);
        
        if (!user) {
            return res.render('auth/login', {
                title: 'Giriş Yap',
                error: 'Kullanıcı adı veya şifre hatalı!'
            });
        }
        
        // Şifre kontrolü
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.render('auth/login', {
                title: 'Giriş Yap',
                error: 'Kullanıcı adı veya şifre hatalı!'
            });
        }
        
        // Session'a kullanıcı bilgilerini kaydet
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        };
        
        // Role'e göre yönlendir
        if (user.role === 'admin') {
            res.redirect('/admin/dashboard');
        } else {
            res.redirect('/dashboard');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.render('auth/login', {
            title: 'Giriş Yap',
            error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
        });
    }
});

// Logout işlemi
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

// GET logout (güvenlik için POST'a yönlendir)
router.get('/logout', (req, res) => {
    res.redirect('/auth/login');
});

module.exports = router;