/**
 * GVBYTES.COM — Unified 16-Bit Voxel Sky-Isle Diorama & Real DOM Text Physics Engine
 * Zero purple gradients • Sleek Terminal • Interactive 3D Biome Controls
 */

(function () {
    'use strict';

    const GH_USER = 'gvbytes';
    const EXCLUDE_REPOS = ['gvbytes', 'gaurav-portfolio'];

    // Featured Security Projects
    const FEATURED_PROJECTS = [
        {
            name: "TrustHouse",
            badge: "FLAGSHIP // SECURITY",
            lang: "Python",
            description: "A secure, transparent authentication and verification framework engineered for verifiable data exchanges and zero-trust identity architectures.",
            tags: ["Zero-Trust", "Cryptography", "Verification"],
            url: "https://github.com/gvbytes/trusthouse"
        },
        {
            name: "PassGauge",
            badge: "TOOL // ENTROPY",
            lang: "Python",
            description: "Advanced password entropy calculator and pattern strength auditor evaluating mathematical randomness and brute-force resistance.",
            tags: ["Entropy Analysis", "Heuristics"],
            url: "https://github.com/gvbytes/passgauge"
        },
        {
            name: "LinkSleuth",
            badge: "THREAT INTEL",
            lang: "Python",
            description: "Automated URL analysis and phishing threat intelligence scanner inspecting redirection chains, domain heuristics, SSL validity, and payload indicators.",
            tags: ["OSINT", "Phishing Detection"],
            url: "https://github.com/gvbytes/linksleuth"
        },
        {
            name: "VaultLock",
            badge: "CRYPTOGRAPHY",
            lang: "Python / Cryptography",
            description: "Local encrypted secret store utilizing authenticated AES-GCM-256 and Argon2 key derivation for secure credential isolation and zero plaintext exposure.",
            tags: ["AES-256-GCM", "Argon2id"],
            url: "https://github.com/gvbytes/vaultlock"
        },
        {
            name: "ThreatMind AI",
            badge: "AI & SEC",
            lang: "Python / ML",
            description: "Machine learning and anomaly detection pipeline classifying suspicious network log records and telemetry vectors for automated SOC alert triaging.",
            tags: ["Anomaly Detection", "SOC Triage"],
            url: "https://github.com/gvbytes/threatmind-ai"
        },
        {
            name: "SRM Secure Browser Audit",
            badge: "RESEARCH REPORT",
            lang: "Security Audit",
            description: "Detailed vulnerability analysis and penetration testing report discovering process isolation and integrity bypass flaws in proctored browser software.",
            tags: ["AppSec", "Sandbox Bypass"],
            url: "srm-secure-browser-report.html"
        }
    ];

    /* ==========================================================================
       THEME TOGGLE
       ========================================================================== */
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        const saved = localStorage.getItem('gv-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);

        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('gv-theme', next);
        });
    }

    /* ==========================================================================
       3D VOXEL SKY-ISLE DIORAMA BACKGROUND & WEATHER CONTROLLER
       ========================================================================== */
    let dioramaMaterials = {};

    function init3DVoxelScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas || !window.THREE) return;

        const THREE = window.THREE;
        const isMobile = window.innerWidth < 768;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 24);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const diorama = new THREE.Group();
        scene.add(diorama);
        diorama.position.set(isMobile ? 0 : 7.2, 0.5, 0);

        const vSize = 0.45;
        const vGeo = new THREE.BoxGeometry(vSize, vSize, vSize);

        // Voxel materials (No purple!)
        dioramaMaterials.mGrass = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        dioramaMaterials.mDirt = new THREE.MeshBasicMaterial({ color: 0x27272a });
        dioramaMaterials.mStone = new THREE.MeshBasicMaterial({ color: 0x52525b });
        dioramaMaterials.mGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        dioramaMaterials.mWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        dioramaMaterials.mTree = new THREE.MeshBasicMaterial({ color: 0x059669 });
        dioramaMaterials.mTrunk = new THREE.MeshBasicMaterial({ color: 0x78350f });
        dioramaMaterials.mWater = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });

        // Island base
        const radius = 6;
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const dist = Math.sqrt(x * x + z * z);
                if (dist <= radius) {
                    const depth = Math.floor((radius - dist) * 0.8) + 1;
                    for (let y = 0; y >= -depth; y--) {
                        let mat = (y === 0) ? dioramaMaterials.mGrass : ((y === -depth) ? dioramaMaterials.mStone : dioramaMaterials.mDirt);
                        if (x === 3 && y === 0) mat = dioramaMaterials.mWater;
                        const block = new THREE.Mesh(vGeo, mat);
                        block.position.set(x * vSize, y * vSize, z * vSize);
                        diorama.add(block);
                    }
                }
            }
        }

        // Voxel Pine Tree
        const treeX = -2 * vSize;
        const treeZ = -1 * vSize;
        for (let y = 1; y <= 3; y++) {
            const trunk = new THREE.Mesh(vGeo, dioramaMaterials.mTrunk);
            trunk.position.set(treeX, y * vSize, treeZ);
            diorama.add(trunk);
        }
        for (let fx = -1; fx <= 1; fx++) {
            for (let fz = -1; fz <= 1; fz++) {
                for (let fy = 4; fy <= 6; fy++) {
                    if (fy === 6 && (Math.abs(fx) + Math.abs(fz) > 0)) continue;
                    const leaf = new THREE.Mesh(vGeo, dioramaMaterials.mTree);
                    leaf.position.set(treeX + fx * vSize, fy * vSize, treeZ + fz * vSize);
                    diorama.add(leaf);
                }
            }
        }

        // Voxel Mountain Peak
        for (let my = 1; my <= 4; my++) {
            const pR = 4 - my;
            for (let px = -pR; px <= pR; px++) {
                for (let pz = -pR; pz <= pR; pz++) {
                    if (Math.abs(px) + Math.abs(pz) <= pR) {
                        const rock = new THREE.Mesh(vGeo, my === 4 ? dioramaMaterials.mWhite : dioramaMaterials.mStone);
                        rock.position.set((px + 2) * vSize, my * vSize, (pz + 1) * vSize);
                        diorama.add(rock);
                    }
                }
            }
        }

        // Orbiting Moon & Cloud
        const orbitRig = new THREE.Group();
        diorama.add(orbitRig);

        const moonRig = new THREE.Group();
        for (let mx = -1; mx <= 1; mx++) {
            for (let my = -1; my <= 1; my++) {
                for (let mz = -1; mz <= 1; mz++) {
                    if (Math.abs(mx) + Math.abs(my) + Math.abs(mz) <= 2) {
                        const mB = new THREE.Mesh(vGeo, dioramaMaterials.mGold);
                        mB.position.set(mx * vSize, my * vSize, mz * vSize);
                        moonRig.add(mB);
                    }
                }
            }
        }
        moonRig.position.set(4.5, 3.5, 0);
        orbitRig.add(moonRig);

        const cloudRig = new THREE.Group();
        for (let cx = -2; cx <= 2; cx++) {
            for (let cz = -1; cz <= 1; cz++) {
                const cB = new THREE.Mesh(vGeo, dioramaMaterials.mWhite);
                cB.position.set(cx * vSize, Math.sin(cx) * 0.2, cz * vSize);
                cloudRig.add(cB);
            }
        }
        cloudRig.position.set(-4.5, 2.8, 0);
        orbitRig.add(cloudRig);

        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.015;

            diorama.position.y = 0.5 + Math.sin(time) * 0.25;
            diorama.rotation.y = time * 0.15 + mouseX * 0.3;
            diorama.rotation.x = 0.25 - mouseY * 0.2;

            orbitRig.rotation.y = time * 0.3;
            cloudRig.rotation.y += 0.01;

            camera.position.x += (mouseX * 2 - camera.position.x) * 0.04;
            camera.position.y += (8 - mouseY * 2 - camera.position.y) * 0.04;
            camera.lookAt(2, 0, 0);

            renderer.render(scene, camera);
        }
        animate();
    }

    function initWeatherControls() {
        const btns = document.querySelectorAll('.weather-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-weather');
                btns.forEach(b => b.classList.toggle('active', b === btn));

                if (!dioramaMaterials.mGrass) return;

                if (mode === 'golden') {
                    dioramaMaterials.mGrass.color.setHex(0x10b981);
                    dioramaMaterials.mGold.color.setHex(0xf59e0b);
                    document.documentElement.style.setProperty('--color-gold', '#fcd116');
                } else if (mode === 'lunar') {
                    dioramaMaterials.mGrass.color.setHex(0x064e3b);
                    dioramaMaterials.mGold.color.setHex(0x00d4ff);
                    document.documentElement.style.setProperty('--color-gold', '#00d4ff');
                } else if (mode === 'cloudy') {
                    dioramaMaterials.mGrass.color.setHex(0x059669);
                    dioramaMaterials.mGold.color.setHex(0xe2e8f0);
                    document.documentElement.style.setProperty('--color-gold', '#e2e8f0');
                }
            });
        });
    }

    /* ==========================================================================
       AUTHENTIC DOM TEXT PHYSICS ENGINE (GRAVITY / VACUUM / BLACKHOLE / EXPLODE)
       ========================================================================== */
    class PhysicsBody {
        constructor(element, type, container) {
            this.element = element;
            this.type = type;
            this.container = container || element.closest('section, footer, #hero') || document.body;
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.rotation = 0;
            this.vrotation = 0;
            this.scale = 1;
            this.opacity = 1;

            this.width = 0;
            this.height = 0;
            this.initialX = 0;
            this.initialY = 0;
            this.floorY = 0;
            this.ceilingY = 0;
            this.leftWallX = 0;
            this.rightWallX = 0;
        }

        initLayout(containerCache) {
            const r = this.element.getBoundingClientRect();
            this.width = r.width;
            this.height = r.height;
            this.initialX = r.left + window.scrollX;
            this.initialY = r.top + window.scrollY;
            this.updateContainerBounds(containerCache);
        }

        updateContainerBounds(containerCache) {
            let r;
            if (containerCache && containerCache.has(this.container)) {
                r = containerCache.get(this.container);
            } else {
                r = this.container.getBoundingClientRect();
                if (containerCache) containerCache.set(this.container, r);
            }
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;
            this.floorY = r.bottom + scrollY - 30;
            this.ceilingY = r.top + scrollY + 15;
            this.leftWallX = r.left + scrollX + 15;
            this.rightWallX = r.right + scrollX - 15;
        }

        updateRect() {
            const prevTransform = this.element.style.transform;
            this.element.style.transform = '';
            const r = this.element.getBoundingClientRect();
            this.width = r.width;
            this.height = r.height;
            this.initialX = r.left + window.scrollX;
            this.initialY = r.top + window.scrollY;
            this.element.style.transform = prevTransform;
        }

        reset() {
            this.x = 0;
            this.y = 0;
            this.vx = 0;
            this.vy = 0;
            this.rotation = 0;
            this.vrotation = 0;
            this.scale = 1;
            this.opacity = 1;
            this.element.classList.add('resetting');
            this.applyStyles();
            setTimeout(() => {
                this.element.classList.remove('resetting');
                this.element.style.transform = '';
                this.element.style.opacity = '';
            }, 800);
        }

        applyStyles() {
            this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.rotation}deg) scale(${this.scale})`;
            this.element.style.opacity = this.opacity;
        }
    }

    let physicsActive = false;
    let physicsMode = null;
    let physicsBodies = [];
    let physicsFrameId = null;
    let isMouseDown = false;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX + window.scrollX;
        mousePos.y = e.clientY + window.scrollY;
    }, { passive: true });
    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    function preparePhysicsBodies() {
        const bodies = [];

        function splitText(el, splitType = 'letter') {
            if (!el) return;
            if (el.dataset.physicsProcessed) return;
            el.dataset.physicsProcessed = 'true';

            const lines = el.innerHTML.split(/<br\s*\/?>/i);
            el.innerHTML = '';

            lines.forEach((lineHtml) => {
                const lineContainer = document.createElement('span');
                lineContainer.style.display = 'block';
                lineContainer.className = 'phy-line-container';

                const temp = document.createElement('div');
                temp.innerHTML = lineHtml.trim();

                processNode(temp, lineContainer);
                el.appendChild(lineContainer);
            });

            function processNode(node, container) {
                Array.from(node.childNodes).forEach((child) => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        const text = child.textContent;
                        const words = text.split(/(\s+)/);
                        words.forEach((chunk) => {
                            if (chunk.trim().length === 0) {
                                if (chunk.length > 0) {
                                    const space = document.createElement('span');
                                    space.className = 'phy-space';
                                    space.textContent = ' ';
                                    container.appendChild(space);
                                }
                            } else {
                                if (splitType === 'letter') {
                                    const wordSpan = document.createElement('span');
                                    wordSpan.className = 'phy-word';

                                    Array.from(chunk).forEach((char) => {
                                        const span = document.createElement('span');
                                        span.className = 'phy-particle';
                                        span.textContent = char;
                                        wordSpan.appendChild(span);
                                        bodies.push(new PhysicsBody(span, 'letter', el));
                                    });
                                    container.appendChild(wordSpan);
                                } else {
                                    const span = document.createElement('span');
                                    span.className = 'phy-particle';
                                    span.textContent = chunk;
                                    container.appendChild(span);
                                    bodies.push(new PhysicsBody(span, 'word', el));
                                }
                            }
                        });
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const cloned = child.cloneNode(false);
                        cloned.classList.add('phy-cloned-wrapper');
                        container.appendChild(cloned);
                        processNode(child, cloned);
                    }
                });
            }
        }

        splitText(document.querySelector('.hero-name'), isMobile ? 'word' : 'letter');
        splitText(document.querySelector('.hero-tagline'), isMobile ? 'word' : 'letter');

        document.querySelectorAll('.section-header h2').forEach((h2) => {
            splitText(h2, isMobile ? 'word' : 'letter');
        });

        document.querySelectorAll('.about-text p, .section-subtitle, .footer-bottom p, .cert-description').forEach((p) => {
            splitText(p, 'word');
        });

        const badgeEl = document.querySelector('.hero-badge');
        if (badgeEl) {
            badgeEl.classList.add('phy-particle');
            bodies.push(new PhysicsBody(badgeEl, 'badge'));
        }

        document.querySelectorAll('.hero-cta a').forEach((btn) => {
            btn.classList.add('phy-particle');
            bodies.push(new PhysicsBody(btn, 'button'));
        });

        const cardSelectors = ['.project-card', '.learning-card', '.cert-card', '.social-card', '.terminal-window', '.milestone-card'];
        cardSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((card) => {
                card.classList.add('phy-particle');
                bodies.push(new PhysicsBody(card, 'card'));
            });
        });

        const containerCache = new Map();
        bodies.forEach((b) => b.initLayout(containerCache));
        return bodies;
    }

    function runPhysicsLoop() {
        if (!physicsActive) return;

        const vtx = document.getElementById('black-hole-vortex');
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const time = performance.now() * 0.001;
        const docWidth = document.documentElement.scrollWidth;
        const docHeight = document.documentElement.scrollHeight;

        if (physicsMode === 'blackhole' && vtx) {
            vtx.style.left = `${mousePos.x - scrollX}px`;
            vtx.style.top = `${mousePos.y - scrollY}px`;
        }

        physicsBodies.forEach((p) => {
            const floorY = p.floorY;
            const ceilingY = p.ceilingY;
            const leftWallX = p.leftWallX;
            const rightWallX = p.rightWallX;

            const absX = p.initialX + p.x;
            const absY = p.initialY + p.y;

            if (physicsMode === 'gravity') {
                p.vy += 0.28;
                p.vx *= 0.98;

                const dx = (absX + p.width / 2) - mousePos.x;
                const dy = (absY + p.height / 2) - mousePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pushRadius = 150;
                if (dist < pushRadius) {
                    const force = (1 - dist / pushRadius) * 3.5;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                    p.vrotation = (Math.random() - 0.5) * force * 15;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vrotation;
                p.vrotation *= 0.97;

                const bottomY = p.initialY + p.y + p.height;
                if (bottomY >= floorY) {
                    p.y = floorY - p.initialY - p.height;
                    p.vy = -p.vy * 0.55;
                    p.vx *= 0.8;
                    p.vrotation = (Math.random() - 0.5) * p.vy * 5;
                    if (Math.abs(p.vy) < 0.2) p.vy = 0;
                }

                if (absX <= leftWallX) {
                    p.x = leftWallX - p.initialX;
                    p.vx = -p.vx * 0.6;
                } else if (absX + p.width >= rightWallX) {
                    p.x = rightWallX - p.initialX - p.width;
                    p.vx = -p.vx * 0.6;
                }
            } else if (physicsMode === 'vacuum') {
                const waveAmp = isMobile ? 0.22 : 0.08;
                const waveX = Math.sin(time * 0.6 + p.initialY * 0.05) * waveAmp;
                const waveY = Math.cos(time * 0.5 + p.initialX * 0.05) * waveAmp;
                p.vx += waveX;
                p.vy += waveY;

                const dx = mousePos.x - (absX + p.width / 2);
                const dy = mousePos.y - (absY + p.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (isMouseDown) {
                    const maxSuctionDist = 450;
                    if (dist > 10 && dist < maxSuctionDist) {
                        const force = (1 - dist / maxSuctionDist) * 1.5;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }
                } else {
                    const maxSuctionDist = 200;
                    if (dist < maxSuctionDist) {
                        const force = (1 - dist / maxSuctionDist) * 0.15;
                        p.vx += (dx / dist) * force;
                        p.vy += (dy / dist) * force;
                    }
                }

                p.vx *= 0.96;
                p.vy *= 0.96;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.vx * 1.2;

                const currentAbsX = p.initialX + p.x;
                const currentAbsY = p.initialY + p.y;
                
                if (currentAbsY <= ceilingY) { p.y = ceilingY - p.initialY; p.vy *= -0.7; }
                else if (currentAbsY + p.height >= floorY) { p.y = floorY - p.initialY - p.height; p.vy *= -0.7; }

                if (currentAbsX <= leftWallX) { p.x = leftWallX - p.initialX; p.vx *= -0.7; }
                else if (currentAbsX + p.width >= rightWallX) { p.x = rightWallX - p.initialX - p.width; p.vx *= -0.7; }
            } else if (physicsMode === 'blackhole') {
                const dx = mousePos.x - (absX + p.width / 2);
                const dy = mousePos.y - (absY + p.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    const pull = (isMobile ? 2200 : 3800) / (dist * dist + 700);
                    const ox = -dy / dist;
                    const oy = dx / dist;
                    const swirl = isMobile ? 3.0 : 5.0;

                    p.vx += (dx / dist) * pull + ox * swirl;
                    p.vy += (dy / dist) * pull + oy * swirl;
                }

                p.vx *= 0.93;
                p.vy *= 0.93;
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += 3.0;

                const eventHorizon = isMobile ? 120 : 220;
                if (dist < eventHorizon) {
                    const ratio = dist / eventHorizon;
                    p.scale = ratio;
                    p.opacity = ratio;
                } else {
                    p.scale = 1;
                    p.opacity = 1;
                }

                if (dist < 15) {
                    p.scale = 0;
                    p.opacity = 0;
                }
            } else if (physicsMode === 'explode') {
                p.vy += 0.15;
                p.vx *= 0.985;

                const dx = (absX + p.width / 2) - mousePos.x;
                const dy = (absY + p.height / 2) - mousePos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const pushRadius = 180;
                if (dist < pushRadius) {
                    const force = (1 - dist / pushRadius) * 4.5;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += (p.vx + p.vy) * 1.5;

                const bottomY = p.initialY + p.y + p.height;
                if (bottomY >= floorY) {
                    p.y = floorY - p.initialY - p.height;
                    p.vy = -p.vy * 0.4;
                    p.vx *= 0.7;
                    if (Math.abs(p.vy) < 0.3) p.vy = 0;
                }

                if (p.initialY + p.y <= ceilingY) { p.y = ceilingY - p.initialY; p.vy *= -0.4; }
                if (absX <= leftWallX) { p.x = leftWallX - p.initialX; p.vx = -p.vx * 0.5; }
                else if (absX + p.width >= rightWallX) { p.x = rightWallX - p.initialX - p.width; p.vx = -p.vx * 0.5; }
            }

            const maxV = 30;
            if (p.vx > maxV) p.vx = maxV; else if (p.vx < -maxV) p.vx = -maxV;
            if (p.vy > maxV) p.vy = maxV; else if (p.vy < -maxV) p.vy = -maxV;

            p.applyStyles();
        });

        physicsFrameId = requestAnimationFrame(runPhysicsLoop);
    }

    function initTextPhysics() {
        const dock = document.getElementById('physics-dock');
        const vtx = document.getElementById('black-hole-vortex');
        if (!dock) return;

        const btns = dock.querySelectorAll('.dock-btn[data-mode]');
        const resetBtn = document.getElementById('btn-reset');

        function ensureBodies() {
            if (physicsBodies.length === 0) {
                physicsBodies = preparePhysicsBodies();
            }
        }

        btns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                ensureBodies();

                if (btn.classList.contains('active')) {
                    deactivatePhysics();
                    return;
                }

                btns.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                physicsMode = mode;
                physicsActive = true;
                document.body.classList.add('phy-active');
                document.documentElement.classList.add('phy-active');

                document.body.classList.remove('phy-shake');
                void document.body.offsetWidth;
                document.body.classList.add('phy-shake');
                setTimeout(() => document.body.classList.remove('phy-shake'), 400);

                if (vtx) {
                    vtx.classList.toggle('active', mode === 'blackhole');
                }

                if (mode === 'explode') {
                    const cx = window.innerWidth / 2 + window.scrollX;
                    const cy = window.innerHeight / 2 + window.scrollY;
                    physicsBodies.forEach((p) => {
                        const px = p.initialX + p.x + p.width / 2;
                        const py = p.initialY + p.y + p.height / 2;
                        let dx = px - cx;
                        let dy = py - cy;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = (isMobile ? 6 : 12) + Math.random() * (isMobile ? 5 : 10);
                        p.vx = (dx / dist) * force + (Math.random() - 0.5) * (isMobile ? 2 : 4);
                        p.vy = (dy / dist) * force - Math.random() * (isMobile ? 3 : 6);
                        p.scale = 1;
                        p.opacity = 1;
                    });
                } else {
                    const initV = isMobile ? 3 : 6;
                    physicsBodies.forEach((p) => {
                        p.vx = (Math.random() - 0.5) * initV;
                        p.vy = (Math.random() - 0.5) * initV;
                        p.scale = 1;
                        p.opacity = 1;
                    });
                }

                cancelAnimationFrame(physicsFrameId);
                runPhysicsLoop();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', deactivatePhysics);
        }

        function deactivatePhysics() {
            btns.forEach((b) => b.classList.remove('active'));
            physicsActive = false;
            physicsMode = null;
            document.body.classList.remove('phy-active');
            document.documentElement.classList.remove('phy-active');
            if (vtx) vtx.classList.remove('active');

            cancelAnimationFrame(physicsFrameId);
            document.body.classList.add('phy-resetting');
            physicsBodies.forEach((p) => p.reset());
            setTimeout(() => {
                document.body.classList.remove('phy-resetting');
            }, 800);
        }

        window.addEventListener('resize', () => {
            if (physicsBodies.length > 0) {
                const containerCache = new Map();
                physicsBodies.forEach((p) => {
                    p.updateRect();
                    p.updateContainerBounds(containerCache);
                });
            }
        });
    }

    /* ==========================================================================
       RENDER PROJECTS (STATIC + LIVE GITHUB FETCH)
       ========================================================================== */
    async function renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        let html = '<div class="projects-grid">';
        html += FEATURED_PROJECTS.map(p => `
            <div class="project-card">
                <span class="project-badge pixel">${p.badge}</span>
                <h3 class="pixel">${p.name}</h3>
                <p>${p.description}</p>
                <div class="project-tags pixel">
                    ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link pixel">[VIEW PROJECT]</a>
                </div>
            </div>
        `).join('');
        html += '</div>';

        container.innerHTML = html;

        // Fetch dynamic GitHub repos to append
        try {
            const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=12`);
            if (res.ok) {
                const repos = await res.json();
                const filtered = repos.filter(r => !r.fork && !EXCLUDE_REPOS.includes(r.name) && !FEATURED_PROJECTS.some(fp => fp.name.toLowerCase() === r.name.toLowerCase())).slice(0, 4);

                const grid = container.querySelector('.projects-grid');
                filtered.forEach(repo => {
                    const card = `
                        <div class="project-card">
                            <span class="project-badge pixel">GITHUB REPO</span>
                            <h3 class="pixel">${repo.name}</h3>
                            <p>${repo.description || 'Open source project by Gaurav Verma.'}</p>
                            <div class="project-tags pixel">
                                <span class="project-tag">${repo.language || 'Code'}</span>
                                <span class="project-tag">★ ${repo.stargazers_count}</span>
                            </div>
                            <div class="project-links">
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link pixel">[GITHUB]</a>
                            </div>
                        </div>
                    `;
                    grid.insertAdjacentHTML('beforeend', card);
                });
            }
        } catch (e) {}
    }

    /* ==========================================================================
       LOAD TRYHACKME & LEETCODE STATS
       ========================================================================== */
    async function loadStats() {
        // TryHackMe
        try {
            const res = await fetch('data/tryhackme.json');
            if (res.ok) {
                const data = await res.json();
                const list = document.getElementById('thm-rooms-list');
                if (list && data.recentRooms) {
                    list.innerHTML = data.recentRooms.map(r => `<li>✔ ${r}</li>`).join('');
                }
                if (data.rank) {
                    const hud = document.getElementById('hudThmRank');
                    if (hud) hud.textContent = data.rank;
                }
                if (data.badgeUrl) {
                    const badgeImg = document.getElementById('thm-badge-img');
                    const badgeBox = document.getElementById('thm-badge-container');
                    if (badgeImg && badgeBox) {
                        badgeImg.src = data.badgeUrl;
                        badgeImg.style.display = 'block';
                        badgeBox.style.display = 'block';
                    }
                }
            }
        } catch (e) {}

        // LeetCode
        try {
            const res = await fetch('data/leetcode.json');
            if (res.ok) {
                const data = await res.json();
                const statsDiv = document.getElementById('lc-stats');
                if (statsDiv) {
                    statsDiv.innerHTML = `
                        <p>Total Solved: <strong class="gold-text">${data.totalSolved || '300+'}</strong></p>
                        <p>Easy: <span class="green-text">${data.easySolved || '110+'}</span> | Medium: <span class="cyan-text">${data.mediumSolved || '160+'}</span></p>
                    `;
                }
                if (data.totalSolved) {
                    const hud = document.getElementById('hudLeetCode');
                    if (hud) hud.textContent = `${data.totalSolved} SOLVED`;
                }
            }
        } catch (e) {}
    }

    /* ==========================================================================
       BACK TO TOP BUTTON
       ========================================================================== */
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Initialize on DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        init3DVoxelScene();
        initWeatherControls();
        renderProjects();
        loadStats();
        initTextPhysics();
        initBackToTop();
    });

})();
