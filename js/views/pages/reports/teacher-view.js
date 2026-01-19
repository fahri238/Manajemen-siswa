import { SessionManager } from "../../../auth/session.js";

const API_REPORT = "http://localhost:5000/api/reports/teacher-summary";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user) {
    alert("Sesi habis.");
    SessionManager.logout();
    return;
  }
  // Load pertama kali (tanpa filter ID kelas)
  loadReport(user);
  setupDate();
});

// Parameter classId opsional (default null)
// ... import dan kode atas tetap sama ...

async function loadReport(user, classId = null) {
  document.getElementById("sig-teacher-name").innerText =
    user.nama || user.name || "Guru Wali Kelas";

  try {
    let url = `${API_REPORT}/${user.id}`;
    if (classId) url += `?classId=${classId}`;

    const res = await fetch(url);
    const result = await res.json();

    if (result.success) {
      // FIX ERROR DISINI:
      // Kita tampung dulu datanya, lalu kita cek ketersediaannya (Optional Chaining)
      const data = result.data;

      // 1. SAFEGUARD: Cek apakah backend mengirim format Baru (available_classes) atau Lama (kelas)
      // Jika backend masih versi lama, 'available_classes' akan undefined, kita ganti array kosong []
      const availableClasses = data.available_classes || [];
      const activeClass = data.active_class || data.kelas; // Support lama & baru

      // Pastikan data kelas ada
      if (!activeClass)
        throw new Error("Data kelas tidak ditemukan dari server.");

      const stats = data.stats;
      const students = data.students;

      // --- 2. SETUP DROPDOWN KELAS ---
      const selector = document.getElementById("class-selector");

      // Cek length hanya jika arraynya ada
      if (availableClasses && availableClasses.length > 1) {
        selector.style.display = "block";

        if (selector.options.length === 0) {
          selector.innerHTML = "";
          availableClasses.forEach((cls) => {
            const option = document.createElement("option");
            option.value = cls.id;
            option.text = cls.nama_kelas;
            if (cls.id === activeClass.id) option.selected = true;
            selector.appendChild(option);
          });

          selector.addEventListener("change", (e) => {
            loadReport(user, e.target.value);
          });
        }
      } else {
        selector.style.display = "none";
      }

      // --- 3. UPDATE UI ---
      document.getElementById("class-subtitle").innerText =
        `Laporan Kelas: ${activeClass.nama_kelas}`;
      document.getElementById("total-students").innerText = stats.total_siswa;
      document.getElementById("total-violations").innerText =
        stats.total_pelanggaran;
      document.getElementById("avg-attendance").innerText =
        stats.avg_attendance + "%";

      // Sorting (Sama seperti sebelumnya)
      const topAlpha = [...students]
        .sort((a, b) => b.alfa - a.alfa)
        .slice(0, 5);
      renderTopAlpha(topAlpha);

      const topViolations = [...students]
        .filter((s) => s.total_pelanggaran > 0)
        .sort((a, b) => b.total_pelanggaran - a.total_pelanggaran)
        .slice(0, 5);
      renderTopPoints(topViolations);

      renderFullTable(students);
    } else {
      document.getElementById("class-subtitle").innerHTML =
        `<span style="color:red">${result.message}</span>`;
    }
  } catch (error) {
    console.error("Error loadReport:", error);
    document.getElementById("class-subtitle").innerText =
      "Gagal memuat data (Cek Console).";
  }
}

function renderTopAlpha(data) {
  const tbody = document.getElementById("top-alpha-body");
  tbody.innerHTML = "";
  data.forEach((s) => {
    if (s.alfa === 0) return;
    tbody.innerHTML += `
            <tr>
                <td style="font-weight:600">${s.nama_lengkap}</td>
                <td style="text-align:center; color:red; font-weight:bold">${s.alfa}</td>
                <td><span class="badge warning">Alpha</span></td>
            </tr>`;
  });
  if (tbody.innerHTML === "")
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">Nihil</td></tr>`;
}

// FIX: Menampilkan Top Pelanggaran di Box Merah
function renderTopPoints(data) {
  const tbody = document.getElementById("top-points-body");
  tbody.innerHTML = "";

  data.forEach((s) => {
    // Logic Status Pelanggaran
    let action = "Teguran Lisan";
    if (s.total_pelanggaran > 20) action = "Surat Peringatan 1";
    if (s.total_pelanggaran > 50) action = "Panggilan Ortu";

    tbody.innerHTML += `
            <tr>
                <td style="font-weight:600">${s.nama_lengkap}</td>
                <td style="text-align:center; font-weight:bold; color:#dc2626">
                    ${s.total_pelanggaran}
                </td>
                <td style="font-size:12px">${action}</td>
            </tr>`;
  });

  if (tbody.innerHTML === "") {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#64748b;">Aman (Tidak ada pelanggaran)</td></tr>`;
  }
}

// FIX: Tabel Utama (Kolom Poin menampilkan Poin Prestasi)
function renderFullTable(data) {
  const tbody = document.getElementById("full-student-list");
  tbody.innerHTML = "";

  data.forEach((s, index) => {
    const genderIcon =
      s.gender === "L"
        ? '<i class="fa-solid fa-mars" style="color:blue"></i>'
        : '<i class="fa-solid fa-venus" style="color:pink"></i>';

    // Poin Prestasi Warnanya Hijau
    // Jika ada pelanggaran, bisa kita tampilkan kecil di bawahnya (Opsional)
    tbody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${s.nis}</td>
                <td style="font-weight:600">${s.nama_lengkap}</td>
                <td style="text-align:center">${genderIcon}</td>
                <td style="text-align:center">${s.attendance_pct}%</td>
                
                <td style="text-align:center; font-weight:bold; color:#10b981">
                    ${s.total_prestasi}
                    ${s.total_pelanggaran > 0 ? `<br><small style="color:red; font-size:10px">(-${s.total_pelanggaran} Plg)</small>` : ""}
                </td>
                
                <td><div style="border-bottom:1px dotted #ccc; height:20px;"></div></td>
            </tr>`;
  });
}

function setupDate() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const el = document.getElementById("print-date");
  if (el) el.innerText = today;
}
