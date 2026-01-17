const API_REPORTS = "http://localhost:5000/api/reports";

document.addEventListener("DOMContentLoaded", () => {
  // Set default bulan ke bulan saat ini
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0"); // Jan = 01
  document.getElementById("filter-month").value = `${yyyy}-${mm}`;

  // Load laporan default (Pelanggaran bulan ini)
  generateReport();
});

// Fungsi Utama: Generate Laporan
window.generateReport = async () => {
  const type = document.getElementById("filter-type").value;
  const month = document.getElementById("filter-month").value;
  const tbody = document.getElementById("report-body");
  const titleElement = document.getElementById("report-title");

  // Update Judul Laporan agar dinamis sesuai filter
  const typeText =
    type === "violation" ? "Siswa Bermasalah" : "Siswa Berprestasi";

  let monthText = "Semua Waktu";
  if (month) {
    // Ubah "2023-10" jadi "Oktober 2023"
    const [y, m] = month.split("-");
    const dateObj = new Date(y, m - 1);
    monthText = dateObj.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  }

  titleElement.innerText = `Laporan ${typeText} - ${monthText}`;

  // Loading State
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Menganalisis data...</td></tr>`;

  try {
    // Fetch Data dengan Query Params
    let url = `${API_REPORTS}?type=${type}`;
    if (month) url += `&month=${month}`;

    const res = await fetch(url);
    const result = await res.json();

    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px;">Tidak ada data ditemukan untuk periode ini.</td></tr>`;
      return;
    }

    // Render Data
    result.data.forEach((item, index) => {
      // Tentukan warna poin (Merah jika pelanggaran, Hijau jika prestasi)
      const color = type === "violation" ? "#ef4444" : "#10b981";

      // Highlight Top 3 dengan piala/medali (Opsional visual candy)
      let rankIcon = `#${index + 1}`;
      if (index === 0) rankIcon = `🥇 1`;
      if (index === 1) rankIcon = `🥈 2`;
      if (index === 2) rankIcon = `🥉 3`;

      const row = `
                <tr>
                    <td style="font-weight:bold; font-size:1.1em;">${rankIcon}</td>
                    <td style="font-weight:600;">${item.nama_lengkap}</td>
                    <td>${item.nama_kelas}</td>
                    <td style="text-align:center;">${item.total_kasus}x</td>
                    <td style="font-weight:bold; color: ${color}; font-size: 1.2em;">
                        ${item.total_poin}
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal memuat laporan.</td></tr>`;
  }
};
