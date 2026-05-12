// Replace with your actual project details
const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeEl = null;
const canvas = document.getElementById('canvas');

/** * 1. THE ENGINE (Defined first to prevent ReferenceErrors)
 */
function spawn(content, type, className, x = 50, y = 50) {
    const el = document.createElement(type);
    if (type === 'img') {
        el.src = content;
    } else {
        el.innerText = content;
        el.contentEditable = true;
    }
    
    el.className = `draggable ${className}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    // Drag Start
    el.onmousedown = (e) => { 
        activeEl = el; 
        el.style.zIndex = 1000; 
        e.stopPropagation(); 
    };
    
    canvas.appendChild(el);
}

function renderCanvas(dataArray) {
    canvas.innerHTML = ''; // Clear placeholder
    if (!dataArray || dataArray.length === 0) return;
    
    dataArray.forEach(item => {
        const htmlType = item.asset_type === 'image' ? 'img' : 'div';
        spawn(item.content, htmlType, item.class_name, item.pos_x, item.pos_y);
    });
}

/**
 * 2. AUTH & CLOUD SYNC
 */
sb.auth.onAuthStateChange((event, session) => {
    const overlay = document.getElementById('auth-overlay');
    if (session) {
        overlay.style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('user-display').innerText = `Logged in: ${session.user.email}`;
        loadUserCanvas(session.user.id);
    } else {
        overlay.style.display = 'flex';
        document.getElementById('logoutBtn').style.display = 'none';
    }
});

async function loadUserCanvas(userId) {
    const { data, error } = await sb.from('links').select('*').eq('user_id', userId);
    if (data) renderCanvas(data);
}

document.getElementById('saveCloudBtn').onclick = async () => {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return alert("Please log in first!");

    // Delete old state to overwrite with new
    await sb.from('links').delete().eq('user_id', user.id);
    
    const assets = Array.from(document.querySelectorAll('.draggable')).map(el => ({
        user_id: user.id,
        content: el.tagName === 'IMG' ? el.src : el.innerText,
        asset_type: el.tagName === 'IMG' ? 'image' : (el.classList.contains('text-box') ? 'text' : 'shape'),
        class_name: el.className.replace('draggable ', ''),
        pos_x: parseInt(el.style.left) || 50,
        pos_y: parseInt(el.style.top) || 50
    }));

    const { error } = await sb.from('links').insert(assets);
    alert(error ? "Save failed!" : "Cloud Sync Complete! ☁️");
};

/**
 * 3. UI TOOLS (Shapes, Text, Images, PNG)
 */
document.getElementById('addShapeBtn').onclick = () => spawn('', 'div', document.getElementById('shapeSelect').value);
document.getElementById('addTextBtn').onclick = () => spawn('Click to Edit Text', 'div', 'text-box');

document.getElementById('imgUpload').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (f) => spawn(f.target.result, 'img', 'uploaded-img');
    reader.readAsDataURL(e.target.files[0]);
};

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => canvas.className = btn.dataset.mode;
});

// THE SNAPSHOT FEATURE
document.getElementById('exportPngBtn').onclick = () => {
    html2canvas(canvas, { backgroundColor: null, logging: false }).then(c => {
        const link = document.createElement('a');
        link.download = `linksynth-snap-${Date.now()}.png`;
        link.href = c.toDataURL("image/png");
        link.click();
    });
};

/**
 * 4. GLOBAL DRAG HANDLER
 */
document.onmousemove = (e) => {
    if (!activeEl) return;
    const rect = canvas.getBoundingClientRect();
    activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
    activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
};
document.onmouseup = () => activeEl = null;

// Auth Actions
document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
};

document.getElementById('registerBtn').onclick = async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const { error } = await sb.auth.signUp({ email, password });
    if (error) alert("Check your email for confirmation!");
};

document.getElementById('logoutBtn').onclick = () => sb.auth.signOut();
