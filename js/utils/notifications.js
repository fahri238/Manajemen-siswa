// --- js/utils/notifications.js ---

const Notifications = {
  // 1. Fungsi Toast (Muncul Hilang)
  show(message, type = "info") {
    // Cek apakah wadah toast sudah ada? Kalau belum, buat dulu
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    // Tentukan Icon berdasarkan tipe
    let iconClass = "fa-info-circle";
    if (type === "success") iconClass = "fa-circle-check";
    if (type === "error") iconClass = "fa-circle-exclamation";

    // Buat Element Toast
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
            <i class="fa-solid ${iconClass}"></i>
            <span class="toast-message">${message}</span>
        `;

    // Masukkan ke wadah
    container.appendChild(toast);

    // Hapus otomatis setelah 3 detik
    setTimeout(() => {
      toast.classList.add("hide");
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, 3000);
  },

  // Shortcut biar nulisnya gampang
  success(msg) {
    this.show(msg, "success");
  },
  error(msg) {
    this.show(msg, "error");
  },
  info(msg) {
    this.show(msg, "info");
  },

  // 2. Fungsi Konfirmasi Custom
  confirm(title, message, callback) {
    // Buat elemen modal konfirmasi secara dinamis
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay show";
    overlay.innerHTML = `
            <div class="confirm-box">
                <div class="confirm-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="confirm-title">${title}</div>
                <div class="confirm-desc">${message}</div>
                <div class="confirm-actions">
                    <button class="btn-confirm-cancel" id="btn-cancel">Batal</button>
                    <button class="btn-confirm-yes" id="btn-yes">Ya</button>
                </div>
            </div>
        `;
    document.body.appendChild(overlay);

    // Event Listener Tombol
    document.getElementById("btn-cancel").onclick = () => {
      overlay.remove();
    };

    document.getElementById("btn-yes").onclick = () => {
      overlay.remove();
      if (callback) callback(); // Jalankan fungsi hapus jika user klik YA
    };
  },
};

// Pasang ke Window agar bisa dipanggil di file lain
window.Notifications = Notifications;
