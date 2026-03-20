/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Corrigé pour la table unique 'clients'
 */

// 1. CONNEXION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];
const restoID = "villa_saint_antoine"; // ID du restaurant pour ce dashboard

// 🛡️ 2. VÉRIFICATION DE LA SESSION
async function verifierSession() {
    const { data: { session }, error } = await supabaseApp.auth.getSession();

    if (!session || error) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('displayEmail').innerText = session.user.email;
    chargerDonnees(restoID);
}

// 📊 3. CHARGEMENT DES DONNÉES
async function chargerDonnees(id) {
    // On utilise 'created_at' car 'date_inscription' n'existe pas dans ta table
    const { data, error } = await supabaseApp
        .from('clients')
        .select('*')
        .eq('restaurant_origine', id)
        .order('created_at', { ascending: false }); 

    if (error) {
        console.error("Erreur détaillée :", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur : ${error.message}</td></tr>`;
        return;
    }

    dataClients = data || [];/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Corrigé pour la table unique 'clients'
 */

// 1. CONNEXION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];

// --- CONFIGURATION À CHANGER POUR CHAQUE DUPLICATION ---
const restoID = "villa_saint_antoine"; // L'identifiant dans 'restaurant_origine'
const pointsColumn = "points_villa";    // Le nom de la colonne de points (ex: points_bistrot)
// -------------------------------------------------------

// 🛡️ 2. VÉRIFICATION DE LA SESSION
async function verifierSession() {
    const { data: { session }, error } = await supabaseApp.auth.getSession();

    if (!session || error) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById('displayEmail').innerText = session.user.email;
    chargerDonnees(restoID);
}

// 📊 3. CHARGEMENT DES DONNÉES
async function chargerDonnees(id) {
    const { data, error } = await supabaseApp
        .from('clients')
        .select('*')
        .eq('restaurant_origine', id)
        .order('created_at', { ascending: false }); 

    if (error) {
        console.error("Erreur détaillée :", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur : ${error.message}</td></tr>`;
        return;
    }

    dataClients = data || [];
    afficherStatistiques(dataClients);
    afficherTableau(dataClients);
}

// 📈 4. STATISTIQUES
function afficherStatistiques(data) {
    document.getElementById('statTotalClients').innerText = data.length;
    
    // Correction : On utilise la variable pointsColumn pour le calcul
    const totalPoints = data.reduce((acc, client) => acc + (client[pointsColumn] || 0), 0);
    document.getElementById('statTotalPoints').innerText = totalPoints; 
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prenom || 'Client'} ${client.nom || ''}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points" style="background:#c5a059; color:white; padding:4px 10px; border-radius:8px; font-weight:bold;">
                ${client[pointsColumn] || 0} pts
            </span></td>
            <td style="color: #6B7280;">
                ${new Date(client.created_at).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})}
            </td>
        </tr>
    `).join('');
}

// 📥 6. EXPORT CSV
document.getElementById('btnExport').addEventListener('click', () => {
    if (dataClients.length === 0) return alert("Rien à exporter.");

    const headers = ["Prenom", "Nom", "Email", "Points", "Date Inscription"];
    const rows = dataClients.map(c => [
        c.prenom || '', 
        c.nom || '',
        c.email, 
        c[pointsColumn] || 0,
        new Date(c.created_at).toLocaleDateString('fr-FR')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_Fiddle_${restoID}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
});

// 🚪 7. DÉCONNEXION
document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabaseApp.auth.signOut();
    window.location.href = "index.html";
});

verifierSession();
    afficherStatistiques(dataClients);
    afficherTableau(dataClients);
}

// 📈 4. STATISTIQUES (Calcul des points cumulés)
function afficherStatistiques(data) {
    document.getElementById('statTotalClients').innerText = data.length;
    
    // On additionne les points de la colonne correspondante (points_villa)
    const totalPoints = data.reduce((acc, client) => acc + (client.points_villa || 0), 0);
    document.getElementById('statTotalPoints').innerText = totalPoints; 
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prenom || 'Client'} ${client.nom || ''}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points" style="background:#c5a059; color:white; padding:4px 10px; border-radius:8px; font-weight:bold;">
                ${client.points_villa || 0} pts
            </span></td>
            <td style="color: #6B7280;">
                ${new Date(client.created_at).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})}
            </td>
        </tr>
    `).join('');
}

// 📥 6. EXPORT CSV
document.getElementById('btnExport').addEventListener('click', () => {
    if (dataClients.length === 0) return alert("Rien à exporter.");

    const headers = ["Prenom", "Nom", "Email", "Points Villa", "Date Inscription"];
    const rows = dataClients.map(c => [
        c.prenom || '', 
        c.nom || '',
        c.email, 
        c.points_villa || 0,
        new Date(c.created_at).toLocaleDateString('fr-FR')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_Fiddle_${restoID}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
});

// 🚪 7. DÉCONNEXION
document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabaseApp.auth.signOut();
    window.location.href = "index.html";
});

verifierSession();
