/**
 * 🔒 SCRIPT DE CONNEXION B2B - FIDDLE BRO'S
 * Gère l'affichage de la modale et l'authentification avec Supabase
 */

// 1. INITIALISATION SUPABASE (Avec un nom de variable qui ne crée pas de bug !)
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";

// On l'appelle supabaseApp pour ne pas entrer en conflit avec la bibliothèque
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. GESTION DE LA FENÊTRE (MODAL)
const modal = document.getElementById('loginModal');
const btnOpen = document.getElementById('btnOpenModal');
const btnClose = document.getElementById('btnCloseModal');

// Ouvrir
btnOpen.addEventListener('click', () => {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
});

// Fermer
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}
btnClose.addEventListener('click', closeModal);

// Fermer en cliquant dans le vide autour de la boîte
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// 3. LA CONNEXION SUPABASE
const loginForm = document.getElementById('loginForm');
const btnSubmit = document.getElementById('btnSubmitLogin');
const errorMsg = document.getElementById('loginError');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêche la page de se recharger
    
    // Récupère les valeurs tapées par le restaurateur
    const email = document.getElementById('restoEmail').value.trim();
    const pwd = document.getElementById('restoPwd').value;

    // Cache les anciennes erreurs et met le bouton en mode "Chargement"
    errorMsg.style.display = 'none';
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "Vérification en cours...";
    btnSubmit.style.opacity = "0.7";
    btnSubmit.disabled = true;

    // On demande à Supabase de valider
    const { data, error } = await supabaseApp.auth.signInWithPassword({
        email: email,
        password: pwd,
    });

    if (error) {
        // ÉCHEC : Mauvais mot de passe ou email
        errorMsg.style.display = 'block';
        errorMsg.innerText = "Erreur : " + (error.message === "Invalid login credentials" ? "Identifiants incorrects." : error.message);
        
        // On remet le bouton à la normale
        btnSubmit.innerText = originalText;
        btnSubmit.style.opacity = "1";
        btnSubmit.disabled = false;
    } else {
        // SUCCÈS : Connecté !
        btnSubmit.innerText = "✓ Connexion réussie !";
        btnSubmit.style.background = "#10b981"; // Vert succès
        btnSubmit.style.color = "white";
        
        // Redirection vers le Dashboard sécurisé
        setTimeout(() => {
            window.location.href = "dashboard-pro.html";
        }, 1000);
    }
});
