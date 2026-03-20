/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Corrigé pour la table unique 'clients'
 */

// 1. CONNEXION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];

// --- CONFIGURATION DYNAMIQUE ---
const urlParams = new URLSearchParams(window.location.search);
const restoID = urlParams.get('resto') || "villa_saint_antoine"; 
// On définit la colonne de points selon le resto dans l'URL
const pointsColumn = (restoID === "bistrot") ? "points_bistrot" : "points_villa";

// 🛡️ 2. VÉRIFICATION DE LA SESSION
async function verifierSession() {
    try {
        const { data: { session }, error } = await supabaseApp.auth.getSession();

        if (!session || error) {
            window.location.href = "index.html";
            return;
        }

        const emailEl = document.getElementById('displayEmail');
        if (emailEl) emailEl.innerText = session.user.email;
        
        chargerDonnees(restoID);
    } catch (e) {
        console.error("Erreur session:", e);
        arreterLoader();
    }
}

// 📊 3. CHARGEMENT DES DONNÉES
async function chargerDonnees(id) {
    try {
        const { data, error } = await supabaseApp
            .from('clients')
            .select('*')
            .eq('restaurant_origine', id)
            .order('created_at', { ascending: false }); 

        if (error) throw error;

        dataClients = data || [];
        afficherStatistiques(dataClients);
        afficherTableau(dataClients);
    } catch (error) {
        console.error("Erreur de chargement :", error);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur base de données.</td></tr>`;
    } finally {
        arreterLoader();
    }
}

// Fonction pour arrêter le "moulinage"
function arreterLoader() {
    const loader = document.getElementById('loader') || document.querySelector('.loader-container') || document.querySelector('.loading-overlay');
    if (loader) loader.style.display = "none";
}

// 📈 4. STATISTIQUES
function afficherStatistiques(data) {
    const totalEl = document.getElementById('statTotalClients');
    const pointsEl = document.getElementById('statTotalPoints');
    
    if (totalEl) totalEl.innerText = data.length;
    
    if (pointsEl) {
        const totalPoints = data.reduce((acc, client) => acc + (client[pointsColumn] || 0), 0);
        pointsEl.innerText = totalPoints; 
    }
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prenom || 'Client'} ${client.nom || ''}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points" style="background:#10b981; color:white; padding:4px 10px; border-radius:8px; font-weight:bold;">
                ${client[pointsColumn] || 0} pts
            </span></td>
            <td style="color: #6B7280;">
                ${new Date(client.created_at).toLocaleDateString('fr-FR')}
            </td>
        </tr>
    `).join('');
}

// 📥 6. EXPORT CSV
const btnExport = document.getElementById('btnExport');
if (btnExport) {
    btnExport.addEventListener('click', () => {
        if (dataClients.length === 0) return alert("Rien à exporter.");
        const headers = ["Prenom", "Nom", "Email", "Points", "Date"];
        const rows = dataClients.map(c => [c.prenom || '', c.nom || '', c.email, c[pointsColumn] || 0, new Date(c.created_at).toLocaleDateString()]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Export_${restoID}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}

// 🚪 7. DÉCONNEXION
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
        await supabaseApp.auth.signOut();
        window.location.href = "index.html";
    });
}

verifierSession();
