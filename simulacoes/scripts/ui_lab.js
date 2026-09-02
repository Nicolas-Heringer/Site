// =============================================================================
// Autor: Nicolas Heringer
// Design System & Laboratório de Interface (UI Lab)
// =============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ICONS_LIST = [
    'dice', 'play', 'pause', 'step', 'rotate', 'refresh',
    'globe', 'sun', 'snowflake', 'leaf', 'flower',
    'thermometer', 'cyclone', 'wind', 'compass', 'sparkles', 'lightbulb'
];

let clickCount = 0;
let scene, camera, renderer, controls;
let currentMesh = null, wireMesh = null, pointsMesh = null;
let testLight = null;
let autoRotateActive = true; // Inicia ativo condizente com o botão na tela

const container = document.getElementById('three-container');

function initThreeScene() {
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b16);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 3.0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    testLight = new THREE.DirectionalLight(0xfacc15, 1.5);
    testLight.position.set(4, 5, 3);
    scene.add(testLight);

    buildMeshGeometry('sphere', 1.0, 16);

    window.addEventListener('resize', onWindowResize);
    if (window.ResizeObserver) {
        new ResizeObserver(onWindowResize).observe(container);
    }
}

function buildMeshGeometry(type = 'sphere', radius = 1.0, segments = 16) {
    if (currentMesh) scene.remove(currentMesh);
    if (wireMesh) scene.remove(wireMesh);
    if (pointsMesh) scene.remove(pointsMesh);

    let geo;
    if (type === 'cube') {
        geo = new THREE.BoxGeometry(radius * 1.4, radius * 1.4, radius * 1.4, Math.max(1, Math.floor(segments / 4)), Math.max(1, Math.floor(segments / 4)), Math.max(1, Math.floor(segments / 4)));
    } else if (type === 'torus') {
        geo = new THREE.TorusGeometry(radius * 0.8, radius * 0.35, segments, segments * 2);
    } else {
        geo = new THREE.SphereGeometry(radius, segments * 2, segments);
    }

    const mat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.4,
        metalness: 0.1,
        flatShading: true
    });
    currentMesh = new THREE.Mesh(geo, mat);
    scene.add(currentMesh);

    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    wireMesh = new THREE.Mesh(geo, wireMat);
    scene.add(wireMesh);

    const ptsMat = new THREE.PointsMaterial({
        color: 0xfacc15,
        size: 0.03
    });
    pointsMesh = new THREE.Points(geo, ptsMat);
    scene.add(pointsMesh);

    const swWire = document.getElementById('switch-demo-wireframe');
    const swPts = document.getElementById('switch-demo-points');
    if (swWire) wireMesh.visible = swWire.checked;
    if (pointsMesh) pointsMesh.visible = swPts.checked;
}

function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (autoRotateActive && currentMesh) {
        currentMesh.rotation.y += 0.008;
        if (wireMesh) wireMesh.rotation.y += 0.008;
        if (pointsMesh) pointsMesh.rotation.y += 0.008;
    }

    renderer.render(scene, camera);
}

function setupListeners() {
    // --- NAVEGAÇÃO ENTRE ABAS DO LABORATÓRIO ---
    const tabs = [
        { btn: 'tab-btn-buttons', panel: 'panel-ui-buttons', name: 'Botões & Ações' },
        { btn: 'tab-btn-sliders', panel: 'panel-ui-sliders', name: 'Sliders & Entradas' },
        { btn: 'tab-btn-switches', panel: 'panel-ui-switches', name: 'Switches & Toggles' },
        { btn: 'tab-btn-huds', panel: 'panel-ui-huds', name: 'HUDs & LaTeX' },
        { btn: 'tab-btn-icons', panel: 'panel-ui-icons', name: 'Galeria de Ícones SVG' }
    ];

    tabs.forEach(t => {
        const btn = document.getElementById(t.btn);
        if (btn) {
            btn.addEventListener('click', () => {
                tabs.forEach(o => {
                    const b = document.getElementById(o.btn);
                    const p = document.getElementById(o.panel);
                    if (b) b.classList.remove('active');
                    if (p) p.style.display = 'none';
                });
                btn.classList.add('active');
                const p = document.getElementById(t.panel);
                if (p) p.style.display = 'block';

                const hudActive = document.getElementById('hud-active-comp');
                if (hudActive) hudActive.textContent = t.name;
            });
        }
    });

    // --- SELETOR DE PALETA DE CORES (ACCENT COLOR) ---
    document.querySelectorAll('.theme-dot-btn').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.theme-dot-btn').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            const color = dot.getAttribute('data-color');
            document.documentElement.style.setProperty('--accent-color', color);
            document.documentElement.style.setProperty('--border-accent', `${color}66`);
            document.documentElement.style.setProperty('--accent-glow', `${color}59`);
            document.documentElement.style.setProperty('--accent-subtle', `${color}26`);
            if (testLight) testLight.color.set(color);
            if (pointsMesh && pointsMesh.material) pointsMesh.material.color.set(color);
        });
    });

    // --- CONTROLE DE ROTAÇÃO NO CANVAS ---
    const btnAuto = document.getElementById('btn-quick-autorotate');
    if (btnAuto) {
        btnAuto.addEventListener('click', () => {
            autoRotateActive = !autoRotateActive;
            btnAuto.classList.toggle('active', autoRotateActive);
        });
    }

    // --- CLIQUE E CONTADORES DE TESTE ---
    const registerClick = () => {
        clickCount++;
        const spanClicks = document.getElementById('hud-click-count');
        if (spanClicks) spanClicks.textContent = `${clickCount}`;
    };

    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-preset, .field-btn, .btn-icon, .sim-btn').forEach(b => {
        b.addEventListener('click', registerClick);
    });

    // Preset Grid Active Toggle
    const pBtns = ['btn-demo-p1', 'btn-demo-p2', 'btn-demo-p3', 'btn-demo-p4'];
    pBtns.forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.addEventListener('click', () => {
                pBtns.forEach(otherId => {
                    const ob = document.getElementById(otherId);
                    if (ob) ob.classList.remove('active');
                });
                b.classList.add('active');
            });
        }
    });

    // Botão Aleatório / Sortear
    const btnDice = document.getElementById('btn-demo-dice');
    if (btnDice) {
        btnDice.addEventListener('click', () => {
            const randomIndex = Math.floor(Math.random() * pBtns.length);
            pBtns.forEach((id, idx) => {
                const b = document.getElementById(id);
                if (b) b.classList.toggle('active', idx === randomIndex);
            });
        });
    }

    // Botões de Ícones Compactos Active Toggle
    const iconBtns = ['btn-icon-play', 'btn-icon-pause', 'btn-icon-step', 'btn-icon-refresh', 'btn-icon-sparkles'];
    iconBtns.forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.addEventListener('click', () => {
                iconBtns.forEach(otherId => {
                    const ob = document.getElementById(otherId);
                    if (ob) ob.classList.remove('active');
                });
                b.classList.add('active');
            });
        }
    });

    // Segmented Pills
    const segBtns = ['btn-seg-1', 'btn-seg-2', 'btn-seg-3'];
    segBtns.forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.addEventListener('click', () => {
                segBtns.forEach(otherId => {
                    const ob = document.getElementById(otherId);
                    if (ob) ob.classList.remove('active');
                });
                b.classList.add('active');
            });
        }
    });

    // --- SLIDERS ---
    const sliderRadius = document.getElementById('slider-demo-radius');
    const valRadius = document.getElementById('val-demo-radius');
    const hudRadius = document.getElementById('hud-sphere-radius');
    if (sliderRadius) {
        sliderRadius.addEventListener('input', (e) => {
            const rad = parseFloat(e.target.value);
            if (valRadius) valRadius.textContent = `${rad.toFixed(2)}x`;
            if (hudRadius) hudRadius.textContent = `${rad.toFixed(2)}`;
            const steps = parseInt(document.getElementById('slider-demo-steps')?.value || 16);
            const meshType = document.getElementById('select-demo-mesh')?.value || 'sphere';
            buildMeshGeometry(meshType, rad, steps);
        });
    }

    const sliderSteps = document.getElementById('slider-demo-steps');
    const valSteps = document.getElementById('val-demo-steps');
    if (sliderSteps) {
        sliderSteps.addEventListener('input', (e) => {
            const steps = parseInt(e.target.value);
            if (valSteps) valSteps.textContent = `${steps} segmentos`;
            const rad = parseFloat(document.getElementById('slider-demo-radius')?.value || 1.0);
            const meshType = document.getElementById('select-demo-mesh')?.value || 'sphere';
            buildMeshGeometry(meshType, rad, steps);
        });
    }

    const selectMesh = document.getElementById('select-demo-mesh');
    if (selectMesh) {
        selectMesh.addEventListener('change', (e) => {
            const rad = parseFloat(document.getElementById('slider-demo-radius')?.value || 1.0);
            const steps = parseInt(document.getElementById('slider-demo-steps')?.value || 16);
            buildMeshGeometry(e.target.value, rad, steps);
        });
    }

    // --- SWITCHES ---
    const swWire = document.getElementById('switch-demo-wireframe');
    if (swWire) {
        swWire.addEventListener('change', (e) => {
            if (wireMesh) wireMesh.visible = e.target.checked;
        });
    }

    const swPts = document.getElementById('switch-demo-points');
    if (swPts) {
        swPts.addEventListener('change', (e) => {
            if (pointsMesh) pointsMesh.visible = e.target.checked;
        });
    }

    const swLight = document.getElementById('switch-demo-light');
    if (swLight) {
        swLight.addEventListener('change', (e) => {
            if (testLight) testLight.visible = e.target.checked;
        });
    }

    // --- GALERIA DE ÍCONES ---
    populateIconGallery();
}

const svgCache = new Map();

async function inlineSVGImages() {
    const images = document.querySelectorAll('img.icon-svg');
    for (const img of images) {
        const src = img.getAttribute('src');
        if (!src || !src.endsWith('.svg')) continue;

        let svgText;
        if (svgCache.has(src)) {
            svgText = svgCache.get(src);
        } else {
            try {
                const res = await fetch(src);
                svgText = await res.text();
                svgCache.set(src, svgText);
            } catch (e) {
                continue;
            }
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg) {
            svg.setAttribute('class', img.getAttribute('class') || 'icon-svg');
            if (img.id) svg.setAttribute('id', img.id);
            if (img.getAttribute('style')) svg.setAttribute('style', img.getAttribute('style'));
            img.replaceWith(svg);
        }
    }
}

function populateIconGallery() {
    const gallery = document.getElementById('icon-gallery');
    if (!gallery) return;

    gallery.innerHTML = '';
    ICONS_LIST.forEach(name => {
        const card = document.createElement('div');
        card.className = 'icon-card';
        card.title = `Copiar código HTML do ícone ${name}.svg`;
        card.innerHTML = `
            <img src="../assets/icons/${name}.svg" class="icon-svg" style="width: 22px; height: 22px;" alt="${name}">
            <span class="icon-card-name">${name}.svg</span>
        `;
        card.addEventListener('click', () => {
            const code = `<img src="../assets/icons/${name}.svg" class="icon-svg" alt="${name}">`;
            navigator.clipboard?.writeText(code);
            card.style.borderColor = 'var(--accent-color)';
            setTimeout(() => { card.style.borderColor = ''; }, 600);
        });
        gallery.appendChild(card);
    });

    inlineSVGImages();
}

window.addEventListener('DOMContentLoaded', async () => {
    initThreeScene();
    setupListeners();
    animate();
    await inlineSVGImages();
});
