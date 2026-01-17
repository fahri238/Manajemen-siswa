// js/views/pages/students/list.js

const API_URL = "http://localhost:5000/api/students";
const API_CLASS = "http://localhost:5000/api/classes";

// Variable global untuk pencarian cepat
let allStudents = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchStudents();
  loadClassesDropdown();

  // Listener Pencarian Realtime
  const searchInput = document.querySelector(".search-box input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      filterStudents(keyword);
    });
  }
});

// --- 1. LOAD DATA SISWA ---
async function fetchStudents() {
  const tbody = document.getElementById("student-list-body");
  tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    if (result.success) {
      allStudents = result.data; // Simpan ke global var
      renderTable(allStudents);
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">${result.message}</td></tr>`;
    }
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:red">Gagal koneksi ke server.</td></tr>`;
  }
}

// --- 2. RENDER TABEL (Logic Poin & Gender Baru) ---
function renderTable(data) {
  const tbody = document.getElementById("student-list-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">Tidak ada data siswa.</td></tr>`;
    return;
  }

  data.forEach((item, index) => {
    const statusClass = item.status === "aktif" ? "active" : "inactive";

    // A. LOGIC GENDER (Fix L/P)
    const genderCode = (item.gender || "").toUpperCase();
    let genderIcon = '<span style="color:#ccc">-</span>';

    if (genderCode === "L") {
      genderIcon = `<div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-mars" style="color:#3b82f6;" title="Laki-laki"></i> Laki-laki</div>`;
    } else if (genderCode === "P") {
      genderIcon = `<div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-venus" style="color:#ec4899;" title="Perempuan"></i> Perempuan</div>`;
    }

    // B. LOGIC POIN (Prestasi vs Pelanggaran)
    const prestasi = parseInt(item.total_prestasi || 0);
    const pelanggaran = parseInt(item.total_pelanggaran || 0);
    // Base poin 100 + Prestasi - Pelanggaran
    const skorBersih = 100 + prestasi - pelanggaran;

    // Warna Skor
    let skorColor = "#10b981"; // Hijau (Aman)
    if (skorBersih < 75) skorColor = "#f59e0b"; // Kuning (Waspada)
    if (skorBersih < 50) skorColor = "#ef4444"; // Merah (Bahaya)

    const row = `
            <tr>
                <td>${index + 1}</td>
                <td><span style="font-family:monospace; font-weight:bold;">${
                  item.nis
                }</span></td>
                <td>
                    <div style="font-weight:600; color:#1e293b;">${
                      item.nama_lengkap
                    }</div>
                    <small style="color:#64748b;">NISN: ${
                      item.nisn || "-"
                    }</small>
                </td>
                <td><span class="badge" style="background:#e0f2fe; color:#0369a1;">${
                  item.nama_kelas || "No Class"
                }</span></td>
                <td>${genderIcon}</td>
                
                <td>
                    <div style="display:flex; flex-direction:column; gap:2px; font-size:11px; font-weight:600;">
                        <span style="font-size:14px; color:${skorColor}; margin-bottom:2px;">
                            ${skorBersih} Poin
                        </span>
                        <div style="display:flex; gap:8px;">
                            <span style="color:#10b981;" title="Total Prestasi">
                                <i class="fa-solid fa-plus"></i> ${prestasi}
                            </span>
                            <span style="color:#ef4444;" title="Total Pelanggaran">
                                <i class="fa-solid fa-minus"></i> ${pelanggaran}
                            </span>
                        </div>
                    </div>
                </td>

                <td><span class="badge ${statusClass}">${
      item.status
    }</span></td>
                
                <td style="text-align: right;">
                    <button class="btn-action edit" onclick="window.editStudent(${
                      item.id
                    })"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action delete" onclick="window.deleteStudent(${
                      item.id
                    })"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

// --- 3. LOAD DROPDOWN KELAS (Untuk Modal) ---
async function loadClassesDropdown() {
  const select = document.getElementById("kelas-select");
  if (!select) return;

  try {
    const res = await fetch(API_CLASS);
    const result = await res.json();
    if (result.success) {
      select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
      result.data.forEach((c) => {
        select.innerHTML += `<option value="${c.id}">${c.nama_kelas}</option>`;
      });
    }
  } catch (err) {
    console.error("Gagal load kelas", err);
  }
}

// --- 4. SIMPAN DATA (CREATE / UPDATE) ---
window.handleSaveStudent = async (e) => {
  e.preventDefault();

  const id = document.getElementById("student-id").value;
  const isEdit = id !== "";

  // Ambil data form (Pastikan ID HTML sesuai)
  const data = {
    nama_lengkap: document.getElementById("nama-lengkap").value,
    nis: document.getElementById("nis").value,
    nisn: document.getElementById("nisn").value, // AMBIL NISN
    kelas_id: document.getElementById("kelas-select").value,
    // Ambil value radio button yang checked
    gender:
      document.querySelector('input[name="gender"]:checked')?.value || "L",
    status: "aktif",
  };

  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  // Efek Loading Tombol
  const btnSubmit = e.target.querySelector("button[type='submit']");
  const oriText = btnSubmit.innerText;
  btnSubmit.innerText = "Menyimpan...";
  btnSubmit.disabled = true;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined")
        Notifications.success(result.message);
      else alert(result.message);

      window.closeModal();
      fetchStudents(); // Refresh tabel
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert("Terjadi kesalahan sistem.");
    console.error(error);
  } finally {
    btnSubmit.innerText = oriText;
    btnSubmit.disabled = false;
  }
};

// --- 5. EDIT DATA (Isi Form) ---
window.editStudent = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (result.success) {
      const d = result.data;

      // Isi Form
      document.getElementById("student-id").value = d.id;
      document.getElementById("nama-lengkap").value = d.nama_lengkap;
      document.getElementById("nis").value = d.nis;
      document.getElementById("nisn").value = d.nisn || ""; // ISI NISN
      document.getElementById("kelas-select").value = d.kelas_id;

      // Set Radio Button Gender
      const radios = document.getElementsByName("gender");
      radios.forEach((r) => {
        // Compare uppercase biar aman
        if (r.value === (d.gender || "").toUpperCase()) {
          r.checked = true;
        }
      });

      // Ubah Judul Modal
      document.getElementById("modal-title").innerText = "Edit Data Siswa";
      window.openAddStudentModal();
    }
  } catch (err) {
    console.error(err);
  }
};

// --- 6. HAPUS DATA ---
window.deleteStudent = async (id) => {
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Siswa?",
      "Data poin & absensi juga akan terhapus.",
      async () => {
        await executeDelete(id);
      }
    );
  } else {
    if (confirm("Hapus siswa ini?")) await executeDelete(id);
  }
};

async function executeDelete(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      Notifications.success("Siswa berhasil dihapus");
      fetchStudents();
    } else {
      alert(result.message);
    }
  } catch (err) {
    alert("Gagal menghapus");
  }
}

// --- 7. MODAL UTILS & SEARCH ---

window.openAddStudentModal = () => {
  const modal = document.getElementById("modal-add-student");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
};

window.closeModal = () => {
  const modal = document.getElementById("modal-add-student");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    // Reset Form
    document.getElementById("form-add-student").reset();
    document.getElementById("student-id").value = "";
    document.getElementById("modal-title").innerText = "Tambah Siswa Baru";
  }, 300);
};

function filterStudents(keyword) {
  const filtered = allStudents.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(keyword) ||
      item.nis.includes(keyword)
  );
  renderTable(filtered);
}
