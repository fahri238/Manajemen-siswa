// js/utils/auth.js

export function getAuthUser() {
  // URUTAN PRIORITAS PENGAMBILAN DATA (PENTING!)

  // 1. Cek Key Utama (Sesuai screenshot Anda)
  let userStr = localStorage.getItem("siswa_manager_session");

  // 2. Jika kosong, cek key alternatif
  if (!userStr) userStr = localStorage.getItem("user_session");

  // 3. Terakhir, cek key standar (fallback)
  if (!userStr) userStr = localStorage.getItem("user");

  if (!userStr) {
    console.warn("Auth: Tidak ada data sesi yang ditemukan di LocalStorage.");
    return null;
  }

  try {
    const parsed = JSON.parse(userStr);
    return parsed;
  } catch (e) {
    console.error("Auth: Gagal memparsing data user (Corrupt JSON)", e);
    return null;
  }
}

export function isLoggedIn() {
  return getAuthUser() !== null;
}

export function logout() {
  if (confirm("Yakin ingin keluar?")) {
    // Bersihkan semua kemungkinan key agar tidak bentrok
    localStorage.removeItem("siswa_manager_session");
    localStorage.removeItem("user_session");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("user_token");

    window.location.href = "../auth/login.html";
  }
}
