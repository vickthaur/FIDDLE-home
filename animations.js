/**
 * 🍏 SCROLLYTELLING & ANIMATIONS GSAP (Style Apple)
 * Réservé à la page vitrine (index.html)
 */

document.addEventListener("DOMContentLoaded", () => {
    // Sécurité : On ne lance les animations GSAP que si on est sur la page d'accueil
    // (pour ne pas faire bugger le Dashboard Pro)
    if (!document.querySelector('.hero-sequence')) return;

    // Initialisation du plugin
    gsap.registerPlugin(ScrollTrigger);

    // ========================================================
    // 1. LENIS - LE MOTEUR DE SCROLL FLUIDE
    // ========================================================
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing très doux
        smoothWheel: true,
    });

    // Synchronisation Lenis et GSAP
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time * 1000) });
    gsap.ticker.lagSmoothing(0);

    // ========================================================
    // 2. HERO : EFFET DE DE-ZOOM (CLIP-PATH)
    // ========================================================
    const heroTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-sequence",
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // L'animation avance et recule avec la molette
        }
    });

    // On réduit l'image pour lui donner une forme d'écran au centre
    heroTl.to("#heroImage", { clipPath: "inset(15% 30% 15% 30% round 40px)", duration: 4, ease: "none" }, 0);
    heroTl.to("#heroImage img", { scale: 1, duration: 4, ease: "none" }, 0);
    
    // Le texte apparaît
    heroTl.to("#heroText", { y: 0, opacity: 1, duration: 2, ease: "power2.out" }, 1);
    
    // L'image part vers le haut
    heroTl.to("#heroImage", { y: "-100vh", opacity: 0, duration: 2, ease: "power2.in" }, 4);

    // ========================================================
    // 3. CONCEPT : SCROLL HORIZONTAL
    // ========================================================
    const hContainer = document.getElementById("horizontalContainer");
    if (hContainer) {
        gsap.to(hContainer, {
            x: () => -(hContainer.scrollWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: ".horizontal-sequence",
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
                invalidateOnRefresh: true // Recalcule les tailles si on redimensionne l'écran
            }
        });
    }

    // ========================================================
    // 4. SHOWCASE : LE TÉLÉPHONE INTERACTIF
    // ========================================================
    const showcaseTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".showcase-sequence",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });

    // Le téléphone monte au centre
    showcaseTl.to("#phoneMockup", { y: 0, duration: 1, ease: "power2.out" });

    // ETAPE 1 (Scan à table)
    showcaseTl.to("#text1", { opacity: 1, y: -20, duration: 1 })
              .to("#text1", { opacity: 0, y: -40, duration: 1, delay: 1 });
    
    // Changement d'écran dans le téléphone
    showcaseTl.add(() => {
        document.getElementById("screen1").classList.remove("active");
        document.getElementById("screen2").classList.add("active");
        document.getElementById("screen3").classList.remove("active");
    });

    // ETAPE 2 (Validation Pro)
    showcaseTl.to("#text2", { opacity: 1, y: -20, duration: 1 })
              .to("#text2", { opacity: 0, y: -40, duration: 1, delay: 1 });
              
    // Changement d'écran dans le téléphone
    showcaseTl.add(() => {
        document.getElementById("screen1").classList.remove("active");
        document.getElementById("screen2").classList.remove("active");
        document.getElementById("screen3").classList.add("active");
    });

    // ETAPE 3 (Votre espace)
    showcaseTl.to("#text3", { opacity: 1, y: -20, duration: 1 })
              .to("#text3", { opacity: 0, y: -40, duration: 1, delay: 1 });

    // Le téléphone repart vers le bas
    showcaseTl.to("#phoneMockup", { y: "100vh", duration: 1, ease: "power2.in" });

    // ========================================================
    // 5. ANIMATIONS D'APPARITION (TARIFS)
    // ========================================================
    gsap.from("#priceTitle", {
        scrollTrigger: { trigger: ".pricing-section", start: "top 70%" },
        y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from("#card1", {
        scrollTrigger: { trigger: ".pricing-section", start: "top 50%" },
        y: 50, opacity: 0, duration: 1, ease: "power3.out"
    });

    gsap.from("#card2", {
        scrollTrigger: { trigger: ".pricing-section", start: "top 50%" },
        y: 50, opacity: 0, scale: 0.95, duration: 1, delay: 0.2, ease: "power3.out"
    });
});
