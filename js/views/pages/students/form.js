// js/views/pages/students/form.js

const API_CLASSES = "http://localhost:5000/api/classes";
const API_STUDENTS = "http://localhost:5000/api/students";

document.addEventListener("DOMContentLoaded", () => {
  loadClassOptions(); // 1. Isi Dropdown Kelas
  setupFormSubmit(); // 2. Siapkan Event Submit
});

// FUNGSI 1: Mengisi Dropdown Kelas dari Database
async function loadClassOptions() {
  const selectKelas = document.getElementById("kelas_id"); // Pastikan ID di HTML <select id="kelas_id">

  // Reset isi dropdown
  if (selectKelas) {
    selectKelas.innerHTML = '<option value="">Pilih Kelas...</option>';

    try {
      const response = await fetch(API_CLASSES);
      const result = await response.json();

      if (result.success) {
        result.data.forEach((kelas) => {
          // Tambahkan opsi ke dropdown
          const option = document.createElement("option");
          option.value = kelas.id;
          option.textContent = kelas.nama_kelas;
          selectKelas.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Gagal memuat data kelas:", error);
    }
  }
}

// FUNGSI 2: Kirim Data ke Backend
function setupFormSubmit() {
  const form = document.getElementById("add-student-form");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // 1. Cek apakah ini Edit atau Baru?
      const studentId = document.getElementById("student_id").value;
      const isEditMode = studentId !== "";

      // 2. Siapkan Data
      const formData = {
        nis: document.getElementById("nis").value,
        nisn: document.getElementById("nisn")?.value || "",
        nama_lengkap: document.getElementById("nama_lengkap").value,
        gender: document.getElementById("gender").value,
        kelas_id: document.getElementById("kelas_id").value,
        status: "aktif",
      };

      // 3. Tentukan URL dan Method
      let url = API_STUDENTS;
      let method = "POST";

      if (isEditMode) {
        url = `${API_STUDENTS}/${studentId}`; // Append ID ke URL
        method = "PUT"; // Ganti method jadi PUT
      }

      // 4. Loading State
      const btnSubmit = form.querySelector('button[type="submit"]');
      const originalText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = "Menyimpan...";
      btnSubmit.disabled = true;

      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          if (typeof Notifications !== "undefined") {
            Notifications.success(result.message);
          } else {
            alert(result.message);
          }

          closeAddStudentModal(); // Tutup modal
          form.reset(); // Bersihkan form
          document.getElementById("student_id").value = ""; // Reset ID rahasia

          // Refresh Tabel
          if (typeof window.fetchStudents === "function") {
            window.fetchStudents();
          } else {
            location.reload();
          }
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        alert(error.message);
      } finally {
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
      }
    });
  }
}
