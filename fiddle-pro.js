/**
 * 🚀 FYDELIO ENGINE v4.4 - DASHBOARD MULTI-VUES & QR CODE
 * Système B2B dynamique avec support Anniversaires, Points unifiés et Navigation
 */

// ==========================================================================
// ⚙️ 1. CONFIGURATION (Harmonisée avec les Vues SQL)
// ==========================================================================
const FYDELIO_CONFIG = {
    supabase: {
        url: "https://qawfwbppnbnskxlkwstu.supabase.co",
        key: "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ"
    },
    restos: {
        "villa_saint_antoine": { 
            nom: "Villa Saint Antoine", 
            colPoints: "points", 
            vueSql: "vue_clients_villa" 
        },
        "bistrot": { 
            nom: "Le Bistrot Paris", 
            colPoints: "points", 
            vueSql: "vue_clients_bistrot" 
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
            btn.innerHTML = `Vérification...`;
            btn.disabled = true;

            try {
                const { error: authError } = await supabaseApp.auth.signInWithPassword({ email, password: pwd });
                if (authError) throw authError;

                const { data: proData } = await supabaseApp
                    .from('acces_pro')
                    .select('resto_id')
                    .eq('email', email)
                    .single();

                const restoID = proData ? proData.resto_id : "villa_saint_antoine";

                btn.innerHTML = `✓ Connexion réussie`;
                btn.style.background = "#10b981";

                setTimeout(() => {
                    window.location.href = `dashboard-pro.html?resto=${restoID}`;
                }, 800);

            } catch (err) {
                console.error("Erreur login:", err);
                errorMsg.style.display = 'block';
                errorMsg.innerText = "Identifiants incorrects.";
                btn.innerHTML = `Se connecter`;
                btn.disabled = false;
            }
        };
    }
}

// ==========================================================================
// 📊 4. DASHBOARD PRO
// ==========================================================================
async function initialiserDashboard() {
    const loader = document.getElementById('loader');
    const urlParams = new URLSearchParams(window.location.search);
    const restoID = urlParams.get('resto') || "villa_saint_antoine";
    const currentResto = FYDELIO_CONFIG.restos[restoID] || FYDELIO_CONFIG.restos["villa_saint_antoine"];

    try {
        const { data: { session } } = await supabaseApp.auth.getSession();
        if (!session) { window.location.href = "index.html"; return; }

        if (document.getElementById('displayEmail')) document.getElementById('displayEmail').innerText = session.user.email;

        // Appel de la VUE SQL correspondante
        const { data, error } = await supabaseApp
            .from(currentResto.vueSql) 
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        dataClientsGlobal = data || [];
        afficherTableau(dataClientsGlobal, currentResto.colPoints, true);

    } catch (err) {
        console.error("Erreur Dashboard:", err);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5">Erreur de chargement des données.</td></tr>`;
    } finally {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }

    // ==========================================
    // 📱 GÉNÉRATION DYNAMIQUE DU QR CODE
    // ==========================================
    const qrContainer = document.getElementById('qr-code-container');
    const btnDownloadQR = document.getElementById('btnDownloadQR');

    if (qrContainer) {
        // Lien d'inscription personnalisé avec l'App Fydelio
        const lienInscription = `https://app.fydelio.fr/?resto=${restoID}`; 
        
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(lienInscription)}`;
        
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code ${currentResto.nom}" style="width: 150px; height: 150px; border-radius: 8px;">`;

        if (btnDownloadQR) {
            btnDownloadQR.addEventListener('click', async (e) => {
                e.preventDefault();
                const btnOriginalText = btnDownloadQR.innerHTML;
                btnDownloadQR.innerHTML = "Téléchargement en cours...";
                
                try {
                    const response = await fetch(qrUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `QR_Code_${currentResto.nom.replace(/\s+/g, '_')}.png`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                } catch (err) {
                    alert("Erreur lors du téléchargement. Faites un clic droit sur l'image > 'Enregistrer l'image sous'.");
                } finally {
                    btnDownloadQR.innerHTML = btnOriginalText;
                }
            });
        }
    }

    // ==========================================
    // 🧭 NAVIGATION DANS LE DASHBOARD
    // ==========================================
    const navClients = document.getElementById('nav-clients');
    const navQrcodes = document.getElementById('nav-qrcodes');
    const viewClients = document.getElementById('view-clients');
    const viewQrcodes = document.getElementById('view-qrcodes');

    if (navClients && navQrcodes && viewClients && viewQrcodes) {
        // Clic sur "Base Clients"
        navClients.addEventListener('click', (e) => {
            e.preventDefault();
            navClients.classList.add('active');
            navQrcodes.classList.remove('active');
            viewClients.style.display = 'block';
            viewQrcodes.style.display = 'none';
        });

        // Clic sur "Mes QR Codes"
        navQrcodes.addEventListener('click', (e) => {
            e.preventDefault();
            navQrcodes.classList.add('active');
            navClients.classList.remove('active');
            viewQrcodes.style.display = 'block';
            viewClients.style.display = 'none';
        });
    }

    // Barre de recherche
    const searchInput = document.getElementById('searchClient');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const terme = e.target.value.toLowerCase();
            const resultats = dataClientsGlobal.filter(c => 
                (c.prenom && c.prenom.toLowerCase().includes(terme)) || 
                (c.nom && c.nom.toLowerCase().includes(terme)) || 
                (c.email && c.email.toLowerCase().includes(terme))
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

// ==========================================================================
// 🛠️ 5. FONCTIONS DE RENDU (Affichage & CSV)
// ==========================================================================

function afficherTableau(data, colPoints, updateStats = true) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;

    if (updateStats) {
        if (document.getElementById('statTotalClients')) document.getElementById('statTotalClients').innerText = data.length;
        if (document.getElementById('statTotalPoints')) {
            const total = data.reduce((acc, c) => acc + (parseInt(c[colPoints]) || 0), 0);
            document.getElementById('statTotalPoints').innerText = total;
        }
    }

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="empty-state">Aucun client trouvé.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(c => `
        <tr>
            <td style="font-weight: 600;">${c.prenom || ''} ${c.nom || ''}</td>
            <td>${c.email || 'N/A'}</td>
            <td>${c.date_anniversaire || '-'}</td>
            <td><span class="badge-points">${c[colPoints] || 0} pts</span></td>
            <td style="color:#6B7280;">${new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
        </tr>
    `).join('');
}

function exporterCSV(restoConfig) {
    if (dataClientsGlobal.length === 0) return alert("Rien à exporter.");
    
    // Titres des colonnes
    const headers = ["Prenom", "Nom", "Email", "Telephone", "Anniversaire", "Points", "Date Inscription"];
    
    // Construction des lignes
    const rows = dataClientsGlobal.map(c => [
        `"${c.prenom || ''}"`, 
        `"${c.nom || ''}"`, 
        `"${c.email || ''}"`, 
        `"${c.telephone || ''}"`, 
        `"${c.date_anniversaire || ''}"`, 
        c[restoConfig.colPoints] || 0, // Utilise colPoints ("points") dynamiquement
        `"${new Date(c.created_at).toLocaleDateString('fr-FR')}"`
    ]);

    // Encodage avec BOM (\ufeff) pour Excel
    const csvContent = "\ufeff" + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Export_FYDELIO_${restoConfig.nom.replace(/\s+/g, '_')}.csv`;
    link.click();
}
