const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================================================================
// 1. ROUTE LAMA (Untuk Admin/General Report)
// =======================================================================
router.get("/", async (req, res) => {
  try {
    const { type, month } = req.query; // Mengambil filter dari Frontend

    // Validasi input minimal
    if (!type) {
      return res
        .status(400)
        .json({ success: false, message: "Tipe laporan harus dipilih!" });
    }

    let sql = `
            SELECT 
                s.nama_lengkap, 
                s.nis,
                k.nama_kelas,
                COUNT(p.id) as total_kasus,
                SUM(p.point_amount) as total_poin
            FROM points p
            JOIN siswa s ON p.student_id = s.id
            JOIN kelas k ON s.kelas_id = k.id
            WHERE p.type = ?
        `;

    const params = [type];

    // Jika ada filter bulan (Format: YYYY-MM)
    if (month) {
      sql += ` AND DATE_FORMAT(p.incident_date, '%Y-%m') = ?`;
      params.push(month);
    }

    // Grouping & Sorting
    sql += ` GROUP BY s.id, s.nama_lengkap, s.nis, k.nama_kelas ORDER BY total_poin DESC, total_kasus DESC`;

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 2. ROUTE BARU (Untuk Laporan Wali Kelas - FIX QUERY KELAS)
// =======================================================================
router.get("/teacher-summary/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { classId } = req.query; // Support filter kelas spesifik

    // A. AMBIL KELAS BERDASARKAN "WALI KELAS" (Bukan Jadwal Mengajar)
    // ------------------------------------------------------------------
    // PENTING: Cek nama kolom di tabel 'kelas' database Anda.
    // Jika kolom untuk ID Guru adalah 'guru_id', ubah 'wali_kelas_id' menjadi 'guru_id'.
    // Jika kolomnya 'wali_kelas', ubah menjadi 'wali_kelas'.
    // ------------------------------------------------------------------

    const [allClasses] = await db.query(
      `
        SELECT k.id, k.nama_kelas, COUNT(s.id) as jumlah_siswa 
        FROM kelas k
        LEFT JOIN siswa s ON k.id = s.kelas_id
        WHERE k.wali_kelas_id = ? 
        GROUP BY k.id
        ORDER BY k.nama_kelas ASC
      `,
      [teacherId],
    );

    // Jika query di atas error (Unknown Column), kemungkinan nama kolomnya beda.
    // Silakan ganti 'WHERE k.wali_kelas_id = ?' sesuai struktur DB Anda.

    if (allClasses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Anda tidak terdaftar sebagai Wali Kelas di kelas manapun.",
      });
    }

    // B. TENTUKAN KELAS MANA YANG AKAN DITAMPILKAN
    // Jika user mengirim ?classId=5, gunakan itu. Jika tidak, ambil kelas pertama.
    let selectedClassId = classId ? parseInt(classId) : allClasses[0].id;

    // Validasi: Pastikan ID kelas yang diminta benar-benar milik guru ini (Wali Kelasnya)
    let activeClass = allClasses.find((c) => c.id === selectedClassId);

    // Jika ID tidak valid (misal mencoba buka kelas orang lain), fallback ke kelas sendiri
    if (!activeClass) {
      activeClass = allClasses[0];
      selectedClassId = activeClass.id;
    }

    // C. AMBIL DATA SISWA (Berdasarkan Kelas Terpilih)
    const [students] = await db.query(
      `
            SELECT id, nis, nama_lengkap, jenis_kelamin as gender 
            FROM siswa WHERE kelas_id = ? ORDER BY nama_lengkap ASC
        `,
      [selectedClassId],
    );

    // D. AMBIL DATA ABSENSI
    const [attendanceStats] = await db.query(
      `
            SELECT siswa_id, 
                COUNT(CASE WHEN status = 'alfa' THEN 1 END) as total_alfa,
                COUNT(CASE WHEN status = 'sakit' THEN 1 END) as total_sakit,
                COUNT(CASE WHEN status = 'izin' THEN 1 END) as total_izin,
                COUNT(*) as total_hari
            FROM absensi 
            WHERE siswa_id IN (SELECT id FROM siswa WHERE kelas_id = ?)
            GROUP BY siswa_id
        `,
      [selectedClassId],
    );

    // E. AMBIL DATA POIN (MURNI: Prestasi & Pelanggaran Terpisah)
    const [pointStats] = await db.query(
      `
            SELECT student_id,
                SUM(CASE WHEN type = 'achievement' THEN point_amount ELSE 0 END) as total_prestasi,
                SUM(CASE WHEN type = 'violation' THEN point_amount ELSE 0 END) as total_pelanggaran
            FROM points
            WHERE student_id IN (SELECT id FROM siswa WHERE kelas_id = ?)
            GROUP BY student_id
        `,
      [selectedClassId],
    );

    // F. MERGE DATA & HITUNG STATISTIK
    let totalSiswa = students.length;
    let totalPelanggaranKelas = 0;
    let totalKehadiranPersen = 0;

    const reportData = students.map((s) => {
      // 1. Cari data absen (Default 0)
      const absen = attendanceStats.find((a) => a.siswa_id === s.id) || {
        total_alfa: 0,
        total_hari: 0,
      };

      // 2. Cari data poin (Default 0)
      const poin = pointStats.find((p) => p.student_id === s.id) || {
        total_prestasi: 0,
        total_pelanggaran: 0,
      };

      const poinPrestasi = Number(poin.total_prestasi);
      const poinPelanggaran = Number(poin.total_pelanggaran);

      // 3. Hitung Persentase Kehadiran
      let attendancePct = 100;
      if (absen.total_hari > 0) {
        attendancePct =
          ((absen.total_hari - absen.total_alfa) / absen.total_hari) * 100;
      }

      // Update Statistik Global
      totalPelanggaranKelas += poinPelanggaran;
      totalKehadiranPersen += attendancePct;

      return {
        ...s,
        alfa: absen.total_alfa,
        attendance_pct: attendancePct.toFixed(1),
        // KIRIM DATA TERPISAH (Bukan Net Poin lagi)
        total_prestasi: poinPrestasi,
        total_pelanggaran: poinPelanggaran,
      };
    });

    // Hitung Rata-rata Kehadiran Kelas
    const avgAttendance =
      totalSiswa > 0 ? (totalKehadiranPersen / totalSiswa).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        active_class: activeClass, // Info kelas yang sedang tampil
        available_classes: allClasses, // List semua kelas milik wali kelas (untuk dropdown)
        stats: {
          total_siswa: totalSiswa,
          total_pelanggaran: totalPelanggaranKelas,
          avg_attendance: avgAttendance,
        },
        students: reportData,
      },
    });
  } catch (error) {
    console.error("Error Report:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
