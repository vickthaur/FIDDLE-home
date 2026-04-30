/**
 * ==========================================================================
 * 🍏 FYDELIO - MOTEUR D'ANIMATION HAUTE PERFORMANCE (ULTIMATE EDITION)
 * --------------------------------------------------------------------------
 * Focus : Fluidité absolue (60fps), Zéro Latence, Rendu Apple/Stripe.
 * Accélération GPU via translate3d, protection Mobile, et Smooth Scroll.
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // ========================================================
    // ⚙️ CONFIGURATION GLOBALE
    // ========================================================
    const CONFIG = {
        scroll: {
            duration: 1.5,
            smoothWheel: true,
            wheelMultiplier: 1.2, // Rendu un peu plus dynamique au scroll souris
        },
        mobileBreakpoint: 1024, // En dessous de ce seuil, on désactive les calculs lourds
    };

    // État global pour le responsive
    let isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    
    // Met à jour l'état au redimensionnement
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= CONFIG.mobileBreakpoint;
    });

    // ========================================================
    // 1. INITIALISATION LENIS (Scroll Fluide)
    // ========================================================
    const lenis = new Lenis({
        duration: CONFIG.scroll.duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Courbe de Bézier ultra-douce
        smoothWheel: CONFIG.scroll.smoothWheel,
        wheelMultiplier: CONFIG.scroll.wheelMultiplier,
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
        if (!heroSection || !heroMedia || isMobile) {
            // Sur mobile, on remet les valeurs par défaut pour ne pas casser le layout
            if (heroMedia && isMobile) heroMedia.style.clipPath = 'none';
            if (heroImg && isMobile) heroImg.style.transform = 'scale(1)';
            if (heroText && isMobile) {
                heroText.style.opacity = "1";
                heroText.style.transform = "translate3d(0, 0, 0)";
            }
            return;
        }

        const rect = heroSection.getBoundingClientRect();
        const viewHeight = window.innerHeight;

        // Si la section n'est plus à l'écran, on stoppe les calculs pour sauver du CPU
        if (rect.bottom < 0 || rect.top > viewHeight) return;

        // Calcul de progression (de 0 à 1)
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - viewHeight)));

        // 1. Clip-path : L'image se réduit pour former l'écran (Arrondi iOS)
        const topBottom = scrollProgress * 20;
        const leftRight = scrollProgress * 35;
        const radius = scrollProgress * 48; // Bords très arrondis
        heroMedia.style.clipPath = `inset(${topBottom}% ${leftRight}% ${topBottom}% ${leftRight}% round ${radius}px)`;

        // 2. Zoom : L'image dézoome subtilement à l'intérieur
        if (heroImg) {
            // translateZ(0) force l'accélération matérielle (GPU)
            heroImg.style.transform = `scale(${1.1 - (scrollProgress * 0.1)}) translateZ(0)`;
        }

        // 3. Texte : Remonte et apparaît derrière l'image
        if (heroText) {
            heroText.style.opacity = scrollProgress > 0.3 ? (scrollProgress - 0.3) * 2 : 0;
            // Utilisation de translate3d au lieu de translateY pour la performance
            heroText.style.transform = `translate3d(0, ${(1 - scrollProgress) * 60}px, 0)`;
        }
    };

    // ========================================================
    // 3. SCROLL HORIZONTAL NATIF (Performances GPU)
    // ========================================================
    const horizontalSec = document.querySelector('.horizontal-sequence');
    const horizontalContainer = document.getElementById('horizontalContainer');

    const updateHorizontal = () => {
        if (!horizontalSec || !horizontalContainer || isMobile) {
            // Désactivation sur mobile pour laisser les éléments s'empiler naturellement
            if (horizontalContainer && isMobile) {
                horizontalContainer.style.transform = 'none';
            }
            return;
        }

        const rect = horizontalSec.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        if (rect.bottom < 0 || rect.top > viewHeight) return;

        // Calcul de la progression dans la zone de scroll
        let progress = -rect.top / (rect.height - viewHeight);
        progress = Math.max(0, Math.min(1, progress));

        // Déplacement avec translate3d pour une fluidité absolue
        const maxScroll = horizontalContainer.scrollWidth - window.innerWidth;
        horizontalContainer.style.transform = `translate3d(${-progress * maxScroll}px, 0, 0)`;
    };

    // ========================================================
    // 4. SHOWCASE TÉLÉPHONE (Textes + Écrans)
    // ========================================================
    const phoneMockup = document.getElementById('phoneMockup');
    const textSteps = document.querySelectorAll('.showcase-text');
    const screens = document.querySelectorAll('.phone-screen');
    let autoPlayInterval;

    // A. Logique Ordinateur (Intersection Observer sur les textes)
    const showcaseObserver = new IntersectionObserver((entries) => {
        if (isMobile) return; // L'observer ne fait rien sur mobile

        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepId = entry.target.id.replace('text', '');
                
                // Active le bon écran dans le téléphone
                screens.forEach((screen, index) => {
                    screen.classList.toggle('active', (index + 1) == stepId);
                });

                // Révèle le texte actif
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translate3d(0, -50%, 0) scale(1)";
            } else {
                // Atténue le texte inactif
                entry.target.style.opacity = "0.2";
                entry.target.style.transform = "translate3d(0, -50%, 0) scale(0.95)";
            }
        });
    }, {
        threshold: 0.5,
        rootMargin: "-25% 0px -25% 0px" // Cible parfaitement le centre de l'écran
    });

    textSteps.forEach(step => showcaseObserver.observe(step));

    // B. Logique Mixte (Animation d'entrée du téléphone + Autoplay Mobile)
    const updateShowcasePhone = () => {
        if (!phoneMockup) return;
        const showcaseSec = document.querySelector('.showcase-sequence');
        if (!showcaseSec) return;

        // Si mobile, on déclenche l'autoplay des écrans pour que ça reste dynamique
        if (isMobile) {
            phoneMockup.style.transform = `translate3d(0, 0, 0)`;
            if (!autoPlayInterval) {
                let currentScreen = 0;
                autoPlayInterval = setInterval(() => {
                    screens.forEach(s => s.classList.remove('active'));
                    currentScreen = (currentScreen + 1) % screens.length;
                    if(screens[currentScreen]) screens[currentScreen].classList.add('active');
                }, 3000);
            }
            return;
        } else {
            // Sur Desktop, on nettoie l'autoplay
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Animation d'entrée/sortie du téléphone depuis le bas (Desktop)
        const rect = showcaseSec.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // Fait monter le téléphone doucement
            phoneMockup.style.transform = `translate3d(0, 0, 0)`;
        } else {
            // Le cache en bas quand on n'est pas dans la section
            phoneMockup.style.transform = `translate3d(0, 100vh, 0)`;
        }
    };

    // ========================================================
    // 5. RÉVÉLATIONS CLASSIQUES (Fade In Up sur Tarifs, FAQ...)
    // ========================================================
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // Se déclenche un peu avant le bas de l'écran
        threshold: 0.1 
    };

    const revealElementsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajout d'un petit délai basé sur l'index de classe (ex: delay-1, delay-2)
                // Géré via le CSS (transition-delay) pour un effet de cascade parfait
                entry.target.classList.add('active');
                
                // Règle d'or de performance : on arrête d'observer une fois affiché
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Cible toutes les classes .reveal (Tarifs, Preuve sociale, FAQ)
    document.querySelectorAll('.reveal, .price-card, .faq-item, .social-proof').forEach((el) => {
        revealElementsObserver.observe(el);
    });

    // ========================================================
    // 6. CŒUR DU MOTEUR (Boucle de Rendu liée à Lenis)
    // ========================================================
    // Au lieu d'utiliser l'event 'scroll' du navigateur qui est saccadé,
    // on couple nos calculs au moteur d'interpolation mathématique de Lenis.
    lenis.on('scroll', () => {
        updateHero();
        updateHorizontal();
        updateShowcasePhone();
    });

    // ========================================================
    // 7. GESTION DES INTERACTIONS UI (Menu & Modale)
    // ========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const modal = document.getElementById('loginModal');
    const btnOpenModal = document.getElementById('btnOpenModal');
    const btnCloseModal = document.getElementById('btnCloseModal');

    // Navigation Mobile (Menu Burger)
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Ferme le menu si clic sur un lien
        document.querySelectorAll('.link-text, .btn-nav').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    // Gestion de la Modale de Connexion
    const openModal = () => {
        if (!modal) return;
        modal.style.display = 'flex';
        // Petit délai pour permettre l'animation CSS d'opacité
        setTimeout(() => modal.classList.add('active'), 10);
        lenis.stop(); // Bloque le scroll arrière-plan
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        // Attend la fin de l'animation CSS avant de display: none
        setTimeout(() => {
            modal.style.display = 'none';
            lenis.start(); // Réactive le scroll
        }, 400); 
    };

    if (btnOpenModal) btnOpenModal.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    
    // Fermeture au clic à l'extérieur de la boîte blanche
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // ========================================================
    // 8. DÉCLENCHEMENT INITIAL
    // ========================================================
    // Force un premier calcul pour placer les éléments correctement au rechargement de la page
    updateHero();
    updateHorizontal();
    updateShowcasePhone();
});
