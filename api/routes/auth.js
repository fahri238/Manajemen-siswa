const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- API LOGIN (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
    // 1. Tangkap input dari Frontend
    const { username, password } = req.body;

    // Validasi input kosong
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username dan password wajib diisi!'
        });
    }

    try {
        // 2. Cari User di Database berdasarkan Username
        // Kita gunakan '?' untuk mencegah SQL Injection
        const sql = 'SELECT * FROM users WHERE username = ? LIMIT 1';
        const [rows] = await db.query(sql, [username]);

        // 3. Cek apakah user ditemukan?
        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username tidak ditemukan.'
            });
        }

        const user = rows[0];

        // 4. Cek Password
        // CATATAN: Untuk saat ini kita pakai perbandingan langsung (Plain Text)
        // sesuai data dummy "123" yang Anda masukkan di SQL.
        // Di aplikasi nyata, Anda wajib menggunakan library 'bcrypt' untuk hashing.
        if (password !== user.password) {
            return res.status(401).json({
                success: false,
                message: 'Password salah.'
            });
        }

        // 5. Jika Sukses: Update Waktu Login Terakhir
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // 6. Kirim Response Sukses ke Frontend
        res.json({
            success: true,
            message: 'Login berhasil!',
            data: {
                id: user.id,
                username: user.username,
                name: user.nama_lengkap, // Sesuai kolom database
                role: user.role,         // admin/guru
                foto: user.foto || 'default.png'
            }
        });

    } catch (error) {
        console.error("Login Error:", error); // Tampilkan di terminal backend jika error
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server database.',
            error: error.message
        });
    }
});

// --- API LOGOUT (POST /api/auth/logout) ---
// Opsional: Karena kita pakai token/session di frontend (localStorage),
// backend tidak terlalu butuh logika logout, tapi kita sediakan saja.
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout berhasil'
    });
});

module.exports = router;