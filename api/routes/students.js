const express = require("express");
const router = express.Router();
const db = require("../config/db");

// =======================================================================
// 1. GET: Ambil Semua Siswa (ADMIN VIEW)
// =======================================================================
router.get("/", async (req, res) => {
  try {
    const sql = `
            SELECT 
                s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin AS gender, s.status, s.kelas_id,
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
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 2. GET: Ambil Siswa Binaan Wali Kelas (TEACHER VIEW)
// =======================================================================
router.get("/teacher/:teacherId", async (req, res) => {
  try {
    const { teacherId } = req.params;

    const sql = `
      SELECT 
        s.id, s.nis, s.nisn, s.nama_lengkap, s.jenis_kelamin AS gender, s.status,
        k.nama_kelas,
        COALESCE(SUM(CASE WHEN p.type = 'achievement' THEN p.point_amount ELSE 0 END), 0) as total_prestasi,
        COALESCE(SUM(CASE WHEN p.type = 'violation' THEN p.point_amount ELSE 0 END), 0) as total_pelanggaran
      FROM siswa s
      JOIN kelas k ON s.kelas_id = k.id
      LEFT JOIN points p ON s.id = p.student_id
      WHERE k.wali_kelas_id = ?
      GROUP BY s.id, k.nama_kelas
      ORDER BY k.nama_kelas ASC, s.nama_lengkap ASC
    `;

    const [rows] = await db.query(sql, [teacherId]);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error Teacher Students:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 3. GET SINGLE: Ambil Detail 1 Siswa
// =======================================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID Siswa tidak valid" });
    }

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

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 4. POST: Tambah Siswa Baru (FIXED)
// =======================================================================
router.post("/", async (req, res) => {
  try {
    const { nis, nisn, nama_lengkap, gender, kelas_id, status, password } =
      req.body;

    // 1. Validasi Input Dasar
    if (!nis || !nama_lengkap || !kelas_id || !password) {
      return res.status(400).json({
        success: false,
        message: "NIS, Nama, Kelas, dan Password wajib diisi!",
      });
    }

    // 2. Simpan ke tabel USERS (Untuk Login)
    // NIS digunakan sebagai username
    const sqlUser = `
      INSERT INTO users (username, password, nama_lengkap, role, status) 
      VALUES (?, ?, ?, 'siswa', ?)
    `;
    await db.execute(sqlUser, [nis, password, nama_lengkap, status || "aktif"]);

    // 3. Simpan ke tabel SISWA (Untuk Profil & Data Akademik)
    const finalNisn = nisn && nisn.trim() !== "" ? nisn : null;
    const sqlSiswa = `
      INSERT INTO siswa (nis, nisn, nama_lengkap, jenis_kelamin, kelas_id, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(sqlSiswa, [
      nis,
      finalNisn,
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
    ]);

    res.json({
      success: true,
      message: "Siswa dan Akun Login berhasil dibuat!",
    });
  } catch (error) {
    console.error("Error Post Student:", error);
    // Cek jika NIS sudah ada di salah satu tabel
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "NIS sudah digunakan oleh akun lain!",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 5. PUT: Update Data Siswa & Sinkronisasi Akun Login (AUTO-CREATE)
// =======================================================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nis, nisn, nama_lengkap, gender, kelas_id, status, password } =
      req.body;

    // 1. Ambil NIS lama dari tabel siswa untuk pelacakan
    const [oldData] = await db.query("SELECT nis FROM siswa WHERE id = ?", [
      id,
    ]);
    if (oldData.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Siswa tidak ditemukan" });
    const oldNis = oldData[0].nis;

    // 2. Update Tabel SISWA (Profil tetap diperbarui)
    const sqlSiswa = `UPDATE siswa SET nis=?, nisn=?, nama_lengkap=?, jenis_kelamin=?, kelas_id=?, status=? WHERE id=?`;
    await db.query(sqlSiswa, [
      nis,
      nisn || null,
      nama_lengkap,
      gender,
      kelas_id,
      status || "aktif",
      id,
    ]);

    // 3. LOGIKA SINKRONISASI AKUN LOGIN (Penting!)
    // Cek apakah akun sudah ada di tabel users?
    const [checkUser] = await db.query(
      "SELECT id FROM users WHERE username = ? AND role = 'siswa'",
      [oldNis],
    );

    if (checkUser.length > 0) {
      // KASUS A: Akun SUDAH ADA, maka UPDATE
      let sqlUser, params;
      if (password && password.trim() !== "") {
        sqlUser =
          "UPDATE users SET username=?, password=?, nama_lengkap=?, status=? WHERE username=? AND role='siswa'";
        params = [nis, password, nama_lengkap, status || "aktif", oldNis];
      } else {
        sqlUser =
          "UPDATE users SET username=?, nama_lengkap=?, status=? WHERE username=? AND role='siswa'";
        params = [nis, nama_lengkap, status || "aktif", oldNis];
      }
      await db.query(sqlUser, params);
    } else {
      // KASUS B: Akun BELUM ADA (Siswa Lama), maka BUAT BARU di tabel users
      // Gunakan password dari input, jika kosong gunakan NIS sebagai password default
      const finalPassword = password && password.trim() !== "" ? password : nis;

      const sqlInsertUser = `
        INSERT INTO users (username, password, nama_lengkap, role, status) 
        VALUES (?, ?, ?, 'siswa', 'aktif')
      `;
      await db.execute(sqlInsertUser, [nis, finalPassword, nama_lengkap]);
      console.log(
        `Akun login baru otomatis dibuat untuk siswa: ${nama_lengkap}`,
      );
    }

    res.json({
      success: true,
      message: "Data profil dan akun login berhasil disinkronkan!",
    });
  } catch (error) {
    console.error("Error PUT Student:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// =======================================================================
// 6. DELETE: Hapus Siswa
// =======================================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil NIS dulu untuk menghapus di tabel users [cite: 2026-01-21]
    const [siswa] = await db.query("SELECT nis FROM siswa WHERE id = ?", [id]);

    if (siswa.length > 0) {
      const nisSiswa = siswa[0].nis;
      // Hapus akun login [cite: 2026-01-21]
      await db.query(
        "DELETE FROM users WHERE username = ? AND role = 'siswa'",
        [nisSiswa],
      );
      // Hapus data siswa [cite: 2026-01-21]
      await db.query("DELETE FROM siswa WHERE id = ?", [id]);
    }

    res.json({
      success: true,
      message: "Data siswa dan akun login berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
