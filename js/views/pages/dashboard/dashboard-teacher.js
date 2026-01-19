import { SessionManager } from "../../../auth/session.js";

const API_DASHBOARD = "http://localhost:5000/api/dashboard/teacher";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cek Sesi
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  // 2. Setup Tampilan Dasar
  setupGreeting(user);
  setupLogout();

  // 3. Ambil Data Dashboard
  loadDashboardData(user.id);
});

function setupGreeting(user) {
  const hour = new Date().getHours();
  let greet = "Selamat Pagi";
  if (hour >= 11) greet = "Selamat Siang";
  if (hour >= 15) greet = "Selamat Sore";
  if (hour >= 18) greet = "Selamat Malam";

  document.getElementById("greeting-text").innerText =
    `${greet}, ${user.nama || user.name}!`;

  // Format Tanggal: Senin, 20 Januari 2026
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("date-text").innerText =
    new Date().toLocaleDateString("id-ID", options);
}

async function loadDashboardData(teacherId) {
  try {
    const res = await fetch(`${API_DASHBOARD}/${teacherId}`);
    const result = await res.json();

    if (result.success) {
      const { today, schedules, stats } = result.data;

      document.getElementById("today-name").innerText = today;

      // A. RENDER STATS (Jika Wali Kelas)
      if (stats.is_wali_kelas) {
        document.getElementById("wali-stats").style.display = "grid";
        document.getElementById("stat-total-siswa").innerText =
          stats.total_siswa + " Siswa";
        document.getElementById("stat-kasus").innerText =
          stats.pelanggaran_hari_ini + " Kasus";
        // Update judul kotak siswa biar spesifik
        // document.querySelector("#wali-stats h4").innerText = `Siswa Kelas ${stats.nama_kelas}`;
      }

      // B. RENDER JADWAL
      renderSchedules(schedules);
    }
  } catch (error) {
    console.error("Gagal load dashboard", error);
    document.getElementById("schedule-container").innerHTML =
      `<p style="color:red">Gagal memuat data server.</p>`;
  }
}

function renderSchedules(schedules) {
  const container = document.getElementById("schedule-container");
  container.innerHTML = "";

  if (schedules.length === 0) {
    container.innerHTML = `
            <div style="text-align:center; padding:40px; background:white; border-radius:12px; border:2px dashed #e5e7eb;">
                <i class="fa-solid fa-mug-hot" style="font-size:30px; color:#9ca3af; margin-bottom:10px;"></i>
                <p style="color:#6b7280; margin:0;">Tidak ada jadwal mengajar hari ini. Selamat beristirahat!</p>
            </div>
        `;
    return;
  }

  // Cek jam sekarang untuk menandai "Sedang Berlangsung"
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute; // Konversi ke menit

  schedules.forEach((sch) => {
    // Konversi jam mulai/selesai ke menit (Contoh: "07:30" -> 450)
    const [startH, startM] = sch.jam_mulai.split(":").map(Number);
    const [endH, endM] = sch.jam_selesai.split(":").map(Number);
    const startVal = startH * 60 + startM;
    const endVal = endH * 60 + endM;

    let statusBadge = `<span class="badge" style="background:#e5e7eb; color:#374151">Selesai</span>`;
    let borderClass = "border-left: 5px solid #9ca3af"; // Abu-abu

    if (currentTimeVal >= startVal && currentTimeVal <= endVal) {
      statusBadge = `<span class="badge active">Sedang Berlangsung</span>`;
      borderClass = "border-left: 5px solid #0f766e"; // Hijau
    } else if (currentTimeVal < startVal) {
      statusBadge = `<span class="badge warning">Akan Datang</span>`;
      borderClass = "border-left: 5px solid #f59e0b"; // Kuning
    }

    container.innerHTML += `
            <div class="schedule-card" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); ${borderClass}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <strong style="color: #374151; font-size:18px;">${sch.jam_mulai.slice(0, 5)} - ${sch.jam_selesai.slice(0, 5)}</strong>
                    ${statusBadge}
                </div>
                <h4 style="margin: 0; font-size:16px;">${sch.nama_pelajaran}</h4>
                <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px">
                    <i class="fa-solid fa-users-rectangle"></i> Kelas ${sch.nama_kelas}
                </p>
            </div>
        `;
  });
}

function setupLogout() {
  document.getElementById("btn-logout").addEventListener("click", (e) => {
    e.preventDefault();
    SessionManager.logout();
  });
}
