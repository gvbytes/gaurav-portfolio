/**
 * GVBYTES.COM — Authentic 16-Bit Voxel Sky-Isle Engine
 * Fully client-side, responsive, zero-lag WebGL & Interactive Physics
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
    function initTheme() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        const saved = localStorage.getItem('gv-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('gv-theme', next);
        });
    }

    /* ==========================================================================
       3D VOXEL SKY-ISLE DIORAMA & GRAVITY ENGINE
       ========================================================================== */
    let physicsMode = 'normal';
    let sceneRefs = null;

    function init3DScene() {
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

        // Master Diorama Island Group
        const diorama = new THREE.Group();
        scene.add(diorama);
        diorama.position.set(isMobile ? 0 : 7.5, 0.5, 0);

        const vSize = 0.45;
        const vGeo = new THREE.BoxGeometry(vSize, vSize, vSize);

        // Voxel Materials (Zero purple!)
        const mGrass = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const mDirt = new THREE.MeshBasicMaterial({ color: 0x27272a });
        const mStone = new THREE.MeshBasicMaterial({ color: 0x52525b });
        const mGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const mWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mTree = new THREE.MeshBasicMaterial({ color: 0x059669 });
        const mTrunk = new THREE.MeshBasicMaterial({ color: 0x78350f });
        const mWater = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.85 });

        // 1. Build Stepped Voxel Island Base
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

        // 2. Build Miniature Voxel Pine Tree
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

        // 3. Build Voxel Mountain Peak
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

        // 4. Orbiting Miniature Voxel Moon & Voxel Cloud
        const orbitRig = new THREE.Group();
        diorama.add(orbitRig);

        // Voxel Moon
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

        // Voxel Cloud
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

        // 5. Floating Ambient Voxel Stars with Gravity Physics
        const starCount = 140;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), Math.random() > 0.5 ? mGold : mWhite);
            const origPos = new THREE.Vector3(
                (Math.random() - 0.5) * 45,
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 25
            );
            s.position.copy(origPos);
            scene.add(s);
            stars.push({
                mesh: s,
                origPos: origPos.clone(),
                velocity: new THREE.Vector3()
            });
        }

        sceneRefs = { diorama, orbitRig, cloudRig, stars };

        // Mouse Parallax
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

            // Island Idle Breathing
            diorama.position.y = 0.5 + Math.sin(time) * 0.25;
            diorama.rotation.y = time * 0.15 + mouseX * 0.3;
            diorama.rotation.x = 0.25 - mouseY * 0.2;

            orbitRig.rotation.y = time * 0.3;
            cloudRig.rotation.y += 0.01;

            // Physics Dock Simulation Modes
            stars.forEach((s, idx) => {
                if (physicsMode === 'gravity') {
                    s.mesh.position.y -= 0.15;
                    if (s.mesh.position.y < -15) s.mesh.position.y = 15;
                } else if (physicsMode === 'vacuum') {
                    s.mesh.position.y += 0.15;
                    if (s.mesh.position.y > 15) s.mesh.position.y = -15;
                } else if (physicsMode === 'blackhole') {
                    const dist = s.mesh.position.length();
                    s.mesh.position.x -= (s.mesh.position.x / dist) * 0.2;
                    s.mesh.position.y -= (s.mesh.position.y / dist) * 0.2;
                    s.mesh.position.z -= (s.mesh.position.z / dist) * 0.2;
                    if (dist < 2) s.mesh.position.copy(s.origPos);
                } else if (physicsMode === 'explode') {
                    s.mesh.position.x += (Math.random() - 0.5) * 0.8;
                    s.mesh.position.y += (Math.random() - 0.5) * 0.8;
                } else {
                    // Normal gentle drift
                    s.mesh.position.y = s.origPos.y + Math.sin(time + idx) * 0.8;
                }
            });

            camera.position.x += (mouseX * 2 - camera.position.x) * 0.04;
            camera.position.y += (8 - mouseY * 2 - camera.position.y) * 0.04;
            camera.lookAt(2, 0, 0);

            renderer.render(scene, camera);
        }
        animate();
    }

    function initPhysicsDock() {
        const dock = document.getElementById('physics-dock');
        if (!dock) return;

        dock.querySelectorAll('.dock-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                if (mode) {
                    physicsMode = mode;
                    dock.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                } else if (btn.id === 'btn-reset') {
                    physicsMode = 'normal';
                    dock.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
                    if (sceneRefs && sceneRefs.stars) {
                        sceneRefs.stars.forEach(s => s.mesh.position.copy(s.origPos));
                    }
                }
            });
        });
    }

    /* ==========================================================================
       RENDER PROJECTS (STATIC + LIVE GITHUB FETCH)
       ========================================================================== */
    async function renderProjects() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        // Render Featured Projects
        let html = FEATURED_PROJECTS.map(p => `
            <div class="project-card">
                <span class="project-badge pixel">${p.badge}</span>
                <h3 class="pixel">${p.name}</h3>
                <p>${p.description}</p>
                <div class="project-tags pixel">
                    ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link pixel">View Project</a>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // Fetch dynamic GitHub repos to append
        try {
            const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=12`);
            if (res.ok) {
                const repos = await res.json();
                const filtered = repos.filter(r => !r.fork && !EXCLUDE_REPOS.includes(r.name) && !FEATURED_PROJECTS.some(fp => fp.name.toLowerCase() === r.name.toLowerCase())).slice(0, 4);

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
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link pixel">GitHub</a>
                            </div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', card);
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
        initTheme();
        init3DScene();
        initPhysicsDock();
        renderProjects();
        loadStats();
        initBackToTop();
    });

})();
