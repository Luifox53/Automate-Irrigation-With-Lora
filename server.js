const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'sulama-sistemi-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 saat
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Ana sayfa - login sayfasına yönlendir
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/dashboard');
        } else {
            return res.redirect('/dashboard');
        }
    }
    res.redirect('/auth/login');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        title: 'Sayfa Bulunamadı',
        message: 'Aradığınız sayfa bulunamadı.',
        error: { status: 404 }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Sunucu Hatası',
        message: 'Bir hata oluştu.',
        error: { status: 500 }
    });
});

app.listen(PORT, () => {
    console.log(`Sulama Sistemi sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});

module.exports = app;