import { SessionManager } from "../../../auth/session.js";

const API_TEACHER_STUDENTS = "http://localhost:5000/api/students/teacher";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  // Load data dengan ID Guru yang sedang login
  loadStudents(user.id);
});

async function loadStudents(teacherId) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Memuat data...</td></tr>`;

  try {
    const response = await fetch(`${API_TEACHER_STUDENTS}/${teacherId}`);

    // Cek jika response bukan JSON (menangani error 404 HTML)
    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      renderTable(result.data);
    } else {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-500">${result.message}</td></tr>`;
    }
  } catch (error) {
    console.error("Error:", error);
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-red-500">Gagal mengambil data (Pastikan Server Nyala)</td></tr>`;
  }
}

function renderTable(students) {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";

  if (students.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Belum ada siswa di kelas Anda.</td></tr>`;
    return;
  }

  students.forEach((s, index) => {
    const genderIcon =
      s.gender === "L"
        ? '<i class="fa-solid fa-mars" style="color:#3b82f6"></i>'
        : '<i class="fa-solid fa-venus" style="color:#ec4899"></i>';

    const statusBadge =
      s.status === "aktif"
        ? '<span class="badge active">Aktif</span>'
        : '<span class="badge inactive">Non-Aktif</span>';

    const row = `
            <tr>
                <td>${index + 1}</td>
                <td>
                    <strong>${s.nis}</strong>
                    <div style="font-size:11px; color:gray">${s.nisn || "-"}</div>
                </td>
                <td>${s.nama_lengkap}</td>
                <td><span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:12px; font-weight:600">${s.nama_kelas}</span></td>
                <td style="text-align:center">${genderIcon}</td>
                <td style="text-align:center">${statusBadge}</td>
                <td style="text-align:center">
                     <span style="color:#10b981; font-weight:bold">+${s.total_prestasi}</span> 
                     <span style="color:#ef4444; font-weight:bold; margin-left:5px">-${s.total_pelanggaran}</span>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
}
