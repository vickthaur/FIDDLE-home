/* ==========================================================================
   🍏 FYDELIO ENGINE - APPLE-STYLE SCROLL (GSAP + ScrollTrigger)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialisation des apparitions classiques (Fade in up)
    initScrollAnimations();

    // 2. Lancement du moteur GSAP Haute Performance
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Optimisation globale GSAP pour éviter les saccades
        gsap.config({ force3D: true });

        initAppleAnimations();
        initPremiumParallax();
        initLuxuryMagneticButtons();
        initDynamicCounters();
    }
});

// ---------------------------------------------------
// 🛠 APPARITION DU TEXTE (Smooth Fade)
// ---------------------------------------------------
function initScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    if (elementsToAnimate.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible'); 
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.15, // Déclenche un peu plus tard pour un effet plus naturel
        rootMargin: "0px 0px -50px 0px"
    });

    elementsToAnimate.forEach(el => observer.observe(el));
}

// ---------------------------------------------------
// 📱 EFFETS GSAP : HERO, STICKY PHONE ET PRIX
// ---------------------------------------------------
function initAppleAnimations() {
    
    // 1. LE HERO QUI "PLONGE" DANS L'ÉCRAN (Effet Flou/Blur Apple)
    gsap.to(".hero", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top", 
            end: "bottom top", 
            scrub: 1, // Le "1" ajoute un très léger lissage (smooth) au scroll
            pin: true, 
            pinSpacing: false
        },
        scale: 0.88,
        opacity: 0,
        y: -80,
        filter: "blur(12px)", // L'effet Luxe : l'image se floute en reculant
        ease: "power2.inOut"
    });

    // --- GESTION RESPONSIVE AVEC GSAP MATCHMEDIA ---
    let mm = gsap.matchMedia();

    // 💻 POUR ORDINATEUR : LA MAGIE DU "STICKY PHONE"
    mm.add("(min-width: 993px)", () => {
        
        const steps = document.querySelectorAll('.method-step');
        const images = document.querySelectorAll('.phone-img');

        if(steps.length > 0 && images.length > 0) {
            
            // Animation d'entrée du téléphone lui-même
            gsap.from(".phone-mockup", {
                scrollTrigger: {
                    trigger: "#fonctionnement",
                    start: "top 70%",
                },
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "expo.out" // Courbe d'accélération ultra-premium
            });

            // Moteur de synchronisation Texte <-> Écran iPhone
            function activateStep(index) {
                steps.forEach(s => s.classList.remove('active'));
                images.forEach(i => i.classList.remove('active'));
                
                if(steps[index]) steps[index].classList.add('active');
                if(images[index]) images[index].classList.add('active');
            }

            steps.forEach((step, index) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top center", // Parfaitement au milieu de l'écran
                    end: "bottom center",
                    onEnter: () => activateStep(index),
                    onEnterBack: () => activateStep(index),
                });
            });
            
            activateStep(0);
        }
    });

    // 📱 POUR MOBILE : APPARITION INDIVIDUELLE ORGANIQUE
    mm.add("(max-width: 992px)", () => {
        const steps = gsap.utils.toArray('.method-step');
        
        steps.forEach((step) => {
            gsap.from(step, {
                scrollTrigger: {
                    trigger: step,
                    start: "top 85%",
                },
                y: 60,
                opacity: 0,
                duration: 1,
                ease: "power3.out", // Plus doux que le stagger classique
                clearProps: "all"
            });
        });
    });

    // 3. MISE EN AVANT DU PRIX (Effet d'impact)
    gsap.from(".pricing-card:not(.highlight)", {
        scrollTrigger: { trigger: "#tarifs", start: "top 75%" },
        y: 50, opacity: 0, duration: 1, ease: "power4.out", clearProps: "all"
    });

    // La carte premium a un effet "rebond" subtil
    gsap.from(".pricing-card.highlight", {
        scrollTrigger: { trigger: "#tarifs", start: "top 75%" },
        y: 80, scale: 0.95, opacity: 0, duration: 1.2, ease: "back.out(1.2, 0.5)", delay: 0.15, clearProps: "all"
    });
}

// ---------------------------------------------------
// 🪄 UTILITAIRES PREMIUM (60 FPS Sans lag)
// ---------------------------------------------------

// Parallaxe Haute Performance avec gsap.quickTo
function initPremiumParallax() {
    const bg1 = document.querySelector('.bg-shape-1');
    const bg2 = document.querySelector('.bg-shape-2');

    if (bg1 && bg2 && !window.matchMedia("(max-width: 768px)").matches) {
        // gsap.quickTo est fait spécifiquement pour traquer la souris sans surcharger le processeur
        const xTo1 = gsap.quickTo(bg1, "x", { duration: 1.5, ease: "power3.out" });
        const yTo1 = gsap.quickTo(bg1, "y", { duration: 1.5, ease: "power3.out" });
        
        const xTo2 = gsap.quickTo(bg2, "x", { duration: 2, ease: "power3.out" });
        const yTo2 = gsap.quickTo(bg2, "y", { duration: 2, ease: "power3.out" });

        window.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
            
            xTo1(mouseX * -120);
            yTo1(mouseY * -120);
            
            xTo2(mouseX * 150);
            yTo2(mouseY * 150);
        });
    }
}

// Boutons Magnétiques Fluides
function initLuxuryMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-large');
    if (window.matchMedia("(max-width: 768px)").matches) return;

    buttons.forEach(btn => {
        const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power2.out" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power2.out" });

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Attire le bouton vers la souris (intensité 0.25)
            xTo(x * 0.25);
            yTo(y * 0.25);
        });

        btn.addEventListener('mouseleave', () => {
            // Relâchement avec effet ressort subtil
            gsap.to(btn, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1.2, 0.4)" });
        });
    });
}

// Compteurs dynamiques
function initDynamicCounters() {
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
                        
                        let start = { val: 0 };
                        gsap.to(start, {
                            val: finalValue,
                            duration: 2.5, // Un peu plus lent = plus luxueux
                            ease: "expo.out",
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
