import { SessionManager } from './session.js';

export function initLogout() {
    // Cari semua elemen dengan class .logout (bisa di sidebar desktop atau mobile)
    const logoutBtns = document.querySelectorAll('.logout');

    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cek apakah Notifikasi Helper tersedia?
            if (typeof Notifications !== 'undefined') {
                // Pakai Konfirmasi Keren
                Notifications.confirm(
                    "Keluar Aplikasi?",
                    "Sesi Anda akan diakhiri.",
                    () => {
                        handleLogout();
                    }
                );
            } else {
                // Fallback (Jaga-jaga) pakai alert biasa
                if(confirm("Yakin ingin keluar?")) {
                    handleLogout();
                }
            }
        });
    });
}

function handleLogout() {
    // Panggil fungsi logout dari SessionManager (yang menghapus LocalStorage)
    SessionManager.logout();
    
    // Pastikan SessionManager.logout() Anda isinya ada window.location.href = 'index.html'
    // Jika tidak, kita paksa redirect di sini:
    // window.location.href = 'index.html'; 
}