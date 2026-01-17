// Ganti URL sesuai backend Anda
const API_BASE = "http://localhost:5000/api/schedules/teacher";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Cek Sesi Login (Pastikan User adalah Guru)
  const session = JSON.parse(localStorage.getItem("user_session"));

  if (!session || session.role !== "guru") {
    alert("Akses ditolak! Silakan login sebagai guru.");
    window.location.href = "../index.html"; // Redirect ke Login
    return;
  }

  // 2. Load Jadwal Guru Tersebut
  loadTeacherSchedule(session.id);
});

async function loadTeacherSchedule(teacherId) {
  const container = document.getElementById("schedule-container");
  container.innerHTML = `<p style="text-align:center; col-span:3;">Memuat jadwal Anda...</p>`;

  try {
    const res = await fetch(`${API_BASE}/${teacherId}`);
    const result = await res.json();

    container.innerHTML = "";

    if (result.success) {
      // Kita siapkan array hari agar urutannya pas
      const daysOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

      // Grouping Data berdasarkan Hari
      // Contoh hasil: { "Senin": [data1, data2], "Selasa": [] }
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

        // Jika hari itu ada jadwal, ATAU mau tetap menampilkan kartu kosong (opsional)
        // Di sini saya render semua hari agar terlihat rapi (Senin-Sabtu)
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
  // 1. Header Card
  let html = `
        <div class="day-card">
            <div class="day-header">
                <span>${dayName}</span>
                <i class="fa-solid fa-calendar-day"></i>
            </div>
            <div class="day-body">
    `;

  // 2. Isi Jadwal (Looping)
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
                        <p>
                            <i class="fa-solid fa-book-open" style="margin-right:5px;"></i> 
                            ${item.nama_mapel} (${item.kode_mapel})
                        </p>
                    </div>
                </div>
            `;
    });
  } else {
    // State Kosong (Libur / Tidak ada jadwal)
    html += `
            <div class="empty-state">
                <i class="fa-solid fa-mug-hot" style="font-size: 24px; margin-bottom: 10px; display:block;"></i>
                Tidak ada jadwal mengajar.
            </div>
        `;
  }

  // 3. Tutup Card
  html += `
            </div>
        </div>
    `;

  return html;
}
