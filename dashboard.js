/**
 * 📊 SCRIPT DU DASHBOARD - FIDDLE BRO'S
 * Corrigé pour l'affichage dynamique
 */

// 1. CONNEXION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let dataClients = [];

// Détection automatique du resto par l'URL ou par défaut
const urlParams = new URLSearchParams(window.location.search);
const restoID = urlParams.get('resto') || "villa_saint_antoine"; 

// --- CHOIX DE LA COLONNE DE POINTS SELON LE RESTO ---
const pointsCol = (restoID === "bistrot") ? "points_bistrot" : "points_villa";

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

// 📊 3. CHARGEMENT ET AFFICHAGE (C'est ici que ça bloquait)
async function chargerDonnees(id) {
    const loader = document.getElementById('loader'); // Vérifie que l'ID est bien 'loader' dans ton HTML
    
    try {
        const { data, error } = await supabaseApp
            .from('clients')
            .select('*')
            .eq('restaurant_origine', id)
            .order('created_at', { ascending: false }); 

        if (error) throw error;

        dataClients = data || [];
        
        // On lance l'affichage
        afficherStatistiques(dataClients);
        afficherTableau(dataClients);

    } catch (err) {
        console.error("Erreur d'affichage :", err);
        const tbody = document.getElementById('tableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Erreur de chargement des données.</td></tr>`;
    } finally {
        // 🛑 ARRÊT DU MOULINAGE (Indispensable)
        // Quoi qu'il arrive (succès ou erreur), on cache le spinner
        if (loader) loader.style.display = "none";
    }
}

// 📈 4. STATISTIQUES
function afficherStatistiques(data) {
    document.getElementById('statTotalClients').innerText = data.length;
    
    // On utilise pointsCol qui a été défini en haut
    const totalPoints = data.reduce((acc, client) => acc + (client[pointsCol] || 0), 0);
    document.getElementById('statTotalPoints').innerText = totalPoints; 
}

// 📋 5. AFFICHAGE DU TABLEAU
function afficherTableau(data) {
    const tbody = document.getElementById('tableBody');
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 40px; color: #6B7280;">Aucun client trouvé pour ce restaurant.</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(client => `
        <tr>
            <td style="font-weight: 600;">${client.prenom || ''} ${client.nom || ''}</td>
            <td style="color: #6B7280;">${client.email}</td>
            <td><span class="badge-points" style="background:#10b981; color:white; padding:4px 10px; border-radius:8px; font-weight:bold;">
                ${client[pointsCol] || 0} pts
            </span></td>
            <td style="color: #6B7280;">
                ${new Date(client.created_at).toLocaleDateString('fr-FR')}
            </td>
        </tr>
    `).join('');
}

// 🚪 6. DÉCONNEXION
document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabaseApp.auth.signOut();
    window.location.href = "index.html";
});

verifierSession();
