/**
 * 🍏 FYDELIO - MOTEUR D'ANIMATION HAUTE PERFORMANCE
 * Focus : Fluidité 60fps, Zéro Latence, Rendu Apple.
 */

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // 1. INITIALISATION LENIS (Scroll Fluide)
    // ========================================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        orientation: 'vertical',
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ========================================================
    // 2. GESTION DU HERO CINÉMA (L'image qui devient téléphone)
    // ========================================================
    const heroMedia = document.getElementById('heroImage');
    const heroImg = heroMedia ? heroMedia.querySelector('img') : null;
    const heroText = document.getElementById('heroText');
    const heroSection = document.querySelector('.hero-sequence');

    const updateHero = () => {
        if (!heroSection || !heroMedia) return;

        const rect = heroSection.getBoundingClientRect();
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));

        // 1. Clip-path : L'image se réduit (de 0% à 20% de marge top/bottom et 35% sur les côtés)
        const topBottom = scrollProgress * 20;
        const leftRight = scrollProgress * 35;
        const radius = scrollProgress * 45;
        heroMedia.style.clipPath = `inset(${topBottom}% ${leftRight}% ${topBottom}% ${leftRight}% round ${radius}px)`;

        // 2. Zoom : L'image dézoome légèrement
        if (heroImg) {
            heroImg.style.transform = `scale(${1.1 - (scrollProgress * 0.1)})`;
        }

        // 3. Texte : Apparition progressive derrière l'image
        if (heroText) {
            heroText.style.opacity = scrollProgress > 0.3 ? (scrollProgress - 0.3) * 2 : 0;
            heroText.style.transform = `translateY(${(1 - scrollProgress) * 50}px)`;
        }
    };

    // ========================================================
    // 3. SCROLL HORIZONTAL NATIF
    // ========================================================
    const horizontalSec = document.querySelector('.horizontal-sequence');
    const horizontalContainer = document.getElementById('horizontalContainer');

    const updateHorizontal = () => {
        if (!horizontalSec || !horizontalContainer) return;

        const rect = horizontalSec.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        // Calcul de la progression dans la section (0 à 1)
        let progress = -rect.top / (rect.height - viewHeight);
        progress = Math.max(0, Math.min(1, progress));

        // On déplace le container vers la gauche
        const maxScroll = horizontalContainer.scrollWidth - window.innerWidth;
        horizontalContainer.style.transform = `translateX(${-progress * maxScroll}px)`;
    };

    // ========================================================
    // 4. SHOWCASE TÉLÉPHONE (Changement d'écrans)
    // ========================================================
    const phoneMockup = document.getElementById('phoneMockup');
    const textSteps = document.querySelectorAll('.showcase-text');
    const screens = document.querySelectorAll('.phone-screen');

    // Observer pour savoir quel texte est au centre de l'écran
    const showcaseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepId = entry.target.id.replace('text', ''); // Récupère 1, 2 ou 3
                
                // Activer l'écran correspondant
                screens.forEach((screen, index) => {
                    screen.classList.toggle('active', (index + 1) == stepId);
                });

                // Optionnel : Ajouter un effet sur le texte actif
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(-50%) scale(1)";
            } else {
                entry.target.style.opacity = "0.3";
                entry.target.style.transform = "translateY(-50%) scale(0.95)";
            }
        });
    }, {
        threshold: 0.6, // Se déclenche quand le texte est bien au centre
        rootMargin: "-20% 0px -20% 0px"
    });

    textSteps.forEach(step => showcaseObserver.observe(step));

    const updateShowcasePhone = () => {
        if (!phoneMockup) return;
        const showcaseSec = document.getElementById('showcaseSec');
        const rect = showcaseSec.getBoundingClientRect();
        
        // Fait monter le téléphone au début et descendre à la fin
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            phoneMockup.style.transform = `translateY(0)`;
        } else {
            phoneMockup.style.transform = `translateY(100vh)`;
        }
    };

    // ========================================================
    // 5. RÉVÉLATIONS CLASSIQUES (Reveal Cards & Pricing)
    // ========================================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal, .price-card').forEach(el => revealObserver.observe(el));

    // ========================================================
    // 6. BOUCLE DE RENDU (Optimisée via Lenis)
    // ========================================================
    lenis.on('scroll', () => {
        updateHero();
        updateHorizontal();
        updateShowcasePhone();
    });

    // ========================================================
    // 7. INTERFACE (Menu & Modal)
    // ========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.getElementById('btnOpenModal');

    // Burger Menu
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Modal Connexion
    if (btnOpenModal && modal) {
        btnOpenModal.addEventListener('click', () => {
            modal.style.display = 'flex';
            lenis.stop(); // Bloque le scroll quand la modal est ouverte
        });

        // Fermer au clic extérieur
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                lenis.start();
            }
        });
    }

    // Initialisation au chargement
    updateHero();
});
