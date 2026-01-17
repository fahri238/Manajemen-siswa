// js/views/pages/reports/teacher-view.js

// --- MOCK DATA (Sama seperti sebelumnya) ---
const currentUser = { id: 101, name: "Bpk. Agus Setiawan" }; // User Login
const classesData = [
  { id: 1, name: "X RPL 1", wali_kelas_id: 101 },
  { id: 2, name: "XI TKJ 2", wali_kelas_id: 103 },
];
const studentsData = [
  {
    id: 1,
    name: "Ahmad Rizky",
    nis: "10293",
    class_id: 1,
    gender: "L",
    points: 5,
  },
  {
    id: 2,
    name: "Bunga Citra",
    nis: "10294",
    class_id: 1,
    gender: "P",
    points: 0,
  },
  {
    id: 3,
    name: "Doni Tata",
    nis: "10295",
    class_id: 1,
    gender: "L",
    points: 45,
  },
  {
    id: 4,
    name: "Eka Saputra",
    nis: "10296",
    class_id: 1,
    gender: "L",
    points: 25,
  },
  { id: 5, name: "Fajar", nis: "10299", class_id: 2, gender: "L", points: 10 },
];
const attendanceData = [
  {
    date: "2025-01-10",
    class_id: 1,
    details: [
      { student_id: 1, status: "H" },
      { student_id: 3, status: "A" },
    ],
  },
  {
    date: "2025-01-11",
    class_id: 1,
    details: [
      { student_id: 1, status: "H" },
      { student_id: 3, status: "A" },
    ],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  initReport();
});

function initReport() {
  // 1. Identifikasi Kelas
  const myClass = classesData.find((c) => c.wali_kelas_id === currentUser.id);

  if (!myClass) {
    document.querySelector(
      ".main-content"
    ).innerHTML = `<h2 style="text-align:center; margin-top:50px;">Anda bukan Wali Kelas.</h2>`;
    return;
  }

  // Set Text UI
  document.getElementById(
    "class-subtitle"
  ).innerText = `Laporan Kelas ${myClass.name}`;
  document.getElementById(
    "print-subtitle"
  ).innerText = `KELAS: ${myClass.name} | TAHUN AJARAN 2025/2026`;
  document.getElementById("sig-teacher-name").innerText = currentUser.name;

  // Set Tanggal Print Hari Ini
  const dateNow = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  document.getElementById("print-date").innerText = dateNow;

  // 2. Filter & Hitung Data Siswa
  const myStudents = studentsData.filter((s) => s.class_id === myClass.id);

  myStudents.forEach((student) => {
    let alpha = 0;
    let totalDays = 0;
    let present = 0;

    attendanceData.forEach((record) => {
      if (record.class_id === myClass.id) {
        const detail = record.details.find((d) => d.student_id === student.id);
        if (detail) {
          totalDays++;
          if (detail.status === "A") alpha++;
          if (detail.status === "H") present++;
        }
      }
    });

    student.alphaCount = alpha;
    // Jika belum ada data absen, anggap 100% (Husnuzan)
    student.attendanceRate =
      totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;
  });

  // 3. Render Statistik Cards
  document.getElementById("total-students").innerText = myStudents.length;
  document.getElementById("total-violations").innerText = myStudents.reduce(
    (sum, s) => sum + s.points,
    0
  );
  const avg =
    myStudents.length > 0
      ? Math.round(
          myStudents.reduce((sum, s) => sum + s.attendanceRate, 0) /
            myStudents.length
        )
      : 0;
  document.getElementById("avg-attendance").innerText = `${avg}%`;

  // 4. Render Tabel-tabel
  renderTopAlpha(myStudents);
  renderTopPoints(myStudents);
  renderFullList(myStudents); // TABEL BARU LENGKAP
}

function renderTopAlpha(students) {
  const tbody = document.getElementById("top-alpha-body");
  const sorted = [...students]
    .sort((a, b) => b.alphaCount - a.alphaCount)
    .slice(0, 5);
  tbody.innerHTML = "";

  if (sorted.length === 0 || sorted[0].alphaCount === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center;">Nihil</td></tr>';
    return;
  }

  sorted.forEach((s) => {
    if (s.alphaCount === 0) return;
    tbody.innerHTML += `<tr><td>${s.name}</td><td style="text-align:center">${s.alphaCount}</td><td><span class="badge warning">Pantau</span></td></tr>`;
  });
}

function renderTopPoints(students) {
  const tbody = document.getElementById("top-points-body");
  const sorted = [...students].sort((a, b) => b.points - a.points).slice(0, 5);
  tbody.innerHTML = "";

  if (sorted.length === 0 || sorted[0].points === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align:center;">Nihil</td></tr>';
    return;
  }

  sorted.forEach((s) => {
    if (s.points === 0) return;
    tbody.innerHTML += `<tr><td>${s.name}</td><td style="text-align:center; color:red; font-weight:bold;">${s.points}</td><td><span class="badge inactive">Binaan</span></td></tr>`;
  });
}

// --- FUNGSI RENDER TABEL LENGKAP UNTUK PRINT ---
function renderFullList(students) {
  const tbody = document.getElementById("full-student-list");
  tbody.innerHTML = "";

  // Urutkan Abjad
  const sorted = [...students].sort((a, b) => a.name.localeCompare(b.name));

  sorted.forEach((s, index) => {
    // Tentukan Predikat Sikap Otomatis
    let catatan = "Sangat Baik, pertahankan.";
    if (s.points > 10 || s.attendanceRate < 90)
      catatan = "Perlu ditingkatkan kedisiplinannya.";
    if (s.points > 30 || s.attendanceRate < 75)
      catatan = "Perlu pembinaan khusus dan panggilan orang tua.";

    const row = `
            <tr>
                <td style="text-align:center;">${index + 1}</td>
                <td>${s.nis}</td>
                <td style="font-weight:600;">${s.name}</td>
                <td style="text-align:center;">${s.gender}</td>
                <td style="text-align:center;">${s.attendanceRate}%</td>
                <td style="text-align:center;">${s.points}</td>
                <td style="font-size: 13px;">${catatan}</td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}
