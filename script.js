const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const canvas = document.getElementById('canvas');
let activeEl = null;

// 1. Spawning Engine: Creates assets that can be moved
function spawn(content, type, className, x = 50, y = 50) {
    const el = document.createElement(type);
    if (type === 'img') el.src = content;
    else { 
        el.innerText = content || "Editable Text"; 
        el.contentEditable = true; 
    }
    
    el.className = `draggable-asset ${className}`;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    // Clicking enables movement
    el.onmousedown = (e) => { 
        activeEl = el; 
        el.style.zIndex = 1000;
        e.stopPropagation(); 
    };
    
    canvas.appendChild(el);
}

// 2. Drag Logic
document.onmousemove = (e) => {
    if (!activeEl) return;
    const rect = canvas.getBoundingClientRect();
    activeEl.style.left = (e.clientX - rect.left - 25) + 'px';
    activeEl.style.top = (e.clientY - rect.top - 25) + 'px';
};
document.onmouseup = () => activeEl = null;

// 3. Toolbar Functionality
document.getElementById('addShapeBtn').onclick = () => spawn('', 'div', document.getElementById('shapeSelect').value);
document.getElementById('addTextBtn').onclick = () => spawn('New Text Block', 'div', 'draggable-text');

document.getElementById('imgUpload').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => spawn(reader.result, 'img', 'uploaded-img');
    reader.readAsDataURL(e.target.files[0]);
};

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.onclick = () => canvas.className = btn.dataset.mode;
});

// 4. PNG Export for AI Snapshots
document.getElementById('exportBtn').onclick = () => {
    html2canvas(canvas).then(canvasImg => {
        const link = document.createElement('a');
        link.download = 'linksynth-snapshot.png';
        link.href = canvasImg.toDataURL();
        link.click();
    });
};

// 5. Supabase Sync: Save the entire layout to the cloud
document.getElementById('saveCloudBtn').onclick = async () => {
    // Clear old state and push new coordinates
    await sb.from('canvas_state').delete().neq('id', 0);
    
    const assets = Array.from(document.querySelectorAll('.draggable-asset')).map(el => ({
        content: el.tagName === 'IMG' ? el.src : el.innerText,
        asset_type: el.tagName === 'IMG' ? 'img' : 'div',
        class_name: el.className.replace('draggable-asset ', ''),
        pos_x: parseInt(el.style.left),
        pos_y: parseInt(el.style.top)
    }));

    const { error } = await sb.from('canvas_state').insert(assets);
    alert(error ? "Sync Error" : "Layout Saved to Supabase!");
};

// Load initial state from Supabase on refresh
window.onload = async () => {
    const { data } = await sb.from('canvas_state').select('*');
    if (data) data.forEach(item => spawn(item.content, item.asset_type, item.class_name, item.pos_x, item.pos_y));
};
