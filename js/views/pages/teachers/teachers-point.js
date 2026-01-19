import { SessionManager } from "../../../auth/session.js";

const API_POINTS = "http://localhost:5000/api/points";
const API_STUDENTS_TEACHER = "http://localhost:5000/api/students/teacher";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  // Set Default Date hari ini
  const dateInput = document.getElementById("input-date");
  if (dateInput) dateInput.valueAsDate = new Date();

  // Load Data Khusus Guru
  loadMyStudents(user.id);
  loadMyHistory(user.id);

  // Logout Foundation
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      Notifications.confirm("Konfirmasi Keluar", "Yakin ingin keluar?", () => {
        localStorage.removeItem("user_session");
        window.location.href = "../../index.html";
      });
    });
  }
});

// 1. ISI DROPDOWN (Hanya Siswa Binaan)
async function loadMyStudents(teacherId) {
  const select = document.getElementById("input-student");
  try {
    const res = await fetch(`${API_STUDENTS_TEACHER}/${teacherId}`);
    const result = await res.json();

    select.innerHTML = '<option value="">-- Pilih Siswa --</option>';

    if (result.success) {
      result.data.forEach((s) => {
        const label = `${s.nama_lengkap} (${s.nama_kelas})`;
        select.innerHTML += `<option value="${s.id}">${label}</option>`;
      });
    }
  } catch (error) {
    console.error(error);
    select.innerHTML = '<option value="">Gagal memuat siswa</option>';
  }
}

// 2. LOAD RIWAYAT (Hanya Poin Siswa Binaan)
async function loadMyHistory(teacherId) {
  const tbody = document.getElementById("points-history-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(`${API_POINTS}/teacher/${teacherId}`);
    const result = await res.json();

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada riwayat poin di kelas Anda.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      const isViolation = item.type === "violation";
      const badgeClass = isViolation ? "badge inactive" : "badge active";
      const sign = isViolation ? "-" : "+";
      const color = isViolation ? "#ef4444" : "#10b981";

      const dateStr = new Date(item.incident_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const row = `
        <tr>
          <td>${dateStr}</td>
          <td>
            <div style="font-weight:bold;">${item.nama_lengkap}</div>
            <small style="color:#64748b;">${item.nama_kelas}</small>
          </td>
          <td>
            <span class="${badgeClass}" style="margin-right:5px; font-size:10px;">
              ${isViolation ? "Pelanggaran" : "Prestasi"}
            </span>
            ${item.description}
          </td>
          <td style="text-align: right; font-weight:bold; color: ${color}; font-size: 16px;">
            ${sign}${item.point_amount}
          </td>
          <td style="text-align: right;">
            <button class="btn-action delete" onclick="deletePoint(${item.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal koneksi.</td></tr>`;
  }
}

// 3. GLOBAL FUNCTIONS (Bisa dipanggil dari HTML)
window.setPointType = (type) => {
  document.getElementById("point-type").value = type;
  const btnVio = document.getElementById("btn-violation");
  const btnAch = document.getElementById("btn-achievement");

  btnVio.className = "type-btn";
  btnAch.className = "type-btn";

  if (type === "violation") {
    btnVio.classList.add("active-minus");
    document.getElementById("input-desc").placeholder = "Contoh: Terlambat...";
  } else {
    btnAch.classList.add("active-plus");
    document.getElementById("input-desc").placeholder =
      "Contoh: Juara Lomba...";
  }
};

window.handleSavePoint = async (e) => {
  e.preventDefault();
  const user = SessionManager.getUser();
  const btnSimpan = e.target.querySelector("button[type='submit']");

  const data = {
    student_id: document.getElementById("input-student").value,
    type: document.getElementById("point-type").value,
    description: document.getElementById("input-desc").value,
    point_amount: document.getElementById("input-amount").value,
    incident_date: document.getElementById("input-date").value,
  };

  btnSimpan.innerText = "Menyimpan...";
  btnSimpan.disabled = true;

  try {
    const res = await fetch(API_POINTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      Notifications.success("Poin berhasil disimpan");
      document.getElementById("form-points").reset();
      document.getElementById("input-date").valueAsDate = new Date();
      loadMyHistory(user.id);
    }
  } catch (error) {
    Notifications.error("Gagal simpan.");
  } finally {
    btnSimpan.innerText = "Simpan Data";
    btnSimpan.disabled = false;
  }
};

window.deletePoint = (id) => {
  const user = SessionManager.getUser();
  Notifications.confirm(
    "Hapus Poin?",
    "Data akan dihapus permanen.",
    async () => {
      try {
        await fetch(`${API_POINTS}/${id}`, { method: "DELETE" });
        Notifications.success("Terhapus");
        loadMyHistory(user.id);
      } catch (err) {
        Notifications.error("Gagal hapus");
      }
    },
  );
};
