const API = 'api/reports.php';
let currentId = null;
let chatTimer = null;

// === 1. INISIALISASI & PROTEKSI REFRESH ===
const initApp = () => {
    const role = localStorage.getItem('role');
    const loc = localStorage.getItem('loc');

    console.log("Session Terdeteksi:", { role, loc });

    // Jika data login hilang (karena logout atau belum login), balik ke login
    if (!role || !loc) {
        window.location.href = 'index.html';
        return;
    }

    // Jalankan loadData jika ada elemen tabel di halaman ini
    if (document.getElementById('tableBody') || document.getElementById('historyBody')) {
        loadData();
    }
};

// Cek status dokumen untuk jalankan initApp
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Handler Form (Khusus Halaman Cabang)
document.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan load data otomatis saat halaman dibuka
    loadData();

    // 2. Logika Submit Laporan (Hanya akan jalan di Cabang karena Pusat tidak punya reportForm)
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.onsubmit = async (e) => {
            e.preventDefault();
            const loc = localStorage.getItem('loc'); 
            
            const payload = {
                location: loc,
                name: document.getElementById('name').value,
                nrp: document.getElementById('nrp').value,
                phone: document.getElementById('phone').value,
                description: document.getElementById('description').value,
                priority: document.getElementById('priority').value,
                eta: document.getElementById('eta').value
            };

            try {
                const res = await fetch(API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.status === 'success') {
                    alert('Laporan berhasil terkirim!');
                    e.target.reset();
                    if (typeof toggleModal === 'function') toggleModal(false);
                    loadData(); 
                } else {
                    alert('Gagal: ' + result.message);
                }
            } catch (err) {
                console.error("Error posting report:", err);
            }
        };
    }

    // 3. Logika Kirim Chat pakai ENTER (Berlaku untuk Pusat & Cabang)
    // Kita gunakan delegasi event supaya lebih aman
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const activeEl = document.activeElement;
            // Cek apakah yang lagi diketik adalah input chat
            if (activeEl && activeEl.id === 'chatInput') {
                e.preventDefault(); // Biar gak bikin baris baru di input
                sendChat();
            }
        }
    });
});

// === 2. FUNGSI LOAD DATA (PUSAT & CABANG) ===
async function loadData() {
    try {
        const role = localStorage.getItem('role');
        const loc = localStorage.getItem('loc') || "";
        
        // Ambil data dari server
        const res = await fetch(API); 
        const allData = await res.json();
        
        const tableId = (role === 'pusat') ? 'tableBody' : 'historyBody';
        const tbody = document.getElementById(tableId);
        if (!tbody) return;

        let displayData = allData;

        // Filter jika user adalah cabang
        if (role === 'cabang') {
            displayData = allData.filter(r => {
                if (!r.location) return false;
                // Hilangkan spasi dan case-insensitive agar perbandingan akurat
                const cleanDB = r.location.toString().replace(/\s+/g, '').toLowerCase();
                const cleanLocal = loc.toString().replace(/\s+/g, '').toLowerCase();
                return cleanDB === cleanLocal;
            });
        }

        // Render ke Tabel
        if (displayData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Belum ada data laporan.</td></tr>`;
        } else {
            tbody.innerHTML = displayData.map(r => {
                let pColor = '#777'; // Warna default
                if(r.priority === 'Tinggi') pColor = '#dc3545';
                if(r.priority === 'Sedang') pColor = '#ffc107';

                return `
                <tr>
                    <td data-label="ID">#${r.id}</td>
                    ${role === 'pusat' ? 
                        `<td data-label="Unit"><b>${r.location}</b><br><small>${r.name}</small></td>` : 
                        `<td data-label="Tanggal">${r.created_at}</td>`
                    }
                    <td data-label="Gangguan">${r.description}</td>
                    <td data-label="Prioritas"><span style="background:${pColor}; color:${r.priority === 'Sedang' ? '#000' : '#fff'}; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;">${r.priority}</span></td>
                    <td data-label="Status"><b style="color:${r.status === 'Pending' ? '#f39c12' : '#27ae60'}">${r.status}</b></td>
                    <td data-label="Aksi">
                        <div style="display:flex; gap:5px; width:100%;">
                            <button onclick="openChat(${r.id})" style="background:#0C3B72; color:white; padding:8px 10px; border:none; border-radius:4px; cursor:pointer; font-size:11px; flex:1;">Chat</button>
                            ${role === 'pusat' && r.status === 'Pending' ? `<button onclick="done(${r.id})" style="background:#27ae60; color:white; padding:8px 10px; border:none; border-radius:4px; cursor:pointer; font-size:11px; flex:1;">Selesai</button>` : ''}
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }

        // Update Dashboard Stats (Cabang Only)
        if (role === 'cabang') {
            const p = document.getElementById('countPending');
            const d = document.getElementById('countDone');
            if(p) p.innerText = displayData.filter(x => x.status === 'Pending').length;
            if(d) d.innerText = displayData.filter(x => x.status === 'Selesai').length;
        }
    } catch (e) {
        console.error("Gagal load data:", e);
    }
}

// === 3. FUNGSI CHAT ===
let chatInterval = null; // Gunakan null agar pengecekan lebih bersih

function openChat(id) {
    currentId = id;
    const chatSec = document.getElementById('chatSection');
    const displayId = document.getElementById('reportIdDisplay');
    
    if (displayId) displayId.innerText = id;
    
    // Pake display block, nanti CSS Media Query yang urus jadi Flex di HP
    if (chatSec) chatSec.style.display = 'block'; 
    
    loadChat();

    if (chatInterval) clearInterval(chatInterval);
    chatInterval = setInterval(() => {
        const isVisible = chatSec && chatSec.style.display !== 'none';
        if (isVisible) {
            loadChat(); 
        } else {
            clearInterval(chatInterval);
            chatInterval = null;
        }
    }, 2000);

    // Focus input biar user bisa langsung ngetik
    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (input) input.focus();
    }, 300);
}

// Tambahkan fungsi ini buat matiin timer pas chat ditutup (biar gak berat)
function closeChat() {
    document.getElementById('chatSection').style.display = 'none';
    clearInterval(chatInterval);
}

async function loadChat() {
    if(!currentId) return;
    try {
        const res = await fetch(`${API}?action=get_chat&laporan_id=${currentId}`);
        const chats = await res.json();
        const chatBox = document.getElementById('chatBox');
        if(!chatBox) return;
        
        const saya = (localStorage.getItem('role') || "").trim().toLowerCase(); 

        chatBox.innerHTML = chats.map(c => {
            const pengirimDB = (c.pengirim || "").trim().toLowerCase();
            const isMe = (pengirimDB === saya);
            
            // Format Waktu: Mengubah "2025-12-30 11:00:00" jadi "11:00"
            // Kita ambil jam dan menitnya saja dari string created_at
            const waktuFull = c.created_at || ""; 
            const jamMenit = waktuFull.split(' ')[1] ? waktuFull.split(' ')[1].substring(0, 5) : "";

            return `
            <div style="margin-bottom:12px; text-align: ${isMe ? 'right' : 'left'}">
                <div style="display:inline-block; padding:8px 12px; border-radius:12px; 
                            background:${isMe ? '#dcf8c6' : '#ffffff'}; 
                            border: 1px solid #ddd; text-align: left; max-width: 80%; position: relative;">
                    
                    <small style="color:${isMe ? '#27ae60' : '#2980b9'}; font-size:10px; display:block;">
                        <b>${c.pengirim}</b>
                    </small>
                    
                    <span style="font-size:13px; display:block; margin-bottom:4px;">${c.pesan}</span>
                    
                    <small style="font-size:9px; color:#999; display:block; text-align:right;">
                        ${jamMenit}
                    </small>
                </div>
            </div>`;
        }).join('');
        
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (e) { console.error("Gagal muat chat:", e); }
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const pesan = input.value.trim();
    if (!pesan || !currentId) return;

    // AMBIL ULANG DARI STORAGE TIAP KALI KLIK KIRIM
    const currentRole = localStorage.getItem('role') || "cabang";
    const pengirim = (currentRole.toLowerCase() === 'pusat') ? 'Pusat' : 'Cabang';

    console.log("Kirim sebagai:", pengirim);

    try {
        await fetch(`${API}?action=send_chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                laporan_id: currentId, 
                pengirim: pengirim, 
                pesan: pesan 
            })
        });
        input.value = '';
        loadChat();
    } catch (e) { console.error("Gagal kirim chat:", e); }
}

// === 4. UPDATE STATUS ===
async function done(id) {
    if(!confirm("Tandai laporan ini sebagai SELESAI?")) return;
    try {
        const res = await fetch(`${API}?action=update_status`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }) 
        });
        const result = await res.json();
        if(result.status === 'success') loadData();
    } catch (e) { console.error("Update status error:", e); }
}