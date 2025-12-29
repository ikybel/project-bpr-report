# 🏦 Sistem Pelaporan Gangguan Jaringan - PT BPR NTB

Aplikasi web sederhana untuk manajemen pelaporan gangguan teknis dari Unit Cabang ke IT Pusat. Dilengkapi dengan fitur login multi-role, monitoring dashboard, dan real-time chat.

## 🚀 Fitur Utama
- **Login Multi-Role**: Akses berbeda untuk Staff Cabang dan IT Pusat.
- **Form Pelaporan**: Input detail gangguan, prioritas, dan estimasi.
- **Dashboard Monitoring**: Tabel rekapitulasi gangguan di sisi IT Pusat.
- **Real-time Chat**: Komunikasi langsung antara Cabang dan Pusat per laporan.
- **Status Management**: Update laporan dari 'Pending' menjadi 'Selesai'.

---

## 🛠️ Cara Instalasi (Localhost)

### 1. Persiapan Folder
Pastikan project berada di dalam folder `htdocs` (XAMPP):
`C:/xampp/htdocs/bpr-system/`

### 2. Setup Database
1. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Buat database baru dengan nama: `db_bpr_report`.
3. Klik database tersebut, pilih tab **SQL**, dan jalankan perintah berikut:

```sql
-- Membuat Tabel Laporan
CREATE TABLE laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100),
    name VARCHAR(100),
    nrp VARCHAR(50),
    phone VARCHAR(20),
    description TEXT,
    priority VARCHAR(20),
    eta VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membuat Tabel Chat
CREATE TABLE chat_laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    laporan_id INT,
    pengirim ENUM('Cabang', 'Pusat'),
    pesan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE
);