/**
 * 🚀 FYDELIO ENGINE v4.1 - MULTI-RESTO OPTIMISÉ
 * Utilise les Vues SQL pour afficher tous les clients actifs par établissement
 */

// ==========================================================================
// ⚙️ 1. CONFIGURATION (Mise à jour avec les Vues SQL)
// ==========================================================================
const FYDELIO_CONFIG = {
    supabase: {
        url: "https://qawfwbppnbnskxlkwstu.supabase.co",
        key: "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ"
    },
    restos: {
        "villa_saint_antoine": { 
            nom: "Villa Saint Antoine", 
            colPoints: "points_villa",
            vueSql: "vue_clients_villa" // Appelle la vue SQL créée précédemment
        },
        "bistrot": { 
            nom: "Le Bistrot Paris", 
            colPoints: "points_bistrot",
            vueSql: "vue_clients_bistrot" // Appelle la vue SQL créée précédemment
        }
    }
};

const supabaseApp = window.supabase.createClient(FYDELIO_CONFIG.supabase.url, FYDELIO_CONFIG.supabase.key);
let dataClientsGlobal = []; 

// ==========================================================================
// 🧭 2. ROUTEUR INTELLIGENT
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('loginForm')) initialiserPageAccueil();
    if (document.getElementById('tableBody')) initialiserDashboard();
});

// ==========================================================================
// 🔐 3. PAGE D'ACCUEIL (Connexion & Annuaire)
// ==========================================================================
function initialiserPageAccueil() {
    const modal = document.getElementById('loginModal');
    const btnOpen = document.getElementById('btnOpenModal');
    const btnClose = document.getElementById('btnCloseModal');
    const loginForm = document.getElementById('loginForm');

    if (btnOpen) btnOpen.onclick = () => { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); };
    if (btnClose) btnClose.onclick = () => { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); };
    window.onclick = (e) => { if (e.target === modal) { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); } };

    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitLogin');
            const email = document.getElementById('restoEmail').value.trim().toLowerCase();
            const pwd = document.getElementById('restoPwd').value;
            const errorMsg = document.getElementById('loginError');

            errorMsg.style.display = 'none';
            btn.innerHTML = `<span class="btn-spinner" style="display:inline-block;"></span> Vérification...`;
            btn.disabled = true;

            try {
                // 1. Connexion de l'utilisateur
                const { error: authError } = await supabaseApp.auth.signInWithPassword({ email, password: pwd });
                if (authError) throw authError;

                btn.innerHTML = `<span class="btn-spinner" style="display:inline-block;"></span> Recherche du restaurant...`;

                // 2. Interrogation de la table acces_pro
                const { data: proData, error: dbError } = await supabaseApp
                    .from('acces_pro')
                    .select('resto_id')
                    .eq('email', email)
                    .single();

                // On récupère le resto, ou on met la villa par défaut si tu as oublié de le rajouter dans l'annuaire
                const restoID = proData ? proData.resto_id : "villa_saint_antoine";

                btn.innerHTML = `✓ Connexion réussie`;
                btn.style.background = "#10b981";

                // 3. Redirection vers le dashboard
                setTimeout(() => {
                    window.location.href = `dashboard-pro.html?resto=${restoID}`;
                }, 800);

            } catch (err) {
                console.error("Erreur de connexion :", err);
                errorMsg.style.display = 'block';
                errorMsg.innerText = "Identifiants incorrects ou accès refusé.";
                btn.innerHTML = `<span class="btn-text">Se connecter au Dashboard</span>`;
                btn.disabled = false;
            }
        };
    }
}

// ==========================================================================
// 📊 4. DASHBOARD PRO (Version "Vue Dynamique")
// ==========================================================================
async function initialiserDashboard() {
    const loader = document.getElementById('loader');
    const urlParams = new URLSearchParams(window.location.search);
    const restoID = urlParams.get('resto') || "villa_saint_antoine";
    const currentResto = FYDELIO_CONFIG.restos[restoID] || FYDELIO_CONFIG.restos["villa_saint_antoine"];

    try {
        const { data: { session }, error: sessionError } = await supabaseApp.auth.getSession();
        if (sessionError || !session) { window.location.href = "index.html"; return; }

        if (document.getElementById('displayEmail')) document.getElementById('displayEmail').innerText = session.user.email;

        // 🔥 MODIFICATION ICI : On appelle la VUE au lieu de la table 'clients'
        // On ne met PLUS de filtre .eq('restaurant_origine'), car la vue s'occupe
        // de ne montrer que les gens qui ont des points dans CE resto.
        const { data, error } = await supabaseApp
            .from(currentResto.vueSql) 
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        dataClientsGlobal = data || [];
        
        // On affiche. Note: dans la vue, la colonne de points s'appelle toujours "points"
        // car on l'a renommée en SQL (AS points) pour simplifier.
        afficherTableau(dataClientsGlobal, "points", true);

    } catch (err) {
        console.error("Erreur Dashboard:", err);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color:#EF4444;">Erreur base de données.</td></tr>`;
    } finally {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }
    // Barre de recherche
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const terme = e.target.value.toLowerCase();
            const resultats = dataClientsGlobal.filter(c => 
                (c.prenom && c.prenom.toLowerCase().includes(terme)) || 
                (c.nom && c.nom.toLowerCase().includes(terme)) || 
                (c.email && c.email.toLowerCase().includes(terme)) ||
                (c.telephone && c.telephone.includes(terme))
            );
            afficherTableau(resultats, currentResto.colPoints, false); 
        });
    }

    // Export CSV
    const btnExport = document.getElementById('btnExport');
    if (btnExport) btnExport.addEventListener('click', () => exporterCSV(currentResto));

    // Déconnexion
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await supabaseApp.auth.signOut();
            window.location.href = "index.html";
        });
    }
}

// Gère l'affichage du tableau
function afficherTableau(data, colPoints, updateStats = true) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (updateStats) {
        if (document.getElementById('statTotalClients')) document.getElementById('statTotalClients').innerText = data.length;
        if (document.getElementById('statTotalPoints')) document.getElementById('statTotalPoints').innerText = data.reduce((acc, c) => acc + (c[colPoints] || 0), 0);
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Aucun client trouvé.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(c => `
        <tr>
            <td style="font-weight: 600;">${c.prenom || ''} ${c.nom || ''}</td>
            <td>${c.email || 'N/A'}</td>
            <td><span class="badge-points">${c[colPoints] || 0} pts</span></td>
            <td style="color:#6B7280;">${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
        </tr>
    `).join('');
}

// Gère l'export CSV
function exporterCSV(restoConfig) {
    if (dataClientsGlobal.length === 0) return alert("Rien à exporter.");
    const headers = ["Prenom", "Nom", "Email", "Telephone", "Points", "Date Inscription"];
    const rows = dataClientsGlobal.map(c => [
        `"${c.prenom || ''}"`, `"${c.nom || ''}"`, `"${c.email || ''}"`, `"${c.telephone || ''}"`, c[restoConfig.colPoints] || 0, `"${new Date(c.created_at).toLocaleDateString('fr-FR')}"`
    ]);
    const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Export_FYDELIO_${restoConfig.nom.replace(/\s+/g, '_')}.csv`;
    link.click();
}
