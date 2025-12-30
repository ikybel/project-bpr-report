<?php
// Letakkan ini di baris paling ATAS, sebelum include apapun
ob_start(); 
error_reporting(0); // Matikan error agar tidak merusak format JSON

include 'config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'GET') {
    if ($action === 'get_chat') {
        $laporan_id = isset($_GET['laporan_id']) ? intval($_GET['laporan_id']) : 0;
        
        // Query sudah benar pakai *, jadi created_at pasti ikut
        $q = mysqli_query($conn, "SELECT * FROM chat_laporan WHERE laporan_id = '$laporan_id' ORDER BY id ASC");
        
        $chats = [];
        while($row = mysqli_fetch_assoc($q)) { 
            $chats[] = $row; 
        }

        // TAMBAHKAN INI: Bersihkan output buffer biar gak ada karakter aneh sebelum JSON
        ob_clean(); 
        echo json_encode($chats);
    } 
    else {
        // ... bagian ambil semua laporan (sudah benar) ...
        $sql = "SELECT * FROM laporan ORDER BY id DESC";
        $result = mysqli_query($conn, $sql);
        
        if (!$result) {
            ob_clean();
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
            exit;
        }

        $data = [];
        while($row = mysqli_fetch_assoc($result)) {
            $data[] = $row;
        }
        ob_clean();
        echo json_encode($data);
    }
    exit; 
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($action === 'send_chat') {
        $laporan_id = $data['laporan_id'];
        $pengirim = $data['pengirim'];
        $pesan = mysqli_real_escape_string($conn, $data['pesan']);
        $q = mysqli_query($conn, "INSERT INTO chat_laporan (laporan_id, pengirim, pesan) VALUES ('$laporan_id', '$pengirim', '$pesan')");
        ob_clean();
        echo json_encode(['status' => 'success']);
    } 
    elseif ($action === 'update_status') {
        $id = $data['id'];
        $q = mysqli_query($conn, "UPDATE laporan SET status='Selesai' WHERE id='$id'");
        ob_clean();
        echo json_encode(['status' => 'success']);
    } 
    else {
        $loc = mysqli_real_escape_string($conn, $data['location']);
        $name = mysqli_real_escape_string($conn, $data['name']);
        $nrp = mysqli_real_escape_string($conn, $data['nrp']);
        $phone = mysqli_real_escape_string($conn, $data['phone']);
        $desc = mysqli_real_escape_string($conn, $data['description']);
        $pri = mysqli_real_escape_string($conn, $data['priority']);
        $eta = mysqli_real_escape_string($conn, $data['eta']);

        $sql = "INSERT INTO laporan (location, name, nrp, phone, description, priority, eta, status) 
                VALUES ('$loc', '$name', '$nrp', '$phone', '$desc', '$pri', '$eta', 'Pending')";
        $q = mysqli_query($conn, $sql);
        ob_clean();
        echo json_encode(['status' => $q ? 'success' : 'error']);
    }
}