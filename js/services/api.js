// Contoh di Frontend
async function getStudents() {
    const response = await fetch('http://localhost:3000/api/students');
    const result = await response.json();
    console.log(result.data); // Ini data siswa dari MySQL!
}