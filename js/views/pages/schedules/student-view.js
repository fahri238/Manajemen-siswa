// js/views/pages/schedules/student-view.js

// --- MOCK DATA ---
// 1. Data Siswa Login (Kita asumsikan dia kelas ID 1)
const studentInfo = {
    class_id: 1, // X RPL 1
    class_name: "X RPL 1"
};

// 2. Data Mapel
const subjectsData = [
    { id: 1, name: "Matematika (Wajib)", teacher: "Bpk. Agus" },
    { id: 2, name: "Bahasa Indonesia", teacher: "Ibu Siti" },
    { id: 3, name: "Pemrograman Web", teacher: "Bpk. Budi" },
    { id: 4, name: "Basis Data", teacher: "Bpk. Budi" },
    { id: 5, name: "PJOK", teacher: "Pak Roni" },
    { id: 99, name: "Istirahat", teacher: "-" }
];

// 3. Data Jadwal (Semua Kelas)
const schedulesData = [
    // Senin
    { class_id: 1, day: "Senin", start: "07:00", end: "07:30", subject_id: 0, custom: "Upacara Bendera" },
    { class_id: 1, day: "Senin", start: "07:30", end: "09:30", subject_id: 1 },
    { class_id: 1, day: "Senin", start: "09:30", end: "10:00", subject_id: 99 },
    { class_id: 1, day: "Senin", start: "10:00", end: "12:00", subject_id: 3 },
    
    // Selasa
    { class_id: 1, day: "Selasa", start: "07:30", end: "09:30", subject_id: 4 },
    { class_id: 1, day: "Selasa", start: "09:30", end: "10:00", subject_id: 99 },
    { class_id: 1, day: "Selasa", start: "10:00", end: "11:30", subject_id: 2 },
    
    // Rabu
    { class_id: 1, day: "Rabu", start: "07:30", end: "09:30", subject_id: 5 },
    { class_id: 2, day: "Rabu", start: "07:30", end: "09:30", subject_id: 1 } // Jadwal kelas lain (tidak boleh muncul)
];

document.addEventListener("DOMContentLoaded", () => {
    renderSchedule();
});

function renderSchedule() {
    const container = document.getElementById("schedule-container");
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

    container.innerHTML = "";

    days.forEach(day => {
        // 1. Filter Jadwal Kelas Siswa & Per Hari
        const dailySchedules = schedulesData.filter(s => 
            s.class_id === studentInfo.class_id && s.day === day
        );

        // Sort jam
        dailySchedules.sort((a, b) => a.start.localeCompare(b.start));

        // 2. Build HTML
        let listHTML = "";

        if (dailySchedules.length > 0) {
            dailySchedules.forEach(sch => {
                let subjectName = sch.custom || "Unknown";
                let teacherName = "";

                if (sch.subject_id > 0) {
                    const sub = subjectsData.find(s => s.id === sch.subject_id);
                    if (sub) {
                        subjectName = sub.name;
                        teacherName = sub.teacher;
                    }
                }

                // Styling beda buat istirahat
                const isBreak = sch.subject_id === 99;
                const bgStyle = isBreak ? 'background-color: #f8fafc;' : '';

                listHTML += `
                    <li class="schedule-item" style="${bgStyle}">
                        <div class="time-badge">
                            ${sch.start}<br>s.d<br>${sch.end}
                        </div>
                        <div class="subject-info">
                            <h4 style="${isBreak ? 'color:#64748B; font-style:italic;' : ''}">
                                ${subjectName}
                            </h4>
                            ${teacherName !== "-" && teacherName !== "" ? 
                                `<p><i class="fa-solid fa-chalkboard-user"></i> ${teacherName}</p>` : ''}
                        </div>
                    </li>
                `;
            });
        } else {
            listHTML = `<li class="schedule-item" style="color:#94a3b8; font-style:italic; justify-content:center;">Tidak ada jadwal.</li>`;
        }

        // 3. Render Card
        const card = `
            <div class="day-card">
                <div class="day-header">
                    <span>${day}</span>
                    <i class="fa-regular fa-calendar"></i>
                </div>
                <ul class="schedule-list">
                    ${listHTML}
                </ul>
            </div>
        `;

        container.innerHTML += card;
    });
}