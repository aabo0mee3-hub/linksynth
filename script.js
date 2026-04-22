const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

let activeEl = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');

    // 1. THEME TOGGLES (Fixed logic)
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => {
            canvas.className = btn.dataset.mode;
            console.log("Theme switched to:", btn.dataset.mode);
        };
    });

    // 2. SHAPE & TEXT TOOLS
    document.getElementById('addShapeBtn').onclick = () => {
        const shape = document.getElementById('shapeSelect').value;
        spawn('', 'div', shape);
    };

    document.getElementById('addTextBtn').onclick = () => {
        spawn('Edit text', 'div', 'draggable-text');
    };

    // 3. CLEAR CANVAS
    document.getElementById('clearCanvasBtn').onclick = () => {
        if(confirm("Clear current concept?")) canvas.innerHTML = '';
    };

    // 4. LAUNCH DUMMY PAGE (With Print/Save functionality)
    document.getElementById('launchDummyBtn').onclick = () => {
        const win = window.open('', '_blank');
        const content = canvas.innerHTML;
        const theme = canvas.className;

        win.document.write(`
            <html>
                <head>
                    <link rel="stylesheet" href="style.css">
                    <style>
                        body { padding: 40px; }
                        .export-tools { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
                        @media print { .export-tools { display: none; } }
                    </style>
                </head>
                <body class="${theme}">
                    <div class="export-tools">
                        <button onclick="window.print()">📄 Save as PDF / Print</button>
                        <p><small>Tip: To save as PNG, use a screen capture tool or Right-Click > Save As if available.</small></p>
                    </div>
                    <div style="position:relative;">${content}</div>
                </body>
            </html>
        `);
    };

    // --- CORE ENGINE: SPAWN & DRAG ---
    function spawn(content, type, className) {
        const el = document.createElement(type);
        if (type === 'img') el.src = content; 
        else { el.innerText = content; el.contentEditable = true; }
        el.className = `draggable-asset ${className}`;
        el.style.left = '50px'; el.style.top = '50px';
        
        el.onmousedown = () => { activeEl = el; el.style.zIndex = 1000; };
        canvas.appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = canvas.getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    // Image Importer
    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (f) => spawn(f.target.result, 'img', 'uploaded-img');
        reader.readAsDataURL(e.target.files[0]);
    };
});
