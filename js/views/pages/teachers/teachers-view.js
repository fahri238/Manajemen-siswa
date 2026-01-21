// Ganti URL sesuai backend Anda
const API_BASE = "http://localhost:5000/api/schedules/teacher";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cek Sesi Login (Izinkan Admin ATAU Guru)
  const session = JSON.parse(localStorage.getItem("user_session"));

  // Perbaikan Logika: Admin atau Guru boleh lewat
  if (!session || (session.role !== "guru" && session.role !== "admin")) {
    alert("Akses ditolak! Silakan login kembali.");
    window.location.href = "../index.html"; // Redirect ke Login
    return;
  }

  // 2. Load Jadwal Guru
  // Jika yang login adalah Guru, load jadwal miliknya sendiri
  // Jika Admin, kita bisa me-load data guru tertentu (opsional)
  if (session.role === "guru") {
    loadTeacherSchedule(session.id);
  } else if (session.role === "admin") {
    // Jika di halaman list guru admin, panggil fungsi load data guru
    console.log("Admin mengakses data guru");
  }
});

async function loadTeacherSchedule(teacherId) {
  const container = document.getElementById("schedule-container");

  // Pastikan elemen container ada di HTML sebelum memuat
  if (!container) return;

  container.innerHTML = `<p style="text-align:center;">Memuat jadwal Anda...</p>`;

  try {
    const res = await fetch(`${API_BASE}/${teacherId}`);
    const result = await res.json();

    container.innerHTML = "";

    if (result.success && result.data) {
      const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const groupedSchedule = {};
      daysOrder.forEach((day) => (groupedSchedule[day] = []));

      result.data.forEach((item) => {
        if (groupedSchedule[item.hari]) {
          groupedSchedule[item.hari].push(item);
        }
      });

      daysOrder.forEach((day) => {
        const schedules = groupedSchedule[day];
        const card = createDayCard(day, schedules);
        container.innerHTML += card;
      });
    }
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p style="color:red; text-align:center;">Gagal memuat jadwal.</p>`;
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

  if (schedules && schedules.length > 0) {
    schedules.forEach((item) => {
      const start = item.jam_mulai.substring(0, 5);
      const end = item.jam_selesai.substring(0, 5);

      html += `
                <div class="schedule-item">
                    <div class="time-box">
                        ${start}<br>s/d<br>${end}
                    </div>
                    <div class="lesson-info">
                        <h4>${item.nama_kelas}</h4>
                        <p>
                            <i class="fa-solid fa-book-open" style="margin-right:5px;"></i> 
                            ${item.nama_mapel} (${item.kode_mapel})
                        </p>
                    </div>
                </div>
            `;
    });
  } else {
    html += `
            <div class="empty-state">
                <i class="fa-solid fa-mug-hot" style="font-size: 24px; margin-bottom: 10px; display:block;"></i>
                Tidak ada jadwal mengajar.
            </div>
        `;
  }

  html += `
            </div>
        </div>
    `;

  return html;
}
