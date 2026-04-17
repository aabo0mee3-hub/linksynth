// --- CONFIGURATION ---
const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; 
const GIPHY_KEY = 'dc6zaTOxFJmzC'; // Public Beta Key for onboarding

let client, repoData = [], activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // Initial load from Supabase
    const { data } = await client.from('Links').select('*');
    if (data) { repoData = data; renderRepo(); }

    // SAVE ASSET (Resolves the 404 local path error)
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value.trim();
        const type = document.getElementById('assetType').value;
        if (!url) return;

        // Force HTTPS to ensure browser treats as external link
        if (!url.startsWith('http')) url = 'https://' + url;

        const entry = { url, type };
        repoData.push(entry);
        renderRepo();
        await client.from('Links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // GIPHY API SEARCH
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

    // DRAG AND DROP LOGIC
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

    // FORMAT PULLING LOGIC
    document.getElementById('applyThemeBtn').onclick = () => {
        repoData.forEach(item => {
            if (item.type === 'theme') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = item.url;
                document.head.appendChild(link);
            }
        });
    };

    // Image Importation
    document.getElementById('imageImporter').onchange = (e) => {
        const r = new FileReader();
        r.onload = (v) => spawnDraggable(v.target.result, 'img');
        r.readAsDataURL(e.target.files[0]);
    };
});

function renderRepo() {
    document.getElementById('linkList').innerHTML = repoData.map(i => `<div class="link-card"><strong>${i.type}</strong><br>${i.url.slice(0,20)}...</div>`).join('');
}
