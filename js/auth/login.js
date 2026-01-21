// js/auth/login.js
import { SessionManager } from "./session.js";

// KONFIGURASI API
const API_BASE_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const btnLogin = document.querySelector(".btn-login");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // UI Loading State
    const originalText = btnLogin.innerText;
    btnLogin.innerText = "Menghubungkan...";
    btnLogin.disabled = true;
    btnLogin.style.opacity = "0.7";

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        const userData = {
          id: result.data.id,
          username: result.data.username,
          role: result.data.role, // Pastikan backend mengirim field 'role'
          nama: result.data.nama_lengkap,
        };

        // Gunakan nama key "user_session" agar cocok dengan list.js
        localStorage.setItem("user_session", JSON.stringify(userData));

        // Tetap panggil SessionManager jika memang diperlukan modul lain
        SessionManager.login(result.data);

        // --- LOGIKA REDIRECT BERDASARKAN ROLE ---
        let redirectUrl = "index.html";

        if (result.data.role === "admin") {
          redirectUrl = "../../dashboard.html";
        } else if (result.data.role === "guru") {
          // Sesuaikan dengan folder guru Anda
          redirectUrl = "../pages/teacher-dashboard.html";
        } else if (result.data.role === "siswa") {
          // Sesuaikan dengan folder siswa Anda
          redirectUrl = "../pages/student-dashboard.html";
        }

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);
      } else {
        throw new Error(result.message || "Login gagal");
      }
    } catch (error) {
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

      btnLogin.innerText = originalText;
      btnLogin.disabled = false;
      btnLogin.style.opacity = "1";
    }
  });
});
