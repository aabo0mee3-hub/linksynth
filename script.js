// CONFIGURATION
const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
let sbClient;
let activeEl = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase correctly using window object
    sbClient = window.supabase.createClient(SB_URL, SB_KEY);

    const canvas = document.getElementById('canvas');

    // --- 1. THEME SWITCHER (FIXED) ---
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = () => {
            canvas.className = btn.dataset.theme;
        };
    });

    // --- 2. SHAPE & TEXT TOOLS (FIXED) ---
    document.getElementById('addShapeBtn').onclick = () => {
        const shapeType = document.getElementById('shapePicker').value;
        spawnElement('', 'div', `shape-${shapeType}`);
    };

    document.getElementById('addTextBtn').onclick = () => {
        spawnElement('Double click to edit', 'div', 'draggable-text');
    };

    // --- 3. CLEAR & LAUNCH (NEW) ---
    document.getElementById('clearCanvasBtn').onclick = () => {
        canvas.innerHTML = '<p class="placeholder-text">Canvas Cleared.</p>';
    };

    document.getElementById('launchDummyBtn').onclick = () => {
        const dummyWin = window.open('', '_blank');
        const content = canvas.innerHTML;
        const currentTheme = canvas.className;
        
        dummyWin.document.write(`
            <html>
                <head><link rel="stylesheet" href="style.css"></head>
                <body class="${currentTheme}" style="padding:20px;">
                    <div style="position:relative;">${content}</div>
                </body>
            </html>
        `);
    };

    // --- 4. IMAGE IMPORT (FIXED) ---
    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => spawnElement(event.target.result, 'img', 'uploaded-img');
        reader.readAsDataURL(e.target.files[0]);
    };

    // --- 5. CORE SPAWN & DRAG ENGINE ---
    function spawnElement(content, type, className) {
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
        activeEl.style.left = (e.clientX - rect.left - 25) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 25) + 'px';
    };

    document.onmouseup = () => activeEl = null;
});
