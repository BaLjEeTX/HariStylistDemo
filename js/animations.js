/* ============================================================
   GSAP — Reveal, scroll, hover, parallax
   IMPORTANT: All animations use gsap.from() so the page is
   readable even if GSAP fails to load.
   ============================================================ */

(function(){
    if(typeof gsap === 'undefined') return;
    if(typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    /* -------- Initial fade-in for hero on load -------- */
    function heroIntro(){
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.from('.hero__monogram-figure',  { opacity: 0, y: 40, duration: 1.1 }, 0)
          .from('.hero__eyebrow',          { opacity: 0, y: 40, duration: .9 }, 0.2)
          .from('.hero__title-line',       { opacity: 0, y: 60, duration: 1.1, stagger: 0.12 }, 0.35)
          .from('.hero__rule',             { opacity: 0, y: 40, duration: .8 }, 0.9)
          .from('.hero__lede',             { opacity: 0, y: 40, duration: .9 }, 1.0)
          .from('.hero__actions .btn',     { opacity: 0, y: 40, duration: .9, stagger: 0.12 }, 1.2)
          .from('.hero__pillars',          { opacity: 0, y: 40, duration: .8 }, 1.4);

        return tl;
    }

    /* -------- Scroll-triggered reveals -------- */
    function setupReveals(){
        if(typeof ScrollTrigger === 'undefined') return;

        // simple reveals outside hero
        gsap.utils.toArray('.reveal').forEach(el => {
            if(el.closest('.hero')) return;
            gsap.from(el, {
                opacity: 0, y: 40,
                duration: 1, ease: 'power3.out',
                immediateRender: false,
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });

        // cards
        gsap.utils.toArray('.reveal-card').forEach((el, i) => {
            gsap.from(el, {
                opacity: 0, y: 60,
                duration: 1.1, ease: 'power3.out',
                delay: i * 0.12,
                immediateRender: false,
                scrollTrigger: { trigger: el, start: 'top 85%' }
            });
        });

        // service rows
        gsap.utils.toArray('.reveal-row').forEach((el, i) => {
            gsap.from(el, {
                opacity: 0, y: 40,
                duration: .9, ease: 'power3.out',
                delay: i * 0.08,
                immediateRender: false,
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });

        // features stagger
        gsap.utils.toArray('.reveal-feature').forEach((el, i) => {
            gsap.from(el, {
                opacity: 0, y: 40,
                duration: .9, ease: 'power3.out',
                delay: i * 0.12,
                immediateRender: false,
                scrollTrigger: { trigger: '.features', start: 'top 75%' }
            });
        });
    }

    /* -------- Price count-up -------- */
    function setupPriceCounters(){
        gsap.utils.toArray('.combo__price-now').forEach(el => {
            const target = parseInt(el.dataset.target || '0', 10);
            if(!target){
                // fallback: just show the target value
                return;
            }
            // Show the final value immediately as fallback, then animate
            el.textContent = '₹' + target.toLocaleString('en-IN');

            if(typeof ScrollTrigger === 'undefined') return;

            const obj = { v: 0 };
            ScrollTrigger.create({
                trigger: el,
                start: 'top 85%',
                once: true,
                onEnter: () => {
                    obj.v = 0;
                    gsap.to(obj, {
                        v: target,
                        duration: 1.6,
                        ease: 'power2.out',
                        onUpdate(){
                            el.textContent = '₹' + Math.round(obj.v).toLocaleString('en-IN');
                        }
                    });
                }
            });
        });
    }

    /* -------- Stats count-up -------- */
    function setupStatsCounters(){
        gsap.utils.toArray('.master__stats-num').forEach(el => {
            const target = parseInt(el.dataset.target || '0', 10);
            if(!target) return;
            el.textContent = '0';

            if(typeof ScrollTrigger === 'undefined') return;

            const obj = { v: 0 };
            ScrollTrigger.create({
                trigger: el,
                start: 'top 88%',
                once: true,
                onEnter: () => {
                    obj.v = 0;
                    gsap.to(obj, {
                        v: target,
                        duration: 2.0,
                        ease: 'power2.out',
                        onUpdate(){
                            el.textContent = Math.round(obj.v).toLocaleString('en-IN');
                        }
                    });
                }
            });
        });
    }

    /* -------- Hero scene parallax on scroll -------- */
    function setupHeroParallax(){
        if(typeof ScrollTrigger === 'undefined') return;
        const scene = document.getElementById('heroScene');
        if(!scene) return;

        gsap.to(scene, {
            yPercent: -8,
            scale: 1.04,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.6
            }
        });
        gsap.to('.hero__copy', {
            yPercent: -15,
            opacity: 0.5,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 0.8
            }
        });
    }

    /* -------- Section title parallax -------- */
    function setupSectionParallax(){
        if(typeof ScrollTrigger === 'undefined') return;
        gsap.utils.toArray('.section-title').forEach(t => {
            gsap.from(t, {
                y: 60, opacity: 0.4,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: {
                    trigger: t,
                    start: 'top 95%',
                    end: 'top 40%',
                    scrub: 0.7
                }
            });
        });
    }

    /* -------- Magnetic buttons -------- */
    function setupMagnetic(){
        const items = document.querySelectorAll('.btn, .nav__cta, .sticky__book');
        items.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                gsap.to(el, { x: x * 0.18, y: y * 0.25, duration: 0.4, ease: 'power3.out' });
                el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
                el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
            });
        });
    }

    /* -------- 3D tilt for combo cards -------- */
    function setupTilt(){
        const cards = document.querySelectorAll('.combo, .contact-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width  - 0.5;
                const y = (e.clientY - r.top)  / r.height - 0.5;
                gsap.to(card, {
                    rotateY: x * 8,
                    rotateX: -y * 8,
                    transformPerspective: 900,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0, rotateX: 0,
                    duration: 0.8, ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    // expose
    window.SalonAnims = {
        heroIntro,
        setupReveals,
        setupPriceCounters,
        setupStatsCounters,
        setupHeroParallax,
        setupSectionParallax,
        setupMagnetic,
        setupTilt
    };

})();
