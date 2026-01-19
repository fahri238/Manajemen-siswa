import { SessionManager } from "../../../auth/session.js";

// Endpoint API
const API_CLASSES = "http://localhost:5000/api/attendance/classes";
const API_ATTENDANCE_LIST = "http://localhost:5000/api/attendance/list";
const API_SAVE = "http://localhost:5000/api/attendance/save";

document.addEventListener("DOMContentLoaded", () => {
  const user = SessionManager.getUser();
  if (!user || user.role !== "guru") {
    window.location.href = "../../index.html";
    return;
  }

  // Set Default Tanggal Hari Ini (Safety Check)
  const dateInput = document.getElementById("attendance-date");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  // Load Dropdown Kelas Perwalian
  loadClasses(user.id);

  // Event Listener Ganti Kelas / Tanggal
  const classSelector = document.getElementById("class-selector");
  if (classSelector) {
    classSelector.addEventListener("change", loadAttendanceData);
  }

  if (dateInput) {
    dateInput.addEventListener("change", loadAttendanceData);
  }

  // Event Simpan
  const btnSave = document.getElementById("btn-save-attendance");
  if (btnSave) {
    btnSave.addEventListener("click", saveAttendance);
  }
});

async function loadClasses(teacherId) {
  const selector = document.getElementById("class-selector");
  if (!selector) return;

  selector.innerHTML = `<option value="">Memuat...</option>`;

  try {
    const response = await fetch(`${API_CLASSES}/${teacherId}`);
    const result = await response.json();

    if (result.success && result.data.length > 0) {
      selector.innerHTML = `<option value="">-- Pilih Kelas --</option>`;
      result.data.forEach((cls) => {
        const option = document.createElement("option");
        option.value = cls.id;
        option.text = cls.nama_kelas;
        selector.appendChild(option);
      });
    } else {
      selector.innerHTML = `<option value="">Tidak ada kelas perwalian</option>`;
    }
  } catch (error) {
    console.error("Error loading classes:", error);
    selector.innerHTML = `<option value="">Gagal memuat</option>`;
  }
}

async function loadAttendanceData() {
  const classSelector = document.getElementById("class-selector");
  const dateInput = document.getElementById("attendance-date");
  const tbody = document.getElementById("attendance-list-body");

  if (!tbody || !classSelector || !dateInput) return;

  const kelasId = classSelector.value;
  const date = dateInput.value;

  if (!kelasId || !date) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Silakan pilih kelas dan tanggal.</td></tr>`;
    return;
  }

  tbody.innerHTML = `<tr><td colspan="5" class="text-center">Memuat data siswa...</td></tr>`;

  try {
    const response = await fetch(
      `${API_ATTENDANCE_LIST}?kelasId=${kelasId}&date=${date}`,
    );
    const result = await response.json();

    if (result.success) {
      renderAttendanceTable(result.data);
    } else {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">${result.message}</td></tr>`;
    }
  } catch (error) {
    console.error("Error:", error);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-red-500">Gagal mengambil data.</td></tr>`;
  }
}

function renderAttendanceTable(students) {
  const tbody = document.getElementById("attendance-list-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="padding:20px;">Tidak ada siswa di kelas ini.</td></tr>`;
    return;
  }

  students.forEach((s, index) => {
    const st = s.status || "hadir";

    const row = `
            <tr data-id="${s.siswa_id}">
                <td style="text-align:center; color:#6b7280;">${index + 1}</td>
                <td>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-weight:600; color:#111827; font-size:14px;">${s.nama_lengkap}</span>
                        <span style="font-size:12px; color:#6b7280;">NIS: ${s.nis}</span>
                    </div>
                </td>
                <td style="text-align:center;">
                    <span style="background:#f3f4f6; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:12px; color:#374151;">
                        ${s.jenis_kelamin}
                    </span>
                </td>
                <td>
                    <div class="status-options">
                        <label class="radio-label" title="Hadir">
                            <input type="radio" name="status_${s.siswa_id}" value="hadir" ${st === "hadir" ? "checked" : ""}>
                            <span class="badge active" style="background:#d1fae5; color:#065f46">Hadir</span>
                        </label>
                        <label class="radio-label" title="Sakit">
                            <input type="radio" name="status_${s.siswa_id}" value="sakit" ${st === "sakit" ? "checked" : ""}>
                            <span class="badge warning" style="background:#fef3c7; color:#92400e">Sakit</span>
                        </label>
                        <label class="radio-label" title="Izin">
                            <input type="radio" name="status_${s.siswa_id}" value="izin" ${st === "izin" ? "checked" : ""}>
                            <span class="badge info" style="background:#dbeafe; color:#1e40af">Izin</span>
                        </label>
                        <label class="radio-label" title="Alpha">
                            <input type="radio" name="status_${s.siswa_id}" value="alfa" ${st === "alfa" ? "checked" : ""}>
                            <span class="badge inactive" style="background:#fee2e2; color:#991b1b">Alpha</span>
                        </label>
                    </div>
                </td>
                <td>
                    <input type="text" 
                           class="note-input" 
                           placeholder="Tulis keterangan..." 
                           value="${s.keterangan || ""}" 
                           autocomplete="off">
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

async function saveAttendance() {
  const classSelector = document.getElementById("class-selector");
  const dateInput = document.getElementById("attendance-date");
  const btnSave = document.getElementById("btn-save-attendance");
  const rows = document.querySelectorAll("#attendance-list-body tr");

  if (!classSelector || !dateInput || !btnSave) return;

  const kelasId = classSelector.value;
  const date = dateInput.value;

  // Validasi Notifikasi menggunakan Objek Notifications
  if (!kelasId) {
    Notifications.error("Silakan pilih kelas terlebih dahulu!");
    return;
  }

  if (rows.length === 0 || rows[0].getAttribute("data-id") === null) {
    Notifications.error("Tidak ada data siswa untuk disimpan.");
    return;
  }

  const attendanceData = [];
  rows.forEach((row) => {
    const siswaId = row.getAttribute("data-id");
    if (siswaId) {
      const statusInput = row.querySelector(
        `input[name="status_${siswaId}"]:checked`,
      );
      const keteranganInput = row.querySelector(".note-input");

      attendanceData.push({
        siswa_id: siswaId,
        status: statusInput ? statusInput.value : "hadir",
        keterangan: keteranganInput ? keteranganInput.value : "",
      });
    }
  });

  const originalText = btnSave.innerText;
  btnSave.innerText = "Menyimpan...";
  btnSave.disabled = true;

  try {
    const response = await fetch(API_SAVE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kelasId, date, attendanceData }),
    });

    const result = await response.json();

    if (result.success) {
      Notifications.success("Data absensi berhasil disimpan!");
    } else {
      Notifications.error("Gagal menyimpan: " + result.message);
    }
  } catch (error) {
    console.error("Error saving:", error);
    Notifications.error("Terjadi kesalahan koneksi ke server.");
  } finally {
    btnSave.innerText = originalText;
    btnSave.disabled = false;
  }
}
