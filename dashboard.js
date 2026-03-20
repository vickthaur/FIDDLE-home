/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Gère la vérification de session, l'affichage et l'export des données
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
        // Pas de badge de sécurité = retour à l'accueil direct
        window.location.href = "index.html";
        return;
    }

    // Si c'est bon, on affiche l'email du pro en haut à droite
    const userEmail = session.user.email;
    document.getElementById('displayEmail').innerText = userEmail;
    
    // Attribution du restoID (logique temporaire pour ton pilote)
    let restoID = "bistrot"; 
    if (userEmail.includes("villa")) restoID = "villa_saint_antoine";

    // On fait disparaître l'écran de chargement
    document.getElementById('loader').style.display = "none";

    // On lance la récupération des clients
    chargerDonnees(restoID);
}

// 📊 3. CHARGEMENT DES DONNÉES RESTAURANT
async function chargerDonnees(restoID) {
    const { data, error } = await supabaseApp
        .from('clients')
        .select('*')
        .eq('restaurant_id', restoID)
        .order('derniere_visite', { ascending: false });

    if (error) {
        console.error("Erreur de chargement :", error);
        document.getElementById('tableBody').innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur de chargement des données.</td></tr>`;
        return;
    }

    dataClients = data || [];
    afficherStatistiques(dataClients);
    afficherTableau(dataClients);
}

// 📈 4. AFFICHAGE DES CHIFFRES
function afficherStatistiques(data) {
    document.getElementById('statTotalClients').innerText = data.length;
    const totalPts = data.reduce((sum, client) => sum + (client.points || 0), 0);
    document.getElementById('statTotalPoints').innerText = totalPts;
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client enregistré pour le moment.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prenom || 'Non renseigné'}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points">${client.points} pts</span></td>
            <td style="color: #6B7280;">${new Date(client.derniere_visite).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'})}</td>
        </tr>
    `).join('');
}

// 📥 6. GESTION DU BOUTON EXPORT CSV
document.getElementById('btnExport').addEventListener('click', () => {
    if (dataClients.length === 0) return alert("Rien à exporter.");

    const headers = ["Prenom", "Email", "Points", "Derniere Visite"];
    const rows = dataClients.map(c => [
        c.prenom || '', 
        c.email, 
        c.points, 
        new Date(c.derniere_visite).toLocaleDateString('fr-FR')
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

// Lancement de la machine dès que le fichier est lu
verifierSession();
