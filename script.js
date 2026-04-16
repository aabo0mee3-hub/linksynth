// Supabase Configuration (Placeholders)
const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
const supabase = lib.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const linkInput = document.getElementById('linkInput');
const assetType = document.getElementById('assetType');
const addBtn = document.getElementById('addBtn');
const linkList = document.getElementById('linkList');
const generateBtn = document.getElementById('generateBtn');
const canvas = document.getElementById('canvas');

let repository = [];

// 1. Initialize: Check Cookies/Local Storage
window.onload = () => {
    const savedData = getCookie("repo_session");
    if (savedData) {
        repository = JSON.parse(savedData);
        renderRepository();
    }
};

// 2. Add Link Logic
addBtn.onclick = async () => {
    const url = linkInput.value;
    const type = assetType.value;
    if (!url) return alert("Please enter a URL");

    const entry = { url, type, timestamp: new Date() };
    repository.push(entry);
    
    // Save to Cookies (30 day expiry)
    setCookie("repo_session", JSON.stringify(repository), 30);
    
    // Save to Supabase
    const { data, error } = await supabase.from('links').insert([entry]);
    
    renderRepository();
    linkInput.value = "";
};

// 3. Render Repository
function renderRepository() {
    linkList.innerHTML = repository.map(item => `
        <div class="link-card">
            <strong>${item.type.toUpperCase()}</strong><br>
            ${item.url}
        </div>
    `).join('');
}

// 4. Generate Prototype Logic
generateBtn.onclick = () => {
    canvas.innerHTML = `<h3>Generated Prototype</h3><p>Importing assets...</p>`;
    
    repository.forEach(item => {
        if (item.type === 'theme') {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = item.url;
            canvas.appendChild(link);
        }
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.url;
            img.style.width = "100px";
            canvas.appendChild(img);
        }
    });
};

// Cookie Helper Functions
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days*24*60*60*1000));
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
// FIX: Renamed 'supabase' to 'sbClient' to avoid conflict with the library's global object
let sbClient;
let repository = [];

document.addEventListener('DOMContentLoaded', () => {
    // INITIALIZATION
    const SUPABASE_URL = 'YOUR_URL_HERE';
    const SUPABASE_KEY = 'YOUR_KEY_HERE';
    
    // FIX: Using window.supabase to access the library, assigning to sbClient
    sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- FEATURE: DRAG & DROP ENGINE ---
    let activeElement = null;

    function makeDraggable(el) {
        el.onmousedown = (e) => {
            activeElement = el;
            el.style.zIndex = 1000;
        };
    }

    document.onmousemove = (e) => {
        if (!activeElement) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        // Calculate position relative to the canvas
        activeElement.style.left = (e.clientX - rect.left - 25) + 'px';
        activeElement.style.top = (e.clientY - rect.top - 25) + 'px';
    };

    document.onmouseup = () => { activeElement = null; };

    // --- FEATURE: STICKERS & GIFS ---
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.onclick = () => {
            const isImg = btn.dataset.src.startsWith('http');
            const el = document.createElement(isImg ? 'img' : 'div');
            if(isImg) el.src = btn.dataset.src;
            else el.innerText = btn.dataset.src;
            
            el.className = 'draggable-asset';
            el.style.fontSize = '3rem';
            document.getElementById('canvas').appendChild(el);
            makeDraggable(el);
        };
    });

    // --- FEATURE: LOCAL IMAGE IMPORT ---
    document.getElementById('imageImporter').onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'draggable-asset';
            document.getElementById('canvas').appendChild(img);
            makeDraggable(img);
        };
        reader.readAsDataURL(file);
    };

    // --- REVISED REPOSITORY LOGIC ---
    document.getElementById('addBtn').onclick = async () => {
        const url = document.getElementById('linkInput').value;
        const type = document.getElementById('assetType').value;
        if (!url) return;

        const entry = { url, type };
        repository.push(entry);
        renderRepository(); // Helper function to refresh list
        
        // Save to Supabase using sbClient
        const { error } = await sbClient.from('links').insert([entry]);
        if (error) console.error("Sync Error:", error.message);
    };

    // --- THEME PICKERS ---
    document.getElementById('colorPicker').oninput = (e) => {
        document.getElementById('canvas').style.backgroundColor = e.target.value;
    };
    document.getElementById('fontPicker').onchange = (e) => {
        document.getElementById('canvas').style.fontFamily = e.target.value;
    };
});

// ... (renderRepository and Cookie helper functions from previous versions) ...
