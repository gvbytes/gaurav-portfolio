/**
 * GVBYTES.COM — 16-Bit Voxel Sky-Isle Diorama & Real DOM Text Physics Engine
 * Authentic Retro Arcade Aesthetics • Strictly Public Non-Forked Repos
 */

(function () {
    'use strict';

    const GH_USER = 'gvbytes';
    const EXCLUDE_REPOS = ['gvbytes', 'gaurav-portfolio'];

    /* ==========================================================================
       3D FLOATING SKY-ISLE DIORAMA BACKGROUND (THREE.JS)
       ========================================================================== */
    function init3DScene() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas || !window.THREE) return;

        const THREE = window.THREE;
        const isMobile = window.innerWidth < 768;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 24);

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Master Diorama Island Group
        const diorama = new THREE.Group();
        scene.add(diorama);
        diorama.position.set(isMobile ? 0 : 7.2, 0.5, 0);

        const vSize = 0.45;
        const vGeo = new THREE.BoxGeometry(vSize, vSize, vSize);

        // Voxel materials
        const mGrass = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const mDirt = new THREE.MeshBasicMaterial({ color: 0x27272a });
        const mStone = new THREE.MeshBasicMaterial({ color: 0x52525b });
        const mGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const mWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mTree = new THREE.MeshBasicMaterial({ color: 0x059669 });
        const mTrunk = new THREE.MeshBasicMaterial({ color: 0x78350f });
        const mWater = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });

        // 1. Island base
        const radius = 6;
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const dist = Math.sqrt(x * x + z * z);
                if (dist <= radius) {
                    const depth = Math.floor((radius - dist) * 0.8) + 1;
                    for (let y = 0; y >= -depth; y--) {
                        let mat = (y === 0) ? mGrass : ((y === -depth) ? mStone : mDirt);
                        if (x === 3 && y === 0) mat = mWater;
                        const block = new THREE.Mesh(vGeo, mat);
                        block.position.set(x * vSize, y * vSize, z * vSize);
                        diorama.add(block);
                    }
                }
            }
        }

        // 2. Voxel Pine Tree
        const treeX = -2 * vSize;
        const treeZ = -1 * vSize;
        for (let y = 1; y <= 3; y++) {
            const trunk = new THREE.Mesh(vGeo, mTrunk);
            trunk.position.set(treeX, y * vSize, treeZ);
            diorama.add(trunk);
        }
        for (let fx = -1; fx <= 1; fx++) {
            for (let fz = -1; fz <= 1; fz++) {
                for (let fy = 4; fy <= 6; fy++) {
                    if (fy === 6 && (Math.abs(fx) + Math.abs(fz) > 0)) continue;
                    const leaf = new THREE.Mesh(vGeo, mTree);
                    leaf.position.set(treeX + fx * vSize, fy * vSize, treeZ + fz * vSize);
                    diorama.add(leaf);
                }
            }
        }

        // 3. Voxel Mountain Peak
        for (let my = 1; my <= 4; my++) {
            const pR = 4 - my;
            for (let px = -pR; px <= pR; px++) {
                for (let pz = -pR; pz <= pR; pz++) {
                    if (Math.abs(px) + Math.abs(pz) <= pR) {
                        const rock = new THREE.Mesh(vGeo, my === 4 ? mWhite : mStone);
                        rock.position.set((px + 2) * vSize, my * vSize, (pz + 1) * vSize);
                        diorama.add(rock);
                    }
                }
            }
        }

        // 4. Orbiting Moon & Cloud Rig
        const orbitRig = new THREE.Group();
        diorama.add(orbitRig);

        const moonRig = new THREE.Group();
        for (let mx = -1; mx <= 1; mx++) {
            for (let my = -1; my <= 1; my++) {
                for (let mz = -1; mz <= 1; mz++) {
                    if (Math.abs(mx) + Math.abs(my) + Math.abs(mz) <= 2) {
                        const mB = new THREE.Mesh(vGeo, mGold);
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
                const cB = new THREE.Mesh(vGeo, mWhite);
                cB.position.set(cx * vSize, Math.sin(cx) * 0.2, cz * vSize);
                cloudRig.add(cB);
            }
        }
        cloudRig.position.set(-4.5, 2.8, 0);
        orbitRig.add(cloudRig);

        // 5. Floating Voxel Space Particles
        const starGroup = new THREE.Group();
        scene.add(starGroup);
        const starGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        for (let i = 0; i < 90; i++) {
            const mat = Math.random() > 0.4 ? mGold : mWhite;
            const star = new THREE.Mesh(starGeo, mat);
            star.position.set(
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 20
            );
            starGroup.add(star);
        }

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

            starGroup.rotation.y = time * 0.02;

            camera.position.x += (mouseX * 2 - camera.position.x) * 0.04;
            camera.position.y += (8 - mouseY * 2 - camera.position.y) * 0.04;
            camera.lookAt(2, 0, 0);

            renderer.render(scene, camera);
        }
        animate();
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

    /* Snapshot storage: element -> original innerHTML, to fully restore DOM on reset */
    const domSnapshots = new Map();
    /* Track elements that had phy-particle class added (not split, just classified) */
    const addedPhyParticleEls = new Set();

    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX + window.scrollX;
        mousePos.y = e.clientY + window.scrollY;
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mousePos.x = e.touches[0].clientX + window.scrollX;
            mousePos.y = e.touches[0].clientY + window.scrollY;
        }
    }, { passive: true });
    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });
    window.addEventListener('touchstart', (e) => {
        isMouseDown = true;
        if (e.touches.length > 0) {
            mousePos.x = e.touches[0].clientX + window.scrollX;
            mousePos.y = e.touches[0].clientY + window.scrollY;
        }
    }, { passive: true });
    window.addEventListener('touchend', () => { isMouseDown = false; }, { passive: true });

    function preparePhysicsBodies() {
        const bodies = [];

        function splitText(el, splitType = 'letter') {
            if (!el) return;
            if (el.dataset.physicsProcessed) return;

            /* Save a snapshot of original innerHTML BEFORE any modification */
            if (!domSnapshots.has(el)) {
                domSnapshots.set(el, el.innerHTML);
            }

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

        splitText(document.querySelector('.hero h1'), isMobile ? 'word' : 'letter');
        splitText(document.querySelector('.hero .lead'), isMobile ? 'word' : 'letter');

        document.querySelectorAll('.section-header h2').forEach((h2) => {
            splitText(h2, isMobile ? 'word' : 'letter');
        });

        document.querySelectorAll('.about-text p, .section-subtitle, .footer-bottom p').forEach((p) => {
            splitText(p, 'word');
        });

        const badgeEl = document.querySelector('.quest-badge');
        if (badgeEl) {
            badgeEl.classList.add('phy-particle');
            addedPhyParticleEls.add(badgeEl);
            bodies.push(new PhysicsBody(badgeEl, 'badge'));
        }

        document.querySelectorAll('.btn-group a').forEach((btn) => {
            btn.classList.add('phy-particle');
            addedPhyParticleEls.add(btn);
            bodies.push(new PhysicsBody(btn, 'button'));
        });

        const cardSelectors = ['.project-card', '.learning-card', '.cert-card', '.social-card', '.terminal-window'];
        cardSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((card) => {
                card.classList.add('phy-particle');
                addedPhyParticleEls.add(card);
                bodies.push(new PhysicsBody(card, 'card'));
            });
        });

        const containerCache = new Map();
        bodies.forEach((b) => b.initLayout(containerCache));
        return bodies;
    }

    /**
     * Fully restore the DOM to its pre-physics state.
     * - Restores innerHTML of all text-split elements from snapshots.
     * - Removes phy-particle class and inline styles from cards/buttons/badges.
     * - Clears physicsBodies array so fresh bodies are prepared on next activation.
     */
    function fullDOMRestore() {
        /* 1. Restore all text-split elements to their original innerHTML */
        domSnapshots.forEach((originalHTML, el) => {
            el.innerHTML = originalHTML;
            delete el.dataset.physicsProcessed;
        });

        /* 2. Remove phy-particle class and clear inline styles from non-split elements */
        addedPhyParticleEls.forEach((el) => {
            el.classList.remove('phy-particle', 'resetting');
            el.style.transform = '';
            el.style.opacity = '';
        });
        addedPhyParticleEls.clear();

        /* 3. Clear bodies array — fresh preparation will happen on next activation */
        physicsBodies = [];
    }

    function runPhysicsLoop() {
        if (!physicsActive) return;

        const vtx = document.getElementById('black-hole-vortex');
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        const time = performance.now() * 0.001;

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

        const btns = dock.querySelectorAll('.dock-hud-btn[data-mode]');
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
            /* 1. Stop physics immediately */
            physicsActive = false;
            physicsMode = null;
            cancelAnimationFrame(physicsFrameId);

            /* 2. Remove active states from UI */
            btns.forEach((b) => b.classList.remove('active'));
            if (vtx) vtx.classList.remove('active');

            /* 3. Animate all particles back to origin with CSS transition */
            document.body.classList.add('phy-resetting');
            document.documentElement.classList.add('phy-resetting');

            physicsBodies.forEach((p) => {
                p.x = 0;
                p.y = 0;
                p.vx = 0;
                p.vy = 0;
                p.rotation = 0;
                p.vrotation = 0;
                p.scale = 1;
                p.opacity = 1;
                p.element.classList.add('resetting');
                p.applyStyles();
            });

            /* 4. After transition completes, fully restore original DOM */
            setTimeout(() => {
                /* Remove transition classes */
                document.body.classList.remove('phy-active', 'phy-resetting');
                document.documentElement.classList.remove('phy-active', 'phy-resetting');

                /* Full DOM restore: put back original innerHTML, remove phy-particle, clear bodies */
                fullDOMRestore();
            }, 850);
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
       DYNAMIC GITHUB PROJECTS FETCH
       ========================================================================== */
    function getLangColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a', 'Python': '#3572A5', 'HTML': '#e34c26',
            'CSS': '#563d7c', 'TypeScript': '#3178c6', 'Shell': '#89e051',
            'Go': '#00ADD8', 'Rust': '#dea584', 'C': '#555555',
            'C++': '#f34b7d', 'Java': '#b07219', 'Ruby': '#701516',
        };
        return colors[lang] || 'var(--accent)';
    }

    function createProjectCard(project, index) {
        const card = document.createElement('a');
        card.href = project.html_url || `https://github.com/${GH_USER}/${project.name}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'project-card';
        card.id = `project-${project.name}`;

        const lang = project.language || '';
        const stars = project.stargazers_count || 0;
        const desc = project.description || 'View on GitHub →';

        let metaPill = '';
        if (lang || stars > 0) {
            metaPill = '<div class="project-footer-meta pixel">';
            if (lang) {
                metaPill += `<span class="project-lang-pill"><span class="project-lang-dot" style="background: ${getLangColor(lang)}"></span>${lang}</span>`;
            }
            if (stars > 0) {
                metaPill += `<span class="project-stars-pill">★ ${stars}</span>`;
            }
            metaPill += '</div>';
        }

        card.innerHTML = `
            <div class="project-badge pixel">[PUBLIC REPO]</div>
            <h3 class="project-card-title pixel">${project.name}</h3>
            <p class="project-card-desc">${desc}</p>
            <div class="project-card-footer pixel">
                <span class="project-repo-name">${GH_USER}/${project.name}</span>
                ${metaPill}
            </div>`;
        return card;
    }

    async function fetchGitHubRepos() {
        const cacheKey = 'gv_repos_cache';
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                if (Date.now() - ts < 600000) return data; 
            }
        } catch (_) {}

        try {
            const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?per_page=100&sort=updated`);
            if (!res.ok) throw new Error(res.status);
            const repos = await res.json();
            const filtered = repos.filter(r => !r.fork && !EXCLUDE_REPOS.includes(r.name));
            try { localStorage.setItem(cacheKey, JSON.stringify({ data: filtered, ts: Date.now() })); } catch (_) {}
            return filtered;
        } catch (_) {
            return null;
        }
    }

    async function renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        container.innerHTML = '<p class="pixel" style="text-align:center;padding:40px 0;color:var(--muted);font-size:1.3rem;">Loading public projects from GitHub…</p>';

        const repos = await fetchGitHubRepos();
        container.innerHTML = '';

        if (!repos || repos.length === 0) {
            container.innerHTML = '<p class="pixel" style="text-align:center;font-size:1.3rem;color:var(--muted);">Could not load projects. <a href="https://github.com/gvbytes" target="_blank" style="color:var(--accent);">View on GitHub →</a></p>';
            return;
        }

        /* Dynamically update terminal project count to reflect live public non-forked repos */
        const terminalCountEl = document.getElementById('terminal-project-count');
        if (terminalCountEl) {
            terminalCountEl.textContent = repos.length;
        }

        const vulnMapped = ['srm-secure-browser-vulnerabilities', 'srm-secure-browser-review'];
        const otherMapped = ['del-and-bits', 'del-bits', 'del&bits', 'gaurav-portfolio'];

        const cyberRepos = [];
        const vulnRepos = [];
        const otherRepos = [];

        repos.forEach((repo) => {
            const nameLower = repo.name.toLowerCase();
            if (vulnMapped.includes(nameLower)) {
                vulnRepos.push(repo);
            } else if (otherMapped.includes(nameLower)) {
                otherRepos.push(repo);
            } else {
                cyberRepos.push(repo);
            }
        });

        if (cyberRepos.length > 0) {
            const h3 = document.createElement('h3');
            h3.className = 'project-group-title pixel';
            h3.innerHTML = `Cybersecurity Tools and Analysis`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            cyberRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }

        if (vulnRepos.length > 0) {
            const h3 = document.createElement('h3');
            h3.className = 'project-group-title pixel';
            h3.style.marginTop = '48px';
            h3.innerHTML = `Vulnerability Analysis`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            vulnRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }

        if (otherRepos.length > 0) {
            const h3 = document.createElement('h3');
            h3.className = 'project-group-title pixel';
            h3.style.marginTop = '48px';
            h3.innerHTML = `Other Projects`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            otherRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }
    }

    /* ==========================================================================
       TRYHACKME BADGE LOADER
       ========================================================================== */
    async function loadTHMBadge() {
        try {
            const res = await fetch('data/tryhackme.json');
            if (res.ok) {
                const data = await res.json();
                if (data.badge_image_path) {
                    const badgeContainer = document.getElementById('thm-badge-container');
                    const badgeImg = document.getElementById('thm-badge-img');
                    if (badgeContainer && badgeImg) {
                        badgeImg.src = data.badge_image_path;
                        badgeContainer.style.display = 'flex';
                    }
                }
            }
        } catch (_) {}
    }

    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 500);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ==========================================================================
       INITIALIZATION
       ========================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        init3DScene();
        renderProjects();
        loadTHMBadge();
        initTextPhysics();
        initBackToTop();
    });

})();
