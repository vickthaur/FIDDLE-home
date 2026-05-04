/* ==========================================================================
   🍏 FYDELIO ENGINE - APPLE-STYLE SCROLL (GSAP + ScrollTrigger)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // On s'assure que GSAP est bien chargé
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initAppleAnimations();
        initParallaxBackground();
        // On garde nos petits effets utilitaires
        initMagneticButtons();
        initDynamicCounters();
    }
});

function initAppleAnimations() {
    // Si on est sur mobile, on fait plus simple pour l'ergonomie
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    // ---------------------------------------------------
    // EFFET 1 : LE HERO QUI "PLONGE"
    // Quand on scrolle, le Hero reste fixe, se rétrécit et s'estompe
    // ---------------------------------------------------
    gsap.to(".hero", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top", // Commence quand le haut du hero touche le haut de l'écran
            end: "bottom top", // Finit quand le bas du hero touche le haut
            scrub: true, // L'animation est liée à la molette (Apple style)
            pin: true, // Fixe la section pendant l'animation
            pinSpacing: false
        },
        scale: 0.85,
        opacity: 0,
        y: -50,
        ease: "none"
    });

    // ---------------------------------------------------
    // EFFET 2 : LE TEXTE QUI S'ALLUME (Section Concept)
    // ---------------------------------------------------
    // Remplaçons le texte du h2 par des lettres individuelles si on veut aller très loin, 
    // mais un simple fade-up avec scrub donne un effet lourd.
    gsap.from("#concept .section-header", {
        scrollTrigger: {
            trigger: "#concept",
            start: "top 80%",
            end: "top 40%",
            scrub: 1 // scrub: 1 ajoute un léger lissage "beurre" d'une seconde
        },
        y: 100,
        opacity: 0
    });

    // Les 3 cartes du Concept apparaissent une à une en décalé
    gsap.from("#concept .card", {
        scrollTrigger: {
            trigger: "#concept .grid-3",
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        y: 80,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2, // Délai entre chaque carte
        ease: "back.out(1.5)" // Effet rebond très qualitatif
    });

    // ---------------------------------------------------
    // EFFET 3 : SCROLL HORIZONTAL (Section Méthode)
    // ---------------------------------------------------
    if (!isMobile) {
        const methodSection = document.querySelector("#fonctionnement");
        const scrollWrapper = document.querySelector(".horizontal-scroll-wrapper");
        
        if (scrollWrapper) {
            // Calcule la distance de défilement horizontal
            const scrollDistance = scrollWrapper.scrollWidth - window.innerWidth;

            gsap.to(scrollWrapper, {
                x: -scrollDistance, // Déplace le conteneur vers la gauche
                ease: "none",
                scrollTrigger: {
                    trigger: methodSection,
                    start: "center center", // On commence quand la section est au milieu
                    end: () => "+=" + scrollDistance, // La durée du scroll égale la largeur
                    pin: true, // On fige l'écran ! L'utilisateur scrolle vers le bas, mais ça va à droite
                    scrub: 1, // Lissage
                    invalidateOnRefresh: true // Recalcule si on redimensionne la fenêtre
                }
            });
        }
    }

    // ---------------------------------------------------
    // EFFET 4 : MISE EN AVANT DU PRIX (Section Tarifs)
    // La carte "Abonnement" s'agrandit de manière spectaculaire
    // ---------------------------------------------------
    gsap.from(".pricing-card:not(.highlight)", {
        scrollTrigger: {
            trigger: "#tarifs",
            start: "top 70%",
        },
        x: -50,
        opacity: 0,
        duration: 0.8
    });

    gsap.from(".pricing-card.highlight", {
        scrollTrigger: {
            trigger: "#tarifs",
            start: "top 70%",
        },
        scale: 0.8,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.7)", // Effet élastique subtil
        delay: 0.2
    });
}

// ---------------------------------------------------
// UTILITAIRES CONSERVÉS (Parallaxe Fond, Compteurs, Boutons)
// ---------------------------------------------------
function initParallaxBackground() {
    const bg1 = document.querySelector('.bg-shape-1');
    const bg2 = document.querySelector('.bg-shape-2');

    if (bg1 && bg2 && !window.matchMedia("(max-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            // Un peu de GSAP pour lisser le mouvement de la souris (plus propre que transition CSS)
            gsap.to(bg1, { x: mouseX * -100, y: mouseY * -100, duration: 1, ease: "power2.out" });
            gsap.to(bg2, { x: mouseX * 120, y: mouseY * 120, duration: 1.5, ease: "power2.out" });
        });
    }
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-large');
    if (window.matchMedia("(max-width: 768px)").matches) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });
}

function initDynamicCounters() {
    // (Même code que précédemment pour faire tourner les compteurs du dashboard)
    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length === 0) return;

    kpiValues.forEach(kpi => {
        const observer = new MutationObserver((mutationsList, obs) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const text = kpi.innerText;
                    if (text === '-' || text === 'Optimisé') return; 
                    
                    const finalValue = parseInt(text.replace(/\s/g, ''), 10);
                    if (!isNaN(finalValue) && finalValue > 0 && !kpi.dataset.animating) {
                        kpi.dataset.animating = 'true';
                        obs.disconnect(); 
                        
                        // GSAP s'occupe du compteur de façon beaucoup plus fluide
                        let start = { val: 0 };
                        gsap.to(start, {
                            val: finalValue,
                            duration: 2,
                            ease: "power3.out",
                            onUpdate: () => {
                                kpi.innerText = Math.floor(start.val);
                            }
                        });
                    }
                }
            }
        });
        observer.observe(kpi, { childList: true, characterData: true, subtree: true });
    });
}
