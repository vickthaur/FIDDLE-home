/**
 * 🚀 FIDDLE ENGINE - SOLUTION B2B TOUT-EN-UN
 * Gère : Auth, Multi-Resto, Dashboard, Stats, Export & Recherche
 */

// 1. CONFIGURATION GLOBALE
const CONFIG = {
    supabase: {
        url: "https://qawfwbppnbnskxlkwstu.supabase.co",
        key: "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ"
    },
    restos: {
        "bistrot": { nom: "Le Bistrot Paris", col: "points_bistrot" },
        "villa_saint_antoine": { nom: "Villa Saint Antoine", col: "points_villa" }
    }
};

// INITIALISATION
const supabaseApp = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.key);
let dataClients = []; // Stockage global pour la recherche et l'export

// ==========================================
// 🔑 SECTION A : AUTHENTIFICATION (LOGIN)
// ==========================================

function initLogin() {
    const modal = document.getElementById('loginModal');
    const btnOpen = document.getElementById('btnOpenModal');
    const btnClose = document.getElementById('btnCloseModal');
    const loginForm = document.getElementById('loginForm');

    if (btnOpen) btnOpen.onclick = () => { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); };
    if (btnClose) btnClose.onclick = () => { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); };
    
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitLogin');
            const email = document.getElementById('restoEmail').value.trim();
            const pwd = document.getElementById('restoPwd').value;

            btn.innerText = "Vérification...";
            btn.disabled = true;

            const { data, error } = await supabaseApp.auth.signInWithPassword({ email, password: pwd });

            if (error) {
                document.getElementById('loginError').style.display = 'block';
                btn.innerText = "Se connecter";
                btn.disabled = false;
            } else {
                // REDIRECTION INTELLIGENTE
                const id = email.toLowerCase().includes("bistrot") ? "bistrot" : "villa_saint_antoine";
                window.location.href = `dashboard-pro.html?resto=${id}`;
            }
        };
    }
}

// ==========================================
// 📊 SECTION B : DASHBOARD (DONNÉES)
// ==========================================

async function initDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const restoID = urlParams.get('resto') || "villa_saint_antoine";
    const restoConfig = CONFIG.restos[restoID] || CONFIG.restos["villa_saint_antoine"];

    // 1. Vérifier Session
    const { data: { session } } = await supabaseApp.auth.getSession();
    if (!session) { window.location.href = "index.html"; return; }

    if (document.getElementById('displayEmail')) document.getElementById('displayEmail').innerText = session.user.email;

    // 2. Charger Données
    try {
        const { data, error } = await supabaseApp
            .from('clients')
            .select('*')
            .eq('restaurant_origine', restoID)
            .order('created_at', { ascending: false });

        if (error) throw error;
        dataClients = data || [];

        renderDashboard(dataClients, restoConfig.col);

    } catch (err) {
        console.error("Erreur Engine:", err);
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = "none";
    }

    // 3. BARRE DE RECHERCHE (Le truc "plus loin" que tu voulais)
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = dataClients.filter(c => 
                (c.prenom + ' ' + c.nom).toLowerCase().includes(val) || c.email.toLowerCase().includes(val)
            );
            renderDashboard(filtered, restoConfig.col, false); // false = ne pas recalculer les stats
        };
    }
}

// FONCTION DE RENDU (Tableau + Stats)
function renderDashboard(data, colPoints, updateStats = true) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (updateStats) {
        document.getElementById('statTotalClients').innerText = data.length;
        const total = data.reduce((acc, c) => acc + (c[colPoints] || 0), 0);
        document.getElementById('statTotalPoints').innerText = total;
    }

    tbody.innerHTML = data.map(c => `
        <tr>
            <td style="font-weight:600;">${c.prenom || ''} ${c.nom || ''}</td>
            <td>${c.email}</td>
            <td><span class="badge-points">${c[colPoints] || 0} pts</span></td>
            <td>${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
        </tr>
    `).join('');
}

// ==========================================
// 🚀 SECTION C : INITIALISATION GÉNÉRALE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Si on est sur la page index/login
    if (document.getElementById('loginForm')) initLogin();
    
    // Si on est sur le dashboard
    if (document.getElementById('tableBody')) initDashboard();

    // Bouton Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.onclick = async () => { await supabaseApp.auth.signOut(); window.location.href = "index.html"; };

    // Bouton Export
    const btnExport = document.getElementById('btnExport');
    if (btnExport) btnExport.onclick = () => {
        if (dataClients.length === 0) return;
        const csv = ["Prenom,Email,Points", ...dataClients.map(c => `${c.prenom},${c.email},0`)].join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `clients_fiddle.csv`; a.click();
    };
});
