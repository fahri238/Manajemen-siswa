const API_URL = "http://localhost:5000/api/announcements";

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
});

// 1. LOAD DATA PENGUMUMAN
async function loadAnnouncements() {
  const tbody = document.getElementById("announcement-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();

    tbody.innerHTML = "";

    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada pengumuman.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      // 1. LOGIKA KATEGORI & WARNA (Harus di dalam forEach)
      let badgeClass = "status-info"; // Default (Umum/Kegiatan)
      if (item.category === "Akademik") badgeClass = "status-info";
      if (item.category === "Keuangan") badgeClass = "status-danger";
      if (item.category === "Kegiatan") badgeClass = "status-success";
      if (item.category === "Umum") badgeClass = "status-secondary";

      // 2. FORMAT TANGGAL
      const dateObj = new Date(item.created_at);
      const dateStr = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const row = `
  <tr>
    <td>${dateStr}</td>
    <td>
      <div style="font-weight:bold;">${item.title}</div>
      <span class="status-badge ${badgeClass}">${item.category}</span>
    </td>
    <td>${item.content}</td>
    <td><span class="badge active">Umum</span></td> <td style="text-align: right;">
      <button class="btn-action delete" onclick="window.deleteAnnouncement(${item.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  </tr>
`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal memuat data dari server.</td></tr>`;
  }
}

// 2. SIMPAN PENGUMUMAN
window.handleSaveAnnouncement = async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector("button[type='submit']");
  const originalText = btn.innerText;
  btn.innerText = "Memproses...";
  btn.disabled = true;

  const data = {
    title: document.getElementById("input-title").value,
    category: document.getElementById("input-category").value,
    content: document.getElementById("input-content").value,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined")
        Notifications.success("Pengumuman dipublikasikan!");
      e.target.reset();
      loadAnnouncements();
    }
  } catch (error) {
    alert("Gagal menyimpan pengumuman.");
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  }
};

// 3. DELETE PENGUMUMAN
window.deleteAnnouncement = async (id) => {
  // Cek apakah library Notifications tersedia
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Pengumuman?",
      "Informasi ini akan dihapus secara permanen dari dashboard.",
      async () => {
        await executeDelete(id);
      },
    );
  } else {
    // Fallback jika library tidak termuat
    if (confirm("Hapus pengumuman ini?")) {
      await executeDelete(id);
    }
  }
};

// Fungsi eksekusi hapus yang dipisahkan agar lebih rapi
async function executeDelete(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined") {
        Notifications.success("Pengumuman berhasil dihapus");
      }
      loadAnnouncements(); // Refresh tabel
    } else {
      alert("Gagal menghapus: " + result.message);
    }
  } catch (err) {
    console.error("Delete Error:", err);
    alert("Gagal terhubung ke server.");
  }
}
