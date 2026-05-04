/* ==========================================================================
   🍏 FYDELIO ENGINE - APPLE-STYLE SCROLL (GSAP + ScrollTrigger)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. On réactive l'apparition classique du texte
    initScrollAnimations();

    // 2. On lance la magie GSAP si la librairie est bien chargée
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        initAppleAnimations();
        initParallaxBackground();
        initMagneticButtons();
        initDynamicCounters();
    }
});

// ---------------------------------------------------
// 🛠 CORRECTIF : APPARITION DU TEXTE CLASSIQUE
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
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    elementsToAnimate.forEach(el => observer.observe(el));
}

// ---------------------------------------------------
// 📱 EFFETS GSAP : HERO, STICKY PHONE ET PRIX
// ---------------------------------------------------
function initAppleAnimations() {
    
    // 1. LE HERO QUI "PLONGE" (Actif partout)
    gsap.to(".hero", {
        scrollTrigger: {
            trigger: ".hero",
            start: "top top", 
            end: "bottom top", 
            scrub: true, 
            pin: true, 
            pinSpacing: false
        },
        scale: 0.85,
        opacity: 0,
        y: -50,
        ease: "none"
    });

    // --- GESTION RESPONSIVE AVEC GSAP MATCHMEDIA ---
    let mm = gsap.matchMedia();

    // 💻 POUR ORDINATEUR : LA MAGIE DU "STICKY PHONE"
    mm.add("(min-width: 993px)", () => {
        
        const steps = document.querySelectorAll('.method-step');
        const images = document.querySelectorAll('.phone-img');

        if(steps.length > 0 && images.length > 0) {
            
            // Fonction pour activer l'étape en cours
            function activateStep(index) {
                // On retire la classe 'active' partout
                steps.forEach(s => s.classList.remove('active'));
                images.forEach(i => i.classList.remove('active'));
                
                // On met 'active' sur l'étape et l'image qui correspondent
                if(steps[index]) steps[index].classList.add('active');
                if(images[index]) images[index].classList.add('active');
            }

            // On crée un déclencheur pour chaque bloc de texte
            steps.forEach((step, index) => {
                ScrollTrigger.create({
                    trigger: step,
                    start: "top 50%", // S'active quand le haut du texte arrive au milieu de l'écran
                    end: "bottom 50%",
                    onEnter: () => activateStep(index),
                    onEnterBack: () => activateStep(index),
                });
            });
            
            // Initialisation de la première étape par défaut
            activateStep(0);
        }
    });

    // 📱 POUR MOBILE : APPARITION EN CASCADE CLASSIQUE
    mm.add("(max-width: 992px)", () => {
        gsap.from(".method-step", {
            scrollTrigger: {
                trigger: "#fonctionnement",
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            clearProps: "all"
        });
    });

    // 3. MISE EN AVANT DU PRIX (Section Tarifs - Actif partout)
    gsap.from(".pricing-card:not(.highlight)", {
        scrollTrigger: { trigger: "#tarifs", start: "top 70%" },
        x: -50, opacity: 0, duration: 0.8, clearProps: "all"
    });

    gsap.from(".pricing-card.highlight", {
        scrollTrigger: { trigger: "#tarifs", start: "top 70%" },
        scale: 0.8, opacity: 0, duration: 1, ease: "elastic.out(1, 0.7)", delay: 0.2, clearProps: "all"
    });
}

// ---------------------------------------------------
// UTILITAIRES CONSERVÉS (Parallaxe, Boutons, Compteurs)
// ---------------------------------------------------
function initParallaxBackground() {
    const bg1 = document.querySelector('.bg-shape-1');
    const bg2 = document.querySelector('.bg-shape-2');

    if (bg1 && bg2 && !window.matchMedia("(max-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;
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
