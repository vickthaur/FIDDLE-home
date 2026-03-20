/**
 * 🚀 FIDDLE ENGINE v2.0 - SYSTÈME B2B UNIFIÉ
 * Logique complète : Auth, Base de données, Dashboard, Recherche & Export
 */

// ==========================================
// 1. CONFIGURATION (Pour ajouter tes futurs clients)
// ==========================================
const FIDDLE_CONFIG = {
    supabase: {
        url: "https://qawfwbppnbnskxlkwstu.supabase.co",
        key: "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ"
    },
    // Le dictionnaire de tes clients. Pour en ajouter un, copie-colle une ligne.
    restos: {
        "bistrot": { nom: "Le Bistrot Paris", colPoints: "points_bistrot" },
        "villa_saint_antoine": { nom: "Villa Saint Antoine", colPoints: "points_villa" }
    }
};

// INITIALISATION DE SUPABASE
const supabaseApp = window.supabase.createClient(FIDDLE_CONFIG.supabase.url, FIDDLE_CONFIG.supabase.key);
let dataClientsGlobal = []; // Garde les clients en mémoire pour la recherche rapide

// ==========================================
// 2. ROUTEUR INTELLIGENT (Savoir sur quelle page on est)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Si on trouve le formulaire de login, on est sur la page d'accueil
    if (document.getElementById('loginForm')) {
        initialiserPageAccueil();
    }
    
    // Si on trouve le tableau, on est sur le Dashboard
    if (document.getElementById('tableBody')) {
        initialiserDashboard();
    }
});

// ==========================================
// 3. LOGIQUE PAGE D'ACCUEIL (Modale & Connexion)
// ==========================================
function initialiserPageAccueil() {
    const modal = document.getElementById('loginModal');
    const btnOpen = document.getElementById('btnOpenModal');
    const btnClose = document.getElementById('btnCloseModal');
    const loginForm = document.getElementById('loginForm');

    // Ouverture / Fermeture de la modale
    if (btnOpen) btnOpen.onclick = () => { modal.classList.add('active'); };
    if (btnClose) btnClose.onclick = () => { modal.classList.remove('active'); };
    window.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

    // Soumission du formulaire de connexion
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSubmitLogin');
            const btnText = btn.querySelector('.btn-text');
            const email = document.getElementById('restoEmail').value.trim().toLowerCase();
            const pwd = document.getElementById('restoPwd').value;
            const errorMsg = document.getElementById('loginError');

            // État de chargement
            errorMsg.style.display = 'none';
            btn.classList.add('loading');
            btnText.innerText = "Vérification...";
            btn.disabled = true;

            try {
                // Requête Supabase
                const { data, error } = await supabaseApp.auth.signInWithPassword({ email, password: pwd });

                if (error) throw error;

                // Succès : Détection du resto et redirection
                btnText.innerText = "Connexion réussie !";
                btn.style.background = "#10b981";
                
                let restoID = "villa_saint_antoine"; // Par défaut
                if (email.includes("bistrot")) restoID = "bistrot";
                
                setTimeout(() => {
                    window.location.href = `dashboard-pro.html?resto=${restoID}`;
                }, 800);

            } catch (err) {
                // Échec
                errorMsg.style.display = 'block';
                btnText.innerText = "Se connecter au Dashboard";
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        };
    }
}

// ==========================================
// 4. LOGIQUE DASHBOARD PRO (Données & Affichage)
// ==========================================
async function initialiserDashboard() {
    const loader = document.getElementById('loader');
    
    // 4.1 Identification du restaurant via l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const restoID = urlParams.get('resto') || "villa_saint_antoine";
    const currentResto = FIDDLE_CONFIG.restos[restoID] || FIDDLE_CONFIG.restos["villa_saint_antoine"];

    try {
        // 4.2 Vérification de la session
        const { data: { session }, error: sessionError } = await supabaseApp.auth.getSession();
        if (sessionError || !session) {
            window.location.href = "index.html";
            return;
        }

        // Afficher l'email du pro connecté
        const emailDisplay = document.getElementById('displayEmail');
        if (emailDisplay) emailDisplay.innerText = session.user.email;

        // 4.3 Récupération des données clients
        const { data, error } = await supabaseApp
            .from('clients')
            .select('*')
            .eq('restaurant_origine', restoID)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        dataClientsGlobal = data || [];
        afficherTableau(dataClientsGlobal, currentResto.colPoints, true);

    } catch (err) {
        console.error("Erreur Dashboard:", err);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color: #EF4444;">Erreur de chargement de la base de données.</td></tr>`;
    } finally {
        // 🛑 ARRÊT DU MOULINAGE GARANTI
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }

    // 4.4 Écouteur pour la barre de recherche
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const terme = e.target.value.toLowerCase();
            const resultats = dataClientsGlobal.filter(c => 
                (c.prenom && c.prenom.toLowerCase().includes(terme)) || 
                (c.nom && c.nom.toLowerCase().includes(terme)) || 
                (c.email && c.email.toLowerCase().includes(terme))
            );
            afficherTableau(resultats, currentResto.colPoints, false); // false = on ne change pas les stats globales
        });
    }

    // 4.5 Écouteur pour l'Export CSV
    const btnExport = document.getElementById('btnExport');
    if (btnExport) {
        btnExport.addEventListener('click', () => exporterCSV(currentResto));
    }

    // 4.6 Écouteur pour la Déconnexion
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await supabaseApp.auth.signOut();
            window.location.href = "index.html";
        });
    }
}

// ==========================================
// 5. FONCTIONS UTILITAIRES
// ==========================================

// Gère l'affichage des lignes du tableau et la mise à jour des statistiques
function afficherTableau(data, colPoints, updateStats = true) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    // Mise à jour des compteurs en haut de page
    if (updateStats) {
        const statClients = document.getElementById('statTotalClients');
        const statPoints = document.getElementById('statTotalPoints');
        
        if (statClients) statClients.innerText = data.length;
        if (statPoints) {
            const total = data.reduce((acc, c) => acc + (c[colPoints] || 0), 0);
            statPoints.innerText = total;
        }
    }

    // Si aucun client
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Aucun client trouvé.</td></tr>`;
        return;
    }

    // Remplissage dynamique
    tbody.innerHTML = data.map(c => `
        <tr>
            <td style="font-weight: 600;">${c.prenom || ''} ${c.nom || ''}</td>
            <td>${c.email || 'N/A'}</td>
            <td><span class="badge-points">${c[colPoints] || 0} pts</span></td>
            <td>${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
        </tr>
    `).join('');
}

// Génère et télécharge le fichier CSV
function exporterCSV(restoConfig) {
    if (dataClientsGlobal.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }

    const headers = ["Prenom", "Nom", "Email", "Telephone", "Points", "Date Inscription"];
    const rows = dataClientsGlobal.map(c => [
        `"${c.prenom || ''}"`, 
        `"${c.nom || ''}"`, 
        `"${c.email || ''}"`, 
        `"${c.telephone || ''}"`, 
        c[restoConfig.colPoints] || 0, 
        `"${new Date(c.created_at).toLocaleDateString('fr-FR')}"`
    ]);

    const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Export_Clients_${restoConfig.nom.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
