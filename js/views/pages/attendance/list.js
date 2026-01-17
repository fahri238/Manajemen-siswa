const API_BASE = "http://localhost:5000/api/attendance";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Set Default Tanggal Hari Ini
    document.getElementById("filter-date").valueAsDate = new Date();

    // 2. Cek Sesi Guru
    const session = JSON.parse(localStorage.getItem('user_session'));
    if (!session || session.role !== 'guru') {
        alert("Akses Guru diperlukan!");
        window.location.href = "../index.html";
        return;
    }

    // 3. Load Kelas Ajar Guru
    loadTeacherClasses(session.id);
});

// LOAD DROPDOWN KELAS
async function loadTeacherClasses(teacherId) {
    const select = document.getElementById("filter-class");
    try {
        const res = await fetch(`${API_BASE}/classes/${teacherId}`);
        const result = await res.json();

        if (result.success) {
            result.data.forEach(c => {
                select.innerHTML += `<option value="${c.id}">${c.nama_kelas}</option>`;
            });
        }
    } catch (error) { console.error(error); }
}

// LOAD DAFTAR SISWA (UTAMA)
window.loadStudentList = async () => {
    const classId = document.getElementById("filter-class").value;
    const date = document.getElementById("filter-date").value;
    const tbody = document.getElementById("attendance-list-body");
    const btnSave = document.getElementById("btn-save");

    if (!classId || !date) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Pilih Kelas & Tanggal dulu.</td></tr>`;
        btnSave.style.display = "none";
        return;
    }

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data siswa...</td></tr>`;

    try {
        const res = await fetch(`${API_BASE}/list?class_id=${classId}&date=${date}`);
        const result = await res.json();
        
        tbody.innerHTML = "";

        if (result.data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Tidak ada siswa di kelas ini.</td></tr>`;
            btnSave.style.display = "none";
            return;
        }

        // Tampilkan Tombol Simpan
        btnSave.style.display = "inline-flex";

        result.data.forEach((s, index) => {
            // Status Default = 'H' (Hadir), kecuali sudah ada data di database
            const status = s.status || 'H'; 
            const note = s.note || '';

            // Helper function buat generate radio button checked
            const check = (val) => status === val ? 'checked' : '';

            const row = `
                <tr class="student-row" data-id="${s.student_id}">
                    <td>${index + 1}</td>
                    <td>${s.nis}</td>
                    <td style="font-weight:600;">${s.nama_lengkap}</td>
                    
                    <td>
                        <div class="attendance-options">
                            <label class="attendance-label">
                                <input type="radio" name="status_${s.student_id}" value="H" ${check('H')}> H
                            </label>
                            <label class="attendance-label">
                                <input type="radio" name="status_${s.student_id}" value="I" ${check('I')}> I
                            </label>
                            <label class="attendance-label">
                                <input type="radio" name="status_${s.student_id}" value="S" ${check('S')}> S
                            </label>
                            <label class="attendance-label">
                                <input type="radio" name="status_${s.student_id}" value="A" ${check('A')}> A
                            </label>
                        </div>
                    </td>
                    
                    <td>
                        <input type="text" class="form-control note-input" value="${note}" placeholder="Ket. (Opsional)">
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal memuat data.</td></tr>`;
    }
};

// SIMPAN ABSENSI
window.saveAttendance = async () => {
    const session = JSON.parse(localStorage.getItem('user_session'));
    const classId = document.getElementById("filter-class").value;
    const date = document.getElementById("filter-date").value;
    
    // Kumpulkan Data dari Tabel
    const studentsData = [];
    const rows = document.querySelectorAll(".student-row");

    rows.forEach(row => {
        const studentId = row.getAttribute("data-id");
        // Cari radio button yang diceklis pada baris ini
        const status = row.querySelector(`input[name="status_${studentId}"]:checked`).value;
        const note = row.querySelector(".note-input").value;

        studentsData.push({
            student_id: studentId,
            status: status,
            note: note
        });
    });

    // Kirim ke Backend
    const btnSave = document.getElementById("btn-save");
    btnSave.innerText = "Menyimpan...";
    btnSave.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacher_id: session.id,
                class_id: classId,
                date: date,
                students: studentsData
            })
        });

        const result = await res.json();

        if (result.success) {
            if(typeof Notifications !== 'undefined') Notifications.success("Absensi berhasil disimpan!");
            else alert("Tersimpan!");
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Gagal menyimpan data.");
    } finally {
        btnSave.innerHTML = `<i class="fa-solid fa-check"></i> Simpan Absensi`;
        btnSave.disabled = false;
    }
};