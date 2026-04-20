const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // 1. SHAPE & TEXT TOOLS
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.onclick = () => spawnElement('', 'div', `shape-${btn.dataset.shape}`);
    });

    document.getElementById('addTextBtn').onclick = () => {
        spawnElement('Editable Text', 'div', 'draggable-text');
    };

    // 2. THEME SWITCHER
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            const canvas = document.getElementById('canvas');
            canvas.className = btn.dataset.theme;
        };
    });

    // 3. IMAGE IMPORTER (FIXED)
    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            spawnElement(event.target.result, 'img', 'uploaded-img');
        };
        reader.readAsDataURL(e.target.files[0]);
    };

    // 4. DUMMY PAGE LAUNCHER
    document.getElementById('launchDummyBtn').onclick = () => {
        const win = window.open('', '_blank');
        const canvasContent = document.getElementById('canvas').innerHTML;
        const themeClass = document.getElementById('canvas').className;
        
        win.document.write(`
            <html>
                <head><link rel="stylesheet" href="style.css"></head>
                <body class="${themeClass}" style="padding:50px;">
                    <div style="position:relative;">${canvasContent}</div>
                </body>
            </html>
        `);
    };

    // 5. HELPER: SPAWN & DRAG
    function spawnElement(content, type, className) {
        const el = document.createElement(type);
        if (type === 'img') {
            el.src = content;
            el.style.width = "150px";
        } else {
            el.innerText = content;
            el.contentEditable = true;
        }
        el.className = `draggable-asset ${className}`;
        el.style.left = '50px'; el.style.top = '50px';
        
        el.onmousedown = (e) => { activeEl = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    document.getElementById('clearCanvasBtn').onclick = () => {
        document.getElementById('canvas').innerHTML = '';
    };
});
