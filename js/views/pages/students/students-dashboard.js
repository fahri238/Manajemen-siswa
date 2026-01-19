import { SessionManager } from "../../../auth/session.js";

console.log("Script Dashboard Siswa Terdeteksi!");
const API_DASHBOARD_STUDENT = "http://localhost:5000/api/dashboard/student";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();

  // Proteksi Halaman
  if (!user || user.role !== "siswa") {
    window.location.href = "../index.html";
    return;
  }

  // Set Tanggal Hari Ini di Header
  const dateEl = document.getElementById("current-date");
  if (dateEl) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateEl.innerText = new Date().toLocaleDateString("id-ID", options);
  }

  // Handle Logout
  const btnLogout = document.querySelector(".logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      Notifications.confirm(
        "Konfirmasi Keluar",
        "Apakah kamu ingin keluar dari area siswa?",
        () => {
          localStorage.removeItem("user_session");
          window.location.href = "../../../../index.html";
        },
      );
    });
  }

  loadDashboardData(user.id);
});

async function loadDashboardData(studentId) {
  try {
    const response = await fetch(`${API_DASHBOARD_STUDENT}/${studentId}`);
    const result = await response.json();

    if (result.success) {
      // PERBAIKAN: Tambahkan 'announcements' di sini
      const { profile, schedules, today, points, attendance, announcements } =
        result.data;

      // 1. Update Profile UI
      updateProfileUI(profile);

      // 2. Render Jadwal
      renderTodaySchedule(schedules, today);

      // 3. PERBAIKAN: Panggil fungsi render pengumuman
      renderAnnouncements(announcements);

      // 4. Update Angka Statistik
      document.getElementById("my-points").innerText = points.total_pelanggaran;
      document.getElementById("my-achievements").innerText =
        points.total_prestasi;

      const attendanceEl = document.getElementById("attendance-pct");
      if (attendanceEl) {
        attendanceEl.innerText = `${attendance}%`;
      }
    }
  } catch (error) {
    console.error("Gagal Render Dashboard:", error);
  }
}

function updateProfileUI(profile) {
  const initials = profile.nama_lengkap
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const avatarEl = document.querySelector(".sidebar div[style*='width: 60px']");
  if (avatarEl) avatarEl.innerText = initials;

  const nameSidebar = document.querySelector(".sidebar h4");
  const classSidebar = document.querySelector(".sidebar p");
  if (nameSidebar) nameSidebar.innerText = profile.nama_lengkap;
  if (classSidebar) classSidebar.innerText = profile.nama_kelas;

  const welcomeEl = document.querySelector(".top-bar h1");
  if (welcomeEl) {
    const firstName = profile.nama_lengkap.split(" ")[0];
    welcomeEl.innerText = `Halo, ${firstName}! 👋`;
  }
}

function renderTodaySchedule(schedules, todayName) {
  const container = document.getElementById("today-schedule");
  if (!container) return;

  if (!schedules || schedules.length === 0) {
    container.innerHTML = `<p style="color: #94a3b8; font-style: italic">Tidak ada jadwal pelajaran untuk hari ${todayName}.</p>`;
    return;
  }

  let html = "";
  schedules.forEach((s) => {
    html += `
            <div style="display: flex; gap: 15px; margin-bottom: 20px; position: relative;">
                <div style="min-width: 80px; font-weight: bold; color: #0ea5e9; font-size: 14px;">
                    ${s.jam_mulai.slice(0, 5)}
                </div>
                <div style="background: #f8fafc; padding: 12px 15px; border-radius: 12px; flex: 1; border-left: 4px solid #0ea5e9;">
                    <h4 style="margin: 0; font-size: 14px; color: #1e293b;">${s.nama_mapel}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">Sampai pukul ${s.jam_selesai.slice(0, 5)}</p>
                </div>
            </div>
        `;
  });
  container.innerHTML = html;
}

// PERBAIKAN: Tambahkan fungsi renderAnnouncements
function renderAnnouncements(data) {
  const container = document.getElementById("announcement-list");
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `<p style="color: #94a3b8; font-size: 13px; font-style: italic;">Belum ada pengumuman hari ini.</p>`;
    return;
  }

  let html = "";
  data.forEach((item) => {
    const color = item.category === "Keuangan" ? "#ef4444" : "#0ea5e9";
    html += `
            <div style="border-left: 3px solid ${color}; padding-left: 12px; margin-bottom: 5px; background: #f8fafc; padding: 10px; border-radius: 0 8px 8px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 13px; color: #1e293b;">${item.title}</strong>
                    <span style="font-size: 10px; color: #94a3b8;">${item.tanggal || ""}</span>
                </div>
                <p style="margin: 3px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.4;">
                    ${item.content}
                </p>
            </div>
        `;
  });
  container.innerHTML = html;
}
