import { SessionManager } from "../../../auth/session.js";

// PERBAIKAN: Gunakan /api/points/student (Sesuai server.js dan routes/points.js)
const API_POINTS = "http://localhost:5000/api/points/student";

document.addEventListener("DOMContentLoaded", async () => {
  const user = SessionManager.getUser();
  if (!user) {
    window.location.href = "../../index.html";
    return;
  }

  // --- PERBAIKAN: Ambil profil lengkap agar 'nama_kelas' muncul ---
  try {
    // Kita "numpang" ke API dashboard karena di sana SQL-nya sudah lengkap (JOIN Kelas)
    const response = await fetch(
      `http://localhost:5000/api/dashboard/student/${user.id}`,
    );
    const result = await response.json();

    if (result.success) {
      // Gunakan data profile dari database, bukan dari session
      updateSidebarUI(result.data.profile);
    } else {
      // Fallback jika API gagal, tetap tampilkan data session seadanya
      updateSidebarUI(user);
    }
  } catch (error) {
    console.error("Gagal load profil sidebar:", error);
    updateSidebarUI(user);
  }

  fetchPointsHistory(user.id);
});

function updateSidebarUI(profile) {
  // Ambil inisial
  const initials = profile.nama_lengkap
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  document.getElementById("user-initials").innerText = initials;
  document.getElementById("user-name-sidebar").innerText = profile.nama_lengkap;

  // Sekarang 'nama_kelas' akan terisi karena 'profile' berasal dari API Dashboard
  document.getElementById("user-class-sidebar").innerText =
    profile.nama_kelas || "-";
}

async function fetchPointsHistory(studentId) {
  try {
    const response = await fetch(`${API_POINTS}/${studentId}`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);

    const result = await response.json();
    if (result.success) {
      renderPointsTable(result.data);
    }
  } catch (error) {
    console.error("Gagal memuat data poin:", error);
  }
}

function renderPointsTable(points) {
  const tbody = document.getElementById("points-history-body");
  const totalVioEl = document.getElementById("total-violation");
  const totalAchEl = document.getElementById("total-achievement");

  tbody.innerHTML = "";
  let sumViolation = 0;
  let sumAchievement = 0;

  if (!points || points.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:#94a3b8;">Belum ada riwayat poin.</td></tr>`;
    totalVioEl.innerText = "0";
    totalAchEl.innerText = "0";
    return;
  }

  points.forEach((item) => {
    const isViolation = item.type === "violation";

    // Perbaikan hitung total poin [cite: 2026-01-21]
    if (isViolation) {
      sumViolation += parseInt(item.point_amount);
    } else {
      sumAchievement += parseInt(item.point_amount); // Gunakan point_amount, bukan +1
    }

    const typeLabel = isViolation ? "Pelanggaran" : "Prestasi";
    const badgeClass = isViolation ? "badge warning" : "badge active";
    const pointColor = isViolation ? "color: #EF4444;" : "color: #10B981;";
    const pointPrefix = isViolation ? "+" : "★";

    const dateStr = new Date(item.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    tbody.innerHTML += `
        <tr>
            <td>${dateStr}</td>
            <td><span class="${badgeClass}">${typeLabel}</span></td>
            <td style="font-weight: 500;">${item.name}</td>
            <td style="text-align: right; font-weight: bold; ${pointColor}">
                ${pointPrefix} ${item.point_amount}
            </td>
        </tr>`;
  });

  totalVioEl.innerText = sumViolation;
  totalAchEl.innerText = sumAchievement;
}
