document.addEventListener("DOMContentLoaded", () => {
    // 1. Custom Cursor Setup
    const cursorDot = document.createElement('div');
    cursorDot.id = 'custom-cursor-dot';
    document.body.appendChild(cursorDot);
    
    const cursorRing = document.createElement('div');
    cursorRing.id = 'custom-cursor-ring';
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    // Only enable custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth follow for the ring
        const renderCursor = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderCursor);
        };
        renderCursor();

        // Hover effects
        const setupHoverEffects = () => {
            const hoverElements = document.querySelectorAll('a, button, .portfolio-card, .skill-badge');
            hoverElements.forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hovering'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hovering'));
            });
        };
        setupHoverEffects();
    }

    // 2. Initialize Lenis
    const lenis = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. GSAP Initialization
    gsap.registerPlugin(ScrollTrigger);

    // Sync Lenis and ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000)
    });
    gsap.ticker.lagSmoothing(0);

    // 4. Preloader Sequence
    const tlPreloader = gsap.timeline();
    
    // Prevent scrolling during preloader
    lenis.stop();
    document.body.style.overflow = 'hidden';

    tlPreloader.to('.wheel-symbol', {
        rotation: 360,
        duration: 2,
        ease: 'power2.inOut'
    })
    .to('.preloader-text', {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.out'
    }, "-=0.5")
    .to('#preloader', {
        yPercent: -100,
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
            lenis.start();
            document.body.style.overflow = '';
            initHeroAnimations();
        }
    });

    // 5. Hero Animations
    function initHeroAnimations() {
        const heroTitle = new SplitType('.hero-headline', { types: 'chars' });
        
        gsap.from(heroTitle.chars, {
            scale: 1.5,
            y: 50,
            opacity: 0,
            color: '#FF6A00',
            textShadow: '0 0 50px #FF6A00',
            stagger: 0.1,
            duration: 2.5,
            ease: 'power4.out',
            filter: 'blur(20px)',
            onComplete: () => {
                // Clear inline styles so CSS burn-effect animation takes over smoothly
                gsap.set(heroTitle.chars, { clearProps: "all" });
            }
        });

        gsap.from('.hero-sub', {
            y: 30,
            opacity: 0,
            duration: 1,
            delay: 0.5,
            ease: 'power3.out'
        });

        gsap.from('.hero-desc', {
            x: -30,
            opacity: 0,
            duration: 1,
            delay: 0.8,
            ease: 'power3.out'
        });

        gsap.from('.hero-cta a', {
            y: 20,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            delay: 1,
            ease: 'power3.out'
        });

        gsap.from('#hero-trident', {
            scale: 0.8,
            opacity: 0,
            y: 50,
            duration: 2,
            ease: 'power4.out',
            filter: 'blur(20px)'
        }, "-=1.5");
        
        gsap.to('#hero-bg-img', {
            scale: 1,
            duration: 15,
            ease: 'none'
        });
    }

    // 6. Canvas Animation (Smoke and Fire Embers)
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height; // start from bottom
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * -2 - 0.5;
            this.color = Math.random() > 0.7 ? '#FF6A00' : '#8B0000'; // Embers
            this.alpha = Math.random() * 0.8 + 0.2;
            this.life = Math.random() * 300 + 100;
        }

        update() {
            // Sway effect based on mouse position
            let sway = 0;
            if (mouseX) {
                sway = (mouseX - width / 2) * 0.001;
            }
            
            this.x += this.speedX + sway;
            this.y += this.speedY;
            this.life--;
            
            if (this.size > 0.1) this.size -= 0.005;

            if (this.life <= 0 || this.y < 0) {
                this.x = Math.random() * width;
                this.y = height + 10;
                this.life = Math.random() * 300 + 100;
                this.size = Math.random() * 2.5 + 0.5;
            }
        }

        draw() {
            ctx.globalAlpha = this.alpha * (this.life / 400);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Init particles
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        
        // Add subtle smoke background effect
        if (mouseX && mouseY) {
            const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 600);
            gradient.addColorStop(0, 'rgba(255, 106, 0, 0.04)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // 7. GSAP Scroll Animations

    // Horizontal Story Scroll (Only on desktop)
    const storyPanels = gsap.utils.toArray('.story-panel');
    if (window.innerWidth > 768 && storyPanels.length > 0) {
        const horizontalTween = gsap.to(storyPanels, {
            xPercent: -100 * (storyPanels.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: "#story-scroll",
                pin: true,
                scrub: 1,
                end: () => "+=" + document.querySelector("#story-scroll").offsetWidth * 3
            }
        });

        // Animate text inside panels based on container animation
        storyPanels.forEach((panel, i) => {
            const title = panel.querySelector('.panel-title');
            const text = panel.querySelector('.panel-text');
            
            gsap.from([title, text], {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: horizontalTween,
                    start: "left center+=200",
                    toggleActions: "play none none reverse"
                }
            });
        });
    } else {
        // Mobile fallback animations
        storyPanels.forEach((panel, i) => {
            const title = panel.querySelector('.panel-title');
            const text = panel.querySelector('.panel-text');
            
            gsap.from([title, text], {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                scrollTrigger: {
                    trigger: panel,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    // Section Titles
    const sectionTitles = gsap.utils.toArray('.section-title');
    sectionTitles.forEach(title => {
        gsap.from(title, {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
            }
        });
    });

    // Portfolio Animations
    const portfolioCards = gsap.utils.toArray('.portfolio-card');
    portfolioCards.forEach((card, i) => {
        gsap.from(card, {
            y: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // Skills Animations
    gsap.from('.skill-badge', {
        scale: 0.5,
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: "#skills",
            start: "top 70%",
        }
    });

    // Quote Parallax
    gsap.from('.quote-text', {
        yPercent: 30,
        opacity: 0.5,
        ease: "none",
        scrollTrigger: {
            trigger: "#quote",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Testimonials
    gsap.from('.testimonial-card', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#testimonials",
            start: "top 75%",
        }
    });

    // Final CTA
    const ctaTitle = new SplitType('.cta-title', { types: 'chars' });
    gsap.from(ctaTitle.chars, {
        y: -100,
        opacity: 0,
        stagger: 0.05,
        duration: 1.5,
        ease: "bounce.out",
        scrollTrigger: {
            trigger: "#cta",
            start: "top 60%",
        }
    });
    
    gsap.from('.cta-buttons a', {
        scale: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.2,
        duration: 1,
        delay: 0.8,
        ease: "power3.out",
        scrollTrigger: {
            trigger: "#cta",
            start: "top 60%",
        }
    });
});
