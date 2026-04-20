// CONFIGURATION
const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
const TENOR_API_KEY = 'YOUR_TENOR_KEY'; // Replace this with your Tenor API Key

let client, activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // 1. TENOR GIF SEARCH
    document.getElementById('searchGifBtn').onclick = async () => {
        const query = document.getElementById('gifSearch').value;
        const url = `https://tenor.googleapis.com/v2/search?q=${query}&key=${TENOR_API_KEY}&limit=8`;
        
        try {
            const resp = await fetch(url);
            const { results } = await resp.json();
            const box = document.getElementById('gifResults');
            box.innerHTML = results.map(g => `
                <img src="${g.media_formats.tinygif.url}" class="tenor-gif" data-full="${g.media_formats.gif.url}">
            `).join('');

            document.querySelectorAll('.tenor-gif').forEach(img => {
                img.onclick = () => spawnDraggable(img.dataset.full, 'img');
            });
        } catch (e) { console.error("Tenor Error:", e); }
    };

    // 2. PRESET FORMAT BUTTONS
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => {
            const canvas = document.getElementById('canvas');
            // Remove any previously applied preset classes
            canvas.className = ''; 
            // Apply the new one
            canvas.classList.add(btn.dataset.theme);
        };
    });

    // 3. IMAGE IMPORTATION TOOL
    document.getElementById('imageImporter').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => spawnDraggable(event.target.result, 'img');
            reader.readAsDataURL(file);
        }
    };

    // 4. TEXT BOX CREATOR
    document.getElementById('addTextBtn').onclick = () => {
        const txt = document.getElementById('textInput').value || "Edit Text";
        spawnDraggable(txt, 'text');
        document.getElementById('textInput').value = "";
    };

    // HELPERS
    function spawnDraggable(src, kind) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        if (kind === 'img') el.src = src;
        else { el.innerText = src; el.contentEditable = true; el.className = 'draggable-text'; }
        
        el.classList.add('draggable-asset');
        el.style.left = '50px'; el.style.top = '50px';
        
        el.onmousedown = (e) => { activeEl = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    // DRAG ENGINE
    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 30) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 30) + 'px';
    };
    document.onmouseup = () => activeEl = null;
});
