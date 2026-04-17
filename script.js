const SB_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SB_KEY = 'YOUR_ACTUAL_KEY';
const GIPHY_KEY = 'dc6zaTOxFJmzC';

let client, repoItems = [], activeEl = null;

document.addEventListener('DOMContentLoaded', async () => {
    client = window.supabase.createClient(SB_URL, SB_KEY);

    // 1. COOKIE PERSISTENCE: Load session links
    const saved = getCookie("repo_session");
    if (saved) { repoItems = JSON.parse(saved); renderRepo(); }

    // 2. TEXT BOX CREATOR
    document.getElementById('addTextBtn').onclick = () => {
        const val = document.getElementById('textInput').value || "Edit Me";
        spawnDraggable(val, 'text');
        document.getElementById('textInput').value = "";
    };

    // 3. EXPORT TOOL
    document.getElementById('exportBtn').onclick = () => {
        const canvas = document.getElementById('canvas');
        let css = `/* Exported Styles */\n.canvas {\n  background: ${canvas.style.backgroundColor};\n  font-family: ${canvas.style.fontFamily};\n}\n`;
        document.querySelectorAll('.draggable-asset').forEach((el, i) => {
            css += `.item-${i} { position: absolute; left: ${el.style.left}; top: ${el.style.top}; }\n`;
        });
        document.getElementById('codeOutput').value = css;
        document.getElementById('exportModal').style.display = 'flex';
    };

    // 4. SUPABASE & SAVE LOGIC
    document.getElementById('addBtn').onclick = async () => {
        let url = document.getElementById('linkInput').value;
        const type = document.getElementById('assetType').value;
        if (!url.startsWith('http')) url = 'https://' + url;

        const entry = { url, type };
        repoItems.push(entry);
        setCookie("repo_session", JSON.stringify(repoItems), 30);
        renderRepo();
        await client.from('Links').insert([entry]);
    };

    // HELPER: Spawn Items
    function spawnDraggable(content, kind) {
        const el = document.createElement(kind === 'img' ? 'img' : 'div');
        if(kind === 'img') el.src = content; else { el.innerText = content; el.contentEditable = true; el.className += ' draggable-text'; }
        el.className += ' draggable-asset';
        el.style.left = '50px'; el.style.top = '50px';
        el.onmousedown = () => activeEl = el;
        document.getElementById('canvas').appendChild(el);
    }

    // GIPHY & DRAG Logic... (Include mousemove logic from previous versions)
    document.onmousemove = (e) => {
        if (!activeEl) return;
        const rect = document.getElementById('canvas').getBoundingClientRect();
        activeEl.style.left = (e.clientX - rect.left - 20) + 'px';
        activeEl.style.top = (e.clientY - rect.top - 20) + 'px';
    };
    document.onmouseup = () => activeEl = null;
    document.getElementById('closeModal').onclick = () => document.getElementById('exportModal').style.display = 'none';
});

// COOKIE HELPERS
function setCookie(n,v,d){const date=new Date();date.setTime(date.getTime()+(d*24*60*60*1000));document.cookie=`${n}=${v};expires=${date.toUTCString()};path=/`;}
function getCookie(n){const name=`${n}=`;const ca=document.cookie.split(';');for(let i=0;i<ca.length;i++){let c=ca[i];while(c.charAt(0)==' ')c=c.substring(1);if(c.indexOf(name)==0)return c.substring(name.length,c.length);}return "";}
function renderRepo(){document.getElementById('linkList').innerHTML = repoItems.map(i => `<div class="link-card"><strong>${i.type}</strong><br>${i.url.slice(0,15)}...</div>`).join('');}
