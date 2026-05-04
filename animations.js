/* ==========================================================================
   ✨ FYDELIO ANIMATION ENGINE (3D, Scroll & Micro-interactions)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialisation conditionnelle pour éviter les erreurs selon la page
    initScrollAnimations();
    init3DTiltEffect();
    initParallaxBackground();
    initDynamicCounters();
    initMagneticButtons();
});

// ==========================================================================
// 1. APPARITION AU SCROLL (Intersection Observer)
// ==========================================================================
function initScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    if (elementsToAnimate.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Ajoute la classe qui déclenchera l'animation CSS
                entry.target.classList.add('is-visible');
                // On cesse d'observer pour que l'animation ne se joue qu'une fois
                observer.unobserve(entry.target); 
            }
        });
    }, {
        threshold: 0.1, // Se déclenche quand 10% de l'élément est visible à l'écran
        rootMargin: "0px 0px -50px 0px"
    });

    elementsToAnimate.forEach(el => observer.observe(el));
}

// ==========================================================================
// 2. EFFET 3D (TILT) SUR LES CARTES
// ==========================================================================
function init3DTiltEffect() {
    // Cible les cartes de la vitrine et du dashboard
    const cards = document.querySelectorAll('.card, .pricing-card, .kpi-card');
    
    // Si on est sur mobile, on désactive la 3D pour éviter les conflits tactiles
    if (window.matchMedia("(max-width: 768px)").matches) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top;  
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcul de l'angle (diviseur plus grand = effet plus subtil)
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.transition = 'none'; 
        });

        // Retour à la normale fluide quand la souris part
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ==========================================================================
// 3. PARALLAXE SUR LES FORMES DE FOND (Vitrine)
// ==========================================================================
function initParallaxBackground() {
    const bg1 = document.querySelector('.bg-shape-1');
    const bg2 = document.querySelector('.bg-shape-2');

    if (bg1 && bg2 && !window.matchMedia("(max-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            // Calcul de la position relative de la souris par rapport au centre de l'écran
            const mouseX = (e.clientX / window.innerWidth) - 0.5;
            const mouseY = (e.clientY / window.innerHeight) - 0.5;

            // Mouvements inversés pour un effet de profondeur
            bg1.style.transform = `translate(${mouseX * -50}px, ${mouseY * -50}px)`;
            bg2.style.transform = `translate(${mouseX * 70}px, ${mouseY * 70}px)`;
        });
    }
}

// ==========================================================================
// 4. ANIMATION DES COMPTEURS KPI (Dashboard)
// ==========================================================================
function initDynamicCounters() {
    const kpiValues = document.querySelectorAll('.kpi-value');
    if (kpiValues.length === 0) return;

    // Fonction d'animation qui fait défiler les nombres
    const countUp = (element, finalValue, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Courbe d'accélération (démarre vite, finit lentement)
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            element.innerText = Math.floor(easeOutQuart * finalValue);
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.innerText = finalValue; // Sécurité pour afficher le nombre exact à la fin
            }
        };
        window.requestAnimationFrame(step);
    };

    kpiValues.forEach(kpi => {
        // On écoute les changements injectés par Supabase (fiddle-pro.js)
        const observer = new MutationObserver((mutationsList, obs) => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const text = kpi.innerText;
                    
                    // On ignore les états par défaut ou le texte "Optimisé"
                    if (text === '-' || text === 'Optimisé') return; 
                    
                    // On extrait le nombre (ex: "1 250" devient 1250)
                    const finalValue = parseInt(text.replace(/\s/g, ''), 10);
                    
                    if (!isNaN(finalValue) && finalValue > 0 && !kpi.dataset.animating) {
                        kpi.dataset.animating = 'true'; // Marqueur pour ne pas relancer l'animation
                        obs.disconnect(); // On arrête d'écouter pour éviter une boucle infinie
                        countUp(kpi, finalValue, 2000); // Animation sur 2 secondes
                    }
                }
            }
        });
        
        // Configuration du MutationObserver
        observer.observe(kpi, { childList: true, characterData: true, subtree: true });
    });
}

// ==========================================================================
// 5. BOUTONS MAGNÉTIQUES (Call to actions)
// ==========================================================================
function initMagneticButtons() {
    // Cible uniquement les gros boutons d'action
    const buttons = document.querySelectorAll('.btn-large');
    if (window.matchMedia("(max-width: 768px)").matches) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            // Calcule la distance de la souris par rapport au centre du bouton
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Force d'attraction (0.2 = subtil)
            const pullX = x * 0.2;
            const pullY = y * 0.2;
            
            btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
            btn.style.transition = 'none';
        });
        
        // Relâche le bouton quand la souris sort
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px)`;
            btn.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}
