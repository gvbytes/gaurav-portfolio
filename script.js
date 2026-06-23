/* ═══════════════════════════════════════════════════
   Gaurav Verma Portfolio v3 — JavaScript
   Full-page Three.js scene with floating wireframe
   geometries, scroll-driven world rotation, orbiting
   satellites, particle network, dual theme, 3D tilt
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── GitHub username (single source of truth) ── */
    const GH_USER = 'gvbytes';

    const EXCLUDE_REPOS = ['gvbytes'];

    /* Shared ref for theme-switching Three.js materials */
    let sceneRefs = null;

    /* ════════════════════════════════════════════════
       1. THEME MANAGEMENT
       ════════════════════════════════════════════════ */

    function getPreferredTheme() {
        const s = localStorage.getItem('gv-theme');
        if (s) return s;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    function applyTheme(theme, animate) {
        if (animate) {
            document.body.classList.add('theme-transitioning');
            setTimeout(() => document.body.classList.remove('theme-transitioning'), 600);
        }
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gv-theme', theme);
        document.querySelector('meta[name="theme-color"]')
            ?.setAttribute('content', theme === 'dark' ? '#06060e' : '#f4f4fa');
        if (sceneRefs) updateSceneTheme(theme === 'dark');
    }

    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        applyTheme(getPreferredTheme(), false);
        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            applyTheme(cur === 'dark' ? 'light' : 'dark', true);
        });
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!localStorage.getItem('gv-theme')) applyTheme(e.matches ? 'light' : 'dark', true);
        });
    }

    /* ════════════════════════════════════════════════
       2. THREE.JS — FULL-PAGE 3D SCENE
       ════════════════════════════════════════════════ */

    function loadThreeJS() {
        return new Promise((resolve, reject) => {
            if (window.THREE) { resolve(); return; }
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    /* Theme-switch all materials */
    function updateSceneTheme(isDark) {
        if (!sceneRefs) return;
        const THREE = window.THREE;
        const { particleMat, accentMat, lineMat, geoMaterials } = sceneRefs;

        const blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

        particleMat.color.setHex(isDark ? 0x00d4ff : 0x0099cc);
        particleMat.opacity = isDark ? 0.7 : 0.5;
        particleMat.blending = blending;
        particleMat.needsUpdate = true;

        accentMat.color.setHex(isDark ? 0x7c3aed : 0x6d28d9);
        accentMat.opacity = isDark ? 0.4 : 0.3;
        accentMat.blending = blending;
        accentMat.needsUpdate = true;

        lineMat.opacity = isDark ? 0.3 : 0.15;
        lineMat.blending = blending;
        lineMat.needsUpdate = true;

        geoMaterials.forEach((m) => {
            m.blending = blending;
            m.opacity = isDark ? m.userData.darkOp : m.userData.lightOp;
            if (m.userData.colorDark && m.userData.colorLight) {
                m.color.setHex(isDark ? m.userData.colorDark : m.userData.colorLight);
            }
            m.needsUpdate = true;
        });
    }

    function initScene() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const THREE = window.THREE;
        const isMobile = window.innerWidth < 768;
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;

        /* ── Renderer / Camera / Scene ── */
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 55;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        /* ── World group — scroll rotates this ── */
        const world = new THREE.Group();
        scene.add(world);

        /* ═══ PARTICLES ═══ */
        const PCOUNT = isMobile ? 40 : 110;
        const SPREAD = 75;
        const HALF   = SPREAD / 2;
        const CDIST  = isMobile ? 6 : 8.5;

        const pPos = new Float32Array(PCOUNT * 3);
        const pVel = [];
        for (let i = 0; i < PCOUNT; i++) {
            pPos[i * 3]     = (Math.random() - 0.5) * SPREAD;
            pPos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
            pPos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
            pVel.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012,
                (Math.random() - 0.5) * 0.012
            ));
        }

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
        const particleMat = new THREE.PointsMaterial({
            color: isDark ? 0x00d4ff : 0x0099cc,
            size: isMobile ? 2 : 2.4,
            transparent: true,
            opacity: isDark ? 0.7 : 0.5,
            sizeAttenuation: true,
            blending,
            depthWrite: false,
        });
        world.add(new THREE.Points(pGeo, particleMat));

        /* Accent particles */
        const ACOUNT = Math.floor(PCOUNT * 0.14);
        const aPos = new Float32Array(ACOUNT * 3);
        const aVel = [];
        for (let i = 0; i < ACOUNT; i++) {
            aPos[i * 3]     = (Math.random() - 0.5) * SPREAD;
            aPos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD;
            aPos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD;
            aVel.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008,
                (Math.random() - 0.5) * 0.008
            ));
        }
        const aGeo = new THREE.BufferGeometry();
        aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
        const accentMat = new THREE.PointsMaterial({
            color: isDark ? 0x7c3aed : 0x6d28d9,
            size: isMobile ? 3 : 3.6,
            transparent: true,
            opacity: isDark ? 0.4 : 0.3,
            sizeAttenuation: true,
            blending,
            depthWrite: false,
        });
        world.add(new THREE.Points(aGeo, accentMat));

        /* Connection lines */
        const maxL = PCOUNT * 6;
        const lPos = new Float32Array(maxL * 6);
        const lCol = new Float32Array(maxL * 6);
        const lGeo = new THREE.BufferGeometry();
        lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
        lGeo.setAttribute('color',    new THREE.BufferAttribute(lCol, 3));
        lGeo.setDrawRange(0, 0);
        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: isDark ? 0.3 : 0.15,
            blending,
            depthWrite: false,
        });
        world.add(new THREE.LineSegments(lGeo, lineMat));

        /* ═══ WIREFRAME GEOMETRIES ═══ */
        const geoMaterials = [];

        function makeWire(geometry, hex, darkOp, lightOp, pos, scale) {
            const hexLight = (hex === 0x00d4ff) ? 0x0099cc : 0x6d28d9;
            const mat = new THREE.MeshBasicMaterial({
                color: isDark ? hex : hexLight, wireframe: true, transparent: true,
                opacity: isDark ? darkOp : lightOp,
                blending, depthWrite: false,
            });
            mat.userData = { darkOp, lightOp, colorDark: hex, colorLight: hexLight };
            geoMaterials.push(mat);

            const mesh = new THREE.Mesh(geometry, mat);
            mesh.position.copy(pos);
            mesh.scale.setScalar(scale || 1);
            world.add(mesh);

            /* Glow shell */
            const gMat = new THREE.MeshBasicMaterial({
                color: isDark ? hex : hexLight, wireframe: true, transparent: true,
                opacity: (isDark ? darkOp : lightOp) * 0.3,
                blending, depthWrite: false,
            });
            gMat.userData = { darkOp: darkOp * 0.3, lightOp: lightOp * 0.3, colorDark: hex, colorLight: hexLight };
            geoMaterials.push(gMat);

            const glow = new THREE.Mesh(geometry, gMat);
            glow.position.copy(pos);
            glow.scale.setScalar((scale || 1) * 1.06);
            world.add(glow);

            return { mesh, glow };
        }

        const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

        /* 1. Icosahedron — large, left */
        const ico = makeWire(
            new THREE.IcosahedronGeometry(isMobile ? 6 : 9, 1),
            0x00d4ff, 0.13, 0.08,
            v3(-30, 10, -18)
        );

        /* 2. Torus — right */
        const torus = makeWire(
            new THREE.TorusGeometry(isMobile ? 4 : 7, isMobile ? 0.7 : 1.2, 16, 42),
            0x7c3aed, 0.11, 0.07,
            v3(32, -6, -22)
        );

        /* 3. Octahedron — top-right */
        const oct = makeWire(
            new THREE.OctahedronGeometry(isMobile ? 3.5 : 5.5, 0),
            0x00d4ff, 0.1, 0.06,
            v3(18, 22, -12)
        );

        let ring2;

        if (!isMobile) {
            /* 4. Large flat ring */
            ring2 = makeWire(
                new THREE.TorusGeometry(14, 0.25, 6, 80),
                0x00d4ff, 0.04, 0.025,
                v3(0, 0, -40)
            );
        }

        /* ── Orbiting satellites around Icosahedron ── */
        const ORBIT_R = isMobile ? 10 : 15;
        const orbiters = [];
        const orbiterCount = isMobile ? 1 : 2;
        const orbGeo = new THREE.SphereGeometry(0.5, 6, 4);

        for (let i = 0; i < orbiterCount; i++) {
            const angle = (i / orbiterCount) * Math.PI * 2;
            const colorDark = i % 2 === 0 ? 0x00d4ff : 0x7c3aed;
            const colorLight = i % 2 === 0 ? 0x0099cc : 0x6d28d9;
            const mat = new THREE.MeshBasicMaterial({
                color: isDark ? colorDark : colorLight,
                wireframe: true, transparent: true,
                opacity: isDark ? 0.25 : 0.15,
                blending, depthWrite: false,
            });
            mat.userData = { darkOp: 0.25, lightOp: 0.15, colorDark, colorLight };
            geoMaterials.push(mat);

            const mesh = new THREE.Mesh(orbGeo, mat);
            world.add(mesh);
            orbiters.push({ mesh, angle, speed: 0.35 + i * 0.08, yTilt: 0.5 + i * 0.15 });
        }

        /* ── Orbiting satellites around Torus ── */
        const orbiters2 = [];
        if (!isMobile) {
            for (let i = 0; i < 1; i++) {
                const angle = (i / 1) * Math.PI * 2;
                const colorDark = i % 2 === 0 ? 0x7c3aed : 0x00d4ff;
                const colorLight = i % 2 === 0 ? 0x6d28d9 : 0x0099cc;
                const mat = new THREE.MeshBasicMaterial({
                    color: isDark ? colorDark : colorLight,
                    wireframe: true, transparent: true,
                    opacity: isDark ? 0.2 : 0.12,
                    blending, depthWrite: false,
                });
                mat.userData = { darkOp: 0.2, lightOp: 0.12, colorDark, colorLight };
                geoMaterials.push(mat);

                const mesh = new THREE.Mesh(orbGeo, mat);
                world.add(mesh);
                orbiters2.push({ mesh, angle, speed: 0.5 + i * 0.12 });
            }
        }

        /* ═══ SPARKLE LAYER — tiny bright flashing particles ═══ */
        const SPARK_COUNT = isMobile ? 12 : 25;
        const sparkPos = new Float32Array(SPARK_COUNT * 3);
        const sparkPhases = [];
        for (let i = 0; i < SPARK_COUNT; i++) {
            sparkPos[i * 3]     = (Math.random() - 0.5) * SPREAD * 1.2;
            sparkPos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 1.2;
            sparkPos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 1.2;
            sparkPhases.push(Math.random() * Math.PI * 2);
        }
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
        const sparkMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: isMobile ? 1.2 : 1.5,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const sparkMesh = new THREE.Points(sparkGeo, sparkMat);
        world.add(sparkMesh);

        /* ═══ STORE REFS ═══ */
        sceneRefs = { particleMat, accentMat, lineMat, geoMaterials };

        /* ── Mouse ── */
        const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
        if (!isMobile) {
            window.addEventListener('mousemove', (e) => {
                mouse.tx = (e.clientX / window.innerWidth)  * 2 - 1;
                mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
            });
        }

        /* ── Scroll ── */
        let scrollP = 0;
        let maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        window.addEventListener('scroll', () => {
            scrollP = window.scrollY / maxScroll;
        }, { passive: true });
        window.addEventListener('resize', () => {
            maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        });

        /* ═══ RENDER LOOP ═══ */
        const clock = new THREE.Clock();
        let frame = 0;

        function animate() {
            requestAnimationFrame(animate);
            frame++;
            const t = clock.getElapsedTime();

            /* Smooth mouse */
            mouse.x += (mouse.tx - mouse.x) * 0.05;
            mouse.y += (mouse.ty - mouse.y) * 0.05;

            /* ── Move particles ── */
            const pp = pGeo.attributes.position.array;
            for (let i = 0; i < PCOUNT; i++) {
                const ix = i * 3;
                pp[ix]     += pVel[i].x;
                pp[ix + 1] += pVel[i].y;
                pp[ix + 2] += pVel[i].z;
                if (Math.abs(pp[ix])     > HALF) pVel[i].x *= -1;
                if (Math.abs(pp[ix + 1]) > HALF) pVel[i].y *= -1;
                if (Math.abs(pp[ix + 2]) > HALF) pVel[i].z *= -1;
            }
            pGeo.attributes.position.needsUpdate = true;

            /* Move accent */
            const ap = aGeo.attributes.position.array;
            for (let i = 0; i < ACOUNT; i++) {
                const ix = i * 3;
                ap[ix]     += aVel[i].x;
                ap[ix + 1] += aVel[i].y;
                ap[ix + 2] += aVel[i].z;
                if (Math.abs(ap[ix])     > HALF) aVel[i].x *= -1;
                if (Math.abs(ap[ix + 1]) > HALF) aVel[i].y *= -1;
                if (Math.abs(ap[ix + 2]) > HALF) aVel[i].z *= -1;
            }
            aGeo.attributes.position.needsUpdate = true;

            /* ── Lines (every 2 frames) ── */
            if (frame % 2 === 0) {
                let idx = 0;
                const lp = lGeo.attributes.position.array;
                const lc = lGeo.attributes.color.array;
                const dk = document.documentElement.getAttribute('data-theme') !== 'light';
                const cdistSq = CDIST * CDIST;

                for (let i = 0; i < PCOUNT && idx < maxL; i++) {
                    for (let j = i + 1; j < PCOUNT && idx < maxL; j++) {
                        const dx = pp[i*3]   - pp[j*3];
                        const dy = pp[i*3+1] - pp[j*3+1];
                        const dz = pp[i*3+2] - pp[j*3+2];
                        const distSq = dx*dx + dy*dy + dz*dz;

                        if (distSq < cdistSq) {
                            const dist = Math.sqrt(distSq);
                            const a = 1 - dist / CDIST;
                            const ci = idx * 6;
                            lp[ci]   = pp[i*3]; lp[ci+1] = pp[i*3+1]; lp[ci+2] = pp[i*3+2];
                            lp[ci+3] = pp[j*3]; lp[ci+4] = pp[j*3+1]; lp[ci+5] = pp[j*3+2];

                            if (dk) {
                                lc[ci]=0; lc[ci+1]=0.83*a; lc[ci+2]=a;
                                lc[ci+3]=0; lc[ci+4]=0.83*a; lc[ci+5]=a;
                            } else {
                                lc[ci]=0; lc[ci+1]=0.6*a; lc[ci+2]=0.8*a;
                                lc[ci+3]=0; lc[ci+4]=0.6*a; lc[ci+5]=0.8*a;
                            }
                            idx++;
                        }
                    }
                }
                lGeo.setDrawRange(0, idx * 2);
                lGeo.attributes.position.needsUpdate = true;
                lGeo.attributes.color.needsUpdate = true;
            }

            /* ── Geometry rotations ── */
            ico.mesh.rotation.x = t * 0.12;
            ico.mesh.rotation.y = t * 0.18;
            ico.glow.rotation.copy(ico.mesh.rotation);

            torus.mesh.rotation.x = t * 0.22;
            torus.mesh.rotation.y = t * 0.08;
            torus.glow.rotation.copy(torus.mesh.rotation);

            oct.mesh.rotation.x = t * 0.18;
            oct.mesh.rotation.z = t * 0.26;
            oct.glow.rotation.copy(oct.mesh.rotation);

            if (ring2) { ring2.mesh.rotation.x = Math.PI * 0.35 + t * 0.025; ring2.mesh.rotation.y = t * 0.04; ring2.glow.rotation.copy(ring2.mesh.rotation); }

            /* ── Bobbing ── */
            const b = (freq, off) => Math.sin(t * freq + off);
            ico.mesh.position.y   = 10 + b(0.4, 0) * 4;   ico.glow.position.y = ico.mesh.position.y;
            torus.mesh.position.y = -6 + b(0.35, 1) * 3;   torus.glow.position.y = torus.mesh.position.y;
            oct.mesh.position.y   = 22 + b(0.5, 2) * 2.5;  oct.glow.position.y = oct.mesh.position.y;

            /* ── Breathing / pulsing ── */
            const pulse1 = 1 + b(0.55, 0) * 0.06;
            ico.mesh.scale.setScalar(pulse1);
            ico.glow.scale.setScalar(pulse1 * 1.06);

            const pulse2 = 1 + b(0.45, 1.5) * 0.05;
            torus.mesh.scale.setScalar(pulse2);
            torus.glow.scale.setScalar(pulse2 * 1.06);

            const pulse3 = 1 + b(0.6, 3) * 0.07;
            oct.mesh.scale.setScalar(pulse3);
            oct.glow.scale.setScalar(pulse3 * 1.06);

            /* ── Orbiters around Ico ── */
            const icoP = ico.mesh.position;
            orbiters.forEach((o) => {
                const a = o.angle + t * o.speed;
                o.mesh.position.set(
                    icoP.x + Math.cos(a) * ORBIT_R,
                    icoP.y + Math.sin(a) * ORBIT_R * o.yTilt,
                    icoP.z + Math.sin(a + 0.5) * ORBIT_R * 0.4
                );
                o.mesh.rotation.x = t * 2;
                o.mesh.rotation.y = t * 1.6;
            });

            /* Orbiters around Torus */
            if (!isMobile) {
                const toP = torus.mesh.position;
                orbiters2.forEach((o) => {
                    const a = o.angle + t * o.speed;
                    o.mesh.position.set(
                        toP.x + Math.cos(a) * 12,
                        toP.y + Math.sin(a) * 8,
                        toP.z + Math.sin(a + 1) * 5
                    );
                    o.mesh.rotation.x = t * 1.8;
                    o.mesh.rotation.z = t * 1.2;
                });
            }

            /* ── Sparkle twinkle ── */
            sparkMat.opacity = 0.15 + Math.abs(b(1.2, 0)) * 0.25;
            const sp = sparkGeo.attributes.position.array;
            for (let i = 0; i < SPARK_COUNT; i++) {
                sp[i * 3 + 1] += Math.sin(t * 0.8 + sparkPhases[i]) * 0.008;
            }
            sparkGeo.attributes.position.needsUpdate = true;

            /* ── Scroll-driven world rotation ── */
            world.rotation.y = scrollP * Math.PI * 0.45;
            world.rotation.x = scrollP * 0.12;

            /* ── Camera parallax ── */
            if (!isMobile) {
                camera.position.x += (mouse.x * 10 - camera.position.x) * 0.025;
                camera.position.y += (mouse.y * 7  - camera.position.y) * 0.025;
            }

            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        }

        animate();

        /* Resize */
        let rT;
        window.addEventListener('resize', () => {
            clearTimeout(rT);
            rT = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, 150);
        });
    }

    /* ════════════════════════════════════════════════
       3. SCROLL ANIMATIONS
       ════════════════════════════════════════════════ */

    function initScrollAnimations() {
        const els = document.querySelectorAll('.animate-on-scroll:not(.visible)');
        if (!els.length) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
        els.forEach((el) => obs.observe(el));
    }

    function initTerminalAnimation() {
        const term = document.getElementById('terminal-body');
        if (!term) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { term.classList.add('terminal-visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.3 });
        obs.observe(term);
    }

    /* ════════════════════════════════════════════════
       4. PROJECT CARDS + GITHUB FETCH + 3D TILT
       ════════════════════════════════════════════════ */

    function createProjectCard(project, index) {
        const card = document.createElement('a');
        card.href = project.html_url || `https://github.com/${GH_USER}/${project.name}`;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'project-card animate-on-scroll';
        card.style.transitionDelay = `${index * 0.06}s`;
        card.id = `project-${project.name}`;

        const lang = project.language || '';
        const stars = project.stargazers_count || 0;
        const desc = project.description || 'View on GitHub →';

        let footerExtra = '';
        if (lang) {
            footerExtra += `<span class="project-lang-dot" style="background: ${getLangColor(lang)}"></span><span>${lang}</span>`;
        }
        if (stars > 0) {
            footerExtra += `<span style="margin-left:auto;display:inline-flex;align-items:center;gap:3px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>${stars}</span>`;
        }

        card.innerHTML = `
            <div class="project-card-header">
                <div class="project-card-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="project-card-external">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </div>
            </div>
            <h3 class="project-card-title">${project.name}</h3>
            <p class="project-card-desc">${desc}</p>
            <div class="project-card-footer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span>${GH_USER}/${project.name}</span>
                ${footerExtra}
            </div>`;
        return card;
    }

    function getLangColor(lang) {
        const colors = {
            'JavaScript': '#f1e05a', 'Python': '#3572A5', 'HTML': '#e34c26',
            'CSS': '#563d7c', 'TypeScript': '#3178c6', 'Shell': '#89e051',
            'Go': '#00ADD8', 'Rust': '#dea584', 'C': '#555555',
            'C++': '#f34b7d', 'Java': '#b07219', 'Ruby': '#701516',
        };
        return colors[lang] || 'var(--accent-cyan)';
    }

    async function fetchGitHubRepos() {
        const cacheKey = 'gv_repos_cache';
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const { data, ts } = JSON.parse(cached);
                if (Date.now() - ts < 600000) return data; /* 10-min cache */
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
            /* Return cached data even if expired on network failure */
            try {
                const cached = localStorage.getItem(cacheKey);
                if (cached) return JSON.parse(cached).data;
            } catch (__) {}
            return null;
        }
    }

    async function renderProjects() {
        const container = document.getElementById('projects-container') || document.getElementById('projects-grid');
        if (!container) return;

        if (container.id === 'projects-grid') {
            container.className = '';
        }

        /* Show loading skeleton while fetching */
        container.innerHTML = '<p class="project-card-desc loading" style="text-align:center;padding:40px 0;">Loading projects from GitHub…</p>';

        const repos = await fetchGitHubRepos();
        container.innerHTML = '';

        if (!repos || repos.length === 0) {
            container.innerHTML = '<p class="project-card-desc" style="text-align:center;">Could not load projects. <a href="https://github.com/gvbytes" target="_blank" style="color:var(--accent-cyan);">View on GitHub →</a></p>';
            return;
        }

        /* Update the terminal project count */
        const countEl = document.querySelector('.terminal-output.t-line[style*="1.9s"]');
        if (countEl) countEl.textContent = String(repos.length);

        // Categorization mapping
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
            h3.className = 'project-group-title animate-on-scroll';
            h3.innerHTML = `<svg class="group-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Cybersecurity tools and Analysis`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            cyberRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }

        if (vulnRepos.length > 0) {
            const h3 = document.createElement('h3');
            h3.className = 'project-group-title animate-on-scroll';
            h3.style.marginTop = '48px';
            h3.innerHTML = `<svg class="group-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Vulnerability analysis`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            vulnRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }

        if (otherRepos.length > 0) {
            const h3 = document.createElement('h3');
            h3.className = 'project-group-title animate-on-scroll';
            h3.style.marginTop = '48px';
            h3.innerHTML = `<svg class="group-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> Other Projects`;
            container.appendChild(h3);

            const grid = document.createElement('div');
            grid.className = 'projects-grid';
            otherRepos.forEach((repo, i) => grid.appendChild(createProjectCard(repo, i)));
            container.appendChild(grid);
        }

        initScrollAnimations();
    }

    /* ════════════════════════════════════════════════
       4b. TRYHACKME PROGRESS — AUTO-UPDATED
       ════════════════════════════════════════════════ */

    async function renderTryHackMe() {
        const list = document.getElementById('thm-rooms-list');
        if (!list) return;

        /* Fallback data in case fetch fails */
        const fallback = [
            { title: 'Offensive Security Intro', status: 'completed' },
            { title: 'Defensive Security Intro', status: 'completed' },
        ];

        let rooms = fallback;
        try {
            const res = await fetch('data/tryhackme.json');
            if (res.ok) {
                const data = await res.json();
                if (data.completed_rooms && data.completed_rooms.length > 0) {
                    rooms = data.completed_rooms;
                }
            }
        } catch (_) { /* use fallback */ }

        list.innerHTML = '';
        rooms.forEach((room) => {
            const li = document.createElement('li');
            const badge = document.createElement('span');
            badge.className = room.status === 'completed' ? 'badge badge-complete' : 'badge badge-progress';
            badge.textContent = room.status === 'completed' ? 'Completed' : 'In Progress';
            li.appendChild(badge);
            li.appendChild(document.createTextNode(room.title));
            list.appendChild(li);
        });
    }

    /* ════════════════════════════════════════════════
       4c. LEETCODE PROGRESS — AUTO-UPDATED
       ════════════════════════════════════════════════ */

    async function renderLeetCode() {
        const container = document.getElementById('lc-stats');
        if (!container) return;

        const fallback = { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0, total_easy: 876, total_medium: 1850, total_hard: 800, ranking: null };
        let data = fallback;

        try {
            const res = await fetch('data/leetcode.json');
            if (res.ok) {
                const json = await res.json();
                if (json.total_solved !== undefined) data = json;
            }
        } catch (_) { /* use fallback */ }

        const total = data.total_solved || 0;
        const easy = data.easy_solved || 0;
        const med = data.medium_solved || 0;
        const hard = data.hard_solved || 0;
        const tEasy = data.total_easy || 876;
        const tMed = data.total_medium || 1850;
        const tHard = data.total_hard || 800;

        container.innerHTML = `
            <div class="lc-total"><span class="lc-total-num">${total}</span><span class="lc-total-label">problems solved</span></div>
            <div class="lc-bar-group">
                <div class="lc-bar-row">
                    <span class="lc-diff lc-easy">Easy</span>
                    <div class="lc-bar"><div class="lc-bar-fill lc-fill-easy" style="width:${tEasy ? (easy / tEasy * 100) : 0}%"></div></div>
                    <span class="lc-count">${easy}<span class="lc-of">/${tEasy}</span></span>
                </div>
                <div class="lc-bar-row">
                    <span class="lc-diff lc-medium">Med</span>
                    <div class="lc-bar"><div class="lc-bar-fill lc-fill-medium" style="width:${tMed ? (med / tMed * 100) : 0}%"></div></div>
                    <span class="lc-count">${med}<span class="lc-of">/${tMed}</span></span>
                </div>
                <div class="lc-bar-row">
                    <span class="lc-diff lc-hard">Hard</span>
                    <div class="lc-bar"><div class="lc-bar-fill lc-fill-hard" style="width:${tHard ? (hard / tHard * 100) : 0}%"></div></div>
                    <span class="lc-count">${hard}<span class="lc-of">/${tHard}</span></span>
                </div>
            </div>
            ${data.ranking ? `<div class="lc-rank">Ranking: <strong>${data.ranking.toLocaleString()}</strong></div>` : ''}
        `;
    }

    function initCardTilt() {
        if (window.innerWidth < 768) return;
        document.addEventListener('mousemove', (e) => {
            if (physicsActive) return;
            document.querySelectorAll('.project-card').forEach((c) => {
                const r = c.getBoundingClientRect();
                if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
                    const rx = ((e.clientY - r.top - r.height/2) / (r.height/2)) * -10;
                    const ry = ((e.clientX - r.left - r.width/2) / (r.width/2)) * 10;
                    c.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.03,1.03,1.03)`;
                } else {
                    c.style.transform = '';
                }
            });
        });
    }

    /* ════════════════════════════════════════════════
       5. CURSOR GLOW + MAGNETIC BUTTONS
       ════════════════════════════════════════════════ */

    function initCursorGlow() {
        if (window.innerWidth < 768) return;
        const g = document.getElementById('cursor-glow');
        if (!g) return;
        let cx = -500, cy = -500, tx = -500, ty = -500;
        document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!g.classList.contains('active')) g.classList.add('active'); });
        document.addEventListener('mouseleave', () => g.classList.remove('active'));
        (function loop() { cx += (tx-cx)*0.12; cy += (ty-cy)*0.12; g.style.left = cx+'px'; g.style.top = cy+'px'; requestAnimationFrame(loop); })();
    }

    function initMagneticButtons() {
        if (window.innerWidth < 768) return;
        document.querySelectorAll('.magnetic').forEach((b) => {
            b.addEventListener('mousemove', (e) => {
                if (physicsActive) return;
                const r = b.getBoundingClientRect();
                b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*0.25}px,${(e.clientY-r.top-r.height/2)*0.25}px)`;
            });
            b.addEventListener('mouseleave', () => { b.style.transform = ''; b.style.transition = 'transform 0.4s cubic-bezier(0.16,1,0.3,1)'; setTimeout(() => b.style.transition = '', 400); });
        });
    }

    /* ════════════════════════════════════════════════
       6. NAV + SCROLL PROGRESS + BACK-TO-TOP
       ════════════════════════════════════════════════ */

    function initNavigation() {
        const nb = document.getElementById('navbar'), tg = document.getElementById('nav-toggle'), lk = document.getElementById('nav-links');
        const navLinks = document.querySelectorAll('.nav-link'), prog = document.getElementById('scroll-progress'), btt = document.getElementById('back-to-top');
        let tick = false;
        let dh = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        window.addEventListener('resize', () => {
            dh = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        });
        window.addEventListener('scroll', () => { if (!tick) { requestAnimationFrame(() => {
            const sy = window.scrollY;
            nb.classList.toggle('scrolled', sy > 50);
            if (prog && dh > 0) prog.style.transform = `scaleX(${sy/dh})`;
            if (btt) btt.classList.toggle('visible', sy > 600);
            tick = false;
        }); tick = true; } }, { passive: true });
        if (btt) btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        tg.addEventListener('click', () => { tg.classList.toggle('open'); lk.classList.toggle('open'); });
        navLinks.forEach((a) => a.addEventListener('click', () => { tg.classList.remove('open'); lk.classList.remove('open'); }));
        const sections = document.querySelectorAll('section[id], footer[id]');
        const nObs = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { const id = e.target.id; navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`)); } });
        }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });
        sections.forEach((s) => nObs.observe(s));
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const h = a.getAttribute('href'); if (h === '#') return;
                const t = document.querySelector(h); if (!t) return;
                e.preventDefault();
                window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
            });
        });
    }

    /* ════════════════════════════════════════════════
       5. INTERACTIVE TEXT PHYSICS SYSTEM
       ════════════════════════════════════════════════ */

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
    let physicsMode = null; // 'gravity', 'vacuum', 'blackhole'
    let physicsBodies = [];
    let physicsFrameId = null;
    let isMouseDown = false;

    const mousePos = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
        mousePos.x = e.clientX + window.scrollX;
        mousePos.y = e.clientY + window.scrollY;
    }, { passive: true });

    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    /* Touch support for mobile physics */
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mousePos.x = e.touches[0].clientX + window.scrollX;
            mousePos.y = e.touches[0].clientY + window.scrollY;
        }
    }, { passive: true });
    window.addEventListener('touchstart', () => { isMouseDown = true; }, { passive: true });
    window.addEventListener('touchend', () => { isMouseDown = false; }, { passive: true });

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

        // 1. Hero Text (Split by letters for detail)
        splitText(document.querySelector('.hero-name'), 'letter');
        splitText(document.querySelector('.hero-tagline'), 'letter');

        // 2. Section Titles (Split by letters)
        document.querySelectorAll('.section-header h2').forEach((h2) => {
            splitText(h2, 'letter');
        });

        // 3. Paragraphs, Subtitles & Descriptions (Split by words for legibility and high performance)
        document.querySelectorAll('.about-text p, .section-subtitle, .footer-bottom p, .trusthouse-description').forEach((p) => {
            splitText(p, 'word');
        });

        // 3. Rigid Bodies (Badge and buttons)
        const badgeEl = document.querySelector('.hero-badge');
        if (badgeEl) {
            badgeEl.classList.add('phy-particle');
            bodies.push(new PhysicsBody(badgeEl, 'badge'));
        }

        document.querySelectorAll('.hero-cta a').forEach((btn) => {
            btn.classList.add('phy-particle');
            bodies.push(new PhysicsBody(btn, 'button'));
        });

        // 4. Cards & Simulated Windows (Treated as single, high-performance rigid bodies)
        const cardSelectors = [
            '.project-card',
            '.learning-card',
            '.trusthouse-card',
            '.social-card',
            '.terminal-window'
        ];

        cardSelectors.forEach((selector) => {
            document.querySelectorAll(selector).forEach((card) => {
                card.classList.add('phy-particle');
                bodies.push(new PhysicsBody(card, 'card'));
            });
        });

        // Batch initialize layouts after all DOM mutations to avoid layout thrashing and fix 0-rect bug
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

                // Cursor repulsion
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

                // Floor collision
                const bottomY = p.initialY + p.y + p.height;
                if (bottomY >= floorY) {
                    p.y = floorY - p.initialY - p.height;
                    p.vy = -p.vy * 0.55;
                    p.vx *= 0.8;
                    p.vrotation = (Math.random() - 0.5) * p.vy * 5;
                    if (Math.abs(p.vy) < 0.2) p.vy = 0;
                }

                // Wall collisions
                if (absX <= leftWallX) {
                    p.x = leftWallX - p.initialX;
                    p.vx = -p.vx * 0.6;
                } else if (absX + p.width >= rightWallX) {
                    p.x = rightWallX - p.initialX - p.width;
                    p.vx = -p.vx * 0.6;
                }
            }
            else if (physicsMode === 'vacuum') {
                const waveX = Math.sin(time * 0.6 + p.initialY * 0.05) * 0.08;
                const waveY = Math.cos(time * 0.5 + p.initialX * 0.05) * 0.08;
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
                
                if (currentAbsY <= ceilingY) {
                    p.y = ceilingY - p.initialY;
                    p.vy *= -0.7;
                } else if (currentAbsY + p.height >= floorY) {
                    p.y = floorY - p.initialY - p.height;
                    p.vy *= -0.7;
                }

                if (currentAbsX <= leftWallX) {
                    p.x = leftWallX - p.initialX;
                    p.vx *= -0.7;
                } else if (currentAbsX + p.width >= rightWallX) {
                    p.x = rightWallX - p.initialX - p.width;
                    p.vx *= -0.7;
                }
            }
            else if (physicsMode === 'blackhole') {
                const dx = mousePos.x - (absX + p.width / 2);
                const dy = mousePos.y - (absY + p.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    const pull = 3800 / (dist * dist + 700);
                    const ox = -dy / dist;
                    const oy = dx / dist;
                    const swirl = 5.0;

                    p.vx += (dx / dist) * pull + ox * swirl;
                    p.vy += (dy / dist) * pull + oy * swirl;
                }

                p.vx *= 0.93;
                p.vy *= 0.93;

                p.x += p.vx;
                p.y += p.vy;
                p.rotation += 3.0;

                const eventHorizon = 220;
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
            }
            else if (physicsMode === 'explode') {
                /* Light gravity pulls everything down after the initial burst */
                p.vy += 0.15;
                p.vx *= 0.985;

                /* Cursor repulsion */
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

                /* Floor collision with low bounce */
                const bottomY = p.initialY + p.y + p.height;
                if (bottomY >= floorY) {
                    p.y = floorY - p.initialY - p.height;
                    p.vy = -p.vy * 0.4;
                    p.vx *= 0.7;
                    if (Math.abs(p.vy) < 0.3) p.vy = 0;
                }

                /* Ceiling */
                if (p.initialY + p.y <= ceilingY) {
                    p.y = ceilingY - p.initialY;
                    p.vy = -p.vy * 0.4;
                }

                /* Walls */
                if (absX <= leftWallX) {
                    p.x = leftWallX - p.initialX;
                    p.vx = -p.vx * 0.5;
                } else if (absX + p.width >= rightWallX) {
                    p.x = rightWallX - p.initialX - p.width;
                    p.vx = -p.vx * 0.5;
                }
            }

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

                /* Screen shake on activation */
                document.body.classList.remove('phy-shake');
                void document.body.offsetWidth; /* force reflow to restart animation */
                document.body.classList.add('phy-shake');
                setTimeout(() => document.body.classList.remove('phy-shake'), 400);

                if (vtx) {
                    vtx.classList.toggle('active', mode === 'blackhole');
                    vtx.style.left = `${mousePos.x - window.scrollX}px`;
                    vtx.style.top = `${mousePos.y - window.scrollY}px`;
                }

                if (mode === 'explode') {
                    /* Radial burst from viewport center */
                    const cx = window.innerWidth / 2 + window.scrollX;
                    const cy = window.innerHeight / 2 + window.scrollY;
                    physicsBodies.forEach((p) => {
                        const px = p.initialX + p.x + p.width / 2;
                        const py = p.initialY + p.y + p.height / 2;
                        let dx = px - cx;
                        let dy = py - cy;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const force = 12 + Math.random() * 10;
                        p.vx = (dx / dist) * force + (Math.random() - 0.5) * 4;
                        p.vy = (dy / dist) * force - Math.random() * 6;
                        p.scale = 1;
                        p.opacity = 1;
                    });
                } else {
                    physicsBodies.forEach((p) => {
                        p.vx = (Math.random() - 0.5) * 6;
                        p.vy = (Math.random() - 0.5) * 6;
                        p.scale = 1;
                        p.opacity = 1;
                    });
                }

                cancelAnimationFrame(physicsFrameId);
                runPhysicsLoop();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                deactivatePhysics();
            });
        }

        function deactivatePhysics() {
            btns.forEach((b) => b.classList.remove('active'));
            physicsActive = false;
            physicsMode = null;
            document.body.classList.remove('phy-active');
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

    /* ════════════════════════════════════════════════
       INIT
       ════════════════════════════════════════════════ */

    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initNavigation();
        initSmoothScroll();
        renderProjects();
        renderTryHackMe();
        renderLeetCode();
        initCardTilt();
        initScrollAnimations();
        initTerminalAnimation();
        initCursorGlow();
        initMagneticButtons();
        initTextPhysics();

        loadThreeJS()
            .then(() => initScene())
            .catch(() => { const c = document.getElementById('hero-canvas'); if (c) c.style.display = 'none'; });
    });
})();
