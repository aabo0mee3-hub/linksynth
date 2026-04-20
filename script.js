const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';

let client, repoItems = [], activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // Load from Supabase
    const { data } = await client.from('Links').select('*');
    if (data) { repoItems = data; renderRepo(); }

    // 1. ADD TO STACK
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value.trim();
        const type = document.getElementById('assetType').value;
        if (!url.startsWith('http')) url = 'https://' + url;

        const entry = { url, type };
        repoItems.push(entry);
        renderRepo();
        await client.from('Links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // 2. SHAPE TOOL
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.onclick = () => spawnDraggable('', 'div', `shape-${btn.dataset.shape}`);
    });

    // 3. TEXT TOOL
    document.getElementById('addTextBtn').onclick = () => spawnDraggable('Edit Text', 'div', 'draggable-text');

    // 4. PRESET BUTTONS
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('canvas').className = btn.dataset.theme;
        };
    });

    // 5. THE DUMMY PAGE MAKER (The "Browser Page Maker" function)
    document.getElementById('launchDummyBtn').onclick = () => {
        const dummyWin = window.open('', '_blank');
        let styles = repoItems.filter(i => i.type === 'theme').map(i => `<link rel="stylesheet" href="${i.url}">`).join('\n');
        let content = document.getElementById('canvas').innerHTML;
        
        dummyWin.document.write(`
            <html>
                <head><title>Mockup Preview</title>${styles}</head>
                <body style="margin:0; padding:20px;">
                    <div id="wrapper" style="position:relative;">${content}</div>
                </body>
            </html>
        `);
    };

    // Helper: Spawn Items
    function spawnDraggable(content, kind, cssClass) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        if (kind === 'img') el.src = content; 
        else { el.innerText = content; el.contentEditable = true; }
        
        el.className = `draggable-asset ${cssClass}`;
        el.style.left = '100px'; el.style.top = '100px';
        el.onmousedown = () => activeEl = el;
        document.getElementById('canvas').appendChild(el);
    }

    // Drag Logic
    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    // Local Image Importer
    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (f) => spawnDraggable(f.target.result, 'img', '');
        reader.readAsDataURL(e.target.files[0]);
    };
});

function renderRepo() {
    document.getElementById('linkList').innerHTML = repoItems.map(i => `<div class="link-card"><strong>${i.type}</strong><br>${i.url.slice(0,20)}...</div>`).join('');
}
