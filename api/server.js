// api/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000; // Backend akan jalan di port 3000

// Middleware
app.use(cors()); // Biar frontend bisa akses
app.use(bodyParser.json()); // Biar bisa baca JSON

// --- ROUTES (Jalur URL) ---

// 1. Test Route
app.get("/", (req, res) => {
  res.send("Server Siswa Manager Berjalan! 🚀");
});

// 2. Import Route Siswa (Nanti kita buat filenya)
const studentRoutes = require("./routes/students");
app.use("/api/students", studentRoutes);

// 3. Import Route Auth/Login (Nanti kita buat)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboard"); // <--- TAMBAH
app.use("/api/dashboard", dashboardRoutes); // <--- TAMBAH

const classRoutes = require("./routes/classes"); // <--- Tambah ini
app.use("/api/classes", classRoutes);

const teacherRoutes = require("./routes/teachers"); // <--- TAMBAH INI
app.use("/api/teachers", teacherRoutes);

// mata pelajaran
const subjectRoutes = require("./routes/subjects");
app.use("/api/subjects", subjectRoutes);

// jadwal mata pelajaran
const scheduleRoutes = require("./routes/schedules"); // <--- TAMBAH
app.use("/api/schedules", scheduleRoutes); // <--- TAMBAH

// point siswa
const pointsRoutes = require("./routes/points"); // <--- TAMBAH
app.use("/api/points", pointsRoutes); // <--- TAMBAH

// laporan siswa
const reportRoutes = require("./routes/reports"); // <--- TAMBAH
app.use("/api/reports", reportRoutes); // <--- TAMBAH

// attendance
app.use("/api/attendance", require("./routes/attendance"));

const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Server backend running at http://localhost:${PORT}`);
});
