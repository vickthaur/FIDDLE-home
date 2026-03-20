/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Corrigé avec tes vrais noms de colonnes Supabase
 */

// 1. VRAIES CLÉS SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];

// 🛡️ 2. VÉRIFICATION DE LA CONNEXION AU DÉMARRAGE
async function verifierSession() {
    const { data: { session }, error } = await supabaseApp.auth.getSession();

    if (!session || error) {
        window.location.href = "index.html";
        return;
    }

    const userEmail = session.user.email;
    document.getElementById('displayEmail').innerText = userEmail;
    
    // On force l'ID du restaurant selon ta base de données
    const restoID = "villa_saint_antoine"; 

    document.getElementById('loader').style.display = "none";

    chargerDonnees(restoID);
}

// 📊 3. CHARGEMENT DES DONNÉES RESTAURANT
async function chargerDonnees(restoID) {
    // ⚠️ On interroge "restaurant_origine" comme écrit dans ton Supabase
    const { data, error } = await supabaseApp
        .from('clients')
        .select('*')
        .eq('restaurant_origine', restoID)
        .order('date_inscription', { ascending: false }); // On trie par date d'inscription

    if (error) {
        console.error("Erreur détaillée :", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur : ${error.message}</td></tr>`;
        return;
    }

    dataClients = data || [];
    afficherStatistiques(dataClients);
    afficherTableau(dataClients);
}

// 📈 4. AFFICHAGE DES CHIFFRES
function afficherStatistiques(data) {
    document.getElementById('statTotalClients').innerText = data.length;
    // On met en pause le total des points car il n'est pas dans cette table
    document.getElementById('statTotalPoints').innerText = "-"; 
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré.</td></tr>`;
        return;
    }

    // ⚠️ On utilise "prénom" (avec accent) et "date_inscription"
    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prénom || client.Nom || 'Non renseigné'}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points">Voir Table Points</span></td>
            <td style="color: #6B7280;">${new Date(client.date_inscription).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
        </tr>
    `).join('');
}

// 📥 6. GESTION DU BOUTON EXPORT CSV
document.getElementById('btnExport').addEventListener('click', () => {
    if (dataClients.length === 0) return alert("Rien à exporter.");

    const headers = ["Prenom", "Email", "Date Inscription"];
    const rows = dataClients.map(c => [
        c.prénom || '', 
        c.email, 
        new Date(c.date_inscription).toLocaleDateString('fr-FR')
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Export_FiddleBros_Clients.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
});

// 🚪 7. GESTION DU BOUTON DÉCONNEXION
document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabaseApp.auth.signOut();
    window.location.href = "index.html";
});

// Lancement de la machine
verifierSession();
