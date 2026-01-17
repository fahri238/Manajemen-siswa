const API_SCHEDULES = "http://localhost:5000/api/schedules";
const API_CLASSES = "http://localhost:5000/api/classes";
const API_TEACHERS = "http://localhost:5000/api/teachers";
const API_SUBJECTS = "http://localhost:5000/api/subjects";

document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns(); // Isi opsi dropdown saat halaman dimuat

  // Event Listener: Saat Filter Kelas diubah
  document.getElementById("filter-kelas").addEventListener("change", (e) => {
    fetchSchedules(e.target.value);
  });

  // Load awal (Tampilkan semua jadwal atau kosongkan)
  fetchSchedules();
});

// ==========================================
// 1. LOAD DATA DROPDOWN (KELAS, GURU, MAPEL)
// ==========================================
async function loadDropdowns() {
  try {
    // Ambil data secara paralel (bersamaan) agar cepat
    const [resKelas, resGuru, resMapel] = await Promise.all([
      fetch(API_CLASSES),
      fetch(API_TEACHERS),
      fetch(API_SUBJECTS),
    ]);

    const dataKelas = (await resKelas.json()).data;
    const dataGuru = (await resGuru.json()).data;
    const dataMapel = (await resMapel.json()).data;

    // Elemen Dropdown Filter
    const filterKelas = document.getElementById("filter-kelas");

    // Elemen Dropdown di dalam Modal Form
    const inputKelas = document.getElementById("input-kelas");
    const inputGuru = document.getElementById("input-guru");
    const inputMapel = document.getElementById("input-mapel");

    // 1. Isi Dropdown Kelas (Filter & Form)
    dataKelas.forEach((k) => {
      const opt = `<option value="${k.id}">${k.nama_kelas}</option>`;
      filterKelas.innerHTML += opt;
      inputKelas.innerHTML += opt;
    });

    // 2. Isi Dropdown Guru
    dataGuru.forEach((g) => {
      inputGuru.innerHTML += `<option value="${g.id}">${g.nama_lengkap}</option>`;
    });

    // 3. Isi Dropdown Mapel
    dataMapel.forEach((m) => {
      inputMapel.innerHTML += `<option value="${m.id}">${m.nama_mapel} (${m.kode_mapel})</option>`;
    });
  } catch (error) {
    console.error("Gagal load dropdown:", error);
    if (typeof Notifications !== "undefined")
      Notifications.error("Gagal memuat data referensi.");
  }
}

// ==========================================
// 2. AMBIL DATA JADWAL (READ)
// ==========================================
async function fetchSchedules(kelasId = "") {
  const tbody = document.getElementById("schedule-list-body");
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Memuat jadwal...</td></tr>`;

  // Susun URL (Apakah pakai filter atau tidak?)
  let url = API_SCHEDULES;
  if (kelasId) url += `?kelas_id=${kelasId}`;

  try {
    const res = await fetch(url);
    const result = await res.json();
    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Tidak ada jadwal ditemukan.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      // Potong detik pada jam (07:00:00 -> 07:00)
      const jamMulai = item.jam_mulai.substring(0, 5);
      const jamSelesai = item.jam_selesai.substring(0, 5);

      const row = `
                <tr>
                    <td><span class="badge active">${item.hari}</span></td>
                    <td style="font-weight:bold; color:#2563eb;">${jamMulai} - ${jamSelesai}</td>
                    <td>${item.nama_kelas}</td>
                    <td>${item.nama_mapel} (${item.kode_mapel})</td>
                    <td>${item.nama_guru}</td>
                    <td style="text-align: right;">
                        <button class="btn-action edit" onclick="window.editSchedule(${item.id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-action delete" onclick="window.deleteSchedule(${item.id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red">Error koneksi server.</td></tr>`;
  }
}

// ==========================================
// 3. SIMPAN JADWAL (CREATE & UPDATE)
// ==========================================
window.handleSaveSchedule = async (e) => {
  e.preventDefault();

  // Ambil ID dari input hidden (Jika ada isinya, berarti mode EDIT)
  const id = document.getElementById("schedule-id").value;
  const isEdit = id !== "";

  const data = {
    kelas_id: document.getElementById("input-kelas").value,
    mapel_id: document.getElementById("input-mapel").value,
    guru_id: document.getElementById("input-guru").value,
    hari: document.getElementById("input-hari").value,
    jam_mulai: document.getElementById("jam-mulai").value,
    jam_selesai: document.getElementById("jam-selesai").value,
  };

  // Tentukan URL dan Method
  const url = isEdit ? `${API_SCHEDULES}/${id}` : API_SCHEDULES;
  const method = isEdit ? "PUT" : "POST";

  // Loading State Button
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

      // Refresh tabel sesuai filter yang sedang aktif (bukan reset ke semua)
      const currentFilter = document.getElementById("filter-kelas").value;
      fetchSchedules(currentFilter);
    } else {
      if (typeof Notifications !== "undefined")
        Notifications.error(result.message);
      else alert(result.message);
    }
  } catch (error) {
    if (typeof Notifications !== "undefined")
      Notifications.error("Terjadi kesalahan sistem.");
  } finally {
    btnSimpan.innerText = oriText;
    btnSimpan.disabled = false;
  }
};

// ==========================================
// 4. EDIT JADWAL (ISI FORM DARI DATA LAMA)
// ==========================================
window.editSchedule = async (id) => {
  try {
    // Fetch data detail berdasarkan ID
    const res = await fetch(`${API_SCHEDULES}/${id}`);
    const result = await res.json();

    if (result.success) {
      const data = result.data;

      // Isi Form dengan data dari database
      document.getElementById("schedule-id").value = data.id;
      document.getElementById("input-kelas").value = data.kelas_id;
      document.getElementById("input-mapel").value = data.mapel_id;
      document.getElementById("input-guru").value = data.guru_id;
      document.getElementById("input-hari").value = data.hari;

      // Format Jam (Database HH:MM:SS -> Input Time butuh HH:MM)
      document.getElementById("jam-mulai").value = data.jam_mulai.substring(
        0,
        5
      );
      document.getElementById("jam-selesai").value = data.jam_selesai.substring(
        0,
        5
      );

      // Ubah Judul Modal
      document.querySelector(".modal-header h3").innerText =
        "Edit Jadwal Pelajaran";

      window.openModal();
    }
  } catch (error) {
    console.error("Gagal load edit:", error);
  }
};

// ==========================================
// 5. HAPUS JADWAL (DELETE)
// ==========================================
window.deleteSchedule = async (id) => {
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Jadwal?",
      "Data yang dihapus tidak bisa dikembalikan.",
      async () => {
        await executeDelete(id);
      }
    );
  } else {
    if (confirm("Yakin hapus jadwal ini?")) await executeDelete(id);
  }
};

async function executeDelete(id) {
  try {
    const res = await fetch(`${API_SCHEDULES}/${id}`, { method: "DELETE" });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined")
        Notifications.success("Jadwal berhasil dihapus");

      // Refresh tabel
      const currentFilter = document.getElementById("filter-kelas").value;
      fetchSchedules(currentFilter);
    } else {
      if (typeof Notifications !== "undefined")
        Notifications.error(result.message);
    }
  } catch (err) {
    if (typeof Notifications !== "undefined")
      Notifications.error("Gagal menghapus data.");
  }
}

// ==========================================
// UTILS: MODAL
// ==========================================
window.openModal = () => {
  const modal = document.getElementById("modal-schedule");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
};

window.closeModal = () => {
  const modal = document.getElementById("modal-schedule");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    // Reset Form & ID agar bersih saat dibuka lagi nanti
    document.getElementById("form-schedule").reset();
    document.getElementById("schedule-id").value = "";
    document.querySelector(".modal-header h3").innerText = "Tambah Jadwal Baru";
  }, 300);
};
