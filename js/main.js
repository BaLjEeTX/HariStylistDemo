/* ============================================================
   MAIN — orchestrates loader, cursor, nav, particles, anims
   ============================================================ */

(function(){

    // Helper to return the inline SVG for combo illustration based on string name
    function getIllustrationSVG(name) {
        if (name === 'combo-1') {
            return `<svg class="combo__illustration" viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.1">
                <circle cx="50" cy="60" r="26"/>
                <circle cx="100" cy="60" r="26"/>
                <circle cx="150" cy="60" r="26"/>
                <path d="M40 52c4-6 12-10 20-6M90 50c4-6 14-8 20-3M140 52c5-6 14-8 20-3"/>
                <circle cx="46" cy="60" r="1.4" fill="currentColor"/><circle cx="54" cy="60" r="1.4" fill="currentColor"/>
                <circle cx="96" cy="60" r="1.4" fill="currentColor"/><circle cx="104" cy="60" r="1.4" fill="currentColor"/>
                <circle cx="146" cy="60" r="1.4" fill="currentColor"/><circle cx="154" cy="60" r="1.4" fill="currentColor"/>
                <path d="M44 68c4 4 8 4 12 0M94 68c4 4 8 4 12 0M144 68c4 4 8 4 12 0"/>
            </svg>`;
        }
        if (name === 'combo-2') {
            return `<svg class="combo__illustration" viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.1">
                <path d="M70 20 q14 14 10 38 q-4 22 4 42 q3 10 -2 18"/>
                <path d="M130 20 q-14 14 -10 38 q4 22 -4 42 q-3 10 2 18"/>
                <path d="M80 50 h40 M78 70 h44 M80 90 h40"/>
                <circle cx="100" cy="14" r="6"/>
                <circle cx="100" cy="116" r="4"/>
            </svg>`;
        }
        if (name === 'combo-3') {
            return `<svg class="combo__illustration" viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.1">
                <ellipse cx="100" cy="60" rx="34" ry="44"/>
                <path d="M68 44 q32 -28 64 0"/>
                <circle cx="92" cy="60" r="1.6" fill="currentColor"/>
                <circle cx="108" cy="60" r="1.6" fill="currentColor"/>
                <path d="M92 78 q8 6 16 0"/>
                <path d="M150 24 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" fill="currentColor" opacity=".7"/>
                <path d="M40 70 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill="currentColor" opacity=".7"/>
            </svg>`;
        }
        return `<svg class="combo__illustration" viewBox="0 0 200 120" fill="none" stroke="currentColor" stroke-width="1.1">
            <circle cx="100" cy="60" r="26"/>
        </svg>`;
    }

    // Apply JSON data dynamically to DOM
    function applySalonData(data) {
        try {
            const phone = data.contact.phone;
            const phoneRaw = data.contact.phoneRaw;
            
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                link.href = `tel:${phoneRaw}`;
                const innerTextEl = link.querySelector('.sticky__call-text, .mobile-menu__cta');
                if (innerTextEl) {
                    innerTextEl.textContent = phone;
                } else if (!link.querySelector('span, svg') && (link.textContent.includes('7405') || link.textContent.trim().match(/^\d/))) {
                    link.textContent = phone;
                }
            });
            document.querySelectorAll('.sticky__call-text, .contact-card__value').forEach(el => {
                if (el.textContent.includes('7405') || el.textContent.trim().match(/^\d/)) {
                    el.textContent = phone;
                }
            });
            
            document.querySelectorAll('.nav__brand-sub').forEach(el => {
                if (el.textContent.includes('salon · vadodara')) {
                    el.textContent = `salon · ${data.contact.addressShort.toLowerCase().split(',')[0].trim()}`;
                }
            });
            document.querySelectorAll('.hero__edge--left span').forEach(el => {
                if (el.textContent.includes('Vadodara · Gujarat')) {
                    el.textContent = data.contact.addressShort;
                }
            });
            document.querySelectorAll('.marquee__group span').forEach(el => {
                if (el.textContent.includes('Master craft, Vadodara')) {
                    el.textContent = `Master craft, ${data.contact.addressShort.split(',')[0].trim()}`;
                }
            });
            
            const contactCards = document.querySelectorAll('.contact-card');
            contactCards.forEach(card => {
                const label = card.querySelector('.contact-card__label');
                if (label && label.textContent.includes('The Address')) {
                    const val = card.querySelector('.contact-card__value');
                    const sub = card.querySelector('.contact-card__sub');
                    if (val) val.textContent = data.contact.addressName;
                    if (sub) sub.textContent = data.contact.addressSub;
                }
                if (label && label.textContent.includes('Hours')) {
                    const val = card.querySelector('.contact-card__value');
                    const sub = card.querySelector('.contact-card__sub');
                    if (val) val.innerHTML = data.contact.hours;
                    if (sub) sub.textContent = data.contact.hoursSub;
                }
            });
            
            const footerCols = document.querySelectorAll('.footer__col');
            footerCols.forEach(col => {
                const h4 = col.querySelector('h4');
                if (h4 && h4.textContent.includes('Visit')) {
                    const p = col.querySelector('p');
                    if (p) {
                        const addressParts = data.contact.addressSub.split('·');
                        const mainAddress = data.contact.addressShort;
                        const country = addressParts[1] ? addressParts[1].trim() : 'India';
                        p.innerHTML = `${mainAddress}<br/>${country}`;
                    }
                }
                if (h4 && h4.textContent.includes('Hours')) {
                    const p = col.querySelector('p');
                    if (p) {
                        p.innerHTML = `Open daily<br/>${data.contact.hours}`;
                    }
                }
            });
            
            const stickyLoc = document.querySelector('.sticky__loc');
            if (stickyLoc) {
                const svg = stickyLoc.querySelector('svg');
                stickyLoc.innerHTML = '';
                if (svg) stickyLoc.appendChild(svg);
                stickyLoc.appendChild(document.createTextNode(' ' + data.contact.addressShort));
            }

            // 2. Build Combos
            const combosContainer = document.querySelector('.combos');
            if (combosContainer && data.combos && data.combos.length > 0) {
                combosContainer.innerHTML = '';
                data.combos.forEach((combo, idx) => {
                    const featuredClass = combo.featured ? ' combo--featured' : '';
                    const cardIndex = idx + 1;
                    const article = document.createElement('article');
                    article.className = `combo${featuredClass} reveal-card`;
                    article.setAttribute('data-card', cardIndex);
                    
                    article.innerHTML = `
                        <header class="combo__head">
                            <span class="combo__num">${combo.num}</span>
                            <span class="combo__chip">${combo.chip}</span>
                        </header>
                        <div class="combo__media">
                            ${getIllustrationSVG(combo.illustration)}
                        </div>
                        <h3 class="combo__title">${combo.title}</h3>
                        <p class="combo__desc">${combo.desc}</p>
                        <div class="combo__price">
                            <span class="combo__price-strike">${combo.priceStrike}</span>
                            <span class="combo__price-now" data-target="${combo.priceNow}">₹0</span>
                        </div>
                        <a href="#contact" class="combo__cta">
                            <span>Reserve combo</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        </a>
                    `;
                    combosContainer.appendChild(article);
                });
            }

            // 3. Build Services Menu
            const menuContainer = document.querySelector('.menu');
            if (menuContainer && data.services && data.services.length > 0) {
                menuContainer.innerHTML = '';
                data.services.forEach(service => {
                    const li = document.createElement('li');
                    li.className = 'menu__row reveal-row';
                    li.innerHTML = `
                        <span class="menu__num">${service.num}</span>
                        <h3 class="menu__name">${service.name}</h3>
                        <p class="menu__desc">${service.desc}</p>
                        <span class="menu__price">${service.price}</span>
                    `;
                    menuContainer.appendChild(li);
                });
            }
        } catch (e) {
            console.error('Error applying salon data:', e);
        }
    }

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

    // Fetch JSON data immediately
    fetch('salon-data.json')
        .then(res => res.json())
        .then(data => applySalonData(data))
        .catch(err => console.warn('Failed to load salon data JSON, falling back to static HTML.', err));

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

        // Event delegation for cursor glow scale
        let activeInteractive = null;
        document.body.addEventListener('mouseover', (e) => {
            const target = e.target.closest('a, .btn, .combo, .contact-card, .menu__row, .pillar');
            if (target && target !== activeInteractive) {
                activeInteractive = target;
                glow.style.width = glow.style.height = '520px';
            }
        });
        document.body.addEventListener('mouseout', (e) => {
            const target = e.target.closest('a, .btn, .combo, .contact-card, .menu__row, .pillar');
            if (target && e.relatedTarget && !target.contains(e.relatedTarget)) {
                activeInteractive = null;
                glow.style.width = glow.style.height = '380px';
            }
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
    document.body.addEventListener('click', (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (a) {
            const id = a.getAttribute('href');
            if (id.length > 1) {
                const target = document.querySelector(id);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 60;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        }
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
