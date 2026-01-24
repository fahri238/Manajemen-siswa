const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000; 

app.use(cors()); 
app.use(bodyParser.json());


// 1. Test Route
app.get("/", (req, res) => {
  res.send("Server Siswa Manager Berjalan! 🚀");
});

// siswa
const studentRoutes = require("./routes/students");
app.use("/api/students", studentRoutes);

// auth login
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const dashboardRoutes = require("./routes/dashboard"); 
app.use("/api/dashboard", dashboardRoutes); 

const classRoutes = require("./routes/classes"); 
app.use("/api/classes", classRoutes);

const teacherRoutes = require("./routes/teachers"); 
app.use("/api/teachers", teacherRoutes);

// mata pelajaran
const subjectRoutes = require("./routes/subjects");
app.use("/api/subjects", subjectRoutes);

// jadwal mata pelajaran
const scheduleRoutes = require("./routes/schedules"); 
app.use("/api/schedules", scheduleRoutes); 

// point siswa
const pointsRoutes = require("./routes/points"); 
app.use("/api/points", pointsRoutes); 

// laporan siswa
const reportRoutes = require("./routes/reports"); 
app.use("/api/reports", reportRoutes); 

// attendance
app.use("/api/attendance", require("./routes/attendance"));

// announcement
const announcementRoutes = require('./routes/announcements');
app.use('/api/announcements', announcementRoutes);


app.listen(PORT, () => {
  console.log(`Server backend running at http://localhost:${PORT}`);
});
