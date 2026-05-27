/* ============================================================
   MAIN — orchestrates loader, cursor, nav, particles, anims
   ============================================================ */

(function(){

    /* ---------- Loader (robust) ----------
       Hide on whichever fires first:
       DOMContentLoaded, window load, or a hard 2.2s safety timeout.
       Animations also run safely with try/catch so any CDN hiccup
       (GSAP/Three not loaded) cannot leave the page frozen.
    */
    let booted = false;
    function boot(){
        if(booted) return;
        booted = true;

        const loader = document.getElementById('loader');
        if(loader) loader.classList.add('is-hidden');
        document.body.classList.add('is-ready');

        try {
            if(window.SalonAnims){
                window.SalonAnims.heroIntro();
                window.SalonAnims.setupReveals();
                window.SalonAnims.setupPriceCounters();
                window.SalonAnims.setupStatsCounters();
                window.SalonAnims.setupHeroParallax();
                window.SalonAnims.setupSectionParallax();
                window.SalonAnims.setupMagnetic();
                window.SalonAnims.setupTilt();
            } else {
                // GSAP failed to load — reveal everything immediately
                document.querySelectorAll('.reveal, .reveal-word, .reveal-card, .reveal-row, .reveal-feature')
                    .forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
            }
        } catch (err) {
            console.warn('Animation init failed, continuing without animations.', err);
            document.querySelectorAll('.reveal, .reveal-word, .reveal-card, .reveal-row, .reveal-feature')
                .forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
        }
    }

    // Loader count-up progress animation
    const pctEl = document.getElementById('loaderPct');
    if (pctEl) {
        const duration = 2200; // syncs with progressFill animation in CSS
        const startTime = performance.now();
        function updatePct(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            pctEl.textContent = String(Math.floor(progress * 100)).padStart(2, '0');
            if (progress < 1) {
                requestAnimationFrame(updatePct);
            }
        }
        requestAnimationFrame(updatePct);
    }

    // Try ASAP after DOM ready (small delay so loader is briefly visible)
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 1400));
    } else {
        setTimeout(boot, 1400);
    }
    // Also boot on load (backup)
    window.addEventListener('load', () => setTimeout(boot, 800));
    // Hard safety fallback — no matter what, hide the loader within ~3s
    setTimeout(boot, 3000);

    /* ---------- Cursor glow ---------- */
    const glow = document.getElementById('cursorGlow');
    if(glow && window.matchMedia('(pointer:fine)').matches){
        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let cx = mx, cy = my;
        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

        function loop(){
            cx += (mx - cx) * 0.18;
            cy += (my - cy) * 0.18;
            glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
            requestAnimationFrame(loop);
        }
        loop();

        // scale on interactive elements
        const targets = document.querySelectorAll('a, .btn, .combo, .contact-card, .menu__row, .pillar');
        targets.forEach(t => {
            t.addEventListener('mouseenter', () => glow.style.width = glow.style.height = '520px');
            t.addEventListener('mouseleave', () => glow.style.width = glow.style.height = '380px');
        });
    }

    /* ---------- Nav scroll state & Progress ---------- */
    const nav = document.getElementById('nav');
    const sticky = document.getElementById('sticky');
    let lastY = 0;

    function onScroll(){
        const y = window.scrollY;
        if(nav){
            if(y > 30) nav.classList.add('is-scrolled');
            else nav.classList.remove('is-scrolled');
        }
        if(sticky){
            if(y > 600) sticky.classList.add('is-visible');
            else sticky.classList.remove('is-visible');
        }

        // Scroll progress bar calculation
        const scrollProgress = document.getElementById('scrollProgress');
        if(scrollProgress) {
            const span = scrollProgress.querySelector('span');
            if(span) {
                const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
                const pct = totalHeight > 0 ? (y / totalHeight) * 100 : 0;
                span.style.width = `${pct}%`;
            }
        }
        lastY = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Particles (2D ambient dust) ---------- */
    const canvas = document.getElementById('particles');
    if(canvas){
        const ctx = canvas.getContext('2d');
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;

        const particles = [];
        const COUNT = window.innerWidth < 700 ? 25 : 60;

        for(let i = 0; i < COUNT; i++){
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.4 + 0.4,
                vx: (Math.random() - 0.5) * 0.18,
                vy: -(Math.random() * 0.25 + 0.05),
                a: Math.random() * 0.5 + 0.2,
                t: Math.random() * Math.PI * 2
            });
        }

        function tick(){
            ctx.clearRect(0, 0, W, H);
            for(const p of particles){
                p.x += p.vx;
                p.y += p.vy;
                p.t += 0.02;
                const alpha = (Math.sin(p.t) * 0.3 + 0.7) * p.a;

                if(p.y < -10){ p.y = H + 10; p.x = Math.random() * W; }
                if(p.x < -10) p.x = W + 10;
                if(p.x > W + 10) p.x = -10;

                const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                grd.addColorStop(0, `rgba(216,191,153,${alpha})`);
                grd.addColorStop(1, 'rgba(216,191,153,0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                ctx.fill();
            }
            requestAnimationFrame(tick);
        }
        tick();

        window.addEventListener('resize', () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        });
    }

    /* ---------- Smooth anchor easing ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if(id.length > 1){
                const target = document.querySelector(id);
                if(target){
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    /* ---------- Mobile Menu Toggle ---------- */
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            const isActive = navToggle.classList.contains('is-active');
            if (isActive) {
                navToggle.classList.remove('is-active');
                mobileMenu.classList.remove('is-active');
                document.body.classList.remove('mobile-menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            } else {
                navToggle.classList.add('is-active');
                mobileMenu.classList.add('is-active');
                document.body.classList.add('mobile-menu-open');
                navToggle.setAttribute('aria-expanded', 'true');
                mobileMenu.setAttribute('aria-hidden', 'false');
            }
        });

        // Close mobile menu on clicking links inside it
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('is-active');
                mobileMenu.classList.remove('is-active');
                document.body.classList.remove('mobile-menu-open');
                navToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
    }

    /* ---------- Clock in hero footrail ---------- */
    const timeEl = document.getElementById('heroTime');
    if(timeEl){
        function updateTime(){
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // standard AM/PM clock mapping
            timeEl.textContent = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        }
        updateTime();
        setInterval(updateTime, 1000);
    }

})();
