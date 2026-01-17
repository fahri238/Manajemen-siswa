const API_DASHBOARD = "http://localhost:5000/api/dashboard";

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

async function loadDashboardData() {
  try {
    const res = await fetch(API_DASHBOARD);
    const result = await res.json();

    if (result.success) {
      // 1. Update Angka Statistik
      document.getElementById("count-siswa").innerText = result.stats.siswa;
      document.getElementById("count-guru").innerText = result.stats.guru;
      document.getElementById("count-kelas").innerText = result.stats.kelas;

      // 2. Render Tabel Aktivitas
      renderActivityTable(result.recent_activities);

      // 3. Render Charts (FUNGSI BARU)
      renderCharts(result.charts);
    }
  } catch (error) {
    console.error("Gagal load dashboard:", error);
  }
}

// Fungsi Render Tabel
function renderActivityTable(activities) {
  const tbody = document.getElementById("recent-activity-body");
  tbody.innerHTML = "";

  if (activities.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Belum ada aktivitas.</td></tr>`;
    return;
  }

  activities.forEach((item) => {
    const dateObj = new Date(item.created_at);
    const timeString =
      dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
      " " +
      dateObj.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

    const isViolation = item.type === "violation";
    const badgeClass = isViolation ? "badge inactive" : "badge active";
    const badgeText = isViolation ? "Pelanggaran" : "Prestasi";

    const row = `
            <tr>
                <td style="color: #64748b; font-size: 13px;">${timeString}</td>
                <td>
                    <div style="font-weight:600; color:#334155;">${
                      item.nama_lengkap
                    }</div>
                    <small style="color:#94a3b8;">${
                      item.nama_kelas || "Tanpa Kelas"
                    }</small>
                </td>
                <td style="line-height: 1.6;">${item.description}</td>
                <td><span class="${badgeClass}">${badgeText}</span></td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

// Fungsi Render Charts
function renderCharts(data) {
  // --- CHART 1: SISWA PER JURUSAN (BAR CHART) ---
  const ctxJurusan = document.getElementById("chartJurusan").getContext("2d");

  // 1. PROSES PENGELOMPOKAN DATA (GROUPING)
  const jurusanMap = {};

  data.jurusan.forEach((item) => {
    // Logika Pembersih Nama:
    // Ambil "X OTKP 1" atau "OTKP 1" -> Ubah jadi "OTKP"
    let namaBersih = item.nama_kelas
      .replace(/\b(X|XI|XII|10|11|12)\b/g, "") // Hapus Kelas (Romawi/Angka)
      .replace(/[0-9]/g, "") // Hapus Angka Urut (1, 2, 3)
      .trim(); // Hapus spasi di awal/akhir

    // Jika kosong (jaga-jaga), set ke 'Lainnya'
    if (!namaBersih) namaBersih = "Lainnya";

    // Jumlahkan totalnya
    if (jurusanMap[namaBersih]) {
      jurusanMap[namaBersih] += item.total;
    } else {
      jurusanMap[namaBersih] = item.total;
    }
  });

  // 2. KONVERSI KE FORMAT CHART.JS
  const labelsJurusan = Object.keys(jurusanMap);
  const totalJurusan = Object.values(jurusanMap);

  // PALET WARNA HARMONIS
  const colorfulPalette = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
  ];

  new Chart(ctxJurusan, {
    type: "bar",
    data: {
      labels: labelsJurusan,
      datasets: [
        {
          label: "Jumlah Siswa",
          data: totalJurusan,
          backgroundColor: colorfulPalette,
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            // Custom Tooltip biar jelas
            title: (context) => `Jurusan: ${context[0].label}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });

  // --- CHART 2: POIN (DOUGHNUT CHART) ---
  const ctxPoin = document.getElementById("chartPoin").getContext("2d");

  // Default 0 jika data kosong
  let violationCount = 0;
  let achievementCount = 0;

  data.poin.forEach((p) => {
    if (p.type === "violation") violationCount = p.total;
    if (p.type === "achievement") achievementCount = p.total;
  });

  new Chart(ctxPoin, {
    type: "doughnut",
    data: {
      labels: ["Pelanggaran", "Prestasi"],
      datasets: [
        {
          data: [violationCount, achievementCount],
          backgroundColor: ["#ef4444", "#10b981"], // Merah & Hijau
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: 10, // (Opsional) Memberi jarak chart dari tepi Canvas
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 30, // <--- UBAH INI (Jarak antara Chart dan Label)
            usePointStyle: true, // (Opsional) Ubah kotak jadi lingkaran biar cantik
            font: {
              size: 12, // (Opsional) Ukuran font
            },
          },
        },
      },
    },
  });
}
