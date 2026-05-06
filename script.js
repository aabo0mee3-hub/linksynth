const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SUPABASE_KEY = 'sb_publishable_muIW1nlyLCYOfIT8Ko4OCA_G8pALwVI';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let activeEl = null;
const canvas = document.getElementById('canvas');

// --- AUTH LOGIC ---
sb.auth.onAuthStateChange((event, session) => {
    const overlay = document.getElementById('auth-overlay');
    if (session) {
        overlay.style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
        document.getElementById('user-display').innerText = `User: ${session.user.email}`;
        loadUserCanvas(session.user.id);
    } else {
        overlay.style.display = 'flex';
    }
});

document.getElementById('loginBtn').onclick = async () => {
    const { error } = await sb.auth.signInWithPassword({
        email: document.getElementById('auth-email').value,
        password: document.getElementById('auth-password').value
    });
    if (error) alert(error.message);
};

document.getElementById('registerBtn').onclick = async () => {
    const { error } = await sb.auth.signUp({
        email: document.getElementById('auth-email').value,
        password: document.getElementById('auth-password').value
    });
    if (error) alert("Check email for confirmation!");
};

document.getElementById('logoutBtn').onclick = () => sb.auth.signOut();

// --- CANVAS ENGINE ---
function spawn(content, type, className, x = 50, y = 50) {
    const el = document.createElement(type);
    if (type === 'img') el.src = content;
    else { el.innerText = content; el.contentEditable = true; }
    
    el.className = `draggable-asset ${className}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    el.onmousedown = () => { activeEl = el; el.style.zIndex = 1000; };
    canvas.appendChild(el);
}

// Fixes the "renderCanvas is not defined" error
function renderCanvas(dataArray) {
    canvas.innerHTML = '';
    dataArray.forEach(item => {
        const type = item.asset_type === 'image' ? 'img' : 'div';
        spawn(item.content, type, item.class_name, item.pos_x, item.pos_y);
    });
}

async function loadUserCanvas(userId) {
    const { data } = await sb.from('links').select('*').eq('user_id', userId);
    if (data) renderCanvas(data);
}

// --- TOOLBAR ACTIONS ---
document.getElementById('addShapeBtn').onclick = () => spawn('', 'div', document.getElementById('shapeSelect').value);
document.getElementById('addTextBtn').onclick = () => spawn('Editable Text', 'div', 'draggable-text');

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => canvas.className = btn.dataset.mode;
});

// --- CLOUD SAVING ---
document.getElementById('saveCloudBtn').onclick = async () => {
    const user = (await sb.auth.getUser()).data.user;
    if (!user) return;

    // Delete old state, save new state
    await sb.from('links').delete().eq('user_id', user.id);
    
    const assets = Array.from(document.querySelectorAll('.draggable-asset')).map(el => ({
        user_id: user.id,
        content: el.tagName === 'IMG' ? el.src : el.innerText,
        asset_type: el.tagName === 'IMG' ? 'image' : 'shape',
        class_name: el.className.replace('draggable-asset ', ''),
        pos_x: parseInt(el.style.left),
        pos_y: parseInt(el.style.top)
    }));

    const { error } = await sb.from('links').insert(assets);
    alert(error ? "Error saving" : "Saved to Cloud!");
};

// Drag Logic
document.onmousemove = (e) => {
    if (!activeEl) return;
    const rect = canvas.getBoundingClientRect();
    activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
    activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
};
document.onmouseup = () => activeEl = null;
