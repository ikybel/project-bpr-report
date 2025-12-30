# 🏦 Sistem Pelaporan Gangguan Jaringan - PT BPR NTB

Aplikasi manajemen pelaporan gangguan teknis (Ticketing System) untuk mempermudah koordinasi antara Unit Cabang dan IT Pusat PT BPR NTB secara real-time.

## 🚀 Fitur Utama
- **Login Multi-Role**: Autentikasi menggunakan email resmi kantor (@bprntb.co.id).
- **Smart Form Reporting**: Pelaporan detail gangguan dengan sistem Prioritas (Tinggi, Sedang, Rendah).
- **Real-time Chat System**: Komunikasi dua arah otomatis per laporan (Auto-polling 2 detik).
- **UX Optimization**: Fitur *Enter-to-Send* (Shortcut Enter) dan *Auto-focus* kursor saat buka chat.
- **Dashboard Monitoring**: Rekapitulasi laporan dan status (Pending/Selesai) untuk IT Pusat.

---

## 🛠️ Cara Instalasi (Localhost)

### 1. Persiapan Folder
Pastikan project berada di dalam folder `htdocs` (XAMPP):
`C:/xampp/htdocs/bpr-system/`

### 2. Setup Database
1. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Buat database baru: `db_bpr_report`.
3. Jalankan query SQL berikut (Urutan: Users -> Laporan -> Chat):

```sql
-- 1. Tabel User (Hanya Email, Nama Kantor, dan Role)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    nama_kantor VARCHAR(100) NOT NULL,
    role ENUM('pusat', 'cabang') NOT NULL
);

-- 2. Tabel Laporan
CREATE TABLE laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(100), -- Nama kantor pelapor
    name VARCHAR(100),     -- Nama staff pelapor
    nrp VARCHAR(50),
    phone VARCHAR(20),
    description TEXT,
    priority VARCHAR(20),
    eta VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Chat History
CREATE TABLE chat_laporan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    laporan_id INT,
    pengirim ENUM('Cabang', 'Pusat'),
    pesan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE
);

-- 4. Master Data User Lengkap (KPNO & Semua Kantor Cabang)
INSERT INTO users (email, nama_kantor, role) VALUES
('kpno.mataram@bprntb.co.id', 'KPNO Mataram', 'pusat'),
('pokp.mataram@bprntb.co.id', 'POKP Mataram', 'cabang'),
('kc.gerung@bprntb.co.id', 'KC Gerung', 'cabang'),
('kc.narmada@bprntb.co.id', 'KC Narmada', 'cabang'),
('kc.labuapi@bprntb.co.id', 'KC Labuapi', 'cabang'),
('kc.kuripan@bprntb.co.id', 'KC Kuripan', 'cabang'),
('kc.gunung.sari@bprntb.co.id', 'KC Gunung Sari', 'cabang'),
('kc.kayangan@bprntb.co.id', 'KC Kayangan', 'cabang'),
('kc.bayan@bprntb.co.id', 'KC Bayan', 'cabang'),
('kc.praya@bprntb.co.id', 'KC Praya', 'cabang'),
('kc.praya.timur@bprntb.co.id', 'KC Praya Timur', 'cabang'),
('kc.janapria@bprntb.co.id', 'KC Janapria', 'cabang'),
('kc.batukliang@bprntb.co.id', 'KC Batukliang', 'cabang'),
('kc.pujut@bprntb.co.id', 'KC Pujut', 'cabang'),
('kc.jonggat@bprntb.co.id', 'KC Jonggat', 'cabang'),
('kc.kopang@bprntb.co.id', 'KC Kopang', 'cabang'),
('kc.praya.barat@bprntb.co.id', 'KC Praya Barat', 'cabang'),
('kc.pringgarata@bprntb.co.id', 'KC Pringgarata', 'cabang'),
('kc.selong@bprntb.co.id', 'KC Selong', 'cabang'),
('kc.montong.betok@bprntb.co.id', 'KC Montong Betok', 'cabang'),
('kc.kotaraja@bprntb.co.id', 'KC Kotaraja', 'cabang'),
('kc.paokmotong@bprntb.co.id', 'KC Paokmotong', 'cabang'),
('kc.dasan.lekong@bprntb.co.id', 'KC Dasan Lekong', 'cabang'),
('kc.aikmel@bprntb.co.id', 'KC Aikmel', 'cabang'),
('kc.labuhan.lombok@bprntb.co.id', 'KC Labuhan Lombok', 'cabang'),
('kc.sambeha@bprntb.co.id', 'KC Sambeha', 'cabang'),
('kc.taliwang@bprntb.co.id', 'KC Taliwang', 'cabang'),
('kc.seteluk@bprntb.co.id', 'KC Seteluk', 'cabang'),
('kc.sumbawa@bprntb.co.id', 'KC Sumbawa', 'cabang'),
('kc.empang@bprntb.co.id', 'KC Empang', 'cabang'),
('kc.plampang@bprntb.co.id', 'KC Plampang', 'cabang'),
('kc.lopok@bprntb.co.id', 'KC Lopok', 'cabang'),
('kc.moyo@bprntb.co.id', 'KC Moyo', 'cabang'),
('kc.lenangguar@bprntb.co.id', 'KC Lenangguar', 'cabang'),
('kc.labuhan.sumbawa@bprntb.co.id', 'KC Labuhan Sumbawa', 'cabang'),
('kc.utan@bprntb.co.id', 'KC Utan', 'cabang'),
('kc.alas@bprntb.co.id', 'KC Alas', 'cabang'),
('kc.dompu@bprntb.co.id', 'KC Dompu', 'cabang'),
('kc.montabaru@bprntb.co.id', 'KC Montabaru', 'cabang'),
('kc.soriutu@bprntb.co.id', 'KC Soriutu', 'cabang'),
('kc.rasabou@bprntb.co.id', 'KC Rasabou', 'cabang'),
('kc.bima@bprntb.co.id', 'KC Bima', 'cabang'),
('kc.woha@bprntb.co.id', 'KC Woha', 'cabang'),
('kc.bolo@bprntb.co.id', 'KC Bolo', 'cabang'),
('kc.sape@bprntb.co.id', 'KC Sape', 'cabang');