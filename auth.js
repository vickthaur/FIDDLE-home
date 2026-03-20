/**
 * 🔒 SCRIPT DE CONNEXION B2B - FIDDLE BRO'S
 * Gère l'authentification des restaurateurs et la redirection
 */

// 1. INITIALISATION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. GESTION DE LA MODALE (Ouverture/Fermeture)
const modal = document.getElementById('loginModal');
const btnOpen = document.getElementById('btnOpenModal');
const btnClose = document.getElementById('btnCloseModal');

if (btnOpen) {
    btnOpen.addEventListener('click', () => {
        modal.style.display = 'flex';
        // Petit délai pour l'animation CSS .active
        setTimeout(() => modal.classList.add('active'), 10);
    });
}

function closeModal() {
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

if (btnClose) {
    btnClose.addEventListener('click', closeModal);
}

// Fermeture au clic à l'extérieur de la modale
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// 3. LOGIQUE DE CONNEXION SUPABASE
const loginForm = document.getElementById('loginForm');
const btnSubmit = document.getElementById('btnSubmitLogin');
const errorMsg = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // On bloque le rechargement de la page
        
        const email = document.getElementById('restoEmail').value.trim();
        const pwd = document.getElementById('restoPwd').value;

        // Reset de l'affichage
        errorMsg.style.display = 'none';
        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "Vérification en cours...";
        btnSubmit.style.opacity = "0.7";
        btnSubmit.disabled = true;

        try {
            // Tentative de connexion via Supabase Auth
            const { data, error } = await supabaseApp.auth.signInWithPassword({
                email: email,
                password: pwd,
            });

            if (error) {
                // Échec : Identifiants ou erreur réseau
                errorMsg.style.display = 'block';
                errorMsg.innerText = "Erreur : " + (error.message === "Invalid login credentials" ? "Identifiants incorrects." : error.message);
                
                // On remet le bouton en état normal
                btnSubmit.innerText = originalText;
                btnSubmit.style.opacity = "1";
                btnSubmit.disabled = false;
            } else {
                // SUCCÈS : Connecté !
                btnSubmit.innerText = "✓ Connexion réussie !";
                btnSubmit.style.background = "#10b981"; // Passage au vert
                btnSubmit.style.color = "white";
                
                // CORRECTION : On détecte le restaurant par l'email pour le Dashboard
                let restoID = "villa_saint_antoine"; // Par défaut
                if (email.toLowerCase().includes("bistrot")) {
                    restoID = "bistrot";
                }
                // Si tu ajoutes un nouveau client, tu ajoutes un "if email.includes" ici.

                // Redirection vers le Dashboard avec le bon paramètre resto
                setTimeout(() => {
                    window.location.href = `dashboard-pro.html?resto=${restoID}`;
                }, 800);
            }
        } catch (err) {
            console.error("Erreur critique login:", err);
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Une erreur technique est survenue.";
            btnSubmit.disabled = false;
            btnSubmit.innerText = originalText;
        }
    });
}
