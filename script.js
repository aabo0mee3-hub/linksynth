const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A'; // Replace this!
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Public Beta Key

let client, repoItems = [], draggedEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // FIX: Load existing data
    const { data } = await client.from('Links').select('*');
    if (data) { repoItems = data; renderRepo(); }

    // SAVE LOGIC: Checks for https://
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value;
        const type = document.getElementById('assetType').value;
        
        // FIX: If user forgets https://, add it automatically
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }

        const entry = { url, type };
        repoItems.push(entry);
        renderRepo();
        await client.from('Links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // GIPHY API TOOL
    document.getElementById('searchGifBtn').onclick = async () => {
        const q = document.getElementById('gifSearch').value;
        const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${q}&limit=10`);
        const { data } = await resp.json();
        const results = document.getElementById('gifResults');
        results.innerHTML = data.map(g => `<img src="${g.images.fixed_height_small.url}" class="gif-opt" style="height:70px; cursor:pointer;">`).join('');
        
        document.querySelectorAll('.gif-opt').forEach(img => {
            img.onclick = () => spawnDraggable(img.src, 'img');
        });
    };

    // DRAG LOGIC
    function spawnDraggable(content, kind) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        kind === 'img' ? el.src = content : el.innerText = content;
        el.className = 'draggable-asset';
        if(kind !== 'img') el.style.fontSize = '3rem';
        el.onmousedown = () => { draggedEl = el; };
        document.getElementById('canvas').appendChild(el);
    }

    document.onmousemove = (e) => {
        if (!draggedEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        draggedEl.style.left = (e.clientX - rect.left - 20) + 'px';
        draggedEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => { draggedEl = null; };

    // APPLY THEME LOGIC
    document.getElementById('applyThemeBtn').onclick = () => {
        repoItems.forEach(item => {
            if (item.type === 'theme') {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = item.url;
                document.head.appendChild(link);
            }
        });
    };

    // Design listeners
    document.getElementById('colorPicker').oninput = (e) => document.getElementById('canvas').style.backgroundColor = e.target.value;
    document.getElementById('fontPicker').onchange = (e) => document.getElementById('canvas').style.fontFamily = e.target.value;
});

function renderRepo() {
    document.getElementById('linkList').innerHTML = repoItems.map(i => `<div class="link-card"><strong>${i.type}</strong><br>${i.url.substring(0,20)}...</div>`).join('');
}
