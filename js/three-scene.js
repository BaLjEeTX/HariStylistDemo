/* ============================================================
   THREE.JS SCENE — Luxury Salon
   - Stylized floating salon chair
   - Glowing oval mirror
   - Ambient warm studio lighting
   - Floating dust particles
   - Soft parallax on mouse + slow camera drift
   ============================================================ */

(function(){

    const canvas = document.getElementById('three-canvas');
    if(!canvas || typeof THREE === 'undefined') return;

    const wrap = document.getElementById('heroScene');
    let W = (wrap && wrap.clientWidth) || window.innerWidth || 600;
    let H = (wrap && wrap.clientHeight) || window.innerHeight || 500;

    // ---------- Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ---------- Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xb8a98e, 10, 28);

    // ---------- Camera
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(2.4, 1.9, 6.2);
    camera.lookAt(0, 1.1, 0);

    // ---------- Lights
    const ambient = new THREE.AmbientLight(0xe8d9c0, 0.45);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.4);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffd9a0, 0.9);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffe3b8, 1.4, 12);
    fillLight.position.set(-1.5, 2.2, 2);
    scene.add(fillLight);

    // mirror glow point light
    const mirrorLight = new THREE.PointLight(0xffe9c4, 1.6, 8, 1.4);
    mirrorLight.position.set(-2.6, 2.4, -0.4);
    scene.add(mirrorLight);

    // ---------- Materials
    const chairBlack = new THREE.MeshPhysicalMaterial({
        color: 0x141311,
        roughness: 0.45,
        metalness: 0.1,
        clearcoat: 0.4,
        clearcoatRoughness: 0.5
    });
    const chairMetal = new THREE.MeshStandardMaterial({
        color: 0x1a1916,
        roughness: 0.3,
        metalness: 0.85
    });
    const leatherSeams = new THREE.MeshStandardMaterial({
        color: 0x0a0907,
        roughness: 0.7,
        metalness: 0.05
    });

    // ---------- Floor (tile-like)
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x6a5d49,
        roughness: 0.7,
        metalness: 0.05
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle floor tile grid (lines)
    const gridGeo = new THREE.PlaneGeometry(30, 30, 30, 30);
    const gridWire = new THREE.Mesh(
        gridGeo,
        new THREE.MeshBasicMaterial({ color: 0x4a4030, wireframe: true, transparent: true, opacity: 0.08 })
    );
    gridWire.rotation.x = -Math.PI / 2;
    gridWire.position.y = 0.001;
    scene.add(gridWire);

    // ---------- Back wall
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0x9a8b71,
        roughness: 0.85,
        metalness: 0.02
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), wallMat);
    wall.position.z = -3.5;
    wall.position.y = 6;
    wall.receiveShadow = true;
    scene.add(wall);

    // ---------- Mirror (oval, glowing)
    const mirrorGroup = new THREE.Group();
    mirrorGroup.position.set(-2.6, 2.4, -3.2);

    // outer frame
    const mirrorFrame = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.06, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0x1a1815, roughness: 0.4, metalness: 0.6 })
    );
    mirrorFrame.scale.set(1, 1.6, 1);
    mirrorGroup.add(mirrorFrame);

    // mirror surface (capsule shape via scaled circle)
    const mirrorSurfGeo = new THREE.CircleGeometry(1.0, 64);
    const mirrorSurfMat = new THREE.MeshPhysicalMaterial({
        color: 0xefe2cb,
        roughness: 0.05,
        metalness: 0.95,
        clearcoat: 1,
        emissive: 0xffd9a0,
        emissiveIntensity: 0.35
    });
    const mirrorSurf = new THREE.Mesh(mirrorSurfGeo, mirrorSurfMat);
    mirrorSurf.scale.set(1, 1.6, 1);
    mirrorSurf.position.z = 0.005;
    mirrorGroup.add(mirrorSurf);

    // glow halo behind mirror
    const haloGeo = new THREE.CircleGeometry(1.4, 64);
    const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffd9a0,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.scale.set(1.1, 1.7, 1);
    halo.position.z = -0.05;
    mirrorGroup.add(halo);

    scene.add(mirrorGroup);

    // ---------- Salon Chair (the centerpiece)
    const chair = new THREE.Group();
    chair.position.set(0.2, 0, 0);

    // Base disc
    const baseDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.08, 48),
        chairMetal
    );
    baseDisc.position.y = 0.04;
    baseDisc.castShadow = true;
    baseDisc.receiveShadow = true;
    chair.add(baseDisc);

    // Hydraulic pole
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, 0.7, 24),
        chairMetal
    );
    pole.position.y = 0.45;
    pole.castShadow = true;
    chair.add(pole);

    // Pole upper segment
    const poleTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.12, 0.4, 24),
        chairMetal
    );
    poleTop.position.y = 0.95;
    poleTop.castShadow = true;
    chair.add(poleTop);

    // Seat cushion
    const seatGeo = new THREE.BoxGeometry(1.25, 0.28, 1.05);
    seatGeo.translate(0, 0, 0);
    // round the seat using lathe-like scaling
    const seat = new THREE.Mesh(seatGeo, chairBlack);
    seat.position.set(0, 1.25, 0);
    seat.castShadow = true;
    seat.receiveShadow = true;
    chair.add(seat);

    // Seat front rounded edge
    const seatFront = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 1.25, 24, 1, false, 0, Math.PI),
        chairBlack
    );
    seatFront.rotation.z = Math.PI / 2;
    seatFront.position.set(0, 1.16, 0.52);
    seatFront.castShadow = true;
    chair.add(seatFront);

    // Backrest
    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.8, 0.32),
        chairBlack
    );
    backrest.position.set(0, 2.25, -0.45);
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    chair.add(backrest);

    // Backrest top curve (semicircle)
    const backrestTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.32, 32, 1, false, 0, Math.PI),
        chairBlack
    );
    backrestTop.rotation.x = Math.PI / 2;
    backrestTop.rotation.z = Math.PI / 2;
    backrestTop.position.set(0, 3.15, -0.45);
    backrestTop.castShadow = true;
    chair.add(backrestTop);

    // Backrest seam line (subtle vertical stitch)
    for(let i = 0; i < 3; i++){
        const seam = new THREE.Mesh(
            new THREE.BoxGeometry(1.18, 0.01, 0.005),
            leatherSeams
        );
        seam.position.set(0, 1.7 + i * 0.55, -0.28);
        chair.add(seam);
    }

    // Headrest (tiny pillow)
    const headrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.32, 0.28),
        chairBlack
    );
    headrest.position.set(0, 3.25, -0.32);
    headrest.castShadow = true;
    chair.add(headrest);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.16, 0.16, 1.0);
    const armLeft = new THREE.Mesh(armGeo, chairBlack);
    armLeft.position.set(-0.68, 1.55, 0);
    armLeft.castShadow = true;
    chair.add(armLeft);

    const armRight = new THREE.Mesh(armGeo, chairBlack);
    armRight.position.set(0.68, 1.55, 0);
    armRight.castShadow = true;
    chair.add(armRight);

    // Arm supports (vertical)
    const armSup = new THREE.BoxGeometry(0.08, 0.4, 0.08);
    const supL = new THREE.Mesh(armSup, chairMetal);
    supL.position.set(-0.68, 1.3, -0.4);
    chair.add(supL);
    const supR = new THREE.Mesh(armSup, chairMetal);
    supR.position.set(0.68, 1.3, -0.4);
    chair.add(supR);

    // Footrest
    const footrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.06, 0.4),
        chairMetal
    );
    footrest.position.set(0, 0.45, 0.85);
    footrest.castShadow = true;
    chair.add(footrest);

    // foot support bar
    const footBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16),
        chairMetal
    );
    footBar.rotation.x = Math.PI / 2;
    footBar.position.set(0, 0.45, 0.55);
    chair.add(footBar);

    scene.add(chair);

    // ---------- Decorative shelf with vases (right of mirror)
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-2.2, 1.2, -3.0);

    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x8d7c64, roughness: 0.7 });
    const shelf1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.3), shelfMat);
    shelf1.position.y = 0;
    shelfGroup.add(shelf1);
    const shelf2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.3), shelfMat);
    shelf2.position.y = 0.55;
    shelfGroup.add(shelf2);

    // tiny vases
    const vaseMat = new THREE.MeshStandardMaterial({ color: 0x2e2820, roughness: 0.6, metalness: 0.1 });
    const vasePositions = [
        [-0.45, 0.25, 0, 0.07, 0.4],
        [-0.05, 0.2, 0, 0.06, 0.3],
        [0.45, 0.3, 0, 0.08, 0.45]
    ];
    vasePositions.forEach(p => {
        const v = new THREE.Mesh(new THREE.CylinderGeometry(p[3], p[3]*0.7, p[4], 18), vaseMat);
        v.position.set(p[0], p[1] + p[4]/2, p[2]);
        v.castShadow = true;
        shelfGroup.add(v);

        // tiny leaf accent
        const leaf = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 8, 8),
            new THREE.MeshStandardMaterial({ color: 0x3a3a2a, roughness: 0.7 })
        );
        leaf.position.set(p[0], p[1] + p[4] + 0.05, p[2]);
        leaf.scale.set(1, 1.6, 1);
        shelfGroup.add(leaf);
    });

    scene.add(shelfGroup);

    // ---------- Ambient floating dust (Three.js points)
    const dustCount = 80;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for(let i = 0; i < dustCount; i++){
        dustPos[i*3]   = (Math.random() - 0.5) * 10;
        dustPos[i*3+1] =  Math.random() * 5;
        dustPos[i*3+2] = (Math.random() - 0.5) * 6;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        color: 0xffe3b8,
        size: 0.03,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    // ---------- Floor reflection: a soft second floor with gradient
    const reflMat = new THREE.MeshBasicMaterial({
        color: 0xb89770,
        transparent: true,
        opacity: 0.15
    });
    const reflChairShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.2, 32),
        reflMat
    );
    reflChairShadow.rotation.x = -Math.PI / 2;
    reflChairShadow.position.set(0.2, 0.011, 0.2);
    scene.add(reflChairShadow);

    // ---------- Mouse parallax
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    wrap.addEventListener('mousemove', (e) => {
        const r = wrap.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        target.y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    });
    wrap.addEventListener('mouseleave', () => {
        target.x = 0; target.y = 0;
    });

    // ---------- Resize
    function resize(){
        if(!wrap) return;
        W = wrap.clientWidth || window.innerWidth || 600;
        H = wrap.clientHeight || window.innerHeight || 500;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;

        // Dynamically adjust camera settings for mobile views (portrait screens)
        if (W < 768) {
            camera.fov = 48; // broaden field of view so the chair sits fully centered
            camera.position.set(2.6, 1.8, 7.8);
        } else {
            camera.fov = 38;
            camera.position.set(2.4, 1.9, 6.2);
        }

        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    // ---------- Animate
    const clock = new THREE.Clock();

    function animate(){
        const t = clock.getElapsedTime();

        // smooth-follow mouse
        current.x += (target.x - current.x) * 0.04;
        current.y += (target.y - current.y) * 0.04;

        // chair floating + slight rotation
        const floatOffset = Math.sin(t * 0.8) * 0.06;
        chair.position.y = floatOffset;
        chair.rotation.y = -0.15 + current.x * 0.15 + Math.sin(t * 0.3) * 0.05;
        chair.rotation.x = current.y * 0.04;

        // Dynamic shadow / reflection scaling and opacity update
        if (reflChairShadow && reflMat) {
            const shadowScale = 1 - floatOffset * 0.6;
            reflChairShadow.scale.set(shadowScale, shadowScale, 1);
            reflMat.opacity = 0.15 - floatOffset * 0.5;
        }

        // mirror subtle hover
        mirrorGroup.position.y = 2.4 + Math.sin(t * 0.5) * 0.04;
        // pulse mirror emissive
        const pulse = 0.32 + Math.sin(t * 1.4) * 0.08;
        mirrorSurfMat.emissiveIntensity = pulse;
        mirrorLight.intensity = 1.4 + Math.sin(t * 1.4) * 0.25;

        // camera slow drift + parallax
        camera.position.x = 2.4 + current.x * 0.4 + Math.sin(t * 0.15) * 0.15;
        camera.position.y = 1.9 - current.y * 0.25 + Math.cos(t * 0.2) * 0.06;
        camera.lookAt(0, 1.4, 0);

        // dust drift
        const positions = dustGeo.attributes.position.array;
        for(let i = 0; i < dustCount; i++){
            positions[i*3+1] += 0.003 + Math.sin(t + i) * 0.0008;
            positions[i*3]   += Math.cos(t * 0.5 + i) * 0.0005;
            if(positions[i*3+1] > 5){
                positions[i*3+1] = 0;
                positions[i*3]   = (Math.random() - 0.5) * 10;
            }
        }
        dustGeo.attributes.position.needsUpdate = true;
        dust.rotation.y = t * 0.02;

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    // Initial size + start
    resize();
    animate();

    // ResizeObserver for the wrap (in case it shifts after fonts load)
    if(window.ResizeObserver){
        new ResizeObserver(resize).observe(wrap);
    }

})();
