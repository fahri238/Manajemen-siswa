const API_URL = "http://localhost:5000/api/students";
const API_CLASS = "http://localhost:5000/api/classes";

document.addEventListener("DOMContentLoaded", () => {
  fetchStudents();
  loadClassesDropdown();

  // Fitur Pencarian Realtime
  const searchInput = document.querySelector(".search-box input");
  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    filterStudents(keyword);
  });
});

let allStudents = []; // Simpan data lokal untuk pencarian cepat

// 1. LOAD DATA SISWA
async function fetchStudents() {
  const tbody = document.getElementById("student-list-body");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    if (result.success) {
      allStudents = result.data; // Simpan ke variable global
      renderTable(allStudents);
    }
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red">Gagal koneksi server.</td></tr>`;
  }
}

// 2. RENDER TABEL
function renderTable(data) {
  const tbody = document.getElementById("student-list-body");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada data siswa.</td></tr>`;
    return;
  }

  data.forEach((item) => {
    const statusClass = item.status === "aktif" ? "active" : "inactive";

    // --- LOGIC GENDER ---
    const genderCode = (item.gender || "").toUpperCase();
    let genderDisplay = `<div style="font-size:12px; color:#94a3b8;">-</div>`;

    if (genderCode === "L") {
      genderDisplay = `<div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-mars" style="color:#3b82f6; margin-right:4px;"></i> Laki-laki</div>`;
    } else if (genderCode === "P") {
      genderDisplay = `<div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-venus" style="color:#ec4899; margin-right:4px;"></i> Perempuan</div>`;
    }

    // --- LOGIC POIN (BARU) ---
    const prestasi = item.total_prestasi || 0;
    const pelanggaran = item.total_pelanggaran || 0;

    // Kita hitung skor bersih (Prestasi - Pelanggaran)
    // Opsional: Bisa ditambah 100 jika base poin sekolah adalah 100
    const skorBersih = 100 + parseInt(prestasi) - parseInt(pelanggaran);

    // Warna skor bersih
    let skorColor = "#10b981"; // Hijau aman
    if (skorBersih < 75) skorColor = "#f59e0b"; // Kuning waspada
    if (skorBersih < 50) skorColor = "#ef4444"; // Merah bahaya

    const row = `
            <tr>
                <td>
                    <div style="font-weight:600; color:#1e293b;">${
                      item.nama_lengkap
                    }</div>
                    ${genderDisplay}
                </td>
                <td>${item.nis}</td>
                <td><span class="badge" style="background:#e0f2fe; color:#0369a1;">${
                  item.nama_kelas || "-"
                }</span></td>
                <td><span class="badge ${statusClass}">${
      item.status
    }</span></td>
                
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

// 3. LOAD DROPDOWN KELAS (Untuk Modal)
async function loadClassesDropdown() {
  const select = document.getElementById("kelas-select");
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

// 4. SIMPAN (TAMBAH / EDIT)
window.handleSaveStudent = async (e) => {
  e.preventDefault();

  const id = document.getElementById("student-id").value;
  const isEdit = id !== "";

  const data = {
    nama_lengkap: document.getElementById("nama-lengkap").value,
    nis: document.getElementById("nis").value,
    kelas_id: document.getElementById("kelas-select").value,
    gender: document.querySelector('input[name="gender"]:checked').value,
    status: "aktif", // Default
  };

  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

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
      fetchStudents();
    } else {
      alert(result.message);
    }
  } catch (error) {
    alert("Terjadi kesalahan.");
  }
};

// 5. EDIT (Buka Modal & Isi Data)
window.editStudent = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (result.success) {
      const d = result.data;
      document.getElementById("student-id").value = d.id;
      document.getElementById("nama-lengkap").value = d.nama_lengkap;
      document.getElementById("nis").value = d.nis;
      document.getElementById("kelas-select").value = d.kelas_id;

      // Set Radio Button Gender
      const radios = document.getElementsByName("gender");
      radios.forEach((r) => {
        if (r.value === d.gender) r.checked = true;
      });

      document.getElementById("modal-title").innerText = "Edit Data Siswa";
      window.openAddStudentModal();
    }
  } catch (err) {
    console.error(err);
  }
};

// 6. DELETE
window.deleteStudent = async (id) => {
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Siswa?",
      "Data yang dihapus tidak bisa dikembalikan.",
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
    }
  } catch (err) {
    alert("Gagal menghapus");
  }
}

// 7. SEARCH FILTER
function filterStudents(keyword) {
  const filtered = allStudents.filter(
    (item) =>
      item.nama_lengkap.toLowerCase().includes(keyword) ||
      item.nis.includes(keyword)
  );
  renderTable(filtered);
}

// MODAL UTILS
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
    document.getElementById("form-add-student").reset();
    document.getElementById("student-id").value = "";
    document.getElementById("modal-title").innerText = "Tambah Siswa Baru";
  }, 300);
};
