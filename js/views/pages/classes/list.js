const API_URL = "http://localhost:5000/api/classes";

document.addEventListener("DOMContentLoaded", () => {
  fetchClasses();
  loadTeachers(); // Ambil data guru untuk dropdown
});

// 1. GET CLASSES
async function fetchClasses() {
  const tbody = document.getElementById("class-list-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data kelas.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      const row = `
                <tr>
                    <td style="font-weight:bold;">${item.nama_kelas}</td>
                    <td>${
                      item.nama_wali_kelas ||
                      '<span style="color:#94a3b8; font-style:italic">Belum ditentukan</span>'
                    }</td>
                    <td>${item.tahun_ajaran}</td>
                    <td>${item.kapasitas} Siswa</td>
                    <td>
                        <button class="btn-action edit" onclick="window.editClass(${
                          item.id
                        })"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action delete" onclick="window.deleteClass(${
                          item.id
                        })"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal koneksi.</td></tr>`;
  }
}

// 2. GET TEACHERS (Untuk Dropdown)
async function loadTeachers() {
  const select = document.getElementById("wali-kelas");
  try {
    // Kita butuh route khusus, saya tambahkan di backend tadi
    const res = await fetch(`${API_URL}/teachers/list`);
    const result = await res.json();

    if (result.success) {
      let options = '<option value="">-- Pilih Guru --</option>';
      result.data.forEach((guru) => {
        options += `<option value="${guru.id}">${guru.nama_lengkap}</option>`;
      });
      select.innerHTML = options;
    }
  } catch (error) {
    console.log("Gagal memuat guru:", error);
  }
}

// 3. MODAL FUNCTIONS (Global Window)
window.openModal = () => {
  const modal = document.getElementById("modal-class");
  modal.style.display = "flex";
  // Animasi fade in
  setTimeout(() => modal.classList.add("show"), 10);
};

window.closeModal = () => {
  const modal = document.getElementById("modal-class");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    // Reset Form
    document.getElementById("form-class").reset();
    document.getElementById("class-id").value = "";
    document.querySelector(".modal-header h3").innerText = "Tambah Kelas Baru";
  }, 300);
};

// 4. HANDLE SAVE (CREATE & UPDATE)
window.handleSaveClass = async (e) => {
  e.preventDefault();

  // Ambil Value berdasarkan ID di HTML Anda (pake dash - )
  const id = document.getElementById("class-id").value;
  const isEdit = id !== "";

  const data = {
    nama_kelas: document.getElementById("nama-kelas").value,
    wali_kelas_id: document.getElementById("wali-kelas").value,
    tahun_ajaran: document.getElementById("tahun-ajaran").value,
    kapasitas: document.getElementById("kapasitas").value,
  };

  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  // Loading State
  const btnSimpan = e.target.querySelector("button[type='submit']");
  const oriText = btnSimpan.innerText;
  btnSimpan.innerText = "Menyimpan...";
  btnSimpan.disabled = true;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      Notifications.success(result.message);

      window.closeModal();
      fetchClasses();
    } else {
      Notification.error(result.message);
    }
  } catch (error) {
    Notifications.error("Terjadi kesalahan sistem.");
  } finally {
    btnSimpan.innerText = oriText;
    btnSimpan.disabled = false;
  }
};

// 5. EDIT & DELETE
window.editClass = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (result.success) {
      const data = result.data;

      document.getElementById("class-id").value = data.id;
      document.getElementById("nama-kelas").value = data.nama_kelas;
      document.getElementById("wali-kelas").value = data.wali_kelas_id;
      document.getElementById("tahun-ajaran").value = data.tahun_ajaran;
      document.getElementById("kapasitas").value = data.kapasitas;

      document.querySelector(".modal-header h3").innerText = "Edit Data Kelas";
      window.openModal();
    }
  } catch (error) {
    console.error(error);
  }
};

window.deleteClass = function (id) {
  // Pastikan library Notifications sudah dimuat
  if (typeof Notifications === "undefined") {
    alert("Library notifikasi belum dimuat!");
    return;
  }

  // Panggil Custom Confirm
  Notifications.confirm(
    "Hapus Kelas Ini?", // Judul
    "Data yang dihapus tidak dapat dikembalikan.", // Pesan
    async () => {
      // Callback (Jalan jika user klik YA)
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        const result = await res.json();

        if (result.success) {
          Notifications.success("Data kelas berhasil dihapus");
          fetchClasses(); // Refresh tabel
        } else {
          Notifications.error(result.message || "Gagal menghapus data");
        }
      } catch (error) {
        console.error(error);
        Notifications.error("Terjadi kesalahan koneksi");
      }
    }
  );
};
