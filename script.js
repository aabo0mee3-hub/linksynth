const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
let client, activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // FEATURE: SNAPSHOTTING (Prepares JSON for LLM adaptation)
    document.getElementById('snapshotBtn').onclick = async () => {
        const assets = document.querySelectorAll('.draggable-asset');
        const snapshot = Array.from(assets).map(el => ({
            type: el.classList.contains('shape-circle') ? 'circle' : (el.tagName === 'IMG' ? 'image' : 'rect'),
            left: el.style.left,
            top: el.style.top,
            text: el.innerText || ""
        }));

        console.log("Canvas Snapshot for LLM:", snapshot);
        // Save to Supabase for session memory
        await client.from('Snapshots').insert([{ data: snapshot }]);
        alert("Snapshot saved to Supabase!");
    };

    // SHARED SPAWN FUNCTION
    function spawn(content, type, className) {
        const el = document.createElement(type);
        if (type === 'img') el.src = content; 
        else { el.innerText = content; el.contentEditable = true; }
        el.className = `draggable-asset ${className}`;
        el.style.left = '50px'; el.style.top = '50px';
        el.onmousedown = () => { activeEl = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    // BUTTON HANDLERS
    document.querySelectorAll('.shape-btn').forEach(b => b.onclick = () => spawn('', 'div', `shape-${b.dataset.shape}`));
    document.getElementById('addTextBtn').onclick = () => spawn('New Text', 'div', 'draggable-text');
    
    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;
});
