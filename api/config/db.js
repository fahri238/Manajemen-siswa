// api/config/db.js
const mysql = require('mysql2');

// Buat koneksi pool (lebih efisien)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // User default XAMPP
    password: '',      // Password default XAMPP (kosong)
    database: 'db_siswa_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Ubah jadi promise biar bisa pakai async/await
const db = pool.promise();

module.exports = db;