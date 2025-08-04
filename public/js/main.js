// Otonom Sulama Sistemi - Ana JavaScript Dosyası

// Global değişkenler
let charts = {};
let refreshInterval;
let isAutoRefreshEnabled = true;
const REFRESH_INTERVAL = 30000; // 30 saniye

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    startAutoRefresh();
});

// Uygulama başlatma
function initializeApp() {
    console.log('Otonom Sulama Sistemi başlatılıyor...');
    
    // Bootstrap tooltips'i etkinleştir
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Bootstrap popovers'ı etkinleştir
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Animasyonları başlat
    animateElements();
}

// Event listener'ları ayarla
function setupEventListeners() {
    // Navbar toggle animasyonu
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }
    
    // Form validasyonu
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(function(form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Kart hover efektleri
    const cards = document.querySelectorAll('.card');
    cards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Otomatik yenileme
function startAutoRefresh() {
    if (isAutoRefreshEnabled) {
        refreshInterval = setInterval(function() {
            refreshData();
        }, REFRESH_INTERVAL);
    }
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

function toggleAutoRefresh() {
    isAutoRefreshEnabled = !isAutoRefreshEnabled;
    
    if (isAutoRefreshEnabled) {
        startAutoRefresh();
        showNotification('Otomatik yenileme etkinleştirildi', 'success');
    } else {
        stopAutoRefresh();
        showNotification('Otomatik yenileme devre dışı bırakıldı', 'warning');
    }
    
    updateAutoRefreshButton();
}

function updateAutoRefreshButton() {
    const autoRefreshBtn = document.getElementById('autoRefreshBtn');
    if (autoRefreshBtn) {
        if (isAutoRefreshEnabled) {
            autoRefreshBtn.innerHTML = '<i class="fas fa-pause"></i> Otomatik Yenilemeyi Durdur';
            autoRefreshBtn.className = 'btn btn-warning btn-sm';
        } else {
            autoRefreshBtn.innerHTML = '<i class="fas fa-play"></i> Otomatik Yenilemeyi Başlat';
            autoRefreshBtn.className = 'btn btn-success btn-sm';
        }
    }
}

// Veri yenileme fonksiyonları
function refreshData() {
    console.log('Veriler yenileniyor...');
    
    // Bölge verilerini yenile
    refreshRegionData();
    
    // Grafikleri yenile
    refreshCharts();
    
    // Son güncelleme zamanını göster
    updateLastRefreshTime();
}

function refreshRegionData() {
    fetch('/api/regions')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.regions) {
                updateRegionCards(data.regions);
            } else {
                console.error('Bölge verileri formatı hatalı:', data);
                showNotification('Bölge verileri formatı hatalı', 'danger');
            }
        })
        .catch(error => {
            console.error('Bölge verileri yenilenirken hata:', error);
            showNotification('Bölge verileri yenilenirken hata oluştu', 'danger');
        });
}

function updateRegionCards(regions) {
    regions.forEach(function(region) {
        const regionCard = document.querySelector(`[data-region-id="${region.id}"]`);
        if (regionCard) {
            // Sıcaklık güncelle
            const tempElement = regionCard.querySelector('.temperature');
            if (tempElement) {
                tempElement.textContent = region.temperature + '°C';
            }
            
            // Nem güncelle
            const humidityElement = regionCard.querySelector('.humidity');
            if (humidityElement) {
                humidityElement.textContent = region.humidity + '%';
            }
            
            // Toprak nemi güncelle
            const soilElement = regionCard.querySelector('.soil-moisture');
            if (soilElement) {
                soilElement.textContent = region.soilMoisture + '%';
            }
            
            // Valf durumu güncelle
            const valveElement = regionCard.querySelector('.valve-status');
            if (valveElement) {
                updateValveStatus(valveElement, region.valveOpen);
            }
        }
    });
}

function updateValveStatus(element, isOpen) {
    if (isOpen) {
        element.innerHTML = '<i class="fas fa-check-circle text-success"></i> Açık';
        element.className = 'badge bg-success';
    } else {
        element.innerHTML = '<i class="fas fa-times-circle text-danger"></i> Kapalı';
        element.className = 'badge bg-danger';
    }
}

function updateLastRefreshTime() {
    const lastRefreshElement = document.getElementById('lastRefresh');
    if (lastRefreshElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('tr-TR');
        lastRefreshElement.textContent = `Son güncelleme: ${timeString}`;
    }
}

// Grafik fonksiyonları
function createChart(canvasId, chartData, chartOptions = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element bulunamadı: ${canvasId}`);
        return null;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Varsayılan seçenekler
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };
    
    // Seçenekleri birleştir
    const finalOptions = { ...defaultOptions, ...chartOptions };
    
    // Grafik oluştur
    const chart = new Chart(ctx, {
        type: chartData.type || 'line',
        data: chartData,
        options: finalOptions
    });
    
    // Grafik referansını sakla
    charts[canvasId] = chart;
    
    return chart;
}

function updateChart(canvasId, newData) {
    const chart = charts[canvasId];
    if (chart) {
        chart.data = newData;
        chart.update('active');
    }
}

function refreshCharts() {
    // Haftalık veri grafiğini yenile
    fetch('/api/weekly-data')
        .then(response => response.json())
        .then(data => {
            if (data.success && charts.weeklyChart) {
                updateChart('weeklyChart', data.chartData);
            }
        })
        .catch(error => {
            console.error('Grafik verileri yenilenirken hata:', error);
        });
}

// Valf kontrol fonksiyonları
function toggleValve(regionId) {
    showLoading(`Bölge ${regionId} valfi kontrol ediliyor...`);
    
    fetch(`/api/valve/${regionId}/toggle`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            // Valf durumunu güncelle
            const valveBtn = document.querySelector(`[onclick="toggleValve(${regionId})"]`);
            const valveStatus = document.querySelector(`#region-${regionId} .valve-status`);
            
            if (valveBtn && valveStatus) {
                if (data.valveOpen) {
                    valveBtn.innerHTML = '<i class="fas fa-stop"></i> Kapat';
                    valveBtn.className = 'btn btn-danger btn-sm';
                    valveStatus.innerHTML = '<span class="badge bg-success"><i class="fas fa-check"></i> Açık</span>';
                } else {
                    valveBtn.innerHTML = '<i class="fas fa-play"></i> Aç';
                    valveBtn.className = 'btn btn-success btn-sm';
                    valveStatus.innerHTML = '<span class="badge bg-secondary"><i class="fas fa-times"></i> Kapalı</span>';
                }
            }
            
            showNotification(`Bölge ${regionId} valfi ${data.valveOpen ? 'açıldı' : 'kapatıldı'}`, 'success');
            refreshRegionData();
        } else {
            showNotification('Valf kontrolünde hata oluştu', 'danger');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Valf kontrol hatası:', error);
        showNotification('Valf kontrolünde hata oluştu', 'danger');
    });
}

function openAllValves() {
    showLoading('Tüm valfler açılıyor...');
    
    fetch('/api/valves/open-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showNotification('Tüm valfler açıldı', 'success');
            refreshRegionData();
        } else {
            showNotification('Valfler açılırken hata oluştu', 'danger');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Valf açma hatası:', error);
        showNotification('Valfler açılırken hata oluştu', 'danger');
    });
}

function closeAllValves() {
    showLoading('Tüm valfler kapatılıyor...');
    
    fetch('/api/valves/close-all', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showNotification('Tüm valfler kapatıldı', 'success');
            refreshRegionData();
        } else {
            showNotification('Valfler kapatılırken hata oluştu', 'danger');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Valf kapatma hatası:', error);
        showNotification('Valfler kapatılırken hata oluştu', 'danger');
    });
}

function emergencyStop() {
    if (confirm('ACİL DURDURMA! Tüm valfler kapatılacak. Emin misiniz?')) {
        showLoading('Acil durdurma işlemi gerçekleştiriliyor...');
        
        fetch('/api/emergency-stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showNotification(data.message || 'ACİL DURDURMA: Tüm valfler kapatıldı!', 'warning');
                refreshRegionData();
                // Tüm valf butonlarını güncelle
                document.querySelectorAll('[onclick*="toggleValve"]').forEach(btn => {
                    btn.innerHTML = '<i class="fas fa-play"></i> Aç';
                    btn.className = 'btn btn-success btn-sm';
                });
                document.querySelectorAll('.valve-status').forEach(status => {
                    status.innerHTML = '<span class="badge bg-secondary"><i class="fas fa-times"></i> Kapalı</span>';
                });
            } else {
                showNotification('Acil durdurma işleminde hata oluştu', 'danger');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Acil durdurma hatası:', error);
            showNotification('Acil durdurma işleminde hata oluştu', 'danger');
        });
    }
}

// Zamanlayıcı fonksiyonları
function addScheduledTask(formData) {
    showLoading('Zamanlı görev ekleniyor...');
    
    fetch('/admin/scheduler/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            showNotification('Zamanlı görev başarıyla eklendi', 'success');
            // Formu temizle
            document.getElementById('schedulerForm').reset();
            // Görev listesini yenile
            refreshScheduledTasks();
        } else {
            showNotification('Zamanlı görev eklenirken hata oluştu', 'danger');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Zamanlı görev ekleme hatası:', error);
        showNotification('Zamanlı görev eklenirken hata oluştu', 'danger');
    });
}

function deleteScheduledTask(taskId) {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
        showLoading('Zamanlı görev siliniyor...');
        
        fetch(`/admin/scheduler/delete/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.success) {
                showNotification('Zamanlı görev silindi', 'success');
                refreshScheduledTasks();
            } else {
                showNotification('Zamanlı görev silinirken hata oluştu', 'danger');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Zamanlı görev silme hatası:', error);
            showNotification('Zamanlı görev silinirken hata oluştu', 'danger');
        });
    }
}

function refreshScheduledTasks() {
    // Zamanlı görevleri yenile (admin sayfasında)
    const tasksContainer = document.getElementById('scheduledTasks');
    if (tasksContainer) {
        // Bu fonksiyon admin sayfasında implement edilecek
        console.log('Zamanlı görevler yenileniyor...');
    }
}

// UI Yardımcı fonksiyonları
function showNotification(message, type = 'info', duration = 5000) {
    // Toast notification oluştur
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toastId = 'toast_' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${getIconForType(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
    });
    
    toast.show();
    
    // Toast kapandığında DOM'dan kaldır
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle',
        'primary': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function showLoading(message = 'Yükleniyor...') {
    const loadingHtml = `
        <div id="loadingModal" class="modal fade" tabindex="-1" data-bs-backdrop="static" data-bs-keyboard="false">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-body text-center py-4">
                        <div class="spinner-custom mb-3"></div>
                        <h5>${message}</h5>
                        <p class="text-muted mb-0">Lütfen bekleyiniz...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Önceki loading modal'ı kaldır
    const existingModal = document.getElementById('loadingModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('loadingModal'));
    modal.show();
}

function hideLoading() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
        const modal = bootstrap.Modal.getInstance(loadingModal);
        if (modal) {
            modal.hide();
        }
        setTimeout(() => {
            loadingModal.remove();
        }, 300);
    }
}

function animateElements() {
    // Sayfa yüklendiğinde animasyonları başlat
    const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .bounce-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
}

// Tarih ve saat yardımcı fonksiyonları
function formatDate(date) {
    return new Date(date).toLocaleDateString('tr-TR');
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('tr-TR');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('tr-TR');
}

// Sayfa kapatılırken temizlik
window.addEventListener('beforeunload', function() {
    stopAutoRefresh();
    
    // Tüm grafikleri temizle
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
});

// Global hata yakalayıcı
window.addEventListener('error', function(event) {
    console.error('Global hata:', event.error);
    showNotification('Beklenmeyen bir hata oluştu', 'danger');
});

// Promise hata yakalayıcı
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promise hatası:', event.reason);
    showNotification('Beklenmeyen bir hata oluştu', 'danger');
});

// Export fonksiyonları (modül sistemi için)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        refreshData,
        toggleValve,
        openAllValves,
        closeAllValves,
        emergencyStop,
        showNotification,
        createChart,
        updateChart
    };
}