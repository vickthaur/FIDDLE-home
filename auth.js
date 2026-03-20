/**
 * 🔒 SCRIPT D'AUTHENTIFICATION - FIDDLE BRO'S
 * Gère la modale et la connexion B2B
 */

// 1. INITIALISATION SUPABASE
const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. GESTION DE LA MODALE
// On attend que le DOM soit chargé pour être sûr que les boutons existent
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('loginModal');
    const btnOpen = document.getElementById('btnOpenModal');
    const btnClose = document.getElementById('btnCloseModal');
    const loginForm = document.getElementById('loginForm');

    // OUVRIR LA MODALE
    if (btnOpen) {
        btnOpen.onclick = () => {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
        };
    }

    // FERMER LA MODALE
    if (btnClose) {
        btnClose.onclick = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        };
    }

    // FERMER AU CLIC EXTÉRIEUR
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    };

    // 3. TENTATIVE DE CONNEXION
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const btnSubmit = document.getElementById('btnSubmitLogin');
            const errorMsg = document.getElementById('loginError');
            const email = document.getElementById('restoEmail').value.trim();
            const pwd = document.getElementById('restoPwd').value;

            // Préparation du bouton
            errorMsg.style.display = 'none';
            const originalText = btnSubmit.innerText;
            btnSubmit.innerText = "Vérification...";
            btnSubmit.disabled = true;

            try {
                const { data, error } = await supabaseApp.auth.signInWithPassword({
                    email: email,
                    password: pwd,
                });

                if (error) {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = "Identifiants incorrects.";
                    btnSubmit.innerText = originalText;
                    btnSubmit.disabled = false;
                } else {
                    btnSubmit.innerText = "✓ Connexion...";
                    btnSubmit.style.background = "#10b981";

                    // Détection du resto pour la redirection
                    let restoID = "villa_saint_antoine";
                    if (email.toLowerCase().includes("bistrot")) {
                        restoID = "bistrot";
                    }

                    // On envoie vers le dashboard
                    setTimeout(() => {
                        window.location.href = `dashboard-pro.html?resto=${restoID}`;
                    }, 800);
                }
            } catch (err) {
                console.error(err);
                btnSubmit.disabled = false;
                btnSubmit.innerText = originalText;
            }
        });
    }
});
