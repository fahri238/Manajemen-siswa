// js/views/pages/points/student-view.js

// --- MOCK DATA ---
const historyData = [
    { date: "2025-01-10", type: "Pelanggaran", name: "Terlambat Masuk Sekolah", point: 5 },
    { date: "2025-01-15", type: "Pelanggaran", name: "Tidak Memakai Atribut Lengkap", point: 5 },
    { date: "2025-02-01", type: "Prestasi", name: "Juara 2 Lomba Web Design", point: 50 }, // Prestasi biasanya mengurangi poin pelanggaran atau dicatat terpisah
    { date: "2025-02-05", type: "Pelanggaran", name: "Alpha (Tanpa Keterangan)", point: 10 }
];

document.addEventListener("DOMContentLoaded", () => {
    renderHistory();
});

function renderHistory() {
    const tbody = document.getElementById("points-history-body");
    const totalVioEl = document.getElementById("total-violation");
    const totalAchEl = document.getElementById("total-achievement");
    
    tbody.innerHTML = "";

    let sumViolation = 0;
    let sumAchievement = 0; // Sebenarnya jumlah prestasi, bukan poinnya

    // Urutkan dari tanggal terbaru
    historyData.sort((a, b) => new Date(b.date) - new Date(a.date));

    historyData.forEach(item => {
        const isViolation = item.type === "Pelanggaran";
        
        // Hitung Total
        if (isViolation) sumViolation += item.point;
        else sumAchievement += 1; // Hitung jumlah prestasinya

        // Badge Style
        const badgeClass = isViolation ? "badge warning" : "badge active";
        const pointColor = isViolation ? "color: #EF4444;" : "color: #10B981;";
        const pointPrefix = isViolation ? "+" : "★"; // + poin dosa, ★ poin bintang

        // Format Tanggal
        const dateStr = new Date(item.date).toLocaleDateString("id-ID", {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        const row = `
            <tr>
                <td>${dateStr}</td>
                <td><span class="${badgeClass}">${item.type}</span></td>
                <td style="font-weight: 500;">${item.name}</td>
                <td style="text-align: right; font-weight: bold; ${pointColor}">
                    ${pointPrefix} ${item.point}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Update Angka di Card Atas
    totalVioEl.innerText = sumViolation;
    totalAchEl.innerText = sumAchievement;

    // Logic Warna Angka
    if(sumViolation > 50) totalVioEl.style.color = "#DC2626"; // Merah Gelap
}