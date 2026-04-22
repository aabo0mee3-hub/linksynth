const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const sb = window.supabase ? window.supabase.createClient(SB_URL, SB_KEY) : null;

let activeEl = null;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');

    // 1. ASSET SPAWNING
    document.getElementById('addShapeBtn').onclick = () => spawn('', 'div', document.getElementById('shapeSelect').value);
    document.getElementById('addTextBtn').onclick = () => spawn('Editable Concept Text', 'div', 'draggable-text');

    // 2. THEME SWITCHING
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = () => canvas.className = btn.dataset.mode;
    });

    document.getElementById('clearCanvasBtn').onclick = () => { if(confirm("Clear work?")) canvas.innerHTML = ''; };

    // 3. THE FIXED EXPORT ENGINE
    document.getElementById('launchDummyBtn').onclick = () => {
        const win = window.open('', '_blank');
        const canvasHtml = canvas.innerHTML;
        const currentTheme = canvas.className;
        
        // Grab all styles from the current document to inject into the popup
        const styles = Array.from(document.styleSheets)
            .map(sheet => {
                try { return Array.from(sheet.cssRules).map(rule => rule.cssText).join(''); } 
                catch (e) { return ''; } // Handle cross-origin issues
            }).join('');

        win.document.write(`
            <html>
                <head>
                    <title>LinkSynth Export</title>
                    <style>${styles}</style>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
                </head>
                <body class="${currentTheme}" style="padding:40px; display:flex; flex-direction:column; align-items:center;">
                    <div id="export-area" class="${currentTheme}" style="position:relative; width:100%; min-height:600px; border:1px solid #444; border-radius:10px;">
                        ${canvasHtml}
                    </div>
                    <div style="margin-top:20px;">
                        <button onclick="doSnapshot()" style="background:#10b981; color:white; padding:15px 30px; border:none; border-radius:8px; cursor:pointer; font-weight:bold; font-size:16px;">💾 Save as PNG</button>
                    </div>
                    <script>
                        function doSnapshot() {
                            html2canvas(document.querySelector("#export-area"), {
                                backgroundColor: null,
                                useCORS: true,
                                scale: 2 // Higher quality export
                            }).then(canvas => {
                                let link = document.createElement('a');
                                link.download = 'LinkSynth-Mockup.png';
                                link.href = canvas.toDataURL("image/png");
                                link.click();
                            });
                        }
                    <\/script>
                </body>
            </html>
        `);
    };

    // 4. CORE ENGINE (Dragging & Spawning)
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
        reader.onload = (f) => spawn(f.target.result, 'img', 'draggable-asset');
        reader.readAsDataURL(e.target.files[0]);
    };
});
