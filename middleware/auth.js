// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    next();
};

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    if (req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Erişim Reddedildi',
            message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
            error: { status: 403 }
        });
    }
    
    next();
};

// User authentication middleware (kullanıcı veya admin)
const requireUser = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    
    if (req.session.user.role !== 'user' && req.session.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Erişim Reddedildi',
            message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
            error: { status: 403 }
        });
    }
    
    next();
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireUser
};