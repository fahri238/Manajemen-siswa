// js/app.js
import { DataSeeder } from './services/dataSeeder.js';
import { SessionManager } from './auth/session.js';
import { initLogout } from './auth/logout.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan seeder
    DataSeeder.init();
    
    // 2. Proteksi Halaman
    const path = window.location.pathname;
    const currentPage = path.split("/").pop();
    
    // Anggap string kosong atau index.html sebagai halaman login
    const isLoginPage = currentPage === 'index.html' || currentPage === '';
    const isAuthenticated = SessionManager.isAuthenticated();

    if (!isLoginPage && !isAuthenticated) {
        // Jika mau akses halaman dalam tapi belum login
        window.location.href = 'index.html';
        return; // Hentikan eksekusi script selanjutnya
    }

    if (isLoginPage && isAuthenticated) {
        // Jika sudah login tapi akses halaman login/root
        window.location.href = 'dashboard.html';
        return;
    }

    // 3. Aktifkan fitur global (hanya jika di dashboard/halaman dalam)
    if (!isLoginPage) {
        initLogout();
    }
});

window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    sidebar.classList.toggle('show');
    overlay.classList.toggle('show');
}