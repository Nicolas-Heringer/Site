'use strict';

// =============================================================================
// Simulação — Lei de Snell (Ray Tracing Contínuo)
// =============================================================================
// Os raios seguem a equação diferencial do raio: d/ds(n·dr/ds) = ∇n
// Isso permite simular refração em meios com índice n(x,y) variável e contínuo.
// =============================================================================

window.onload = function () {

    // =========================================================================
    // 1. CANVAS
    // =========================================================================
    const canvas = document.getElementById('simulationCanvas');
    const ctx    = canvas.getContext('2d');

    function resizeCanvas() {
        const area = canvas.parentElement;
        canvas.width  = area.clientWidth;
        canvas.height = area.clientHeight;
    }
    resizeCanvas();

    // =========================================================================
    // 2. ESTADO GLOBAL
    // =========================================================================
    let maps            = null;   // { n, gx, gy, minN, maxN, dispersion } — Float32Arrays
    let feixes          = [];     // Raios ativos na simulação
    let isComputing     = false;  // Worker em execução
    let backgroundCache = null;   // ImageData do fundo (desenhado uma vez ao trocar perfil)
    // trailCanvas: onde os rastros dos raios são acumulados de forma persistente
    const trailCanvas  = document.createElement('canvas');
    const trailCtx     = trailCanvas.getContext('2d');

    // =========================================================================
    // 3. CONTROLES (DOM)
    // =========================================================================
    const sliderAbertura    = document.getElementById('aberturaSlider');
    const spanAbertura      = document.getElementById('aberturaValue');
    const sliderNumFeixes   = document.getElementById('numFeixesSlider');
    const spanNumFeixes     = document.getElementById('numFeixesValue');
    const selectPerfil      = document.getElementById('refractiveIndexFunction');
    const toggleDispersao   = document.getElementById('toggleDispersao');
    const wavelengthControl = document.getElementById('wavelengthControl');
    const sliderNumWav      = document.getElementById('numWavelengthsSlider');
    const spanNumWav        = document.getElementById('numWavelengthsValue');
    const sliderPersistencia= document.getElementById('persistenciaSlider');
    const spanPersistencia  = document.getElementById('persistenciaValue');
    const btnLimparFeixes   = document.getElementById('btnLimparFeixes');
    const loadingIndicator  = document.getElementById('loadingIndicator');

    // Atualização dos displays dos sliders
    sliderAbertura.addEventListener('input', () => {
        spanAbertura.textContent = sliderAbertura.value + '°';
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

    // Toggle dispersão cromática
    toggleDispersao.addEventListener('change', () => {
        wavelengthControl.style.display = toggleDispersao.checked ? 'block' : 'none';
    });

    // Troca de perfil → dispara o worker e limpa tudo
    selectPerfil.addEventListener('change', () => requestMaps(selectPerfil.value));

    // Limpar feixes e rastros
    btnLimparFeixes.addEventListener('click', clearTrails);

    // =========================================================================
    // 4. WEB WORKER — Pré-computação de n(x,y) e ∇n
    // =========================================================================
    // Usamos um parâmetro de versão (timestamp) para evitar que o navegador use 
    // uma versão em cache do worker durante o desenvolvimento.
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
            // Fundo neutro em tons de cinza escuro para destacar as cores dos feixes
            // n baixo = escuro (15), n alto = cinza (55)
            const luma = Math.round(15 + 40 * t);
            d[p]     = luma;
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
    // Os rastros são desenhados em um canvas secundário (trailCanvas).
    // A cada frame, copiamos o trailCanvas para o canvas principal.
    // O fade é aplicado sobrepondo um retângulo semitransparente sobre o trailCanvas.

    function syncTrailCanvas() {
        trailCanvas.width  = canvas.width;
        trailCanvas.height = canvas.height;
    }
    syncTrailCanvas();

    function clearTrails() {
        feixes = [];
        trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }

    // Retorna o alpha de fade baseado no slider (100 = permanente, 0 = some rápido)
    function getFadeAlpha() {
        const val = parseInt(sliderPersistencia.value); // 0–100
        if (val === 100) return 0; // 100 = permanente: nunca aplica fade
        // Mapeamos 0-99 para um alpha de fade. 99 = lento (0.005), 0 = rápido (0.15)
        return 0.005 + ((100 - val) / 100) * 0.145;
    }

    // =========================================================================
    // 7. DISPERSÃO CROMÁTICA — Comprimentos de onda visíveis
    // =========================================================================
    const WAVELENGTHS_NM = [700, 650, 600, 550, 500, 450, 410];
    const LAMBDA_REF     = 550;

    function wavelengthToColor(λ) {
        let r = 0, g = 0, b = 0;
        if      (λ >= 380 && λ < 440) { r = -(λ - 440) / 60; b = 1; }
        else if (λ >= 440 && λ < 490) { g = (λ - 440) / 50;  b = 1; }
        else if (λ >= 490 && λ < 510) { g = 1; b = -(λ - 510) / 20; }
        else if (λ >= 510 && λ < 580) { r = (λ - 510) / 70;  g = 1; }
        else if (λ >= 580 && λ < 645) { r = 1; g = -(λ - 645) / 65; }
        else if (λ >= 645 && λ <= 780){ r = 1; }

        let factor = 1.0;
        if      (λ >= 380 && λ < 420) factor = 0.3 + 0.7 * (λ - 380) / 40;
        else if (λ >  680 && λ <= 700) factor = 0.3 + 0.7 * (700 - λ) / 20;

        return {
            css: `rgba(${Math.round(255*r*factor)}, ${Math.round(255*g*factor)}, ${Math.round(255*b*factor)}, 0.9)`,
            r: Math.round(255*r*factor), g: Math.round(255*g*factor), b: Math.round(255*b*factor)
        };
    }

    function dispersionFactor(λ, B) {
        return 1.0 + B * (1e6 / λ**2 - 1e6 / LAMBDA_REF**2);
    }

    // =========================================================================
    // 8. CLASSE FEIXE (Raio de luz)
    // =========================================================================
    class Feixe {
        constructor(x, y, angle, colorCSS, dispFactor) {
            this.x    = x;
            this.y    = y;
            this.dirx = Math.cos(angle);
            this.diry = Math.sin(angle);
            this.colorCSS   = colorCSS   || 'rgba(255, 230, 50, 0.9)';
            this.dispFactor = dispFactor || 1.0;
            this.foraDoCanvas = false;
        }

        update(ds) {
            const xi = Math.round(this.x);
            const yi = Math.round(this.y);

            if (xi >= 0 && xi < canvas.width && yi >= 0 && yi < canvas.height) {
                const idx = yi * canvas.width + xi;
                const nVal  = maps.n[idx];
                const gxVal = maps.gx[idx] * this.dispFactor;
                const gyVal = maps.gy[idx] * this.dispFactor;

                // Equação diferencial do raio: d/ds(n·dr/ds) = ∇n
                this.dirx += ds * gxVal / nVal;
                this.diry += ds * gyVal / nVal;

                // Normalizar vetor direção
                const norm = Math.sqrt(this.dirx**2 + this.diry**2);
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
    // 9. EMISSÃO DE FEIXES
    // =========================================================================
    function emitFeixes(startX, startY, aberturaRad) {
        if (!maps || isComputing) return;

        const useDispersion = toggleDispersao.checked;
        const numFeixes     = parseInt(sliderNumFeixes.value);

        if (useDispersion) {
            const numWav = parseInt(sliderNumWav.value);
            const B      = maps.dispersion;
            const step   = Math.max(1, Math.floor(WAVELENGTHS_NM.length / numWav));
            const wavs   = WAVELENGTHS_NM.filter((_, i) => i % step === 0).slice(0, numWav);
            const fxPerWav = Math.max(1, Math.round(numFeixes / wavs.length));

            wavs.forEach(λ => {
                const { css } = wavelengthToColor(λ);
                const dfac    = dispersionFactor(λ, B);
                for (let i = 0; i < fxPerWav; i++) {
                    const angle = aberturaRad * (i / fxPerWav - 0.5);
                    feixes.push(new Feixe(startX, startY, angle, css, dfac));
                }
            });
        } else {
            for (let i = 0; i < numFeixes; i++) {
                const angle = aberturaRad * (i / numFeixes - 0.5);
                feixes.push(new Feixe(startX, startY, angle, 'rgba(255, 230, 50, 0.9)', 1.0));
            }
        }
    }

    // =========================================================================
    // 10. INTERAÇÃO — Clique no canvas emite feixes
    // =========================================================================
    canvas.addEventListener('click', function (e) {
        const rect = canvas.getBoundingClientRect();
        const mx   = e.clientX - rect.left;
        const my   = e.clientY - rect.top;
        const aberturaRad = 2 * Math.PI * (parseInt(sliderAbertura.value) / 360);
        emitFeixes(mx, my, aberturaRad);
    });

    // =========================================================================
    // 11. LOOP DE ANIMAÇÃO
    // =========================================================================
    function animate() {
        requestAnimationFrame(animate);
        if (!maps || !backgroundCache) return;

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

        // 3. Compõe: fundo + rastros
        ctx.putImageData(backgroundCache, 0, 0);
        ctx.drawImage(trailCanvas, 0, 0);
    }

    animate();

    // Redimensiona canvas se a janela mudar
    window.addEventListener('resize', () => {
        resizeCanvas();
        syncTrailCanvas();
        if (selectPerfil.value) requestMaps(selectPerfil.value);
    });
};