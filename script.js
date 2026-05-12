const SUPABASE_URL = 'https://your-id.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeEl = null;
const canvas = document.getElementById('canvas');

// --- 1. AUTH & DATA LOADING ---
sb.auth.onAuthStateChange((event, session) => {
    const overlay = document.getElementById('auth-overlay');
    if (session) {
        overlay.style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('user-display').innerText = session.user.email;
        loadUserCanvas(session.user.id);
    } else {
        overlay.style.display = 'flex';
    }
});

async function loadUserCanvas(userId) {
    const { data } = await sb.from('links').select('*').eq('user_id', userId);
    if (data) renderCanvas(data); // Fixed ReferenceError
}

function renderCanvas(dataArray) {
    canvas.innerHTML = '';
    dataArray.forEach(item => {
        spawn(item.content, item.asset_type === 'image' ? 'img' : 'div', item.class_name, item.pos_x, item.pos_y);
    });
}

// --- 2. CANVAS ENGINE ---
function spawn(content, type, className, x = 50, y = 50) {
    const el = document.createElement(type);
    if (type === 'img') el.src = content;
    else { el.innerText = content; el.contentEditable = true; }
    
    el.className = `draggable ${className}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    el.onmousedown = (e) => { activeEl = el; el.style.zIndex = 1000; };
    canvas.appendChild(el);
}

// Draggable Logic
document.onmousemove = (e) => {
    if (!activeEl) return;
    const rect = canvas.getBoundingClientRect();
    activeEl.style.left = (e.clientX - rect.left - 25) + 'px';
    activeEl.style.top = (e.clientY - rect.top - 25) + 'px';
};
document.onmouseup = () => activeEl = null;

// --- 3. UI ACTIONS ---
document.getElementById('addShapeBtn').onclick = () => spawn('', 'div', document.getElementById('shapeSelect').value);
document.getElementById('addTextBtn').onclick = () => spawn('New Text Box', 'div', 'text-box');

document.getElementById('imgUpload').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (event) => spawn(event.target.result, 'img', 'uploaded-img');
    reader.readAsDataURL(e.target.files[0]);
};

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => canvas.className = btn.dataset.mode;
});

// --- 4. CLOUD SAVE & EXPORT ---
document.getElementById('saveCloudBtn').onclick = async () => {
    const user = (await sb.auth.getUser()).data.user;
    await sb.from('links').delete().eq('user_id', user.id); // Clear old
    
    const assets = Array.from(document.querySelectorAll('.draggable')).map(el => ({
        user_id: user.id,
        content: el.tagName === 'IMG' ? el.src : el.innerText,
        asset_type: el.tagName === 'IMG' ? 'image' : 'shape',
        class_name: el.className.replace('draggable ', ''),
        pos_x: parseInt(el.style.left),
        pos_y: parseInt(el.style.top)
    }));
    
    await sb.from('links').insert(assets);
    alert("Saved to Cloud!");
};

document.getElementById('exportPngBtn').onclick = () => {
    html2canvas(canvas).then(c => {
        const link = document.createElement('a');
        link.download = 'linksynth-snapshot.png';
        link.href = c.toDataURL();
        link.click();
    });
};

// Auth buttons
document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
};
