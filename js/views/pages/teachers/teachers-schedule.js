import { SessionManager } from "../../../auth/session.js";

const API_TEACHER_SCHEDULE = "http://localhost:5000/api/schedules/teacher";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  loadMySchedule(user.id);
});

async function loadMySchedule(teacherId) {
  const tbody = document.getElementById("schedule-list-body"); // Pastikan ID ini ada di HTML
  if (!tbody) return;

  try {
    const response = await fetch(`${API_TEACHER_SCHEDULE}/${teacherId}`);
    const result = await response.json();

    if (result.success) {
      renderScheduleTable(result.data);
    } else {
      Notifications.error(result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    Notifications.error("Gagal mengambil jadwal.");
  }
}

function renderScheduleTable(schedules) {
  const tbody = document.getElementById("schedule-list-body");
  tbody.innerHTML = "";

  if (schedules.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Anda belum memiliki jadwal mengajar.</td></tr>`;
    return;
  }

  schedules.forEach((s) => {
    const row = `
            <tr>
                <td class="text-center"><strong>${s.hari}</strong></td>
                <td class="text-center">${s.jam_mulai.slice(0, 5)} - ${s.jam_selesai.slice(0, 5)}</td>
                <td><span class="badge info">${s.nama_kelas}</span></td>
                <td>${s.nama_pelajaran}</td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}
