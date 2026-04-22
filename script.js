// CONFIGURATION (Single Declaration)
const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

let activeEl = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');

    // --- BUTTON WIRING ---
    document.getElementById('addShapeBtn').onclick = () => {
        const shapeClass = document.getElementById('shapeSelect').value;
        spawn('', 'div', shapeClass);
    };

    document.getElementById('addTextBtn').onclick = () => {
        spawn('Edit text', 'div', 'draggable-text');
    };

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => canvas.className = btn.dataset.mode;
    });

    document.getElementById('clearCanvasBtn').onclick = () => {
        if(confirm("Clear work?")) canvas.innerHTML = '';
    };

    // --- THE DUMMY PAGE & SNAPSHOTTER ---
    document.getElementById('launchDummyBtn').onclick = () => {
        const win = window.open('', '_blank');
        const canvasHtml = canvas.innerHTML;
        const currentTheme = canvas.className;

        win.document.write(`
            <html>
                <head>
                    <link rel="stylesheet" href="style.css">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
                </head>
                <body class="${currentTheme}" style="padding:40px;">
                    <div id="export-area" style="position:relative; min-height:500px; border:1px solid #ccc;">
                        ${canvasHtml}
                    </div>
                    <hr>
                    <button onclick="saveAsPNG()" style="background:#10b981; color:white; padding:10px; border-radius:5px; cursor:pointer;">💾 Save as PNG</button>
                    
                    <script>
                        function saveAsPNG() {
                            html2canvas(document.querySelector("#export-area")).then(canvas => {
                                let link = document.createElement('a');
                                link.download = 'linksynth-mockup.png';
                                link.href = canvas.toDataURL();
                                link.click();
                            });
                        }
                    </script>
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

    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (f) => spawn(f.target.result, 'img', 'uploaded-img');
        reader.readAsDataURL(e.target.files[0]);
    };
});
