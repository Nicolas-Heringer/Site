// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.0 Flash & Antigravity
// Simulação: Transformações Lineares 2D (Design System 2.0)
// =============================================================================

import {
    initBottomSheet,
    initSidebarCollapse,
    initTabs,
    inlineSVGImages,
    initKaTeXAutoRender,
    eigen2x2,
    det2x2,
    initModal
} from './sim-ui.js';

class PlanoCartesiano {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Vetores da base no estado atual da animação (em unidades matemáticas)
        this.iHat = { x: 1, y: 0 };
        this.jHat = { x: 0, y: 1 };

        // Vetor de prova opcional (v)
        this.vVec = { x: 2, y: 1 };
        this.showVVec = true;
        this.showEigen = true;

        // Análise de autovalores/autovetores
        this.currentAnalysis = null;

        // Configurações visuais do plano
        this.scale = 50; // 50 píxeis = 1 unidade matemática
        this.gridRange = 14; // Número de linhas da grade para cada lado
        this.origin = { x: canvas.width / 2, y: canvas.height / 2 };

        // Estado de interação
        this.draggingTarget = null; // 'i', 'j', ou 'v'
        this.hoverTarget = null;
        this.dragRadius = 18; // Raio em píxeis para captura do ponteiro/toque
    }

    /**
     * Atualiza as dimensões do Canvas e recalcula a origem no centro
     */
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.origin = { x: this.canvas.width / 2, y: this.canvas.height / 2 };

        if (this.canvas.width < 600) {
            this.scale = 38;
        } else {
            this.scale = 52;
        }
    }

    /**
     * Converte coordenadas matemáticas (x, y) para coordenadas de tela (pixel)
     */
    toScreen(mathX, mathY) {
        return {
            x: this.origin.x + mathX * this.scale,
            y: this.origin.y - mathY * this.scale
        };
    }

    /**
     * Converte coordenadas de tela (pixel) para coordenadas matemáticas (x, y)
     */
    toMath(screenX, screenY) {
        return {
            x: (screenX - this.origin.x) / this.scale,
            y: (this.origin.y - screenY) / this.scale
        };
    }

    /**
     * Aplica a transformação linear a um ponto inicial (x, y):
     * P_transformado = x * î' + y * ĵ'
     */
    transformPoint(x, y) {
        return {
            x: x * this.iHat.x + y * this.jHat.x,
            y: x * this.iHat.y + y * this.jHat.y
        };
    }

    /**
     * Renderização principal do Canvas
     */
    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.clearRect(0, 0, width, height);

        // 1. Grade original suave no fundo (referência cartesiana fixa)
        this.drawBackgroundGrid();

        // 2. Área do Determinante (Paralelograma unitário formado por î' e ĵ')
        this.drawDeterminantArea();

        // 3. Círculo unitário transformado (elipse de deformação)
        this.drawTransformedUnitCircle();

        // 4. Grade transformada
        this.drawTransformedGrid();

        // 5. Eixos principais transformados
        this.drawTransformedAxes();

        // 6. Eixos de autovetores reais invariantes (se ativos)
        if (this.showEigen && this.currentAnalysis && this.currentAnalysis.isReal) {
            this.drawEigenAxes();
        }

        // 7. Vetor de prova personalizado v⃗ e sua imagem v⃗' = Mv⃗
        if (this.showVVec) {
            this.drawVectorProbe();
        }

        // 8. Vetores unitários da base (î' e ĵ') com destaque
        this.drawBasisVectors();

        // 9. Marcador do ponto de origem (0, 0)
        this.drawOriginMarker();
    }

    /**
     * Desenha a grade cartesiana original fixa como referência
     */
    drawBackgroundGrid() {
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';

        for (let i = -this.gridRange; i <= this.gridRange; i++) {
            let p1 = this.toScreen(i, -this.gridRange);
            let p2 = this.toScreen(i, this.gridRange);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();

            p1 = this.toScreen(-this.gridRange, i);
            p2 = this.toScreen(this.gridRange, i);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        }
    }

    /**
     * Desenha a deformação do círculo unitário
     */
    drawTransformedUnitCircle() {
        const steps = 72;
        this.ctx.save();
        this.ctx.beginPath();
        for (let step = 0; step <= steps; step++) {
            const angle = (step / steps) * Math.PI * 2;
            const unitX = Math.cos(angle);
            const unitY = Math.sin(angle);
            const trans = this.transformPoint(unitX, unitY);
            const pt = this.toScreen(trans.x, trans.y);
            if (step === 0) {
                this.ctx.moveTo(pt.x, pt.y);
            } else {
                this.ctx.lineTo(pt.x, pt.y);
            }
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([3, 3]);
        this.ctx.stroke();
        this.ctx.restore();
    }

    /**
     * Desenha o paralelograma preenchido que representa a área do determinante
     */
    drawDeterminantArea() {
        const o = this.toScreen(0, 0);
        const i = this.toScreen(this.iHat.x, this.iHat.y);
        const j = this.toScreen(this.jHat.x, this.jHat.y);
        const ij = this.toScreen(this.iHat.x + this.jHat.x, this.iHat.y + this.jHat.y);

        this.ctx.beginPath();
        this.ctx.moveTo(o.x, o.y);
        this.ctx.lineTo(i.x, i.y);
        this.ctx.lineTo(ij.x, ij.y);
        this.ctx.lineTo(j.x, j.y);
        this.ctx.closePath();

        this.ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
        this.ctx.fill();

        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
        this.ctx.stroke();
    }

    /**
     * Desenha a família de retas paralelas que compõem o espaço transformado
     */
    drawTransformedGrid() {
        const range = this.gridRange;

        for (let y = -range; y <= range; y++) {
            if (y === 0) continue;

            const startMath = this.transformPoint(-range, y);
            const endMath = this.transformPoint(range, y);
            const p1 = this.toScreen(startMath.x, startMath.y);
            const p2 = this.toScreen(endMath.x, endMath.y);

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.1)';
            this.ctx.stroke();
        }

        for (let x = -range; x <= range; x++) {
            if (x === 0) continue;

            const startMath = this.transformPoint(x, -range);
            const endMath = this.transformPoint(x, range);
            const p1 = this.toScreen(startMath.x, startMath.y);
            const p2 = this.toScreen(endMath.x, endMath.y);

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
            this.ctx.stroke();
        }
    }

    /**
     * Desenha os eixos X e Y transformados
     */
    drawTransformedAxes() {
        const range = this.gridRange;

        let startMath = this.transformPoint(-range, 0);
        let endMath = this.transformPoint(range, 0);
        let p1 = this.toScreen(startMath.x, startMath.y);
        let p2 = this.toScreen(endMath.x, endMath.y);

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        this.ctx.stroke();

        startMath = this.transformPoint(0, -range);
        endMath = this.transformPoint(0, range);
        p1 = this.toScreen(startMath.x, startMath.y);
        p2 = this.toScreen(endMath.x, endMath.y);

        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        this.ctx.stroke();
    }

    /**
     * Desenha as retas invariantes dos autovetores
     */
    drawEigenAxes() {
        if (!this.currentAnalysis || !this.currentAnalysis.eigenvectors) return;
        const R = this.gridRange * 1.5;

        this.ctx.save();
        this.ctx.setLineDash([6, 6]);
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)'; // Roxo/Púrpura

        this.currentAnalysis.eigenvectors.forEach((v) => {
            if (!v || (v[0] === 0 && v[1] === 0)) return;
            const p1 = this.toScreen(-R * v[0], -R * v[1]);
            const p2 = this.toScreen(R * v[0], R * v[1]);
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
        });
        this.ctx.restore();
    }

    /**
     * Desenha o vetor de prova personalizado v⃗ e sua transformação v⃗'
     */
    drawVectorProbe() {
        const originPx = this.toScreen(0, 0);
        const vOriginalPx = this.toScreen(this.vVec.x, this.vVec.y);

        this.ctx.save();
        this.ctx.setLineDash([4, 4]);
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = 'rgba(244, 114, 182, 0.4)';
        this.ctx.beginPath();
        this.ctx.moveTo(originPx.x, originPx.y);
        this.ctx.lineTo(vOriginalPx.x, vOriginalPx.y);
        this.ctx.stroke();
        this.ctx.restore();

        const vTransformedMath = this.transformPoint(this.vVec.x, this.vVec.y);
        const vTransformedPx = this.toScreen(vTransformedMath.x, vTransformedMath.y);

        this.drawArrow(originPx, vTransformedPx, '#f472b6', 3);

        this.ctx.font = 'bold 13px Inter, sans-serif';
        this.ctx.fillStyle = '#f472b6';
        this.ctx.fillText(`v⃗'`, vTransformedPx.x + 10, vTransformedPx.y - 10);

        if (this.hoverTarget === 'v' || this.draggingTarget === 'v') {
            this.drawHandle(vTransformedPx, '#f472b6');
        }
    }

    /**
     * Desenha os vetores da base î' e ĵ'
     */
    drawBasisVectors() {
        const originPx = this.toScreen(0, 0);
        const iPx = this.toScreen(this.iHat.x, this.iHat.y);
        const jPx = this.toScreen(this.jHat.x, this.jHat.y);

        // Vetor î' (Amarelo)
        this.drawArrow(originPx, iPx, '#facc15', 4);
        this.ctx.font = 'bold 15px Inter, sans-serif';
        this.ctx.fillStyle = '#facc15';
        this.ctx.fillText('î\'', iPx.x + 12, iPx.y - 8);

        if (this.hoverTarget === 'i' || this.draggingTarget === 'i') {
            this.drawHandle(iPx, '#facc15');
        }

        // Vetor ĵ' (Ciano)
        this.drawArrow(originPx, jPx, '#38bdf8', 4);
        this.ctx.font = 'bold 15px Inter, sans-serif';
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fillText('ĵ\'', jPx.x + 12, jPx.y - 8);

        if (this.hoverTarget === 'j' || this.draggingTarget === 'j') {
            this.drawHandle(jPx, '#38bdf8');
        }
    }

    /**
     * Marca o ponto de origem (0, 0)
     */
    drawOriginMarker() {
        const o = this.toScreen(0, 0);
        this.ctx.beginPath();
        this.ctx.arc(o.x, o.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }

    /**
     * Utilitário para desenhar vetores com ponta de flecha
     */
    drawArrow(from, to, color, width) {
        const headLength = 14;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = width;

        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(to.x, to.y);
        this.ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    /**
     * Desenha anel de captura ao redor do ponto manipulável
     */
    drawHandle(point, color) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fill();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    /**
     * Detecta qual vetor o ponteiro está sobrepondo
     */
    getHitTarget(screenX, screenY) {
        const iPx = this.toScreen(this.iHat.x, this.iHat.y);
        const jPx = this.toScreen(this.jHat.x, this.jHat.y);

        const distI = Math.hypot(screenX - iPx.x, screenY - iPx.y);
        if (distI <= this.dragRadius) return 'i';

        const distJ = Math.hypot(screenX - jPx.x, screenY - jPx.y);
        if (distJ <= this.dragRadius) return 'j';

        if (this.showVVec) {
            const vTransformed = this.transformPoint(this.vVec.x, this.vVec.y);
            const vPx = this.toScreen(vTransformed.x, vTransformed.y);
            const distV = Math.hypot(screenX - vPx.x, screenY - vPx.y);
            if (distV <= this.dragRadius) return 'v';
        }

        return null;
    }
}


// --- INICIALIZAÇÃO DA SIMULAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar subsistemas do Design System 2.0
    inlineSVGImages();
    initTabs();
    initSidebarCollapse();
    initBottomSheet('#controls-panel');
    initKaTeXAutoRender();

    const canvas = document.getElementById('simCanvas');
    const plano = new PlanoCartesiano(canvas);

    // Entradas da Matriz 2x2
    const inputM11 = document.getElementById('m11');
    const inputM12 = document.getElementById('m12');
    const inputM21 = document.getElementById('m21');
    const inputM22 = document.getElementById('m22');

    // Badges de leitura
    const valIx = document.getElementById('valIx');
    const valIy = document.getElementById('valIy');
    const valJx = document.getElementById('valJx');
    const valJy = document.getElementById('valJy');

    // Controls de Presets & Animação
    const presetSelect = document.getElementById('presetSelect');
    const rotationGroup = document.getElementById('rotationGroup');
    const rotSlider = document.getElementById('rotSlider');
    const rotVal = document.getElementById('rotVal');

    const btnApply = document.getElementById('btnApply');
    const btnReset = document.getElementById('btnReset');
    const btnFocus = document.getElementById('btn-focus-mode');

    // Determinante, Autovalores e Leitura
    const detVal = document.getElementById('detVal');
    const detAreaText = document.getElementById('detAreaText');
    const detOrientText = document.getElementById('detOrientText');
    const badgeDetValue = document.getElementById('badgeDetValue');
    const eigenValText = document.getElementById('eigenValText');

    // Vetor de prova
    const chkCustomVector = document.getElementById('chkCustomVector');
    const customVectorControls = document.getElementById('customVectorControls');
    const vxInput = document.getElementById('vxInput');
    const vyInput = document.getElementById('vyInput');
    const valVxPrime = document.getElementById('valVxPrime');
    const valVyPrime = document.getElementById('valVyPrime');
    const chkShowEigen = document.getElementById('chkShowEigen');

    // Estado da animação
    let startMatrix = { a: 1, b: 0, c: 0, d: 1 };
    let targetMatrix = { a: 1, b: 0, c: 0, d: 1 };
    let animRequestId = null;
    let isAnimating = false;

    // Redimensionamento
    function handleResize() {
        plano.resize();
        plano.draw();
    }
    window.addEventListener('resize', handleResize);
    handleResize();

    // Modo Foco
    if (btnFocus) {
        btnFocus.addEventListener('click', () => {
            const sidebar = document.getElementById('controls-panel');
            if (sidebar) sidebar.classList.toggle('collapsed');
        });
    }

    function getTargetMatrixFromInputs() {
        return {
            a: parseFloat(inputM11.value) || 0,
            b: parseFloat(inputM12.value) || 0,
            c: parseFloat(inputM21.value) || 0,
            d: parseFloat(inputM22.value) || 0
        };
    }

    function setInputsFromMatrix(m) {
        inputM11.value = m.a.toFixed(2);
        inputM12.value = m.b.toFixed(2);
        inputM21.value = m.c.toFixed(2);
        inputM22.value = m.d.toFixed(2);
    }

    function updateInterpolatedSpace(t) {
        const a = startMatrix.a + (targetMatrix.a - startMatrix.a) * t;
        const b = startMatrix.b + (targetMatrix.b - startMatrix.b) * t;
        const c = startMatrix.c + (targetMatrix.c - startMatrix.c) * t;
        const d = startMatrix.d + (targetMatrix.d - startMatrix.d) * t;

        plano.iHat = { x: a, y: c };
        plano.jHat = { x: b, y: d };

        valIx.textContent = a.toFixed(2);
        valIy.textContent = c.toFixed(2);
        valJx.textContent = b.toFixed(2);
        valJy.textContent = d.toFixed(2);

        // Determinante
        const det = a * d - b * c;
        detVal.textContent = det.toFixed(2);
        badgeDetValue.textContent = `det(M) = ${det.toFixed(2)}`;

        const absDet = Math.abs(det);
        detAreaText.textContent = `${absDet.toFixed(2)}x (${absDet === 1 ? 'Preservada' : absDet > 1 ? 'Expandida' : absDet === 0 ? 'Colapsada' : 'Reduzida'})`;

        if (Math.abs(det) < 0.001) {
            detOrientText.textContent = 'Colapsada (0D/1D)';
            detOrientText.className = 'readout-value highlight-purple';
        } else if (det < 0) {
            detOrientText.textContent = 'Invertida (-)';
            detOrientText.className = 'readout-value highlight-pink';
        } else {
            detOrientText.textContent = 'Preservada (+)';
            detOrientText.className = 'readout-value highlight-green';
        }

        // Análise de Autovalores via sim-ui.js
        const analysis = eigen2x2({ a, b, c, d });
        plano.currentAnalysis = analysis;

        if (eigenValText) {
            if (analysis.isReal) {
                const [l1, l2] = analysis.eigenvalues;
                eigenValText.textContent = `${l1.toFixed(2)}, ${l2.toFixed(2)}`;
            } else {
                const ev = analysis.eigenvalues[0];
                eigenValText.textContent = `${ev.re.toFixed(2)} ± ${ev.im.toFixed(2)}i`;
            }
        }

        // Vetor v' = Mv
        const vx = parseFloat(vxInput.value) || 0;
        const vy = parseFloat(vyInput.value) || 0;
        plano.vVec = { x: vx, y: vy };

        const vPrime = plano.transformPoint(vx, vy);
        valVxPrime.textContent = vPrime.x.toFixed(2);
        valVyPrime.textContent = vPrime.y.toFixed(2);

        plano.draw();
    }

    function triggerAnimation() {
        if (isAnimating) cancelAnimationFrame(animRequestId);

        startMatrix = {
            a: plano.iHat.x,
            b: plano.jHat.x,
            c: plano.iHat.y,
            d: plano.jHat.y
        };
        targetMatrix = getTargetMatrixFromInputs();

        const duration = 1000;
        const startTime = performance.now();
        isAnimating = true;

        function animateStep(now) {
            const elapsed = now - startTime;
            let p = Math.min(elapsed / duration, 1.0);
            const easedP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

            updateInterpolatedSpace(easedP);

            if (p < 1.0) {
                animRequestId = requestAnimationFrame(animateStep);
            } else {
                isAnimating = false;
                startMatrix = { ...targetMatrix };
            }
        }

        animRequestId = requestAnimationFrame(animateStep);
    }

    // --- LISTENERS DE INTERFACE ---

    btnApply.addEventListener('click', () => {
        btnApply.classList.remove('pulse-accent');
        triggerAnimation();
    });

    [inputM11, inputM12, inputM21, inputM22].forEach(input => {
        input.addEventListener('input', () => {
            targetMatrix = getTargetMatrixFromInputs();
            if (btnApply) btnApply.classList.add('pulse-accent');
        });
    });

    btnReset.addEventListener('click', () => {
        presetSelect.value = 'identity';
        rotationGroup.style.display = 'none';
        if (btnApply) btnApply.classList.remove('pulse-accent');

        targetMatrix = { a: 1, b: 0, c: 0, d: 1 };
        setInputsFromMatrix(targetMatrix);
        triggerAnimation();
    });

    // Modal Didático de Teoria e Deduções Matemáticas
    const modalTeoria = initModal('#modal-theory-matrizes');
    const btnAbrirModal = document.getElementById('btn-abrir-modal-teoria');
    if (btnAbrirModal && modalTeoria) {
        btnAbrirModal.addEventListener('click', () => modalTeoria.open());
    }

    // Botão de Reset Rápido Flutuante no Canvas
    const btnQuickReset = document.getElementById('btn-quick-reset');
    if (btnQuickReset) {
        btnQuickReset.addEventListener('click', () => {
            btnReset.click();
        });
    }

    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        rotationGroup.style.display = (val === 'rotation') ? 'block' : 'none';

        switch (val) {
            case 'identity':
                targetMatrix = { a: 1, b: 0, c: 0, d: 1 };
                break;
            case 'shearX':
                targetMatrix = { a: 1, b: 1, c: 0, d: 1 };
                break;
            case 'shearY':
                targetMatrix = { a: 1, b: 0, c: 1, d: 1 };
                break;
            case 'scale':
                targetMatrix = { a: 2, b: 0, c: 0, d: 1.5 };
                break;
            case 'rotation':
                updateRotationFromSlider();
                return;
            case 'reflectX':
                targetMatrix = { a: 1, b: 0, c: 0, d: -1 };
                break;
            case 'reflectY':
                targetMatrix = { a: -1, b: 0, c: 0, d: 1 };
                break;
            case 'projection':
                targetMatrix = { a: 1, b: 0, c: 0, d: 0 };
                break;
            case 'inversion':
                targetMatrix = { a: -1, b: 0, c: 0, d: -1 };
                break;
        }

        setInputsFromMatrix(targetMatrix);
        if (btnApply) btnApply.classList.add('pulse-accent');
    });

    function updateRotationFromSlider() {
        const deg = parseFloat(rotSlider.value);
        rotVal.textContent = `${deg}°`;

        const rad = deg * (Math.PI / 180);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        targetMatrix = {
            a: cos,
            b: -sin,
            c: sin,
            d: cos
        };

        setInputsFromMatrix(targetMatrix);
        if (btnApply) btnApply.classList.add('pulse-accent');
    }
    rotSlider.addEventListener('input', updateRotationFromSlider);

    chkCustomVector.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        plano.showVVec = isChecked;
        customVectorControls.style.display = isChecked ? 'flex' : 'none';
        plano.draw();
    });

    if (chkShowEigen) {
        chkShowEigen.addEventListener('change', (e) => {
            plano.showEigen = e.target.checked;
            plano.draw();
        });
    }

    [vxInput, vyInput].forEach(input => {
        input.addEventListener('input', () => {
            updateInterpolatedSpace(1.0);
        });
    });

    // --- INTERAÇÃO UNIFICADA DE PONTEIRO (DESKTOP E TOQUE MOBILE) ---

    canvas.addEventListener('pointerdown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const hit = plano.getHitTarget(mouseX, mouseY);
        if (hit) {
            plano.draggingTarget = hit;
            canvas.style.cursor = 'grabbing';
            canvas.setPointerCapture(e.pointerId);
        }
    });

    canvas.addEventListener('pointermove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (plano.draggingTarget) {
            const mathPos = plano.toMath(mouseX, mouseY);
            const roundedX = Math.round(mathPos.x * 10) / 10;
            const roundedY = Math.round(mathPos.y * 10) / 10;

            if (plano.draggingTarget === 'i') {
                inputM11.value = roundedX.toFixed(1);
                inputM21.value = roundedY.toFixed(1);
            } else if (plano.draggingTarget === 'j') {
                inputM12.value = roundedX.toFixed(1);
                inputM22.value = roundedY.toFixed(1);
            } else if (plano.draggingTarget === 'v') {
                vxInput.value = roundedX.toFixed(1);
                vyInput.value = roundedY.toFixed(1);
            }

            targetMatrix = getTargetMatrixFromInputs();
            startMatrix = { ...targetMatrix };
            updateInterpolatedSpace(1.0);
        } else {
            const hit = plano.getHitTarget(mouseX, mouseY);
            if (hit !== plano.hoverTarget) {
                plano.hoverTarget = hit;
                canvas.style.cursor = hit ? 'grab' : 'default';
                plano.draw();
            }
        }
    });

    const endPointer = (e) => {
        if (plano.draggingTarget) {
            try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
            plano.draggingTarget = null;
            canvas.style.cursor = 'default';
            plano.draw();
        }
    };

    canvas.addEventListener('pointerup', endPointer);
    canvas.addEventListener('pointercancel', endPointer);

    // Estado Inicial
    updateInterpolatedSpace(1.0);
});
