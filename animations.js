/**
 * 🍏 FYDELIO - MOTEUR D'ANIMATION LÉGER & PREMIUM
 * Remplace GSAP par des API natives (IntersectionObserver) pour des perfs 100/100
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // ========================================================
    // 1. LENIS - LE SCROLL FLUIDE (Style Apple)
    // ========================================================
    // Vérifie si Lenis est bien chargé (pour éviter les erreurs sur d'autres pages)
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Courbe très douce
            smoothWheel: true,
            wheelMultiplier: 1, // Vitesse du scroll naturelle
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // ========================================================
    // 2. RÉVÉLATION AU SCROLL (Fade In Up)
    // ========================================================
    // Configuration de l'observateur (Se déclenche quand 15% de l'élément est visible)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajoute la classe qui déclenche l'animation CSS
                entry.target.classList.add('active');
                
                // On arrête d'observer une fois animé pour économiser les perfs
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Sélectionne tous les éléments avec la classe .reveal et les observe
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => {
        revealObserver.observe(el);
    });

    // ========================================================
    // 3. EFFET PARALLAXE LÉGER (Sur l'image Hero)
    // ========================================================
    const heroImg = document.getElementById('heroParallax');
    
    if (heroImg) {
        // Utilise requestAnimationFrame pour un parallaxe ultra fluide, sans saccade
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY;
                    // Déplace l'image à 15% de la vitesse du scroll (effet subtil)
                    heroImg.style.transform = `translateY(${scrolled * 0.15}px)`;
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ========================================================
    // 4. MENU BURGER (Navigation Mobile)
    // ========================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Ferme le menu si on clique sur un lien
        document.querySelectorAll('.link-text, .btn-nav').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
});
