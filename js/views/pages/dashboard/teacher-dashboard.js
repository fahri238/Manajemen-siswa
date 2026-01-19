import { SessionManager } from "../../../auth/session.js";

const API_DASHBOARD = "http://localhost:5000/api/dashboard/teacher-stats";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  // --- INISIALISASI TAMPILAN ---
  if (document.getElementById("greeting-text")) {
    document.getElementById("greeting-text").innerText =
      `Selamat Datang, ${user.nama_lengkap || "Guru"}`;
  }

  const dateText = document.getElementById("date-text");
  if (dateText) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateText.innerText = new Date().toLocaleDateString("id-ID", options);
  }

  // --- LOGIKA LOGOUT KUSTOM ---
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      // Gunakan fondasi Konfirmasi Custom kita
      Notifications.confirm(
        "Konfirmasi Keluar",
        "Apakah Anda yakin ingin keluar dari sistem?",
        () => {
          // Callback jika klik YA
          localStorage.removeItem("user_session");
          window.location.href = "../../index.html";
        },
      );
    });
  }

  loadDashboardStats(user.id);
});

async function loadDashboardStats(teacherId) {
  try {
    const response = await fetch(`${API_DASHBOARD}/${teacherId}`);
    const result = await response.json();

    if (result.success) {
      const data = result.data;
      const stats = data.stats;

      // Update Statistik Wali Kelas
      if (document.getElementById("stat-total-siswa"))
        document.getElementById("stat-total-siswa").innerText =
          stats.total_siswa;

      if (document.getElementById("nama-kelas-binaan"))
        document.getElementById("nama-kelas-binaan").innerText =
          stats.nama_kelas;

      if (document.getElementById("stat-kasus"))
        document.getElementById("stat-kasus").innerText =
          stats.pelanggaran_hari_ini;

      // Update Jadwal
      renderTodaySchedule(data.schedules);
    } else {
      if (window.Notifications) Notifications.error(result.message);
    }
  } catch (error) {
    console.error("Dashboard Error:", error);
    if (window.Notifications)
      Notifications.error("Gagal memuat data statistik.");
  }
}

function renderTodaySchedule(schedules) {
  const container = document.getElementById("schedule-container");
  if (!container) return;

  if (!schedules || schedules.length === 0) {
    container.innerHTML = `
      <div style="background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; color: #6b7280;">
        <i class="fa-solid fa-mug-hot" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
        Tidak ada jadwal mengajar hari ini. Selamat beristirahat!
      </div>`;
    return;
  }

  let html = "";
  schedules.forEach((s) => {
    html += `
      <div style="background: white; border-radius: 12px; padding: 15px; border-left: 5px solid #0f766e; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="display: block; font-size: 16px;">${s.nama_pelajaran}</strong>
          <span style="color: #6b7280; font-size: 13px;">${s.jam_mulai.slice(0, 5)} - ${s.jam_selesai.slice(0, 5)}</span>
        </div>
        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px;">${s.nama_kelas}</span>
      </div>
    `;
  });
  container.innerHTML = html;
}
