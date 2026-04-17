const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; // Replace with your actual key
const GIPHY_KEY = 'dc6zaTOxFJmzC'; // Public Beta Key for testing

let client, repoData = [], activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // Load existing data from Supabase
    const { data } = await client.from('Links').select('*');
    if (data) { repoData = data; renderRepo(); }

    // SAVE LOGIC: Automatically adds https:// to prevent 404 local path errors
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value.trim();
        const type = document.getElementById('assetType').value;
        if (!url) return;

        if (!url.startsWith('http')) url = 'https://' + url; //

        const entry = { url, type };
        repoData.push(entry);
        renderRepo();
        await client.from('Links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // GIPHY SEARCH: Uses the API to pull live GIFs into your tool
    document.getElementById('searchGifBtn').onclick = async () => {
        const q = document.getElementById('gifSearch').value;
        const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${q}&limit=8`);
        const { data } = await resp.json();
        const box = document.getElementById('gifResults');
        box.innerHTML = data.map(g => `<img src="${g.images.fixed_height_small.url}" class="g-opt" style="height:60px; cursor:pointer;">`).join('');
        
        document.querySelectorAll('.g-opt').forEach(img => {
            img.onclick = () => spawnDraggable(img.src, 'img');
        });
    };

    // PRESET FORMATS: One-click prototype layout changes
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => {
            const canvas = document.getElementById('canvas');
            canvas.className = ""; // Clear existing presets
            canvas.classList.add(btn.dataset.theme); // Apply new preset
        };
    });

    // DRAG AND DROP: The core of your customization tool
    function spawnDraggable(src, kind) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        kind === 'img' ? el.src = src : el.innerText = src;
        el.className = 'draggable-asset';
        el.onmousedown = () => { activeEl = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 25) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 25) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    // ... (Existing Image Importer and Repository Rendering) ...
});'; // Replace with your actual key
const GIPHY_KEY = 'dc6zaTOxFJmzC'; // Public Beta Key for testing

let client, repoData = [], activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // Load existing data from Supabase
    const { data } = await client.from('Links').select('*');
    if (data) { repoData = data; renderRepo(); }

    // SAVE LOGIC: Automatically adds https:// to prevent 404 local path errors
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value.trim();
        const type = document.getElementById('assetType').value;
        if (!url) return;

        if (!url.startsWith('http')) url = 'https://' + url; //

        const entry = { url, type };
        repoData.push(entry);
        renderRepo();
        await client.from('Links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // GIPHY SEARCH: Uses the API to pull live GIFs into your tool
    document.getElementById('searchGifBtn').onclick = async () => {
        const q = document.getElementById('gifSearch').value;
        const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${q}&limit=8`);
        const { data } = await resp.json();
        const box = document.getElementById('gifResults');
        box.innerHTML = data.map(g => `<img src="${g.images.fixed_height_small.url}" class="g-opt" style="height:60px; cursor:pointer;">`).join('');
        
        document.querySelectorAll('.g-opt').forEach(img => {
            img.onclick = () => spawnDraggable(img.src, 'img');
        });
    };

    // PRESET FORMATS: One-click prototype layout changes
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.onclick = () => {
            const canvas = document.getElementById('canvas');
            canvas.className = ""; // Clear existing presets
            canvas.classList.add(btn.dataset.theme); // Apply new preset
        };
    });

    // DRAG AND DROP: The core of your customization tool
    function spawnDraggable(src, kind) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        kind === 'img' ? el.src = src : el.innerText = src;
        el.className = 'draggable-asset';
        el.onmousedown = () => { activeEl = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 25) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 25) + 'px';
    };
    document.onmouseup = () => activeEl = null;

    // ... (Existing Image Importer and Repository Rendering) ...
});
// ... existing Supabase and Giphy config ...

document.addEventListener('DOMContentLoaded', async () => {
    // ... previous Supabase init and Drag logic ...

   // ... (Supabase initialization remains same) ...

document.addEventListener('DOMContentLoaded', () => {
    // 1. Text Box Tool
    document.getElementById('addTextBtn').onclick = () => {
        const txt = document.getElementById('textInput').value || "Edit this text";
        spawnDraggable(txt, 'div', 'draggable-text');
        document.getElementById('textInput').value = "";
    };

    // 2. Export Tool: Generates CSS/HTML based on canvas state
    document.getElementById('exportBtn').onclick = () => {
        const canvas = document.getElementById('canvas');
        const bgColor = canvas.style.backgroundColor || "white";
        const fontFamily = canvas.style.fontFamily || "sans-serif";
        
        let code = `/* LinkSynth Exported CSS */\n`;
        code += `.canvas-mockup {\n  background-color: ${bgColor};\n  font-family: ${fontFamily};\n  position: relative;\n  height: 500px;\n}\n\n`;
        
        // Loop through all items on the canvas
        document.querySelectorAll('.draggable-asset').forEach((el, index) => {
            code += `.item-${index} {\n  position: absolute;\n  left: ${el.style.left};\n  top: ${el.style.top};\n}\n`;
        });

        document.getElementById('codeOutput').value = code;
        document.getElementById('exportModal').style.display = 'flex';
    };

    // 3. Updated Spawn Function
    function spawnDraggable(content, kind, extraClass = '') {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        if (kind === 'img') el.src = content; 
        else {
            el.innerText = content;
            el.contentEditable = true; // Makes text boxes editable on the fly!
        }
        
        el.className = `draggable-asset ${extraClass}`;
        el.style.left = "50px";
        el.style.top = "50px";
        
        el.onmousedown = (e) => { 
            activeEl = el; 
            el.style.zIndex = 1000; 
        };
        
        document.getElementById('canvas').appendChild(el);
    }

    // ... (Keep existing Giphy, Drag Logic, and Supabase logic) ...
});
