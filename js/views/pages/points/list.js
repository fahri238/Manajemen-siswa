const API_POINTS = "http://localhost:5000/api/points";
const API_STUDENTS = "http://localhost:5000/api/students";

document.addEventListener("DOMContentLoaded", () => {
  // Set Default Date hari ini
  document.getElementById("input-date").valueAsDate = new Date();

  // Load Data Awal
  loadStudents();
  loadHistory();
});

// 1. ISI DROPDOWN SISWA
async function loadStudents() {
  const select = document.getElementById("input-student");
  try {
    const res = await fetch(API_STUDENTS);
    const result = await res.json();

    select.innerHTML = '<option value="">-- Pilih Siswa --</option>';

    if (result.success) {
      result.data.forEach((s) => {
        // Tampilkan Nama + Kelas di dropdown
        const label = `${s.nama_lengkap} (${s.nama_kelas || "Tanpa Kelas"})`;
        select.innerHTML += `<option value="${s.id}">${label}</option>`;
      });
    }
  } catch (error) {
    select.innerHTML = '<option value="">Gagal memuat siswa</option>';
  }
}

// 2. LOAD RIWAYAT POIN
async function loadHistory() {
  const tbody = document.getElementById("points-history-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_POINTS);
    const result = await res.json();

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada riwayat poin.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      // Logic Warna & Tanda
      const isViolation = item.type === "violation";
      const badgeClass = isViolation ? "badge inactive" : "badge active"; // Merah vs Hijau
      const sign = isViolation ? "-" : "+";
      const color = isViolation ? "#ef4444" : "#10b981";

      // Format Tanggal Indo
      const dateObj = new Date(item.incident_date);
      const dateStr = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const row = `
                <tr>
                    <td>${dateStr}</td>
                    <td>
                        <div style="font-weight:bold;">${
                          item.nama_lengkap
                        }</div>
                        <small style="color:#64748b;">${item.nama_kelas}</small>
                    </td>
                    <td>
                        <span class="${badgeClass}" style="margin-right:5px; font-size:10px;">${
        isViolation ? "Pelanggaran" : "Prestasi"
      }</span>
                        ${item.description}
                    </td>
                    <td style="text-align: right; font-weight:bold; color: ${color}; font-size: 16px;">
                        ${sign}${item.point_amount}
                    </td>
                    <td style="text-align: right;">
                        <button class="btn-action delete" onclick="window.deletePoint(${
                          item.id
                        })">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal koneksi server.</td></tr>`;
  }
}

// 3. HANDLE TOMBOL TIPE (Pelanggaran/Prestasi)
window.setPointType = (type) => {
  document.getElementById("point-type").value = type;

  const btnVio = document.getElementById("btn-violation");
  const btnAch = document.getElementById("btn-achievement");

  // Reset Class
  btnVio.className = "type-btn";
  btnAch.className = "type-btn";

  // Set Active Class
  if (type === "violation") {
    btnVio.classList.add("active-minus");
    document.getElementById("input-desc").placeholder =
      "Contoh: Terlambat, Atribut tidak lengkap...";
  } else {
    btnAch.classList.add("active-plus");
    document.getElementById("input-desc").placeholder =
      "Contoh: Juara 1 Lomba, Menolong Guru...";
  }
};

// 4. SIMPAN POIN
window.handleSavePoint = async (e) => {
  e.preventDefault();

  const btnSimpan = e.target.querySelector("button[type='submit']");
  const oriText = btnSimpan.innerText;
  btnSimpan.innerText = "Menyimpan...";
  btnSimpan.disabled = true;

  const data = {
    student_id: document.getElementById("input-student").value,
    type: document.getElementById("point-type").value,
    description: document.getElementById("input-desc").value,
    point_amount: document.getElementById("input-amount").value,
    incident_date: document.getElementById("input-date").value,
  };

  try {
    const res = await fetch(API_POINTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined")
        Notifications.success("Poin berhasil disimpan");

      // Reset Form (Kecuali Tanggal biar user ga capek)
      document.getElementById("input-student").value = "";
      document.getElementById("input-desc").value = "";
      document.getElementById("input-amount").value = "5";

      // Refresh Tabel Kanan
      loadHistory();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert("Error sistem.");
  } finally {
    btnSimpan.innerText = oriText;
    btnSimpan.disabled = false;
  }
};

// 5. DELETE POIN
window.deletePoint = async (id) => {
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Riwayat Poin?",
      "Data ini akan dihapus permanen.",
      async () => {
        await executeDelete(id);
      }
    );
  } else {
    if (confirm("Hapus?")) await executeDelete(id);
  }
};

async function executeDelete(id) {
  try {
    await fetch(`${API_POINTS}/${id}`, { method: "DELETE" });
    if (typeof Notifications !== "undefined") Notifications.success("Terhapus");
    loadHistory();
  } catch (err) {
    alert("Gagal hapus");
  }
}
