const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET: Ambil Semua Siswa (Hitung Total Poin dari tabel 'points')
router.get("/", async (req, res) => {
  try {
    // KITA GUNAKAN "CASE WHEN" UNTUK MEMISAHKAN SUM BERDASARKAN TYPE
    const sql = `
            SELECT 
                s.id, 
                s.nis, 
                s.nisn, 
                s.nama_lengkap, 
                s.jenis_kelamin AS gender, 
                s.status, 
                s.kelas_id,
                k.nama_kelas,
                -- Hitung Total Prestasi (type = 'achievement')
                COALESCE(SUM(CASE WHEN p.type = 'achievement' THEN p.point_amount ELSE 0 END), 0) as total_prestasi,
                -- Hitung Total Pelanggaran (type = 'violation')
                COALESCE(SUM(CASE WHEN p.type = 'violation' THEN p.point_amount ELSE 0 END), 0) as total_pelanggaran
            FROM siswa s 
            LEFT JOIN kelas k ON s.kelas_id = k.id 
            LEFT JOIN points p ON s.id = p.student_id
            GROUP BY s.id, s.nis, s.nama_lengkap, k.nama_kelas
            ORDER BY s.nama_lengkap ASC
        `;

    const [rows] = await db.query(sql);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error Get Siswa:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SINGLE: Ambil 1 Siswa
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Query detail siswa juga perlu join untuk lihat total poin (opsional)
    const sql = `
        SELECT 
            s.id, s.nis, s.nisn, s.nama_lengkap, 
            s.jenis_kelamin AS gender, 
            s.kelas_id, s.status,
            COALESCE(SUM(p.point_amount), 0) as poin
        FROM siswa s
        LEFT JOIN points p ON s.id = p.student_id
        WHERE s.id = ?
        GROUP BY s.id
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Siswa tidak ditemukan" });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. POST: Tambah Siswa Baru
router.post("/", async (req, res) => {
  try {
    const { nis, nisn, nama_lengkap, gender, kelas_id, status } = req.body;

    if (!nis || !nama_lengkap || !kelas_id) {
      return res.status(400).json({
        success: false,
        message: "NIS, Nama, dan Kelas wajib diisi!",
      });
    }

    // --- LOGIC PENTING: Handle NISN Kosong ---
    // Jika nisn kosong string (""), ubah jadi NULL agar tidak error duplicate di database
    const finalNisn = nisn && nisn.trim() !== "" ? nisn : null;

    const sql = `
            INSERT INTO siswa (nis, nisn, nama_lengkap, jenis_kelamin, kelas_id, status, poin) 
            VALUES (?, ?, ?, ?, ?, ?, 0)
        `;

    await db.execute(sql, [
      nis,
      finalNisn, // Pakai variable yang sudah dicheck null
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
    ]);

    res.json({
      success: true,
      message: "Siswa berhasil ditambahkan!",
    });
  } catch (error) {
    // Cek Error Duplicate
    if (error.code === "ER_DUP_ENTRY") {
      // Cek apakah yang duplikat NIS atau NISN
      const msg = error.sqlMessage.includes("nisn")
        ? "NISN sudah digunakan siswa lain!"
        : "NIS sudah terdaftar!";

      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT: Update Data Siswa
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nisn, nama_lengkap, gender, kelas_id, status } = req.body;

    // --- Handle NISN Kosong ---
    const finalNisn = nisn && nisn.trim() !== "" ? nisn : null;

    const sql = `
            UPDATE siswa 
            SET nis = ?, nisn = ?, nama_lengkap = ?, jenis_kelamin = ?, kelas_id = ?, status = ?
            WHERE id = ?
        `;

    await db.query(sql, [
      nis,
      finalNisn, // Pakai NULL jika kosong
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
      id,
    ]);

    res.json({
      success: true,
      message: "Data siswa berhasil diperbarui!",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const msg = error.sqlMessage.includes("nisn")
        ? "NISN sudah digunakan siswa lain!"
        : "NIS sudah terdaftar!";
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. PUT: Update Data Siswa
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nisn, nama_lengkap, gender, kelas_id, status } = req.body;

    const sql = `
            UPDATE siswa 
            SET nis = ?, nisn = ?, nama_lengkap = ?, jenis_kelamin = ?, kelas_id = ?, status = ?
            WHERE id = ?
        `;

    await db.query(sql, [
      nis,
      nisn,
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
      id,
    ]);

    res.json({
      success: true,
      message: "Data siswa berhasil diperbarui!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. DELETE: Hapus Siswa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM siswa WHERE id = ?", [id]);
    res.json({ success: true, message: "Data siswa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
