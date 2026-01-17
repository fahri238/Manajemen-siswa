// js/views/pages/student-dashboard.js

// --- MOCK DATA ---
const studentInfo = {
    name: "Ahmad Rizky",
    class: "X RPL 1",
    points: 5 // Poin pelanggaran
};

const todaySchedule = [
    { time: "07:30 - 09:30", subject: "Matematika (Wajib)", room: "R. 101", teacher: "Bpk. Agus" },
    { time: "09:30 - 10:00", subject: "Istirahat", room: "-", teacher: "-", type: "break" },
    { time: "10:00 - 11:30", subject: "Bahasa Indonesia", room: "R. 101", teacher: "Ibu Siti" },
    { time: "12:30 - 14:00", subject: "Pemrograman Dasar", room: "Lab Komputer 1", teacher: "Bpk. Budi" }
];

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});

function initDashboard() {
    // 1. Set Tanggal Hari Ini
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("current-date").innerText = new Date().toLocaleDateString('id-ID', options);

    // 2. Set Poin & Warna
    const pointEl = document.getElementById("my-points");
    pointEl.innerText = studentInfo.points;
    
    // Logika Warna Poin
    if (studentInfo.points > 50) {
        pointEl.style.color = "#EF4444"; // Merah (Bahaya)
    } else if (studentInfo.points > 20) {
        pointEl.style.color = "#F59E0B"; // Kuning (Hati-hati)
    } else {
        pointEl.style.color = "#10B981"; // Hijau (Aman)
    }

    // 3. Render Jadwal Hari Ini
    const timelineContainer = document.getElementById("today-schedule");
    timelineContainer.innerHTML = "";

    todaySchedule.forEach(item => {
        // Style beda untuk istirahat
        const isBreak = item.type === 'break';
        const color = isBreak ? '#94a3b8' : '#0F172A';
        const icon = isBreak ? '☕' : '📚';

        const html = `
            <div class="timeline-item">
                <div class="timeline-time">${item.time}</div>
                <div class="timeline-title" style="color:${color}">
                    ${icon} ${item.subject}
                </div>
                ${!isBreak ? `<div class="timeline-desc">Guru: ${item.teacher} | Ruang: ${item.room}</div>` : ''}
            </div>
        `;
        timelineContainer.innerHTML += html;
    });
}