let sbClient;
let repository = [];
let activeElement = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Supabase (Use your actual credentials here)
    const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
    const SUPABASE_KEY = 'YOUR_KEY_HERE';
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // 2. Add to Repository Logic
    document.getElementById('addBtn').onclick = async () => {
        const url = document.getElementById('linkInput').value;
        const type = document.getElementById('assetType').value;
        if (!url) return;

        const entry = { url, type };
        repository.push(entry);
        renderRepository();
        await sbClient.from('links').insert([entry]);
        document.getElementById('linkInput').value = "";
    };

    // 3. GIF Search (Giphy Public API Key for testing)
    document.getElementById('searchGifBtn').onclick = async () => {
        const query = document.getElementById('gifSearch').value;
        const resp = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${query}&limit=5`);
        const { data } = await resp.json();
        const resultsDiv = document.getElementById('gifResults');
        resultsDiv.innerHTML = data.map(g => `<img src="${g.images.fixed_height_small.url}" class="gif-result" style="height:50px; cursor:pointer;">`).join('');
        
        document.querySelectorAll('.gif-result').forEach(img => {
            img.onclick = () => createDraggable(img.src, 'img');
        });
    };

    // 4. Create Draggable Elements
    function createDraggable(content, type) {
        const el = document.createElement(type === 'img' ? 'img' : 'div');
        if(type === 'img') el.src = content; else el.innerText = content;
        el.className = 'draggable-asset';
        if(type !== 'img') el.style.fontSize = '3rem';
        
        el.onmousedown = (e) => { activeElement = el; el.style.zIndex = 1000; };
        document.getElementById('canvas').appendChild(el);
    }

    // Drag Logic
    document.onmousemove = (e) => {
        if (!activeElement) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeElement.style.left = (e.clientX - rect.left - 30) + 'px';
        activeElement.style.top = (e.clientY - rect.top - 30) + 'px';
    };
    document.onmouseup = () => { activeElement = null; };

    // 5. Theme Controls
    document.getElementById('colorPicker').oninput = (e) => {
        document.getElementById('canvas').style.backgroundColor = e.target.value;
    };
    document.getElementById('fontPicker').onchange = (e) => {
        document.getElementById('canvas').style.fontFamily = e.target.value;
    };

    // Sticker Buttons
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.onclick = () => createDraggable(btn.dataset.src, 'div');
    });

    // Local Image Upload
    document.getElementById('imageImporter').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (ev) => createDraggable(ev.target.result, 'img');
        reader.readAsDataURL(e.target.files[0]);
    };
});

function renderRepository() {
    const list = document.getElementById('linkList');
    list.innerHTML = repository.map(item => `<div class="link-card"><strong>${item.type}</strong><br>${item.url.substring(0,20)}...</div>`).join('');
}
