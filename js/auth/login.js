// js/auth/login.js
import { SessionManager } from "./session.js";

// KONFIGURASI API (Bisa dipindah ke config.js nanti)
const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const btnLogin = document.querySelector(".btn-login");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Ambil Data Form
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // 2. UI Loading State
    const originalText = btnLogin.innerText;
    btnLogin.innerText = "Menghubungkan...";
    btnLogin.disabled = true;
    btnLogin.style.opacity = "0.7";

    try {
      // 3. REQUEST KE BACKEND (NODE.JS)
      // Ini adalah momen "menembak" ke server yang sedang running
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      // 4. CEK HASIL DARI BACKEND
      if (result.success) {
        // --- LOGIN SUKSES ---

        // Simpan Sesi ke LocalStorage (Browser)
        SessionManager.login(result.data);

        // Tampilkan Notifikasi Sukses
        if (typeof Notifications !== "undefined") {
          Notifications.success(`Selamat datang, ${result.data.name}!`);
        }

        // Tentukan Arah Redirect berdasarkan Role dari Database
        let redirectUrl = "index.html"; // Default

        if (result.data.role === "admin") {
          redirectUrl = "dashboard.html"; // Admin di Root
        } else if (result.data.role === "guru") {
          redirectUrl = "pages/teacher-dashboard.html";
        } else if (result.data.role === "siswa") {
          // Asumsi jika nanti ada role siswa
          redirectUrl = "pages/student-dashboard.html";
        }

        // Redirect setelah 1 detik (biar notifikasi terbaca)
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      } else {
        // --- LOGIN GAGAL (Password Salah / User Tidak Ada) ---
        throw new Error(result.message || "Login gagal");
      }
    } catch (error) {
      // Error Handling (Koneksi putus atau API mati)
      console.error("Login Error:", error);

      let errorMessage = error.message;
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Gagal terhubung ke Server. Pastikan Backend menyala!";
      }

      if (typeof Notifications !== "undefined") {
        Notifications.error(errorMessage);
      } else {
        alert(errorMessage);
      }

      // Reset Tombol
      btnLogin.innerText = originalText;
      btnLogin.disabled = false;
      btnLogin.style.opacity = "1";
    }
  });
});
