// =============================================================================
// Autor: Nicolas Heringer
// Simulação: Tesselação de Voronoi e Relaxamento de Lloyd na Esfera (SCVT)
// Módulo: Main Thread (Abas 1 e 2: Apresentação Matemática e Conexão com a Ciência)
// =============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Constantes Físicas Planetárias
const REAL_EARTH_RADIUS_KM = 6371; // Raio médio real da Terra em km
const REAL_EARTH_SURFACE_KM2 = 510065600; // Área superficial total da Terra (~510 milhões de km²)
const REAL_TROPOSPHERE_KM = 12;    // Espessura média da troposfera terrestre (~12 km)

// URL da Textura de Alta Resolução da Terra (NASA Blue Marble / Three.js CDN)
const EARTH_TEXTURE_URL = 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg';
const EARTH_TEXTURE_FALLBACK = 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg';

// =============================================================================
// 1. ESTADO GLOBAL DA APLICAÇÃO
// =============================================================================

const state = {
    // Aba Ativa: 'tab-math' (Aba 1) ou 'tab-science' (Aba 2)
    activeTab: 'tab-math',

    numCells: 500,
    isAutoLloyd: false,
    lloydIteration: 0,
    lloydAvgShift: 0.0,
    lloydSpeed: 10, // Passos de relaxamento por segundo

    // Parâmetros de Escala Planetária e Atmosférica (Aba 2)
    coreRadius: 0.93, // Raio do planeta sólido (0.93 = 7% de espessura de casca atmosférica)
    shellOpacity: 0.85, // Opacidade dos polígonos de Voronoi (30% a 100%)

    // Visualização 3D
    showEarthTexture: true,
    showStars: true,
    showConstellations: true,
    showGenerators: true,
    showWireframe: true,
    showGraticule: true,
    autoRotate: false
};

// =============================================================================
// 2. DADOS ASTRONÔMICOS: ESTRELAS DO ZODÍACO E CONSTELAÇÕES CELESTES
// =============================================================================

function raDecToXYZ(raHours, decDeg, radius = 75.0) {
    const raRad = (raHours / 24.0) * 2.0 * Math.PI;
    const decRad = (decDeg / 180.0) * Math.PI;

    const x = radius * Math.cos(decRad) * Math.cos(raRad);
    const y = radius * Math.sin(decRad);
    const z = radius * Math.cos(decRad) * Math.sin(raRad);
    return [x, y, z];
}

const CONSTELLATIONS = [
    { name: 'Áries', stars: [[2.11, 23.46], [1.91, 20.80], [1.89, 19.29]], lines: [[0, 1], [1, 2]] },
    { name: 'Touro', stars: [[4.60, 16.51], [5.44, 28.61], [3.79, 24.11], [5.63, 21.14], [4.47, 19.18]], lines: [[0, 4], [4, 2], [0, 3], [3, 1]] },
    { name: 'Gêmeos', stars: [[7.58, 31.89], [7.76, 28.03], [6.63, 16.40], [7.34, 21.98], [6.73, 25.13], [6.38, 22.51]], lines: [[0, 4], [4, 5], [5, 2], [1, 3], [3, 2], [0, 1]] },
    { name: 'Câncer', stars: [[8.97, 11.86], [8.28, 9.19], [8.72, 18.15], [8.74, 18.01]], lines: [[0, 2], [2, 3], [3, 1]] },
    { name: 'Leão', stars: [[10.14, 11.97], [10.33, 19.84], [11.82, 14.57], [11.23, 20.52], [9.88, 23.77], [10.27, 23.42]], lines: [[0, 1], [1, 5], [5, 4], [1, 3], [3, 2], [2, 0]] },
    { name: 'Virgem', stars: [[13.42, -11.16], [12.69, -1.45], [13.04, 10.96], [11.84, 1.77], [12.33, -0.67], [13.58, -0.60]], lines: [[0, 4], [4, 1], [1, 3], [1, 5], [5, 2], [5, 0]] },
    { name: 'Libra', stars: [[15.28, -9.38], [14.85, -16.04], [15.59, -14.79], [15.07, -25.25]], lines: [[0, 1], [1, 3], [3, 2], [2, 0]] },
    { name: 'Escorpião', stars: [[16.49, -26.43], [16.09, -19.80], [16.01, -22.62], [17.62, -43.00], [17.56, -37.10], [17.51, -37.29], [16.84, -34.29]], lines: [[1, 2], [2, 0], [0, 6], [6, 3], [3, 4], [4, 5]] },
    { name: 'Sagitário', stars: [[18.40, -34.38], [18.92, -26.30], [19.04, -29.88], [18.36, -29.83], [18.47, -25.42], [18.09, -30.42]], lines: [[0, 3], [3, 4], [4, 1], [1, 2], [2, 0], [3, 5]] },
    { name: 'Capricórnio', stars: [[20.30, -12.54], [20.35, -14.78], [21.78, -16.13], [21.67, -16.66], [20.86, -26.92]], lines: [[0, 1], [1, 4], [4, 3], [3, 2], [2, 0]] },
    { name: 'Aquário', stars: [[21.52, -5.57], [22.09, -0.32], [22.91, -15.82], [20.79, -9.50], [22.36, -1.39]], lines: [[3, 0], [0, 1], [1, 4], [4, 2]] },
    { name: 'Peixes', stars: [[2.03, 2.76], [23.06, 3.28], [1.23, 7.59], [1.69, 15.35], [23.29, 3.28]], lines: [[0, 2], [2, 3], [0, 1], [1, 4]] },
    { name: 'Cruzeiro do Sul', stars: [[12.44, -63.10], [12.79, -59.69], [12.52, -57.11], [12.25, -58.75]], lines: [[0, 2], [1, 3]] },
    { name: 'Órion', stars: [[5.92, 7.41], [5.24, -8.20], [5.42, 6.35], [5.79, -9.67], [5.68, -1.94], [5.60, -1.20], [5.53, -0.30]], lines: [[0, 2], [2, 6], [6, 5], [5, 4], [4, 1], [1, 3], [3, 0]] }
];

function getGeographicLocation(latDeg, lonDeg) {
    if (latDeg > 66.5) return '❄️ Círculo Polar Ártico';
    if (latDeg < -60) return '🧊 Antártica / Oceano Austral';

    if (latDeg >= -56 && latDeg <= 13 && lonDeg >= -82 && lonDeg <= -34) return '🌎 América do Sul';
    if (latDeg > 13 && latDeg <= 75 && lonDeg >= -168 && lonDeg <= -52) return '🌎 América do Norte';
    if (latDeg >= -35 && latDeg <= 37 && lonDeg >= -18 && lonDeg <= 52) return '🌍 África';
    if (latDeg >= 36 && latDeg <= 71 && lonDeg >= -10 && lonDeg <= 42) return '🌍 Europa';
    if (latDeg >= 0 && latDeg <= 75 && lonDeg > 42 && lonDeg <= 180) return '🌏 Ásia';
    if (latDeg >= -50 && latDeg <= -10 && lonDeg >= 110 && lonDeg <= 180) return '🌏 Oceania / Austrália';

    if (lonDeg >= -70 && lonDeg <= 20) return '🌊 Oceano Atlântico';
    if (lonDeg > 20 && lonDeg <= 110) return '🌊 Oceano Índico';
    return '🌊 Oceano Pacífico';
}

// =============================================================================
// 3. CENA THREE.JS, CÂMERA, LUZES E MALHAS DISTINTAS
// =============================================================================

const container = document.getElementById('three-container');
const cellTooltip = document.getElementById('cell-tooltip');

let scene, camera, renderer, controls;

// Malhas 3D
let globeCoreMesh = null;        // Malha 1: Planeta Sólido Interno (Terra)
let globeMesh = null;            // Malha 2: Casca Poligonal Atmosférica de Voronoi
let wireframeMesh = null;        // Malha 3: Linhas de Contorno das Células
let generatorPointsMesh = null;  // Malha 4: Marcadores dos Centros Celulares
let graticuleGroup = null;       // Malha 5: Equador e Paralelos
let starfieldPointsMesh = null;  // Malha 6: Fundo Estelar Celestial
let constellationsGroup = null;  // Malha 7: Constelações do Zodíaco

// Marcador de Célula Selecionada (Hover Highlight)
let hoverHighlightMesh = null;

let ambientLight = null, sunLight = null;
let globeGeometry = null, globeMaterial = null;
let earthTexture = null, earthSolidMaterial = null;

// Cache dos dados da malha atual para Raycasting e Tooltip
let currentCellPositions = null;
let currentCellDegrees = null;
let currentCellCount = 0;

function initThreeScene() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 1.2, 2.6);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.2;
    controls.maxDistance = 10.0;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.6;

    // Carregamento da Textura da Terra com Fallback
    const textureLoader = new THREE.TextureLoader();
    earthTexture = textureLoader.load(
        EARTH_TEXTURE_URL,
        (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            renderer.render(scene, camera);
        },
        undefined,
        () => {
            // Fallback 1: GitHub Raw
            earthTexture = textureLoader.load(
                EARTH_TEXTURE_FALLBACK,
                (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    if (earthSolidMaterial) {
                        earthSolidMaterial.map = tex;
                        earthSolidMaterial.needsUpdate = true;
                    }
                    renderer.render(scene, camera);
                },
                undefined,
                () => {
                    // Fallback 2: Canvas Procedimental
                    createProceduralEarthTexture();
                }
            );
        }
    );
    earthTexture.colorSpace = THREE.SRGBColorSpace;

    // --- MALHA 1: PLANETA SÓLIDO INTERNO ---
    const coreGeo = new THREE.SphereGeometry(1.0, 64, 32);
    earthSolidMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.FrontSide,
        depthWrite: true,
        depthTest: true
    });
    globeCoreMesh = new THREE.Mesh(coreGeo, earthSolidMaterial);
    globeCoreMesh.scale.setScalar(state.coreRadius);
    globeCoreMesh.visible = (state.activeTab === 'tab-science');
    scene.add(globeCoreMesh);

    // Iluminação
    ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    // Marcador de Destaque no Hover
    const highlightGeo = new THREE.RingGeometry(0.01, 0.03, 16);
    const highlightMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        depthTest: false,
        transparent: true,
        opacity: 0.9
    });
    hoverHighlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    hoverHighlightMesh.visible = false;
    scene.add(hoverHighlightMesh);

    createGraticuleLines();
    createStarfieldAndConstellations();

    window.addEventListener('resize', onWindowResize);
    setupHoverRaycasting();
}

function createProceduralEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f2b48';
    ctx.fillRect(0, 0, 1024, 512);

    ctx.fillStyle = '#2d5a3f';
    ctx.beginPath();
    ctx.ellipse(280, 200, 120, 80, 0, 0, Math.PI * 2);
    ctx.ellipse(320, 360, 70, 100, 0.2, 0, Math.PI * 2);
    ctx.ellipse(560, 220, 90, 80, 0, 0, Math.PI * 2);
    ctx.ellipse(540, 320, 80, 90, 0, 0, Math.PI * 2);
    ctx.ellipse(820, 360, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    const procTexture = new THREE.CanvasTexture(canvas);
    procTexture.colorSpace = THREE.SRGBColorSpace;
    if (earthSolidMaterial) {
        earthSolidMaterial.map = procTexture;
        earthSolidMaterial.needsUpdate = true;
    }
}

function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

function createGraticuleLines() {
    graticuleGroup = new THREE.Group();
    const R = 1.002;

    const eqPoints = [];
    for (let i = 0; i <= 128; i++) {
        const theta = (i / 128) * 2 * Math.PI;
        eqPoints.push(new THREE.Vector3(Math.cos(theta) * R, 0, Math.sin(theta) * R));
    }
    const eqGeo = new THREE.BufferGeometry().setFromPoints(eqPoints);
    const eqMat = new THREE.LineBasicMaterial({
        color: 0xfacc15,
        opacity: 0.75,
        transparent: true,
        depthTest: true,
        depthWrite: false
    });
    graticuleGroup.add(new THREE.Line(eqGeo, eqMat));

    const lats = [Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3];
    for (const lat of lats) {
        const latPoints = [];
        const rLat = R * Math.cos(lat);
        const yLat = R * Math.sin(lat);
        for (let i = 0; i <= 64; i++) {
            const theta = (i / 64) * 2 * Math.PI;
            latPoints.push(new THREE.Vector3(Math.cos(theta) * rLat, yLat, Math.sin(theta) * rLat));
        }
        const latGeo = new THREE.BufferGeometry().setFromPoints(latPoints);
        const latMat = new THREE.LineBasicMaterial({
            color: 0x64748b,
            opacity: 0.35,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });
        graticuleGroup.add(new THREE.Line(latGeo, latMat));
    }

    for (let m = 0; m < 8; m++) {
        const lon = (m / 8) * 2 * Math.PI;
        const lonPoints = [];
        for (let i = 0; i <= 64; i++) {
            const lat = -Math.PI / 2 + (i / 64) * Math.PI;
            lonPoints.push(new THREE.Vector3(
                R * Math.cos(lat) * Math.cos(lon),
                R * Math.sin(lat),
                R * Math.cos(lat) * Math.sin(lon)
            ));
        }
        const lonGeo = new THREE.BufferGeometry().setFromPoints(lonPoints);
        const lonMat = new THREE.LineBasicMaterial({
            color: 0x475569,
            opacity: 0.3,
            transparent: true,
            depthTest: true,
            depthWrite: false
        });
        graticuleGroup.add(new THREE.Line(lonGeo, lonMat));
    }

    graticuleGroup.visible = state.showGraticule;
    scene.add(graticuleGroup);
}

function createStarSpriteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.75)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createStarfieldAndConstellations() {
    const STAR_RADIUS = 75.0;
    const starSprite = createStarSpriteTexture();

    // 1. Campo de Estrelas de Fundo (2.000 estrelas nítidas)
    const numBackgroundStars = 2000;
    const starPositions = new Float32Array(numBackgroundStars * 3);
    const starColors = new Float32Array(numBackgroundStars * 3);

    for (let i = 0; i < numBackgroundStars; i++) {
        const z = 2.0 * Math.random() - 1.0;
        const theta = 2.0 * Math.PI * Math.random();
        const r = Math.sqrt(Math.max(0.0, 1.0 - z * z));

        starPositions[3 * i] = r * Math.cos(theta) * STAR_RADIUS;
        starPositions[3 * i + 1] = z * STAR_RADIUS;
        starPositions[3 * i + 2] = r * Math.sin(theta) * STAR_RADIUS;

        // Classes espectrais realistas (O, B, A, F, G, K, M)
        const starType = Math.random();
        let cr = 1.0, cg = 1.0, cb = 1.0;
        if (starType < 0.25) { cr = 0.75; cg = 0.85; cb = 1.0; }
        else if (starType < 0.65) { cr = 0.95; cg = 0.95; cb = 1.0; }
        else if (starType < 0.88) { cr = 1.0; cg = 0.92; cb = 0.70; }
        else { cr = 1.0; cg = 0.65; cb = 0.50; }

        const brightness = 0.6 + 0.4 * Math.random();
        starColors[3 * i] = cr * brightness;
        starColors[3 * i + 1] = cg * brightness;
        starColors[3 * i + 2] = cb * brightness;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
        size: 0.55,
        map: starSprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    starfieldPointsMesh = new THREE.Points(starGeo, starMat);
    starfieldPointsMesh.visible = (state.activeTab === 'tab-science' && state.showStars);
    scene.add(starfieldPointsMesh);

    // 2. Linhas e Estrelas das Constelações do Zodíaco
    constellationsGroup = new THREE.Group();
    const constellationLines = [];
    const zodiacStarPositions = [];

    for (const c of CONSTELLATIONS) {
        const starCoords = c.stars.map(([ra, dec]) => raDecToXYZ(ra, dec, STAR_RADIUS * 0.99));

        for (const [x, y, z] of starCoords) {
            zodiacStarPositions.push(x, y, z);
        }

        for (const [s1, s2] of c.lines) {
            const p1 = starCoords[s1], p2 = starCoords[s2];
            if (p1 && p2) {
                constellationLines.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2]);
            }
        }
    }

    const constLineGeo = new THREE.BufferGeometry();
    constLineGeo.setAttribute('position', new THREE.Float32BufferAttribute(constellationLines, 3));
    const constLineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        opacity: 0.45,
        transparent: true,
        depthTest: true,
        depthWrite: false
    });
    constellationsGroup.add(new THREE.LineSegments(constLineGeo, constLineMat));

    const zodiacStarGeo = new THREE.BufferGeometry();
    zodiacStarGeo.setAttribute('position', new THREE.Float32BufferAttribute(zodiacStarPositions, 3));
    const zodiacStarMat = new THREE.PointsMaterial({
        size: 0.95,
        map: starSprite,
        color: 0xfacc15,
        transparent: true,
        opacity: 1.0,
        depthTest: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    constellationsGroup.add(new THREE.Points(zodiacStarGeo, zodiacStarMat));

    constellationsGroup.visible = (state.activeTab === 'tab-science' && state.showConstellations);
    scene.add(constellationsGroup);
}

// =============================================================================
// 4. ATUALIZAÇÃO DOS DIRECT BUFFERS NATIVOS (CASCA ATMOSFÉRICA)
// =============================================================================

function applyDirectBuffersToScene(payload) {
    const {
        meshPositions,
        meshNormals,
        meshColors,
        wireframePositions,
        generatorPositions,
        numCells
    } = payload;

    currentCellPositions = generatorPositions;
    currentCellCount = numCells;

    // --- MALHA 2: CASCA ATMOSFÉRICA POLIGONAL ---
    if (globeMesh) scene.remove(globeMesh);

    globeGeometry = new THREE.BufferGeometry();
    globeGeometry.setAttribute('position', new THREE.BufferAttribute(meshPositions, 3));
    globeGeometry.setAttribute('normal', new THREE.BufferAttribute(meshNormals, 3));
    globeGeometry.setAttribute('color', new THREE.BufferAttribute(meshColors, 3));

    const isScienceTab = (state.activeTab === 'tab-science');
    const currentOpacity = isScienceTab ? state.shellOpacity : 1.0;

    globeMaterial = new THREE.MeshStandardMaterial({
        vertexColors: !isScienceTab, // Multicolorido topológico na Aba 1, cor sólida na Aba 2
        color: isScienceTab ? 0x38bdf8 : 0xffffff, // Azul atmosférico uniforme na Aba 2
        roughness: 0.55,
        metalness: 0.05,
        flatShading: true,
        side: THREE.FrontSide,
        transparent: currentOpacity < 1.0,
        opacity: currentOpacity,
        depthWrite: true,
        depthTest: true
    });

    globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globeMesh);

    // --- MALHA 3: WIREFRAME DEDUPLICADO DAS ARESTAS ---
    if (wireframeMesh) scene.remove(wireframeMesh);

    const wireGeo = new THREE.BufferGeometry();
    wireGeo.setAttribute('position', new THREE.BufferAttribute(wireframePositions, 3));
    const wireMat = new THREE.LineBasicMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.65,
        depthTest: true,
        depthWrite: false
    });
    wireframeMesh = new THREE.LineSegments(wireGeo, wireMat);
    wireframeMesh.visible = state.showWireframe;
    scene.add(wireframeMesh);

    // --- MALHA 4: MARCADORES DOS CENTROS CELULARES ---
    if (generatorPointsMesh) scene.remove(generatorPointsMesh);

    const genGeo = new THREE.BufferGeometry();
    genGeo.setAttribute('position', new THREE.BufferAttribute(generatorPositions, 3));
    const genMat = new THREE.PointsMaterial({
        size: 0.022,
        color: 0xffffff,
        depthTest: true,
        depthWrite: false
    });
    generatorPointsMesh = new THREE.Points(genGeo, genMat);
    generatorPointsMesh.visible = state.showGenerators;
    scene.add(generatorPointsMesh);
}

// =============================================================================
// 5. INSPEÇÃO DE CÉLULAS POR HOVER (TOOLTIP & RAYCASTING)
// =============================================================================

function setupHoverRaycasting() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    container.addEventListener('pointermove', (e) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        if (!globeMesh || !currentCellPositions || currentCellCount === 0) {
            hideTooltip();
            return;
        }

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(globeMesh);

        if (intersects.length > 0) {
            const hitPoint = intersects[0].point.clone().normalize();

            // Encontra o centro celular gerador mais próximo
            let nearestCell = 0;
            let maxDot = -2.0;

            for (let c = 0; c < currentCellCount; c++) {
                const gx = currentCellPositions[3 * c] / 1.004;
                const gy = currentCellPositions[3 * c + 1] / 1.004;
                const gz = currentCellPositions[3 * c + 2] / 1.004;

                const dot = hitPoint.x * gx + hitPoint.y * gy + hitPoint.z * gz;
                if (dot > maxDot) {
                    maxDot = dot;
                    nearestCell = c;
                }
            }

            const gx = currentCellPositions[3 * nearestCell] / 1.004;
            const gy = currentCellPositions[3 * nearestCell + 1] / 1.004;
            const gz = currentCellPositions[3 * nearestCell + 2] / 1.004;

            // Posiciona o anel de destaque
            if (hoverHighlightMesh) {
                hoverHighlightMesh.position.set(gx * 1.006, gy * 1.006, gz * 1.006);
                hoverHighlightMesh.lookAt(gx * 2, gy * 2, gz * 2);
                hoverHighlightMesh.visible = true;
            }

            displayTooltip(e.clientX - rect.left, e.clientY - rect.top, gx, gy, gz, nearestCell);
        } else {
            hideTooltip();
        }
    });

    container.addEventListener('pointerleave', hideTooltip);
}

function hideTooltip() {
    if (cellTooltip) cellTooltip.classList.remove('visible');
    if (hoverHighlightMesh) hoverHighlightMesh.visible = false;
}

function displayTooltip(screenX, screenY, x, y, z, cellIndex) {
    if (!cellTooltip) return;

    const latRad = Math.asin(Math.max(-1, Math.min(1, y)));
    const lonRad = Math.atan2(z, x);

    const latDeg = (latRad * 180.0 / Math.PI);
    const lonDeg = (lonRad * 180.0 / Math.PI);

    const avgAreaKm2 = REAL_EARTH_SURFACE_KM2 / Math.max(1, currentCellCount);

    if (state.activeTab === 'tab-math') {
        // --- CONTEÚDO DA ABA 1: APRESENTAÇÃO MATEMÁTICA ---
        const thetaDeg = (Math.acos(Math.max(-1, Math.min(1, y))) * 180.0 / Math.PI).toFixed(1);
        const phiDeg = ((lonDeg + 360.0) % 360.0).toFixed(1);

        cellTooltip.innerHTML = `
            <div class="tooltip-header">Domínio Voronoi #${cellIndex + 1}</div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Ângulo Polar (θ):</span>
                <span class="tooltip-v">${thetaDeg}°</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Ângulo Azimutal (φ):</span>
                <span class="tooltip-v">${phiDeg}°</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Área Esférica (Aᵢ):</span>
                <span class="tooltip-v">${(4.0 * Math.PI / currentCellCount).toFixed(4)} sr</span>
            </div>
            <div class="tooltip-geo">📐 Célula relaxada sobre a esfera S²</div>
        `;
    } else {
        // --- CONTEÚDO DA ABA 2: CONECTANDO À CIÊNCIA & GEOGRAFIA ---
        const latStr = `${Math.abs(latDeg).toFixed(1)}° ${latDeg >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(lonDeg).toFixed(1)}° ${lonDeg >= 0 ? 'E' : 'W'}`;
        const geoName = getGeographicLocation(latDeg, lonDeg);

        cellTooltip.innerHTML = `
            <div class="tooltip-header">Célula Atmosférica #${cellIndex + 1}</div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Latitude:</span>
                <span class="tooltip-v">${latStr}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Longitude:</span>
                <span class="tooltip-v">${lonStr}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-lbl">Área de Cobertura:</span>
                <span class="tooltip-v">~${(avgAreaKm2 * 1e-3).toFixed(0)}k km²</span>
            </div>
            <div class="tooltip-geo">${geoName}</div>
        `;
    }

    // Ajusta a posição do tooltip na tela
    const maxX = container.clientWidth - 210;
    const maxY = container.clientHeight - 130;
    const posX = Math.min(screenX + 15, maxX);
    const posY = Math.min(screenY + 15, maxY);

    cellTooltip.style.left = `${posX}px`;
    cellTooltip.style.top = `${posY}px`;
    cellTooltip.classList.add('visible');
}

// =============================================================================
// 6. GERENCIAMENTO DAS ABAS PROGRESSIVAS
// =============================================================================

function switchTab(newTab) {
    state.activeTab = newTab;

    const btnTabMath = document.getElementById('btn-tab-math');
    const btnTabScience = document.getElementById('btn-tab-science');
    const panelMath = document.getElementById('panel-tab-math');
    const panelScience = document.getElementById('panel-tab-science');

    if (newTab === 'tab-math') {
        btnTabMath.classList.add('active');
        btnTabScience.classList.remove('active');
        panelMath.style.display = 'block';
        panelScience.style.display = 'none';

        // Configuração visual para a Aba 1: Foco matemático puro
        if (globeCoreMesh) globeCoreMesh.visible = false;
        if (starfieldPointsMesh) starfieldPointsMesh.visible = false;
        if (constellationsGroup) constellationsGroup.visible = false;
        if (globeMaterial) {
            globeMaterial.vertexColors = true; // Pentágonos amarelos, hexágonos azuis, etc.
            globeMaterial.color.set(0xffffff);
            globeMaterial.transparent = false;
            globeMaterial.opacity = 1.0;
            globeMaterial.needsUpdate = true;
        }
    } else if (newTab === 'tab-science') {
        btnTabMath.classList.remove('active');
        btnTabScience.classList.add('active');
        panelMath.style.display = 'none';
        panelScience.style.display = 'block';

        // Configuração visual para a Aba 2: Conexão com a Terra e Astronomia
        if (globeCoreMesh) {
            globeCoreMesh.visible = true;
            globeCoreMesh.scale.setScalar(state.coreRadius);
        }
        if (starfieldPointsMesh) starfieldPointsMesh.visible = state.showStars;
        if (constellationsGroup) constellationsGroup.visible = state.showConstellations;
        if (globeMaterial) {
            globeMaterial.vertexColors = false; // Cor sólida uniforme
            globeMaterial.color.set(0x38bdf8);  // Azul atmosférico uniforme
            globeMaterial.transparent = state.shellOpacity < 1.0;
            globeMaterial.opacity = state.shellOpacity;
            globeMaterial.needsUpdate = true;
        }
    }
}

// =============================================================================
// 7. COMUNICAÇÃO COM O WEB WORKER
// =============================================================================

let worker = null;
let isWorkerBusy = false;
let lastStepTimestamp = 0;

function initWorker() {
    worker = new Worker('scripts/clima.worker.js');

    worker.onmessage = function (e) {
        const { type, payload } = e.data;

        if (type === 'MESH_BUFFERS_READY') {
            isWorkerBusy = false;
            state.lloydIteration = payload.iteration;
            state.lloydAvgShift = payload.avgShift;
            applyDirectBuffersToScene(payload);
            updateHUDStats(payload);
        }
    };

    generateNewRandomMesh();
}

function generateNewRandomMesh() {
    if (!worker) return;
    isWorkerBusy = true;
    worker.postMessage({
        type: 'GENERATE_INITIAL_MESH',
        payload: { numPoints: state.numCells }
    });
}

function updateHUDStats(payload) {
    const spanIter = document.getElementById('stat-lloyd-iter');
    const spanShift = document.getElementById('stat-lloyd-shift');
    const spanPent = document.getElementById('stat-pentagons');
    const spanHex = document.getElementById('stat-hexagons');
    const spanHept = document.getElementById('stat-heptagons');
    const spanStatus = document.getElementById('span-topology-status');
    const badgeTitle = document.getElementById('span-badge-title');

    if (spanIter) spanIter.textContent = `${payload.iteration}`;
    if (spanShift) spanShift.textContent = `${payload.avgShift.toExponential(2)}`;
    if (spanPent) {
        spanPent.innerHTML = `${payload.pentagons} ${payload.pentagons === 12 ? '<span style="color:#22c55e; font-size:0.75rem; font-weight:700;">⭐ (Exato 12!)</span>' : ''}`;
    }
    if (spanHex) spanHex.textContent = `${payload.hexagons}`;
    if (spanHept) spanHept.textContent = `${payload.heptagons + (payload.others || 0)}`;

    if (spanStatus) {
        spanStatus.textContent = `${payload.numCells} Células de Voronoi • Iteração ${payload.iteration}`;
    }

    if (badgeTitle) {
        if (payload.iteration === 0) {
            badgeTitle.textContent = 'Malha Inicial (Pontos Aleatórios)';
        } else if (payload.pentagons === 12 && (payload.heptagons + (payload.others || 0)) === 0) {
            badgeTitle.textContent = 'Malha Relaxada Estabilizada (SCVT)';
        } else {
            badgeTitle.textContent = `Relaxamento de Lloyd (Passo ${payload.iteration})`;
        }
    }

    updatePlanetaryScaleStats();
}

function updatePlanetaryScaleStats() {
    const spanVisualThickness = document.getElementById('stat-visual-thickness');
    const spanExaggeration = document.getElementById('stat-exaggeration');

    const thicknessFraction = (1.0 - state.coreRadius);
    const visualKm = thicknessFraction * REAL_EARTH_RADIUS_KM;
    const exaggerationFactor = visualKm / REAL_TROPOSPHERE_KM;

    if (spanVisualThickness) {
        spanVisualThickness.textContent = `${visualKm.toFixed(0)} km (${(thicknessFraction * 100).toFixed(1)}% de R)`;
    }
    if (spanExaggeration) {
        spanExaggeration.textContent = `${exaggerationFactor.toFixed(1)}x real (~12 km)`;
    }
}

// =============================================================================
// 8. LOOP PRINCIPAL DE ANIMAÇÃO
// =============================================================================

function animate(timestamp) {
    requestAnimationFrame(animate);

    controls.update();

    if (state.isAutoLloyd && worker && !isWorkerBusy) {
        const intervalMs = 1000.0 / Math.max(1, state.lloydSpeed);
        if (timestamp - lastStepTimestamp >= intervalMs) {
            lastStepTimestamp = timestamp;
            isWorkerBusy = true;
            worker.postMessage({ type: 'LLOYD_STEP', payload: { steps: 1 } });
        }
    }

    renderer.render(scene, camera);
}

// =============================================================================
// 9. INTERFACE DE USUÁRIO (EVENT LISTENERS)
// =============================================================================

function setupUIListeners() {
    // Alternância de Abas Progressivas
    const btnTabMath = document.getElementById('btn-tab-math');
    const btnTabScience = document.getElementById('btn-tab-science');
    if (btnTabMath) btnTabMath.addEventListener('click', () => switchTab('tab-math'));
    if (btnTabScience) btnTabScience.addEventListener('click', () => switchTab('tab-science'));

    // --- CONTROLES DA ABA 1 (MATEMÁTICA) ---
    const sliderNumCells = document.getElementById('slider-num-cells');
    const valNumCells = document.getElementById('val-num-cells');
    if (sliderNumCells && valNumCells) {
        sliderNumCells.addEventListener('input', (e) => {
            state.numCells = parseInt(e.target.value);
            valNumCells.textContent = `${state.numCells}`;
        });
        sliderNumCells.addEventListener('change', () => {
            stopAutoLloyd();
            generateNewRandomMesh();
        });
    }

    const btnRandom = document.getElementById('btn-random-mesh');
    if (btnRandom) {
        btnRandom.addEventListener('click', () => {
            stopAutoLloyd();
            generateNewRandomMesh();
        });
    }

    const btnAuto = document.getElementById('btn-auto-lloyd');
    if (btnAuto) {
        btnAuto.addEventListener('click', () => {
            state.isAutoLloyd = !state.isAutoLloyd;
            btnAuto.textContent = state.isAutoLloyd ? '⏸ Pausar Relaxamento' : '▶ Relaxar (Lloyd Automático)';
            btnAuto.classList.toggle('active', state.isAutoLloyd);
        });
    }

    function stopAutoLloyd() {
        state.isAutoLloyd = false;
        if (btnAuto) {
            btnAuto.textContent = '▶ Relaxar (Lloyd Automático)';
            btnAuto.classList.remove('active');
        }
    }

    const btnStep = document.getElementById('btn-step-lloyd');
    if (btnStep) {
        btnStep.addEventListener('click', () => {
            stopAutoLloyd();
            if (worker && !isWorkerBusy) {
                isWorkerBusy = true;
                worker.postMessage({ type: 'LLOYD_STEP', payload: { steps: 1 } });
            }
        });
    }

    const sliderSpeed = document.getElementById('slider-speed');
    const valSpeed = document.getElementById('val-speed');
    if (sliderSpeed && valSpeed) {
        sliderSpeed.addEventListener('input', (e) => {
            state.lloydSpeed = parseInt(e.target.value);
            valSpeed.textContent = `${state.lloydSpeed} passos/s`;
        });
    }

    // --- CONTROLES DA ABA 2 (CIÊNCIA & PLANETA) ---
    const sliderCoreRadius = document.getElementById('slider-core-radius');
    const valCoreRadius = document.getElementById('val-core-radius');
    if (sliderCoreRadius && valCoreRadius) {
        sliderCoreRadius.addEventListener('input', (e) => {
            state.coreRadius = parseFloat(e.target.value);
            const thicknessPercent = ((1.0 - state.coreRadius) * 100).toFixed(1);
            valCoreRadius.textContent = `R_solo = ${state.coreRadius.toFixed(2)} (${thicknessPercent}%)`;
            if (globeCoreMesh) {
                globeCoreMesh.scale.setScalar(state.coreRadius);
            }
            updatePlanetaryScaleStats();
        });
    }

    const sliderOpacity = document.getElementById('slider-shell-opacity');
    const valOpacity = document.getElementById('val-shell-opacity');
    if (sliderOpacity && valOpacity) {
        sliderOpacity.addEventListener('input', (e) => {
            state.shellOpacity = parseFloat(e.target.value);
            valOpacity.textContent = `${(state.shellOpacity * 100).toFixed(0)}%`;
            if (globeMaterial && state.activeTab === 'tab-science') {
                globeMaterial.transparent = state.shellOpacity < 1.0;
                globeMaterial.opacity = state.shellOpacity;
                globeMaterial.needsUpdate = true;
            }
        });
    }

    const toggleEarthTexture = document.getElementById('toggle-earth-texture');
    if (toggleEarthTexture) {
        toggleEarthTexture.addEventListener('change', (e) => {
            state.showEarthTexture = e.target.checked;
            if (earthSolidMaterial) {
                earthSolidMaterial.map = state.showEarthTexture ? earthTexture : null;
                earthSolidMaterial.color.set(state.showEarthTexture ? 0xffffff : 0x061126);
                earthSolidMaterial.needsUpdate = true;
            }
        });
    }

    const toggleStars = document.getElementById('toggle-stars');
    if (toggleStars) {
        toggleStars.addEventListener('change', (e) => {
            state.showStars = e.target.checked;
            if (starfieldPointsMesh && state.activeTab === 'tab-science') {
                starfieldPointsMesh.visible = state.showStars;
            }
        });
    }

    const toggleConstellations = document.getElementById('toggle-constellations');
    if (toggleConstellations) {
        toggleConstellations.addEventListener('change', (e) => {
            state.showConstellations = e.target.checked;
            if (constellationsGroup && state.activeTab === 'tab-science') {
                constellationsGroup.visible = state.showConstellations;
            }
        });
    }

    // Toggles Comuns
    const toggleGenerators = document.getElementById('toggle-generators');
    if (toggleGenerators) {
        toggleGenerators.addEventListener('change', (e) => {
            state.showGenerators = e.target.checked;
            if (generatorPointsMesh) generatorPointsMesh.visible = state.showGenerators;
        });
    }

    const toggleWireframe = document.getElementById('toggle-wireframe');
    if (toggleWireframe) {
        toggleWireframe.addEventListener('change', (e) => {
            state.showWireframe = e.target.checked;
            if (wireframeMesh) wireframeMesh.visible = state.showWireframe;
        });
    }

    const toggleGraticule = document.getElementById('toggle-graticule');
    if (toggleGraticule) {
        toggleGraticule.addEventListener('change', (e) => {
            state.showGraticule = e.target.checked;
            if (graticuleGroup) graticuleGroup.visible = state.showGraticule;
        });
    }

    const toggleAutoRotate = document.getElementById('toggle-autorotate');
    if (toggleAutoRotate) {
        toggleAutoRotate.addEventListener('change', (e) => {
            state.autoRotate = e.target.checked;
            controls.autoRotate = state.autoRotate;
        });
    }
}

// =============================================================================
// 10. INICIALIZAÇÃO
// =============================================================================

window.addEventListener('DOMContentLoaded', () => {
    initThreeScene();
    initWorker();
    setupUIListeners();
    switchTab('tab-math'); // Inicia na Aba 1: Apresentação Matemática
    updatePlanetaryScaleStats();
    animate(performance.now());
});
