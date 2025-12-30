<?php
include 'config/db.php';
header('Content-Type: application/json');

// Mengambil data JSON yang dikirim dari Frontend
$data = json_decode(file_get_contents('php://input'), true);
$email = mysqli_real_escape_string($conn, $data['email']);

// Query cek email
$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    $user = mysqli_fetch_assoc($result);
    echo json_encode([
        "status" => "success",
        "role" => $user['role'],
        "nama_kantor" => $user['nama_kantor']
    ]);
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "Email kantor tidak terdaftar!"
    ]);
}
?>