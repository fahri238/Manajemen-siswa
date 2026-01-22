import { SessionManager } from "../../../auth/session.js";

const API_SCHEDULE_BY_ID =
  "http://localhost:5000/api/schedules/student-full-by-id";

document.addEventListener("DOMContentLoaded", async () => {
  const user = SessionManager.getUser();
  if (!user) {
    window.location.href = "../../index.html";
    return;
  }

  // AMBIL PROFIL LENGKAP UNTUK SIDEBAR
  try {
    const response = await fetch(
      `http://localhost:5000/api/dashboard/student/${user.id}`,
    );
    const result = await response.json();
    if (result.success) {
      updateProfileUI(result.data.profile); // Sekarang profile punya info kelas
    }
  } catch (error) {
    console.error("Gagal load profil sidebar");
  }

  fetchSchedules(user.id);
});

async function fetchSchedules(studentId) {
  const container = document.getElementById("schedule-container");
  try {
    const response = await fetch(`${API_SCHEDULE_BY_ID}/${studentId}`);
    const result = await response.json();

    if (result.success) {
      renderScheduleCards(result.data);
      document.getElementById("class-subtitle").innerText =
        "Jadwal Pelajaran Terkini";
    } else {
      container.innerHTML = `<p style="text-align:center; padding:20px;">${result.message}</p>`;
    }
  } catch (error) {
    console.error("Database Error:", error);
  }
}

function updateProfileUI(user) {
  const initials = user.nama_lengkap
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  document.getElementById("user-initials").innerText = initials;
  document.getElementById("user-name-sidebar").innerText = user.nama_lengkap;
  document.getElementById("user-class-sidebar").innerText =
    user.nama_kelas || "-";
}

function renderScheduleCards(schedules) {
  const container = document.getElementById("schedule-container");
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  container.innerHTML = "";

  days.forEach((day) => {
    const dailyData = schedules.filter((s) => s.hari === day);
    let listHtml =
      dailyData.length > 0
        ? ""
        : `<li class="schedule-item" style="color:#94a3b8; font-style:italic; justify-content:center; padding:20px;">Tidak ada jadwal</li>`;

    dailyData.forEach((item) => {
      listHtml += `
                <li class="schedule-item">
                    <div class="time-badge">${item.jam_mulai.slice(0, 5)}<br>s.d<br>${item.jam_selesai.slice(0, 5)}</div>
                    <div class="subject-info">
                        <h4>${item.nama_mapel}</h4>
                        <p><i class="fa-solid fa-chalkboard-user"></i> ${item.nama_guru || "Guru Mapel"}</p>
                    </div>
                </li>`;
    });

    container.innerHTML += `
            <div class="day-card">
                <div class="day-header"><span>${day}</span><i class="fa-regular fa-calendar"></i></div>
                <ul class="schedule-list">${listHtml}</ul>
            </div>`;
  });
}
