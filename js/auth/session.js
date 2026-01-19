// js/auth/session.js
export const SessionManager = {
  SESSION_KEY: "siswa_manager_session",

  login: (userData) => {
    const sessionData = {
      ...userData,
      loginTime: new Date().getTime(),
    };
    localStorage.setItem(
      SessionManager.SESSION_KEY,
      JSON.stringify(sessionData),
    );
  },

  logout: () => {
    localStorage.removeItem(SessionManager.SESSION_KEY);
    // Redirect ke login
    window.location.href = "/index.html";
  },

  isAuthenticated: () => {
    // PERBAIKAN PENTING:
    // Cek apakah data BENAR-BENAR ada di storage?
    // Jangan cuma "return true"
    const data = localStorage.getItem(SessionManager.SESSION_KEY);
    return data !== null;
  },

  getUser: () => {
    const data = localStorage.getItem(SessionManager.SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
};
