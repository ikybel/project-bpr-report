const API = 'api/reports.php';
let currentId = null;
let chatTimer = null;

// === 1. DETEKSI HALAMAN & INIT ===
document.addEventListener('DOMContentLoaded', () => {
    const role = localStorage.getItem('role');
    
    // Jika di halaman pusat, ambil data tabel
    if (document.getElementById('tableBody')) {
        loadData();
    }

    // Jika di halaman cabang, aktifkan form submit
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
        reportForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const payload = {
                location: localStorage.getItem('loc'),
                name: document.getElementById('name').value,
                nrp: document.getElementById('nrp').value,
                phone: document.getElementById('phone').value,
                description: document.getElementById('description').value,
                priority: document.getElementById('priority').value,
                eta: document.getElementById('eta').value
            };

            const res = await fetch(API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (result.status === 'success') {
                alert('Laporan berhasil terkirim ke database Pusat!');
                e.target.reset();
            } else {
                alert('Gagal mengirim ke database: ' + result.message);
            }
        };
    }
});

// === 2. FUNGSI TABEL (PUSAT) ===
async function loadData() {
    try {
        const res = await fetch(API);
        const data = await res.json();
        const tbody = document.getElementById('tableBody');
        
    tbody.innerHTML = data.map(r => `
        <tr>
            <td>#${r.id}</td>
            <td><b>${r.location}</b><br><small>${r.name}</small></td>
            <td style="max-width: 300px; font-size: 13px; color: #555;">
                ${r.description} 
            </td>
            <td><span style="font-size:11px; padding:2px 5px; background:#eee; border-radius:3px;">${r.priority}</span></td>
            <td><b style="color:${r.status === 'Pending' ? 'orange' : 'green'}">${r.status}</b></td>
            <td>
                <div style="display:flex; gap:5px;">
                    <button onclick="openChat(${r.id})" style="background:#0C3B72; width:auto; padding:5px 10px; font-size:12px;">Chat</button>
                    ${r.status === 'Pending' ? `<button onclick="done(${r.id})" style="background:#28a745; width:auto; padding:5px 10px; font-size:12px;">Selesai</button>` : ''}
                </div>
            </td>
        </tr>`).join('');
    } catch (e) {
        console.error("Koneksi Database Gagal");
    }
}

// === 3. FUNGSI CHAT ===
async function openChat(id) {
    currentId = id;
    const section = document.getElementById('chatSection');
    if (section) section.style.display = 'block';
    
    // Tampilkan ID di header chat jika ada elemennya
    const display = document.getElementById('reportIdDisplay');
    if (display) display.innerText = id;

    loadChat();
    if (chatTimer) clearInterval(chatTimer);
    chatTimer = setInterval(loadChat, 3000); // Auto refresh chat
}

async function loadChat() {
    if(!currentId) return;
    const res = await fetch(`${API}?action=get_chat&laporan_id=${currentId}`);
    const chats = await res.json();
    const chatBox = document.getElementById('chatBox');
    
    chatBox.innerHTML = chats.map(c => `
        <div class="msg ${c.pengirim}">
            <small><b>${c.pengirim}</b> - ${c.created_at}</small><br>
            ${c.pesan}
        </div>`).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const pesan = input.value.trim();
    if (!pesan) return;

    const pengirim = localStorage.getItem('role') === 'pusat' ? 'Pusat' : 'Cabang';
    
    await fetch(`${API}?action=send_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laporan_id: currentId, pengirim, pesan })
    });
    
    input.value = '';
    loadChat();
}

// === 4. UPDATE STATUS ===
async function done(id) {
    if(!confirm("Tandai laporan ini sebagai SELESAI?")) return;
    
    await fetch(`${API}?action=update_status`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }) 
    });
    loadData();
}