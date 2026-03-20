/**
 * 🔒 SCRIPT DE CONNEXION B2B - FIDDLE BRO'S
 * CORRIGÉ : Redirection simplifiée
 */

const SUPABASE_URL = "https://qawfwbppnbnskxlkwstu.supabase.co";
const SUPABASE_KEY = "sb_publishable_EbKZkPjtT8rwkEdw3oVRCg_mBJJ_gNJ";
const supabaseApp = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const modal = document.getElementById('loginModal');
const btnOpen = document.getElementById('btnOpenModal');
const btnClose = document.getElementById('btnCloseModal');

if (btnOpen) {
    btnOpen.onclick = () => {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    };
}

function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

if (btnClose) btnClose.onclick = closeModal;

const loginForm = document.getElementById('loginForm');
const btnSubmit = document.getElementById('btnSubmitLogin');
const errorMsg = document.getElementById('loginError');

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('restoEmail').value.trim();
        const pwd = document.getElementById('restoPwd').value;

        errorMsg.style.display = 'none';
        btnSubmit.innerText = "Vérification...";
        btnSubmit.disabled = true;

        const { data, error } = await supabaseApp.auth.signInWithPassword({
            email: email,
            password: pwd,
        });

        if (error) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Identifiants incorrects.";
            btnSubmit.innerText = "SE CONNECTER";
            btnSubmit.disabled = false;
        } else {
            btnSubmit.innerText = "✓ Connexion réussie !";
            btnSubmit.style.background = "#10b981";

            // CORRECTION : On redirige simplement. 
            // C'est le script du Dashboard qui va identifier le resto via l'email du pro.
            setTimeout(() => {
                window.location.href = "dashboard-pro.html";
            }, 800);
        }
    });
}
