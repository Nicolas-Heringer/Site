'use strict';

// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.6 Flash
// Simulação: Lei de Snell (Ray Tracing Contínuo)
// Descrição: Os raios seguem a equação diferencial d/ds(n·dr/ds) = ∇n, permitindo
//            simular refração em meios com índice n(x,y) variável e contínuo.
// =============================================================================

window.onload = function () {

    // =========================================================================
    // 1. CANVAS
    // =========================================================================
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const area = canvas.parentElement;
        canvas.width = area.clientWidth;
        canvas.height = area.clientHeight;
    }
    resizeCanvas();

    // =========================================================================
    // 2. ESTADO GLOBAL
    // =========================================================================
    let maps = null;   // { n, gx, gy, minN, maxN, dispersion } — Float32Arrays
    let feixes = [];     // Raios ativos na simulação
    let isComputing = false;  // Worker em execução
    let isPaused = false;     // Estado de pausa da simulação
    let currentMode = 'point'; // 'point' | 'plane'
    let angleDeg = 0;         // Ângulo de orientação da emissão em graus (0–359)
    let isEmitting = false;   // Disparo contínuo ao arrastar o mouse
    const mousePos = { x: 0, y: 0, inside: false };

    let backgroundCache = null;   // ImageData do fundo (desenhado uma vez ao trocar perfil)
    // trailCanvas: onde os rastros dos raios são acumulados de forma persistente
    const trailCanvas = document.createElement('canvas');
    const trailCtx = trailCanvas.getContext('2d');

    // =========================================================================
    // 3. CONTROLES (DOM) E HUD
    // =========================================================================
    const sliderAbertura = document.getElementById('aberturaSlider');
    const spanAbertura = document.getElementById('aberturaValue');
    const spanAberturaLabel = document.getElementById('aberturaLabel');
    const spanAberturaUnit = document.getElementById('aberturaUnit');
    const sliderNumFeixes = document.getElementById('numFeixesSlider');
    const spanNumFeixes = document.getElementById('numFeixesValue');
    const selectPerfil = document.getElementById('refractiveIndexFunction');
    const toggleDispersao = document.getElementById('toggleDispersao');
    const wavelengthControl = document.getElementById('wavelengthControl');
    const sliderNumWav = document.getElementById('numWavelengthsSlider');
    const spanNumWav = document.getElementById('numWavelengthsValue');
    const sliderPersistencia = document.getElementById('persistenciaSlider');
    const spanPersistencia = document.getElementById('persistenciaValue');
    const btnLimparFeixes = document.getElementById('btnLimparFeixes');
    const btnPlayPause = document.getElementById('btnPlayPause');
    const btnPlayPauseIcon = document.getElementById('btnPlayPauseIcon');
    const btnPlayPauseText = document.getElementById('btnPlayPauseText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const hudNValue = document.getElementById('hudNValue');
    const hudCoords = document.getElementById('hudCoords');
    const hudAngle = document.getElementById('hudAngle');
    const segmentBtns = document.querySelectorAll('#emissionModeControl .segment-btn');

    // Atualização dos displays dos sliders
    sliderAbertura.addEventListener('input', () => {
        spanAbertura.textContent = sliderAbertura.value;
    });
    sliderNumFeixes.addEventListener('input', () => {
        spanNumFeixes.textContent = sliderNumFeixes.value;
    });
    sliderNumWav.addEventListener('input', () => {
        spanNumWav.textContent = sliderNumWav.value;
    });
    sliderPersistencia.addEventListener('input', () => {
        const val = parseInt(sliderPersistencia.value);
        spanPersistencia.textContent = val === 100 ? 'Permanente' : val + '%';
    });

    // Seletor de modo de emissão (Fonte Pontual vs Onda Plana)
    segmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            segmentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (currentMode === 'point') {
                spanAberturaLabel.textContent = 'Abertura angular';
                spanAberturaUnit.textContent = '°';
                sliderAbertura.min = '0';
                sliderAbertura.max = '360';
                sliderAbertura.step = '2';
                sliderAbertura.value = '45';
                spanAbertura.textContent = '45';
            } else {
                spanAberturaLabel.textContent = 'Largura da frente';
                spanAberturaUnit.textContent = 'px';
                sliderAbertura.min = '10';
                sliderAbertura.max = '400';
                sliderAbertura.step = '5';
                sliderAbertura.value = '120';
                spanAbertura.textContent = '120';
            }
        });
    });

    // Atualiza HUD de ângulo
    function updateHudAngle() {
        hudAngle.textContent = `θ = ${Math.round(angleDeg)}°`;
    }
    updateHudAngle();

    // Toggle dispersão cromática
    toggleDispersao.addEventListener('change', () => {
        wavelengthControl.style.display = toggleDispersao.checked ? 'block' : 'none';
    });

    // Troca de perfil → dispara o worker e limpa tudo
    selectPerfil.addEventListener('change', () => requestMaps(selectPerfil.value));

    // Play / Pause
    function togglePlayPause() {
        isPaused = !isPaused;
        if (isPaused) {
            btnPlayPause.classList.add('paused');
            btnPlayPauseIcon.textContent = '▶';
            btnPlayPauseText.textContent = 'Continuar';
        } else {
            btnPlayPause.classList.remove('paused');
            btnPlayPauseIcon.textContent = '⏸';
            btnPlayPauseText.textContent = 'Pausar';
        }
    }
    btnPlayPause.addEventListener('click', togglePlayPause);

    // Limpar feixes e rastros
    btnLimparFeixes.addEventListener('click', clearTrails);

    // =========================================================================
    // 4. WEB WORKER — Pré-computação de n(x,y) e ∇n
    // =========================================================================
    const worker = new Worker('scripts/snell.worker.js?v=' + Date.now());

    worker.onmessage = function (e) {
        if (e.data.error) { console.error('[Worker]', e.data.error); return; }
        maps = e.data;      // { n, gx, gy, dispersion, minN, maxN }
        isComputing = false;
        loadingIndicator.style.display = 'none';
        redrawBackground();
    };

    function requestMaps(funcName) {
        isComputing = true;
        clearTrails();
        loadingIndicator.style.display = 'flex';
        worker.postMessage({ funcName, canvasWidth: canvas.width, canvasHeight: canvas.height });
    }

    // Dispara computação inicial
    requestMaps(selectPerfil.value);

    // =========================================================================
    // 5. FUNDO — Visualização do campo n(x,y)
    // =========================================================================
    function drawBackground() {
        if (!maps) return;
        const { n, minN, maxN } = maps;
        const W = canvas.width, H = canvas.height;
        const range = (maxN - minN) || 1;

        const imageData = ctx.createImageData(W, H);
        const d = imageData.data;

        for (let i = 0; i < W * H; i++) {
            const t = Math.max(0, Math.min(1, (n[i] - minN) / range));
            const p = i * 4;
            const luma = Math.round(15 + 40 * t);
            d[p] = luma;
            d[p + 1] = luma;
            d[p + 2] = luma;
            d[p + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
        backgroundCache = ctx.getImageData(0, 0, W, H);
    }

    function redrawBackground() {
        clearTrails();
        drawBackground();
    }

    // =========================================================================
    // 6. TRAIL CANVAS — Rastro acumulado dos feixes
    // =========================================================================
    function syncTrailCanvas() {
        trailCanvas.width = canvas.width;
        trailCanvas.height = canvas.height;
    }
    syncTrailCanvas();

    function clearTrails() {
        feixes = [];
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }

    function getFadeAlpha() {
        const val = parseInt(sliderPersistencia.value);
        if (val === 100) return 0;
        return 0.005 + ((100 - val) / 100) * 0.145;
    }

    // =========================================================================
    // 7. DISPERSÃO CROMÁTICA — Comprimentos de onda visíveis
    // =========================================================================
    const WAVELENGTHS_NM = [700, 650, 600, 550, 500, 450, 410];
    const LAMBDA_REF = 550;

    function wavelengthToColor(λ) {
        let r = 0, g = 0, b = 0;
        if (λ >= 380 && λ < 440) { r = -(λ - 440) / 60; b = 1; }
        else if (λ >= 440 && λ < 490) { g = (λ - 440) / 50; b = 1; }
        else if (λ >= 490 && λ < 510) { g = 1; b = -(λ - 510) / 20; }
        else if (λ >= 510 && λ < 580) { r = (λ - 510) / 70; g = 1; }
        else if (λ >= 580 && λ < 645) { r = 1; g = -(λ - 645) / 65; }
        else if (λ >= 645 && λ <= 780) { r = 1; }

        let factor = 1.0;
        if (λ >= 380 && λ < 420) factor = 0.3 + 0.7 * (λ - 380) / 40;
        else if (λ > 680 && λ <= 700) factor = 0.3 + 0.7 * (700 - λ) / 20;

        return {
            css: `rgba(${Math.round(255 * r * factor)}, ${Math.round(255 * g * factor)}, ${Math.round(255 * b * factor)}, 0.9)`,
            r: Math.round(255 * r * factor), g: Math.round(255 * g * factor), b: Math.round(255 * b * factor)
        };
    }

    function dispersionFactor(λ, B) {
        return 1.0 + B * (1e6 / λ ** 2 - 1e6 / LAMBDA_REF ** 2);
    }

    // =========================================================================
    // 8. CLASSE FEIXE (Raio de luz individual)
    // =========================================================================
    class Feixe {
        constructor(x, y, angle, colorCSS, dispFactor) {
            this.x = x;
            this.y = y;
            this.dirx = Math.cos(angle);
            this.diry = Math.sin(angle);
            this.colorCSS = colorCSS || 'rgba(255, 230, 50, 0.9)';
            this.dispFactor = dispFactor || 1.0;
            this.foraDoCanvas = false;
        }

        update(ds) {
            const xi = Math.round(this.x);
            const yi = Math.round(this.y);

            if (xi >= 0 && xi < canvas.width && yi >= 0 && yi < canvas.height) {
                const idx = yi * canvas.width + xi;
                const nVal = maps.n[idx];
                const gxVal = maps.gx[idx] * this.dispFactor;
                const gyVal = maps.gy[idx] * this.dispFactor;

                // Equação diferencial do raio: d/ds(n·dr/ds) = ∇n
                this.dirx += ds * gxVal / nVal;
                this.diry += ds * gyVal / nVal;

                // Normalizar vetor direção
                const norm = Math.sqrt(this.dirx ** 2 + this.diry ** 2);
                if (norm > 0) { this.dirx /= norm; this.diry /= norm; }

                // Desenha o ponto diretamente no trailCanvas (acúmulo persistente)
                trailCtx.fillStyle = this.colorCSS;
                trailCtx.fillRect(this.x - 1, this.y - 1, 2, 2);

                // Atualizar posição
                this.x += ds * this.dirx;
                this.y += ds * this.diry;

            } else {
                this.foraDoCanvas = true;
            }
        }
    }

    // =========================================================================
    // 9. CLASSE FEIXESBUILDER (Construtor e Preview de Feixes)
    // =========================================================================
    class FeixesBuilder {
        constructor() {
            this.mode = 'point'; // 'point' | 'plane'
            this.angle = 0;      // em radianos
            this.aperture = Math.PI / 4; // radianos (modo ponto)
            this.width = 120;    // pixels (modo plano)
            this.count = 100;
            this.useDispersion = false;
            this.numWavelengths = 5;
            this.dispersionB = 0.0;
        }

        build(startX, startY) {
            const feixesCriados = [];
            const angleRad = this.angle;
            const numFeixes = this.count;
            const useDisp = this.useDispersion;
            const numWav = this.numWavelengths;
            const B = this.dispersionB;

            // Configurações de cores e fatores de dispersão
            const configs = [];
            if (useDisp) {
                const step = Math.max(1, Math.floor(WAVELENGTHS_NM.length / numWav));
                const wavs = WAVELENGTHS_NM.filter((_, i) => i % step === 0).slice(0, numWav);
                const fxPerWav = Math.max(1, Math.round(numFeixes / wavs.length));
                wavs.forEach(λ => {
                    const { css } = wavelengthToColor(λ);
                    const dfac = dispersionFactor(λ, B);
                    configs.push({ css, dfac, subCount: fxPerWav });
                });
            } else {
                configs.push({ css: 'rgba(255, 230, 50, 0.9)', dfac: 1.0, subCount: numFeixes });
            }

            if (this.mode === 'point') {
                configs.forEach(cfg => {
                    for (let i = 0; i < cfg.subCount; i++) {
                        const t = cfg.subCount > 1 ? (i / (cfg.subCount - 1) - 0.5) : 0;
                        const rayAngle = angleRad + t * this.aperture;
                        feixesCriados.push(new Feixe(startX, startY, rayAngle, cfg.css, cfg.dfac));
                    }
                });
            } else {
                // Modo Onda Plana: vetor normal e propagação
                const nx = -Math.sin(angleRad);
                const ny = Math.cos(angleRad);

                configs.forEach(cfg => {
                    for (let i = 0; i < cfg.subCount; i++) {
                        const t = cfg.subCount > 1 ? (i / (cfg.subCount - 1) - 0.5) : 0;
                        const posX = startX + nx * (t * this.width);
                        const posY = startY + ny * (t * this.width);
                        feixesCriados.push(new Feixe(posX, posY, angleRad, cfg.css, cfg.dfac));
                    }
                });
            }

            return feixesCriados;
        }

        drawPreview(targetCtx, x, y) {
            targetCtx.save();
            targetCtx.translate(x, y);

            const angleRad = this.angle;
            const uX = Math.cos(angleRad);
            const uY = Math.sin(angleRad);

            if (this.mode === 'point') {
                // 1. Seta de direção principal
                const arrowLen = 34;
                targetCtx.strokeStyle = 'rgba(250, 204, 21, 0.95)';
                targetCtx.fillStyle = 'rgba(250, 204, 21, 0.95)';
                targetCtx.lineWidth = 2;

                targetCtx.beginPath();
                targetCtx.moveTo(0, 0);
                targetCtx.lineTo(uX * arrowLen, uY * arrowLen);
                targetCtx.stroke();

                // Ponta da seta
                const tipLen = 7;
                const headAngle = Math.PI / 6;
                targetCtx.beginPath();
                targetCtx.moveTo(uX * arrowLen, uY * arrowLen);
                targetCtx.lineTo(
                    uX * arrowLen - tipLen * Math.cos(angleRad - headAngle),
                    uY * arrowLen - tipLen * Math.sin(angleRad - headAngle)
                );
                targetCtx.lineTo(
                    uX * arrowLen - tipLen * Math.cos(angleRad + headAngle),
                    uY * arrowLen - tipLen * Math.sin(angleRad + headAngle)
                );
                targetCtx.closePath();
                targetCtx.fill();

                // 2. Arco / Leque da abertura angular
                const arcRadius = 45;
                const halfAp = this.aperture / 2;
                targetCtx.beginPath();
                targetCtx.setLineDash([3, 3]);
                targetCtx.strokeStyle = 'rgba(250, 204, 21, 0.5)';
                targetCtx.fillStyle = 'rgba(250, 204, 21, 0.08)';
                targetCtx.moveTo(0, 0);
                targetCtx.arc(0, 0, arcRadius, angleRad - halfAp, angleRad + halfAp);
                targetCtx.closePath();
                targetCtx.stroke();
                targetCtx.fill();

                // Ponto central de origem
                targetCtx.setLineDash([]);
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 3.5, 0, Math.PI * 2);
                targetCtx.fillStyle = '#ffffff';
                targetCtx.fill();

            } else {
                // Modo Onda Plana
                const nx = -Math.sin(angleRad);
                const ny = Math.cos(angleRad);
                const halfW = this.width / 2;

                // Barra transversal da frente de onda
                targetCtx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
                targetCtx.lineWidth = 2.5;
                targetCtx.beginPath();
                targetCtx.moveTo(-nx * halfW, -ny * halfW);
                targetCtx.lineTo(nx * halfW, ny * halfW);
                targetCtx.stroke();

                // Setas paralelas indicando a direção de avanço ao longo da barra
                const numArrows = Math.max(3, Math.min(7, Math.floor(this.width / 25)));
                const arrowLen = 20;
                const tipLen = 5;
                const headAngle = Math.PI / 6;

                targetCtx.lineWidth = 1.5;
                targetCtx.strokeStyle = 'rgba(250, 204, 21, 0.75)';
                targetCtx.fillStyle = 'rgba(250, 204, 21, 0.75)';

                for (let i = 0; i < numArrows; i++) {
                    const t = numArrows > 1 ? (i / (numArrows - 1) - 0.5) : 0;
                    const ax = nx * (t * this.width);
                    const ay = ny * (t * this.width);

                    targetCtx.beginPath();
                    targetCtx.moveTo(ax, ay);
                    targetCtx.lineTo(ax + uX * arrowLen, ay + uY * arrowLen);
                    targetCtx.stroke();

                    // Ponta da seta
                    targetCtx.beginPath();
                    targetCtx.moveTo(ax + uX * arrowLen, ay + uY * arrowLen);
                    targetCtx.lineTo(
                        ax + uX * arrowLen - tipLen * Math.cos(angleRad - headAngle),
                        ay + uY * arrowLen - tipLen * Math.sin(angleRad - headAngle)
                    );
                    targetCtx.lineTo(
                        ax + uX * arrowLen - tipLen * Math.cos(angleRad + headAngle),
                        ay + uY * arrowLen - tipLen * Math.sin(angleRad + headAngle)
                    );
                    targetCtx.closePath();
                    targetCtx.fill();
                }

                // Ponto central
                targetCtx.beginPath();
                targetCtx.arc(0, 0, 3, 0, Math.PI * 2);
                targetCtx.fillStyle = '#ffffff';
                targetCtx.fill();
            }

            targetCtx.restore();
        }
    }

    const builder = new FeixesBuilder();

    // =========================================================================
    // 10. INTERAÇÃO, EMISSÃO E INSPEÇÃO SOB O MOUSE
    // =========================================================================
    function emitAt(x, y) {
        if (!maps || isComputing) return;

        builder.mode = currentMode;
        builder.angle = angleDeg * (Math.PI / 180);
        if (currentMode === 'point') {
            builder.aperture = parseInt(sliderAbertura.value) * (Math.PI / 180);
        } else {
            builder.width = parseInt(sliderAbertura.value);
        }
        builder.count = parseInt(sliderNumFeixes.value);
        builder.useDispersion = toggleDispersao.checked;
        builder.numWavelengths = parseInt(sliderNumWav.value);
        builder.dispersionB = maps.dispersion;

        const novosFeixes = builder.build(x, y);
        feixes.push(...novosFeixes);
    }

    function updateHudAt(clientX, clientY) {
        if (!maps || !maps.n) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = Math.floor((clientX - rect.left) * scaleX);
        const py = Math.floor((clientY - rect.top) * scaleY);

        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
            const idx = py * canvas.width + px;
            const nVal = maps.n[idx];
            hudNValue.textContent = `n = ${nVal.toFixed(3)}`;
            hudCoords.textContent = `(x: ${px}, y: ${py})`;
        }
    }

    // Scroll do mouse altera a orientação do feixe
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 5;
        const delta = e.deltaY < 0 ? -step : step;
        angleDeg = (angleDeg + delta + 360) % 360;
        updateHudAngle();
    }, { passive: false });

    // Disparo por clique / arrasto
    canvas.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isEmitting = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        emitAt(mx, my);
    });

    window.addEventListener('mouseup', function () {
        isEmitting = false;
    });

    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const px = (e.clientX - rect.left) * scaleX;
        const py = (e.clientY - rect.top) * scaleY;

        mousePos.x = px;
        mousePos.y = py;
        mousePos.inside = true;

        updateHudAt(e.clientX, e.clientY);

        if (isEmitting) {
            emitAt(px, py);
        }
    });

    canvas.addEventListener('mouseleave', function () {
        mousePos.inside = false;
        isEmitting = false;
        hudCoords.textContent = '(fora da área)';
    });

    // =========================================================================
    // 11. LOOP DE ANIMAÇÃO
    // =========================================================================
    function animate() {
        requestAnimationFrame(animate);
        if (!maps || !backgroundCache) return;

        if (!isPaused) {
            // 1. Aplica fade no trailCanvas (se persistência < 100)
            const fadeAlpha = getFadeAlpha();
            if (fadeAlpha > 0) {
                trailCtx.globalCompositeOperation = 'destination-out';
                trailCtx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
                trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
                trailCtx.globalCompositeOperation = 'source-over';
            }

            // 2. Atualiza todos os feixes ativos (eles desenham em trailCtx)
            trailCtx.globalCompositeOperation = 'lighter';
            for (let i = feixes.length - 1; i >= 0; i--) {
                const f = feixes[i];
                f.update(1.5);
                if (f.foraDoCanvas) feixes.splice(i, 1);
            }
            trailCtx.globalCompositeOperation = 'source-over';
        }

        // 3. Compõe: fundo + rastros
        ctx.putImageData(backgroundCache, 0, 0);
        ctx.drawImage(trailCanvas, 0, 0);

        // 4. Desenha Live Preview do feixe sob o cursor
        if (mousePos.inside && !isComputing) {
            builder.mode = currentMode;
            builder.angle = angleDeg * (Math.PI / 180);
            if (currentMode === 'point') {
                builder.aperture = parseInt(sliderAbertura.value) * (Math.PI / 180);
            } else {
                builder.width = parseInt(sliderAbertura.value);
            }
            builder.count = parseInt(sliderNumFeixes.value);
            builder.drawPreview(ctx, mousePos.x, mousePos.y);
        }
    }

    animate();

    // Redimensiona canvas se a janela mudar
    window.addEventListener('resize', () => {
        resizeCanvas();
        syncTrailCanvas();
        if (selectPerfil.value) requestMaps(selectPerfil.value);
    });
};