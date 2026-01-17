const API_URL = "http://localhost:5000/api/subjects";

document.addEventListener("DOMContentLoaded", () => {
  fetchSubjects();
});

// 1. GET DATA
async function fetchSubjects() {
  const tbody = document.getElementById("subject-list-body");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>`;

  try {
    const res = await fetch(API_URL);
    const result = await res.json();
    tbody.innerHTML = "";

    if (result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada data mapel.</td></tr>`;
      return;
    }

    result.data.forEach((item) => {
      const row = `
                <tr>
                    <td><span class="badge active">${
                      item.kode_mapel
                    }</span></td>
                    <td style="font-weight:bold;">${item.nama_mapel}</td>
                    <td>${item.kategori}</td>
                    <td style="color:#64748b; font-size:13px;">${
                      item.keterangan || "-"
                    }</td>
                    <td style="text-align: right;">
                        <button class="btn-action edit" onclick="window.editSubject(${
                          item.id
                        })"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-action delete" onclick="window.deleteSubject(${
                          item.id
                        })"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
      tbody.innerHTML += row;
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red">Gagal koneksi.</td></tr>`;
  }
}

// 2. MODAL
window.openModal = () => {
  const modal = document.getElementById("modal-subject");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
};

window.closeModal = () => {
  const modal = document.getElementById("modal-subject");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("form-subject").reset();
    document.getElementById("subject-id").value = "";
    document.querySelector(".modal-header h3").innerText =
      "Form Mata Pelajaran";
  }, 300);
};

// 3. SAVE
window.handleSaveSubject = async (e) => {
  e.preventDefault();
  const id = document.getElementById("subject-id").value;
  const isEdit = id !== "";

  const data = {
    kode_mapel: document.getElementById("kode-mapel").value,
    nama_mapel: document.getElementById("nama-mapel").value,
    kategori: document.getElementById("kategori").value,
    keterangan: document.getElementById("keterangan").value,
  };

  const url = isEdit ? `${API_URL}/${id}` : API_URL;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (result.success) {
      if (typeof Notifications !== "undefined")
        Notifications.success(result.message);
      else alert(result.message);
      window.closeModal();
      fetchSubjects();
    } else {
      if (typeof Notifications !== "undefined")
        Notifications.error(result.message);
      else alert(result.message);
    }
  } catch (error) {
    alert("Error Sistem");
  }
};

// 4. EDIT
window.editSubject = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const result = await res.json();
    if (result.success) {
      const data = result.data;
      document.getElementById("subject-id").value = data.id;
      document.getElementById("kode-mapel").value = data.kode_mapel;
      document.getElementById("nama-mapel").value = data.nama_mapel;
      document.getElementById("kategori").value = data.kategori;
      document.getElementById("keterangan").value = data.keterangan;
      window.openModal();
    }
  } catch (error) {
    console.error(error);
  }
};

// 5. DELETE
window.deleteSubject = async (id) => {
  if (typeof Notifications !== "undefined") {
    Notifications.confirm(
      "Hapus Mapel?",
      "Data akan hilang permanen.",
      async () => {
        try {
          const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
          const result = await res.json();
          if (result.success) {
            Notifications.success("Mapel dihapus");
            fetchSubjects();
          } else {
            Notifications.error(result.message);
          }
        } catch (err) {
          Notifications.error("Gagal menghapus");
        }
      }
    );
  } else {
    if (confirm("Hapus mapel ini?")) {
      /* Fallback manual fetch delete here if needed */
    }
  }
};
