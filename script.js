/**
 * GVBYTES.COM — 16-Bit Voxel Sky-Isle Diorama & Cybersec Engine
 * Fully client-side, responsive, high-performance WebGL & Terminal Engine
 */

(function () {
    'use strict';

    const GH_USER = 'gvbytes';
    const EXCLUDE_REPOS = ['gvbytes', 'gaurav-portfolio'];

    // Web Audio Synthesizer State
    let audioEnabled = true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function play8BitChime(frequency = 987.77, duration = 0.25) {
        if (!audioEnabled) return;
        try {
            if (!audioCtx) audioCtx = new AudioContext();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(frequency * 1.33, audioCtx.currentTime + duration * 0.4);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    /* ==========================================================================
       THREE.JS 3D VOXEL SKY-ISLE DIORAMA & PARTICLES
       ========================================================================== */
    let weatherMode = 'golden';
    let dioramaMaterials = {};

    function init3DVoxelEngine() {
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

        // Voxel Materials
        dioramaMaterials.mGrass = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        dioramaMaterials.mDirt = new THREE.MeshBasicMaterial({ color: 0x27272a });
        dioramaMaterials.mStone = new THREE.MeshBasicMaterial({ color: 0x52525b });
        dioramaMaterials.mGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        dioramaMaterials.mWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
        dioramaMaterials.mTree = new THREE.MeshBasicMaterial({ color: 0x059669 });
        dioramaMaterials.mTrunk = new THREE.MeshBasicMaterial({ color: 0x78350f });
        dioramaMaterials.mWater = new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 });

        // 1. Build Stepped Voxel Island Base
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

        // 2. Build Miniature Voxel Pine Tree
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

        // 3. Build Voxel Mountain Peak on Island
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

        // 4. Orbiting Miniature Voxel Moon & Voxel Cloud
        const orbitRig = new THREE.Group();
        diorama.add(orbitRig);

        // Voxel Moon
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

        // Orbiting Fluffy Voxel Cloud
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

        // 5. Floating Ambient Voxel Stars / Gravity Dust
        const starCount = 140;
        const stars = [];
        for (let i = 0; i < starCount; i++) {
            const s = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), Math.random() > 0.5 ? dioramaMaterials.mGold : dioramaMaterials.mWhite);
            s.position.set((Math.random() - 0.5) * 45, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 25);
            scene.add(s);
            stars.push(s);
        }

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

        // Click Impulse
        window.addEventListener('click', (e) => {
            if (e.target.closest('a, button, input, textarea')) return;
            play8BitChime(1318.51, 0.2);
            diorama.position.y += 0.4;
            setTimeout(() => { diorama.position.y -= 0.4; }, 180);
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

            stars.forEach((s, i) => {
                s.position.y += Math.sin(time + i) * 0.01;
            });

            camera.position.x += (mouseX * 2 - camera.position.x) * 0.04;
            camera.position.y += (8 - mouseY * 2 - camera.position.y) * 0.04;
            camera.lookAt(2, 0, 0);

            renderer.render(scene, camera);
        }
        animate();
    }

    // Weather Biome Transition Logic
    function applyWeatherBiome(mode) {
        weatherMode = mode;
        const btns = document.querySelectorAll('.weather-btn');
        btns.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-weather') === mode);
        });

        if (!dioramaMaterials.mGrass) return;

        if (mode === 'golden') {
            dioramaMaterials.mGrass.color.setHex(0x10b981);
            dioramaMaterials.mGold.color.setHex(0xf59e0b);
            document.documentElement.style.setProperty('--color-gold', '#fcd116');
        } else if (mode === 'lunar') {
            dioramaMaterials.mGrass.color.setHex(0x064e3b);
            dioramaMaterials.mGold.color.setHex(0x00f0ff);
            document.documentElement.style.setProperty('--color-gold', '#00f0ff');
        } else if (mode === 'cloudy') {
            dioramaMaterials.mGrass.color.setHex(0x059669);
            dioramaMaterials.mGold.color.setHex(0xe2e8f0);
            document.documentElement.style.setProperty('--color-gold', '#e2e8f0');
        }
        play8BitChime(880, 0.15);
    }

    function initWeatherControls() {
        const btns = document.querySelectorAll('.weather-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                applyWeatherBiome(btn.getAttribute('data-weather'));
            });
        });
    }

    /* ==========================================================================
       INTERACTIVE CYBERSEC TERMINAL CONSOLE
       ========================================================================== */
    function initTerminal() {
        const input = document.getElementById('terminalInput');
        const output = document.getElementById('terminalOutput');
        if (!input || !output) return;

        const cmdHistory = [];
        let historyIdx = -1;

        const commands = {
            help: () => `
Available Commands:
  <span class="gold-text">about</span>      - View Gaurav's background & IITK focus
  <span class="gold-text">projects</span>   - List flagship security tools & repos
  <span class="gold-text">skills</span>     - Security toolkit & programming languages
  <span class="gold-text">thm</span>        - Print TryHackMe ranking & room stats
  <span class="gold-text">leetcode</span>   - Print LeetCode algorithmic progress
  <span class="gold-text">weather</span>    - Change 3D biome: <span class="cyan-text">weather sunset | lunar | mist</span>
  <span class="gold-text">socials</span>    - Display contact links & profiles
  <span class="gold-text">whoami</span>     - Current user session details
  <span class="gold-text">clear</span>      - Clear terminal screen
  <span class="gold-text">matrix</span>     - Run matrix binary burst
`,
            about: () => `
<span class="green-text">[+] GAURAV VERMA // B.Cyber @ IIT Kanpur</span>
Focus Areas: Network Security, Applied Cryptography, AppSec, Reverse Engineering.
Philosophy: Exploring systems at the binary & protocol level.
`,
            projects: () => `
<span class="gold-text">[+] ARSENAL & REPOSITORIES:</span>
  1. <strong class="green-text">TrustHouse</strong> - Zero-Trust Identity & Proof Framework
  2. <strong class="green-text">PassGauge</strong> - Password Entropy & Randomness Auditor
  3. <strong class="green-text">LinkSleuth</strong> - Automated URL Threat Intelligence
  4. <strong class="green-text">VaultLock</strong> - AES-GCM-256 Authenticated Secret Vault
  5. <strong class="green-text">ThreatMind AI</strong> - SOC Anomaly Classification
  6. <strong class="green-text">SRM Browser Audit</strong> - Process Sandbox Bypass Research
`,
            skills: () => `
<span class="cyan-text">[+] TECHNICAL STACK:</span>
  Languages:  Python, C, C++, Bash, JavaScript, SQL
  Tools:      Ghidra, Wireshark, Burp Suite, Nmap, GDB, Docker, Linux
  Domains:    Cryptography, Network Traffic Analysis, Reverse Engineering, CTFs
`,
            thm: () => `
<span class="green-text">[+] TRYHACKME STATS (@gvbytes):</span>
  Rank:       <span class="gold-text">TOP 1% Global</span>
  Rooms:      120+ Completed
  Focus:      Offensive Labs, Privilege Escalation, Digital Forensics
`,
            leetcode: () => `
<span class="gold-text">[+] LEETCODE PROGRESS (@gvbytes):</span>
  Problems:   300+ Solved
  Topics:     Graphs, Trees, Dynamic Programming, Bit Manipulation
`,
            whoami: () => `
User: guest@gvbytes.com
Access: Authenticated // Level 99 Explorer
Host: x86_64-iitk-cyberspace
`,
            socials: () => `
Email:     <a href="mailto:contact@gvbytes.com" class="gold-text">contact@gvbytes.com</a>
GitHub:    <a href="https://github.com/gvbytes" target="_blank" class="cyan-text">https://github.com/gvbytes</a>
Twitter:   <a href="https://x.com/gvbytes" target="_blank" class="cyan-text">https://x.com/gvbytes</a>
TryHackMe: <a href="https://tryhackme.com/p/gvbytes" target="_blank" class="green-text">https://tryhackme.com/p/gvbytes</a>
LeetCode:  <a href="https://leetcode.com/u/gvbytes/" target="_blank" class="gold-text">https://leetcode.com/u/gvbytes/</a>
`,
            clear: () => {
                output.innerHTML = '';
                return null;
            },
            matrix: () => {
                let lines = '';
                for (let i = 0; i < 5; i++) {
                    const bin = Array.from({ length: 32 }, () => Math.random() > 0.5 ? '1' : '0').join('');
                    lines += `<div class="term-line pixel green-text">${bin}</div>`;
                }
                return lines;
            }
        };

        function printLine(html) {
            if (html === null) return;
            const line = document.createElement('div');
            line.className = 'term-line pixel';
            line.innerHTML = html;
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const raw = input.value.trim();
                input.value = '';
                if (!raw) return;

                cmdHistory.push(raw);
                historyIdx = cmdHistory.length;

                printLine(`<span class="green-text">gaurav@iitk:~$</span> ${raw}`);
                play8BitChime(1046.5, 0.1);

                const parts = raw.toLowerCase().split(' ');
                const cmd = parts[0];
                const arg = parts[1];

                if (cmd === 'weather') {
                    if (arg === 'sunset' || arg === 'golden') {
                        applyWeatherBiome('golden');
                        printLine(`<span class="gold-text">[+] Switched 3D biome to SUNSET GOLD.</span>`);
                    } else if (arg === 'lunar' || arg === 'night' || arg === 'blue') {
                        applyWeatherBiome('lunar');
                        printLine(`<span class="cyan-text">[+] Switched 3D biome to NIGHTFALL BLUE.</span>`);
                    } else if (arg === 'mist' || arg === 'cloudy' || arg === 'alpine') {
                        applyWeatherBiome('cloudy');
                        printLine(`<span class="green-text">[+] Switched 3D biome to ALPINE MIST.</span>`);
                    } else {
                        printLine(`Usage: weather &lt;sunset | lunar | mist&gt;`);
                    }
                } else if (commands[cmd]) {
                    printLine(commands[cmd]());
                } else {
                    printLine(`<span class="red-text">Command not found: ${cmd}. Type 'help' for command manual.</span>`);
                }
            } else if (e.key === 'ArrowUp') {
                if (historyIdx > 0) {
                    historyIdx--;
                    input.value = cmdHistory[historyIdx] || '';
                }
            } else if (e.key === 'ArrowDown') {
                if (historyIdx < cmdHistory.length - 1) {
                    historyIdx++;
                    input.value = cmdHistory[historyIdx] || '';
                } else {
                    historyIdx = cmdHistory.length;
                    input.value = '';
                }
            }
        });
    }

    /* ==========================================================================
       DYNAMIC GITHUB PROJECTS FETCH
       ========================================================================== */
    async function fetchGitHubProjects() {
        const grid = document.getElementById('github-projects-grid');
        if (!grid) return;

        try {
            const res = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=12`);
            if (!res.ok) throw new Error('GitHub API Error');

            const repos = await res.json();
            const filtered = repos.filter(r => !r.fork && !EXCLUDE_REPOS.includes(r.name)).slice(0, 6);

            if (filtered.length === 0) {
                grid.innerHTML = `<div class="loading-state pixel">NO PUBLIC REPOS FOUND</div>`;
                return;
            }

            grid.innerHTML = filtered.map(repo => `
                <div class="project-card">
                    <div class="card-top pixel">
                        <span class="card-badge cyan-badge">[GITHUB // REPO]</span>
                        <span class="card-lang">${repo.language || 'Code'}</span>
                    </div>
                    <h3 class="pixel">${repo.name}</h3>
                    <p>${repo.description || 'Security and algorithmic repository by Gaurav Verma.'}</p>
                    <div class="card-tech pixel">
                        <span>★ ${repo.stargazers_count} Stars</span> • <span>⑂ ${repo.forks_count} Forks</span>
                    </div>
                    <div class="card-actions">
                        <a href="${repo.html_url}" target="_blank" class="card-btn pixel">[VIEW ON GITHUB]</a>
                    </div>
                </div>
            `).join('');

        } catch (e) {
            grid.innerHTML = `
                <div class="project-card">
                    <div class="card-top pixel">
                        <span class="card-badge cyan-badge">[ARCHIVE]</span>
                        <span>Python / C++</span>
                    </div>
                    <h3 class="pixel">IP-Changer & Network Utilities</h3>
                    <p>Automated network rotation, routing anonymity scripts, and traffic isolation tools.</p>
                    <div class="card-actions">
                        <a href="https://github.com/gvbytes" target="_blank" class="card-btn pixel">[VISIT GITHUB PROFILE]</a>
                    </div>
                </div>
            `;
        }
    }

    /* ==========================================================================
       TRYHACKME & LEETCODE STATS DATA FEEDS
       ========================================================================== */
    async function loadStatsData() {
        // Load TryHackMe
        try {
            const res = await fetch('data/tryhackme.json');
            if (res.ok) {
                const data = await res.json();
                if (data.rank) {
                    document.getElementById('thmRankDisplay').textContent = data.rank;
                    document.getElementById('hudThmRank').textContent = data.rank;
                }
                if (data.rooms) document.getElementById('thmRoomsDisplay').textContent = data.rooms;
                if (data.points) document.getElementById('thmPointsDisplay').textContent = data.points;
            }
        } catch (e) {}

        // Load LeetCode
        try {
            const res = await fetch('data/leetcode.json');
            if (res.ok) {
                const data = await res.json();
                if (data.totalSolved) {
                    document.getElementById('lcSolvedDisplay').textContent = data.totalSolved;
                    document.getElementById('hudLeetCode').textContent = `${data.totalSolved} SOLVED`;
                }
                if (data.easySolved) document.getElementById('lcEasyDisplay').textContent = `Easy: ${data.easySolved}`;
                if (data.mediumSolved) document.getElementById('lcMediumDisplay').textContent = `Med: ${data.mediumSolved}`;
            }
        } catch (e) {}
    }

    /* ==========================================================================
       CERTIFICATE MODAL & HUD TOGGLES
       ========================================================================== */
    function initModalsAndToggles() {
        // Certificate Modal
        const viewCertBtn = document.getElementById('viewCertBtn');
        const modal = document.getElementById('certModal');
        const closeBtn = document.getElementById('closeModalBtn');

        if (viewCertBtn && modal) {
            viewCertBtn.addEventListener('click', () => {
                modal.classList.add('open');
                play8BitChime(1174.66, 0.2);
            });
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('open');
                });
            }
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('open');
            });
        }

        // CRT Toggle
        const crtToggle = document.getElementById('crtToggle');
        const crtOverlay = document.querySelector('.crt-scanlines');
        if (crtToggle && crtOverlay) {
            crtToggle.addEventListener('click', () => {
                crtOverlay.classList.toggle('disabled');
                crtToggle.textContent = crtOverlay.classList.contains('disabled') ? '[CRT: OFF]' : '[CRT: ON]';
                play8BitChime(523.25, 0.1);
            });
        }

        // Audio Toggle
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                audioEnabled = !audioEnabled;
                audioToggle.textContent = audioEnabled ? '[SFX: ON]' : '[SFX: OFF]';
                if (audioEnabled) play8BitChime(1318.51, 0.15);
            });
        }
    }

    // Initialize all components on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        if (window.lucide) lucide.createIcons();
        init3DVoxelEngine();
        initWeatherControls();
        initTerminal();
        fetchGitHubProjects();
        loadStatsData();
        initModalsAndToggles();
    });

})();
