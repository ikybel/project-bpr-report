<?php
include 'config/db.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// GET DATA
if ($method === 'GET') {
    if ($action === 'get_chat') {
        $id = $_GET['laporan_id'];
        $q = mysqli_query($conn, "SELECT * FROM chat_laporan WHERE laporan_id='$id' ORDER BY id ASC");
        echo json_encode(mysqli_fetch_all($q, MYSQLI_ASSOC));
    } else {
        $q = mysqli_query($conn, "SELECT * FROM laporan ORDER BY id DESC");
        echo json_encode(mysqli_fetch_all($q, MYSQLI_ASSOC));
    }
} 

// POST DATA
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if ($action === 'send_chat') {
        $laporan_id = $data['laporan_id'];
        $pengirim = $data['pengirim'];
        $pesan = mysqli_real_escape_string($conn, $data['pesan']);
        mysqli_query($conn, "INSERT INTO chat_laporan (laporan_id, pengirim, pesan) VALUES ('$laporan_id', '$pengirim', '$pesan')");
        echo json_encode(['status' => 'success']);
    } elseif ($action === 'update_status') {
        $id = $data['id'];
        mysqli_query($conn, "UPDATE laporan SET status='Selesai' WHERE id='$id'");
        echo json_encode(['status' => 'success']);
    } else {
        $loc = $data['location']; $name = $data['name']; $nrp = $data['nrp'];
        $phone = $data['phone']; $desc = $data['description']; 
        $pri = $data['priority']; $eta = $data['eta'];
        mysqli_query($conn, "INSERT INTO laporan (location, name, nrp, phone, description, priority, eta) 
                             VALUES ('$loc', '$name', '$nrp', '$phone', '$desc', '$pri', '$eta')");
        echo json_encode(['status' => 'success']);
    }
}
?>