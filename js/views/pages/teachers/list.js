const API_URL = "http://localhost:5000/api/teachers";

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("user_session");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  // 1. Cek apakah user adalah Admin
  if (!session || session.role !== "admin") {
    const userRole = session ? session.role : "Tamu";

    // 2. Gunakan Notifikasi Kustom
    if (typeof Notifications !== "undefined") {
      Notifications.error(
        `Akses Ditolak! Akun Anda adalah (${userRole}). Halaman ini hanya untuk Administrator.`,
      );
    } else {
      alert(`Akses Khusus Admin! Peran Anda: ${userRole}`);
    }

    // 3. Beri jeda sedikit agar user bisa membaca pesan sebelum di-redirect
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 2000);
    return;
  }

  fetchTeachers();
});

// 1. GET DATA
async function fetchTeachers() {
  const tbody = document.getElementById("teacher-list-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data guru.</td></tr>`;
      return;
    }

    result.data.forEach((item, index) => {
      const statusBadge =
        item.status === "aktif"
          ? '<span class="badge active">Aktif</span>'
          : '<span class="badge inactive">Non-Aktif</span>';

      const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td style="font-weight:bold;">${item.nama_lengkap}</td>
                    <td>${item.username}</td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right;">
                        <button class="btn-action edit" onclick="window.editTeacher(${item.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action delete" onclick="window.deleteTeacher(${item.id})"><i class="fa-solid fa-trash"></i></button>
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

// 2. MODAL LOGIC
window.openModal = () => {
  const modal = document.getElementById("modal-teacher");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
};

window.closeModal = () => {
  const modal = document.getElementById("modal-teacher");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("form-teacher").reset();
    document.getElementById("teacher-id").value = "";
    document.querySelector(".modal-header h3").innerText = "Tambah Guru Baru";
    document.getElementById("password").required = true; // Password wajib saat baru
  }, 300);
};

// 3. SAVE (CREATE & UPDATE)
window.handleSaveTeacher = async (e) => {
  e.preventDefault();

  const id = document.getElementById("teacher-id").value;
  const isEdit = id !== "";

  const data = {
    nama_lengkap: document.getElementById("nama-lengkap").value,
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    status: document.getElementById("status").value,
  };

  // Validasi Password saat Mode Tambah Baru
  if (!isEdit && !data.password) {
    if (typeof Notifications !== "undefined")
      Notifications.error("Password wajib diisi untuk guru baru!");
    else alert("Password wajib diisi!");
    return;
  }

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
      if (typeof Notifications !== "undefined")
        Notifications.success(result.message);
      else alert(result.message);

      window.closeModal();
      fetchTeachers();
    } else {
      if (typeof Notifications !== "undefined")
        Notifications.error(result.message);
      else alert(result.message);
    }
  } catch (error) {
    if (typeof Notifications !== "undefined")
      Notifications.error("Terjadi kesalahan sistem.");
    else alert("Error Sistem");
  } finally {
    btnSimpan.innerText = oriText;
    btnSimpan.disabled = false;
  }
};

// 4. EDIT
window.editTeacher = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();

    if (result.success) {
      const data = result.data;

      document.getElementById("teacher-id").value = data.id;
      document.getElementById("nama-lengkap").value = data.nama_lengkap;
      document.getElementById("username").value = data.username;
      document.getElementById("status").value = data.status;

      // Password kosongkan saja (opsional kalau mau ganti)
      document.getElementById("password").value = "";
      document.getElementById("password").required = false; // Tidak wajib saat edit

      document.querySelector(".modal-header h3").innerText = "Edit Data Guru";
      window.openModal();
    }
  } catch (error) {
    console.error(error);
  }
};

// 5. DELETE
window.deleteTeacher = async (id) => {
  if (typeof Notifications === "undefined") {
    if (confirm("Hapus Guru ini?")) deleteExecute(id);
    return;
  }

  Notifications.confirm(
    "Hapus Guru?",
    "Akses login guru ini akan hilang.",
    async () => {
      deleteExecute(id);
    },
  );
};

async function deleteExecute(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const result = await res.json();

    if (result.success) {
      Notifications.success(result.message);
      fetchTeachers();
    } else {
      Notifications.error(result.message);
    }
  } catch (error) {
    Notifications.error("Gagal menghapus.");
  }
}
