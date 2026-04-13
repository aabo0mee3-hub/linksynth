// Supabase Configuration (Placeholders)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
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
