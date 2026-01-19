import { SessionManager } from "../../../auth/session.js";

// Endpoint Backend
const API_BASE = "http://localhost:5000/api/schedules/teacher";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil Sesi Menggunakan SessionManager
  const user = SessionManager.getUser();

  if (!user || user.role !== "guru") {
    Notifications.error("Akses ditolak! Silakan login kembali.");
    window.location.href = "../index.html";
    return;
  }

  // 2. Load Jadwal Guru Tersebut
  loadTeacherSchedule(user.id);
});

async function loadTeacherSchedule(teacherId) {
  const container = document.getElementById("schedule-container");
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px;">
                                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: #0f766e;"></i>
                                <p style="margin-top:10px;">Memuat jadwal mengajar Anda...</p>
                           </div>`;

  try {
    const res = await fetch(`${API_BASE}/${teacherId}`);
    const result = await res.json();

    container.innerHTML = "";

    if (result.success) {
      // Urutan Hari Indonesia
      const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      // Grouping Data berdasarkan Hari
      const groupedSchedule = {};
      daysOrder.forEach((day) => (groupedSchedule[day] = []));

      result.data.forEach((item) => {
        if (groupedSchedule[item.hari]) {
          groupedSchedule[item.hari].push(item);
        }
      });

      // Render Card Per Hari
      daysOrder.forEach((day) => {
        const schedules = groupedSchedule[day];
        const card = createDayCard(day, schedules);
        container.innerHTML += card;
      });
    } else {
      Notifications.error(result.message || "Gagal mengambil data jadwal.");
      container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">${result.message}</p>`;
    }
  } catch (error) {
    console.error("Schedule Error:", error);
    Notifications.error("Gagal terhubung ke server.");
    container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:red;">Gagal memuat jadwal. Pastikan server aktif.</p>`;
  }
}

function createDayCard(dayName, schedules) {
  let html = `
        <div class="day-card">
            <div class="day-header">
                <span>${dayName}</span>
                <i class="fa-solid fa-calendar-day"></i>
            </div>
            <div class="day-body">
    `;

  if (schedules.length > 0) {
    schedules.forEach((item) => {
      // Format Jam (07:00:00 -> 07:00)
      const start = item.jam_mulai.substring(0, 5);
      const end = item.jam_selesai.substring(0, 5);

      html += `
                <div class="schedule-item">
                    <div class="time-box">
                        ${start}<br>s/d<br>${end}
                    </div>
                    <div class="lesson-info">
                        <h4>${item.nama_kelas}</h4>
                        <p title="${item.nama_mapel}">
                            <i class="fa-solid fa-book-open" style="margin-right:5px; color: #0f766e;"></i> 
                            ${item.nama_mapel}
                        </p>
                        <small style="color: #6b7280; display: block; margin-top: 2px;">
                            <i class="fa-solid fa-fingerprint" style="margin-right:5px;"></i> ${item.kode_mapel || "-"}
                        </small>
                    </div>
                </div>
            `;
    });
  } else {
    html += `
            <div class="empty-state" style="padding: 20px; text-align:center; color: #9ca3af;">
                <i class="fa-solid fa-mug-hot" style="font-size: 24px; margin-bottom: 10px; display:block; opacity: 0.5;"></i>
                <span style="font-size: 13px;">Tidak ada jadwal mengajar.</span>
            </div>
        `;
  }

  html += `
            </div>
        </div>
    `;

  return html;
}
