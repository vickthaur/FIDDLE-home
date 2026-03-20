/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Gère l'affichage dynamique des clients et des points
 */

// 1. CONNEXION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];

// Récupération de l'ID du restaurant dans l'URL (ex: ?resto=bistrot)
const urlParams = new URLSearchParams(window.location.search);
const restoID = urlParams.get('resto') || "villa_saint_antoine"; 

// Définition de la colonne de points à lire (points_bistrot ou points_villa)
const pointsCol = (restoID === "bistrot") ? "points_bistrot" : "points_villa";

// 🛡️ 2. VÉRIFICATION DE LA SESSION (Sécurité)
async function verifierSession() {
    try {
        const { data: { session }, error } = await supabaseApp.auth.getSession();

        if (!session || error) {
            console.log("Session expirée ou inexistante.");
            window.location.href = "index.html";
            return;
        }

        // Affichage de l'email du pro connecté
        const emailDisplay = document.getElementById('displayEmail');
        if (emailDisplay) emailDisplay.innerText = session.user.email;
        
        // On lance le chargement des données
        await chargerDonnees(restoID);

    } catch (e) {
        console.error("Erreur critique session:", e);
        arreterLoader(); // Sécurité pour ne pas mouliner
    }
}

// 📊 3. CHARGEMENT DES DONNÉES DEPUIS SUPABASE
async function chargerDonnees(id) {
    try {
        // On récupère tout de la table 'clients' pour ce resto précis
        const { data, error } = await supabaseApp
            .from('clients')
            .select('*')
            .eq('restaurant_origine', id)
            .order('created_at', { ascending: false }); 

        if (error) throw error;

        dataClients = data || [];
        
        // Mise à jour des chiffres et du tableau
        afficherStatistiques(dataClients);
        afficherTableau(dataClients);

    } catch (err) {
        console.error("Erreur de chargement des données:", err);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: #EF4444; padding: 20px;">Erreur base de données. Vérifiez votre connexion.</td></tr>`;
    } finally {
        // 🛑 ARRÊT DU MOULINAGE : Indispensable pour enlever l'écran blanc
        arreterLoader();
    }
}

// 📉 4. CALCUL DES STATISTIQUES (Points et Total)
function afficherStatistiques(data) {
    const statTotal = document.getElementById('statTotalClients');
    const statPoints = document.getElementById('statTotalPoints');

    if (statTotal) statTotal.innerText = data.length;
    
    if (statPoints) {
        // On additionne dynamiquement la colonne de points correspondante (villa ou bistrot)
        const total = data.reduce((acc, c) => acc + (c[pointsCol] || 0), 0);
        statPoints.innerText = total; 
    }
}

// 📋 5. GÉNÉRATION DU TABLEAU DES CONTACTS
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré pour cet établissement.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600; color: #111827;">${client.prenom || ''} ${client.nom || ''}</td>
            <td style="color: #4B5563;">${client.email}</td>
            <td><span class="badge-points">
                ${client[pointsCol] || 0} pts
            </span></td>
            <td style="color: #6B7280;">
                ${new Date(client.created_at).toLocaleDateString('fr-FR')}
            </td>
        </tr>
    `).join('');
}

// 🔄 Fonction utilitaire pour masquer l'écran de chargement
function arreterLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = "none";
}

// 📥 6. EXPORT CSV (RGPD)
const btnExport = document.getElementById('btnExport');
if (btnExport) {
    btnExport.addEventListener('click', () => {
        if (dataClients.length === 0) return alert("Rien à exporter.");

        const headers = ["Prenom", "Nom", "Email", "Telephone", "Points", "Date"];
        const rows = dataClients.map(c => [
            c.prenom || '', 
            c.nom || '',
            c.email, 
            c.telephone || '',
            c[pointsCol] || 0,
            new Date(c.created_at).toLocaleDateString('fr-FR')
        ]);
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `Export_Clients_${restoID}.csv`);
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

// Lancement automatique au chargement
verifierSession();
