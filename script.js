const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

let activeEl = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');

    // --- WORKSPACE TOOLS ---
    document.getElementById('addShapeBtn').onclick = () => {
        const shape = document.getElementById('shapeSelect').value;
        spawn('', 'div', shape);
    };

    document.getElementById('addTextBtn').onclick = () => spawn('New Text Box', 'div', 'draggable-text');

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => canvas.className = btn.dataset.mode;
    });

    document.getElementById('clearCanvasBtn').onclick = () => {
        if(confirm("Clear Canvas?")) canvas.innerHTML = '';
    };

    // --- THE DUMMY PAGE (Theme-Fixed) ---
    document.getElementById('launchDummyBtn').onclick = () => {
        const win = window.open('', '_blank');
        const canvasHtml = canvas.innerHTML;
        const currentTheme = canvas.className;
        // Grabs the existing stylesheet to inject into the new window
        const styleLink = document.querySelector('link[rel="stylesheet"]').href;

        win.document.write(`
            <html>
                <head>
                    <link rel="stylesheet" href="${styleLink}">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
                    <style>
                        body { margin: 0; padding: 40px; display: flex; flex-direction: column; align-items: center; }
                        #export-area { width: 100%; min-height: 600px; position: relative; border: 1px solid #ccc; border-radius: 8px; }
                        .controls { margin-top: 20px; padding: 20px; background: #eee; border-radius: 8px; width: 100%; text-align: center; }
                    </style>
                </head>
                <body class="${currentTheme}">
                    <div id="export-area" class="${currentTheme}">
                        ${canvasHtml}
                    </div>
                    <div class="controls">
                        <button onclick="downloadPNG()" style="background:#10b981; color:white; padding:12px 24px; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">💾 Download PNG Mockup</button>
                    </div>
                    <script>
                        function downloadPNG() {
                            const area = document.querySelector("#export-area");
                            html2canvas(area, { backgroundColor: null }).then(canvas => {
                                let link = document.createElement('a');
                                link.download = 'Mockup-Export.png';
                                link.href = canvas.toDataURL("image/png");
                                link.click();
                            });
                        }
                    <\/script>
                </body>
            </html>
        `);
    };

    // --- CORE ENGINE ---
    function spawn(content, type, className) {
        const el = document.createElement(type);
        if (type === 'img') el.src = content; 
        else { el.innerText = content; el.contentEditable = true; }
        el.className = `draggable-asset ${className}`;
        el.style.left = '100px'; el.style.top = '100px';
        el.onmousedown = (e) => { activeEl = el; el.style.zIndex = 1000; };
        canvas.appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = canvas.getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (f) => spawn(f.target.result, 'img', 'uploaded-img');
        reader.readAsDataURL(e.target.files[0]);
    };
});
