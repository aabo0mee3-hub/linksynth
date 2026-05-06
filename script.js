const SUPABASE_URL = 'https://wfpypnlekruafggvhlui.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmcHlwbmxla3J1YWZnZ3ZobHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDM0MDAsImV4cCI6MjA5MTY3OTQwMH0.KNnMeN05j7Weo-qWbUHjGmHAT7muAHw8i1qytZ5c7-A';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth Elements
const authOverlay = document.getElementById('auth-overlay');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('user-display');

// 1. Monitor Auth State
sb.auth.onAuthStateChange((event, session) => {
    if (session) {
        authOverlay.style.display = 'none';
        logoutBtn.style.display = 'block';
        userDisplay.innerText = `User: ${session.user.email}`;
        loadUserData(session.user.id);
    } else {
        authOverlay.style.display = 'flex';
        logoutBtn.style.display = 'none';
        userDisplay.innerText = "Logged Out";
    }
});

// 2. Login/Register Logic
loginBtn.onclick = async () => {
    const { error } = await sb.auth.signInWithPassword({
        email: document.getElementById('auth-email').value,
        password: document.getElementById('auth-password').value,
    });
    if (error) alert(error.message);
};

registerBtn.onclick = async () => {
    const { error } = await sb.auth.signUp({
        email: document.getElementById('auth-email').value,
        password: document.getElementById('auth-password').value,
    });
    if (error) alert("Check your email for confirmation!");
};

logoutBtn.onclick = () => sb.auth.signOut();

// 3. Database Interaction
async function loadUserData(userId) {
    const { data } = await sb.from('links').select('*').eq('user_id', userId);
    if (data) renderCanvas(data);
}

document.getElementById('addBtn').onclick = async () => {
    const user = (await sb.auth.getUser()).data.user;
    const entry = { 
        user_id: user.id, 
        url: document.getElementById('linkInput').value, 
        type: document.getElementById('assetType').value 
    };
    
    await sb.from('links').insert([entry]);
    loadUserData(user.id);
};
