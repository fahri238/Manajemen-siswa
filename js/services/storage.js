// js/services/storage.js
import { TABLE_NAMES } from "../config.js";

export const StorageService = {
  // Ambil semua data dari sebuah tabel
  getAll(tableName) {
    try {
      const data = localStorage.getItem(tableName);
      const parsed = data ? JSON.parse(data) : [];
      // Pastikan hasil selalu array untuk mencegah error .length atau .find
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Gagal parse data dari storage:", e);
      return [];
    }
  },

  // Ambil satu data berdasarkan ID (atau NIS/NIP)
  getById(tableName, id, keyName = "id") {
    const data = this.getAll(tableName);
    return data.find((item) => item[keyName] === id);
  },

  // Simpan data baru
  save(tableName, newData) {
    try {
      const data = this.getAll(tableName);
      data.push(newData);
      localStorage.setItem(tableName, JSON.stringify(data));
      return { success: true };
    } catch (e) {
      console.error("Storage Error:", e);
      return { success: false, message: "Penyimpanan penuh atau error!" };
    }
  },

  // Update data yang sudah ada
  update(tableName, id, updatedData, keyName = "id") {
    let data = this.getAll(tableName);
    const index = data.findIndex((item) => item[keyName] === id);

    if (index !== -1) {
      data[index] = { ...data[index], ...updatedData };
      localStorage.setItem(tableName, JSON.stringify(data));
      return true;
    }
    return false;
  },

  // Hapus data
  delete(tableName, id, keyName = "id") {
    let data = this.getAll(tableName);
    data = data.filter((item) => item[keyName] !== id);
    localStorage.setItem(tableName, JSON.stringify(data));
    return true;
  },
};
