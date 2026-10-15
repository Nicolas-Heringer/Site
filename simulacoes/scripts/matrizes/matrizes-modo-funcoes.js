// =============================================================================
// Autor: Nicolas Heringer
// Projeto: Simulações Matemáticas & Científicas (Design System 2.0)
// Arquivo: matrizes-modo-funcoes.js
// Modo 3: Entradas Funcionais M(x, y, t), Evolução Temporal e Superfícies de Prova
// =============================================================================

import { compileExpression } from './matrizes-expr.js';
import { setFieldState, initToggleButton, syncDualSlider, renderMath } from '../sim-ui.js';

export class ModoFuncoes {
    /**
     * @param {PlanoCartesiano} plano
     * @param {Object} domElements
     */
    constructor(plano, domElements) {
        this.plano = plano;
        this.dom = domElements;

        // Expressões das células
        this.exprStrings = {
            m11: '1',
            m12: '0.2*sin(y + t)',
            m21: '0.2*sin(x + t)',
            m22: '1'
        };

        // Funções compiladas
        this.compiledFns = {
            m11: () => 1,
            m12: (x, y, t) => 0.2 * Math.sin(y + t),
            m21: (x, y, t) => 0.2 * Math.sin(x + t),
            m22: () => 1
        };

        // Parâmetro temporal t
        this.t = 0;
        this.speed = 1.0;
        this.isPlaying = false;
        this.lastTime = 0;
        this.animRequestId = null;

        // Superfícies de prova (inicializa vazio para início limpo sob demanda)
        this.probeSurfaces = [];

        this.initDOM();
        this.recompileAll();
    }

    addCircle() {
        const nextId = Date.now();
        this.probeSurfaces.push({
            id: nextId,
            type: 'circle',
            cx: 1.5,
            cy: 1.5,
            size: 1.0,
            color: '#a855f7'
        });
        this.syncSurfacesToPlano();
    }

    addSquare() {
        const nextId = Date.now();
        this.probeSurfaces.push({
            id: nextId,
            type: 'square',
            cx: -1.8,
            cy: 1.2,
            size: 1.4,
            color: '#22c55e'
        });
        this.syncSurfacesToPlano();
    }

    clearSurfaces() {
        this.probeSurfaces = [];
        this.syncSurfacesToPlano();
    }

    initDOM() {
        const {
            fnM11, fnM12, fnM21, fnM22,
            presetFnSelect,
            btnAddCircle, btnAddSquare, btnClearSurfaces,
            btnPlayFn, btnStepFn, btnResetFn,
            sliderT, numT,
            speedPills
        } = this.dom;

        // Entradas funcionais com validação em tempo real
        const inputs = [
            { key: 'm11', el: fnM11 },
            { key: 'm12', el: fnM12 },
            { key: 'm21', el: fnM21 },
            { key: 'm22', el: fnM22 }
        ];

        inputs.forEach(({ key, el }) => {
            if (!el) return;
            el.addEventListener('input', () => {
                this.exprStrings[key] = el.value.trim();
                const res = compileExpression(this.exprStrings[key]);
                if (res.valid) {
                    this.compiledFns[key] = res.fn;
                    setFieldState(el, 'valid', res.error || 'Sintaxe válida');
                } else {
                    setFieldState(el, 'invalid', res.error || 'Erro de sintaxe');
                }
                this.updatePlanoTransform();
            });
        });

        // Presets funcionais
        if (presetFnSelect) {
            presetFnSelect.addEventListener('change', (e) => {
                this.applyPreset(e.target.value);
            });
        }

        // Adicionar superfícies de prova
        if (btnAddCircle) {
            btnAddCircle.addEventListener('click', () => this.addCircle());
        }

        if (btnAddSquare) {
            btnAddSquare.addEventListener('click', () => this.addSquare());
        }

        if (btnClearSurfaces) {
            btnClearSurfaces.addEventListener('click', () => this.clearSurfaces());
        }

        // Transporte temporal (Play / Pause / Step / Reset)
        if (btnPlayFn) {
            initToggleButton(btnPlayFn, (isActive) => {
                this.isPlaying = isActive;
                if (this.isPlaying) {
                    this.lastTime = performance.now();
                    this.loop();
                } else {
                    cancelAnimationFrame(this.animRequestId);
                }
            });
        }

        if (btnStepFn) {
            btnStepFn.addEventListener('click', () => {
                this.t += 0.1;
                this.updateTControls();
                this.updatePlanoTransform();
            });
        }

        if (btnResetFn) {
            btnResetFn.addEventListener('click', () => {
                this.t = 0;
                this.updateTControls();
                this.updatePlanoTransform();
            });
        }

        // Sincronização do Slider de Tempo
        if (sliderT && numT) {
            this.sliderController = syncDualSlider(sliderT, numT, (val) => {
                this.t = val;
                this.updatePlanoTransform();
            });
        }

        // Pílulas de velocidade
        if (speedPills) {
            speedPills.querySelectorAll('.speed-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    speedPills.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.speed = parseFloat(btn.dataset.speed || 1.0);
                });
            });
        }

        // Callbacks de interação do plano para quando arrastar uma superfície
        this.plano.onTargetChange = () => {
            this.updateSurfaceTelemetry();
        };
    }

    updateTControls() {
        if (this.sliderController) {
            this.sliderController.setValue(parseFloat(this.t.toFixed(2)));
        }
    }

    loop() {
        if (!this.isPlaying) return;
        const now = performance.now();
        const dt = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.t += dt * this.speed;
        if (this.t > 10) {
            this.t = 0; // Loop contínuo de 0 a 10
        }

        this.updateTControls();
        this.updatePlanoTransform();

        this.animRequestId = requestAnimationFrame(() => this.loop());
    }

    recompileAll() {
        const { fnM11, fnM12, fnM21, fnM22 } = this.dom;
        const list = [
            { key: 'm11', el: fnM11 },
            { key: 'm12', el: fnM12 },
            { key: 'm21', el: fnM21 },
            { key: 'm22', el: fnM22 }
        ];

        list.forEach(({ key, el }) => {
            if (el) el.value = this.exprStrings[key];
            const res = compileExpression(this.exprStrings[key]);
            if (res.valid) {
                this.compiledFns[key] = res.fn;
                if (el) setFieldState(el, 'valid');
            } else if (el) {
                setFieldState(el, 'invalid', res.error);
            }
        });

        this.updatePlanoTransform();
    }

    applyPreset(presetName) {
        switch (presetName) {
            case 'vortex':
                // Redemoinho / Vortex: rotação angular decaindo com raio r e girando com t
                this.exprStrings = {
                    m11: 'cos(0.5*sqrt(x^2 + y^2) - t)',
                    m12: '-sin(0.5*sqrt(x^2 + y^2) - t)',
                    m21: 'sin(0.5*sqrt(x^2 + y^2) - t)',
                    m22: 'cos(0.5*sqrt(x^2 + y^2) - t)'
                };
                break;
            case 'wave':
                // Onda senoidal plana
                this.exprStrings = {
                    m11: '1',
                    m12: '0.3*sin(1.5*y + t)',
                    m21: '0.3*sin(1.5*x + t)',
                    m22: '1'
                };
                break;
            case 'lens':
                // Lente Gravitacional / Deformação de densidade
                this.exprStrings = {
                    m11: '1 + 0.3*cos(t)/(1 + 0.1*(x^2 + y^2))',
                    m12: '0',
                    m21: '0',
                    m22: '1 + 0.3*cos(t)/(1 + 0.1*(x^2 + y^2))'
                };
                break;
            case 'nonlinear-shear':
                // Cisalhamento Não-Linear dependente de y^2
                this.exprStrings = {
                    m11: '1',
                    m12: '0.15*y*sin(t)',
                    m21: '0',
                    m22: '1'
                };
                break;
            case 'breathing':
                // Respiração / Pulsação isotrópica
                this.exprStrings = {
                    m11: '1 + 0.35*sin(t)',
                    m12: '0',
                    m21: '0',
                    m22: '1 + 0.35*sin(t)'
                };
                break;
        }

        this.recompileAll();
    }

    updatePlanoTransform() {
        const { m11, m12, m21, m22 } = this.compiledFns;
        const curT = this.t;

        // Define a transformação não-linear no Plano Cartesiano:
        // [x', y'] = M(x, y, t) * [x, y]^T
        this.plano.customTransformFn = (x, y) => {
            const a = m11(x, y, curT);
            const b = m12(x, y, curT);
            const c = m21(x, y, curT);
            const d = m22(x, y, curT);
            return {
                x: a * x + b * y,
                y: c * x + d * y
            };
        };

        this.syncSurfacesToPlano();
        this.updateSurfaceTelemetry();
        this.plano.draw();
    }

    syncSurfacesToPlano() {
        this.plano.probeSurfaces = this.probeSurfaces;
    }

    /**
     * Calcula a telemetria local e aproximação linear (Jacobiana) para cada superfície de prova
     */
    updateSurfaceTelemetry() {
        const container = document.getElementById('funcoes-surfaces-telemetry');
        if (!container) return;

        if (this.probeSurfaces.length === 0) {
            container.innerHTML = '<p class="sim-readout-row" style="color: var(--text-muted); font-size: 0.78rem;">Nenhuma superfície de prova ativa. Adicione um círculo ou quadrado acima.</p>';
            return;
        }

        const eps = 0.001;
        const curT = this.t;
        const map = this.plano.customTransformFn || ((x, y) => ({ x, y }));

        let html = '';
        this.probeSurfaces.forEach((surf, idx) => {
            const cx = surf.cx;
            const cy = surf.cy;

            // Jacobiana numérica J = [dx'/dx  dx'/dy; dy'/dx dy'/dy] em (cx, cy)
            const p0 = map(cx, cy);
            const px = map(cx + eps, cy);
            const py = map(cx, cy + eps);

            const j11 = (px.x - p0.x) / eps;
            const j21 = (px.y - p0.y) / eps;
            const j12 = (py.x - p0.x) / eps;
            const j22 = (py.y - p0.y) / eps;

            const detJ = j11 * j22 - j12 * j21;
            const absDetJ = Math.abs(detJ);

            // Área original
            let origArea = 0;
            if (surf.type === 'circle') {
                origArea = Math.PI * surf.size * surf.size;
            } else {
                origArea = surf.size * surf.size;
            }

            // Estimativa de área deformada via Green/Shoelace sobre a fronteira amostrada
            const steps = 36;
            const pts = [];
            for (let k = 0; k < steps; k++) {
                const th = (k / steps) * Math.PI * 2;
                let mx, my;
                if (surf.type === 'circle') {
                    mx = cx + surf.size * Math.cos(th);
                    my = cy + surf.size * Math.sin(th);
                } else {
                    const s = surf.size / 2;
                    // Amostra do quadrado
                    const u = Math.cos(th);
                    const v = Math.sin(th);
                    const scale = 1 / Math.max(Math.abs(u), Math.abs(v));
                    mx = cx + s * u * scale;
                    my = cy + s * v * scale;
                }
                pts.push(map(mx, my));
            }

            let shoelace = 0;
            for (let k = 0; k < steps; k++) {
                const pCurr = pts[k];
                const pNext = pts[(k + 1) % steps];
                shoelace += (pCurr.x * pNext.y - pNext.x * pCurr.y);
            }
            const transArea = Math.abs(shoelace) / 2;
            const areaRatio = origArea > 0 ? transArea / origArea : 1;

            const badgeColor = surf.type === 'circle' ? 'var(--color-purple)' : 'var(--color-emerald)';
            const surfName = surf.type === 'circle' ? 'Círculo' : 'Quadrado';

            html += `
                <div class="sim-readout" style="margin-bottom: 8px; border-left: 3px solid ${badgeColor};">
                    <div class="sim-readout-title">
                        <span>${surfName} #${idx + 1} em (${cx.toFixed(1)}, ${cy.toFixed(1)})</span>
                    </div>
                    <div class="sim-readout-row">
                        <span class="sim-readout-label">Área Original $A_0$:</span>
                        <span class="sim-readout-value">${origArea.toFixed(2)} un²</span>
                    </div>
                    <div class="sim-readout-row">
                        <span class="sim-readout-label">Área Transformada $A'$:</span>
                        <span class="sim-readout-value tone-cyan">${transArea.toFixed(2)} un²</span>
                    </div>
                    <div class="sim-readout-row">
                        <span class="sim-readout-label">Razão de Área ($A'/A_0$):</span>
                        <span class="sim-readout-value tone-accent">${areaRatio.toFixed(2)}x</span>
                    </div>
                    <div class="sim-readout-row">
                        <span class="sim-readout-label">Jacobiana Local $|\det(J)|$:</span>
                        <span class="sim-readout-value tone-rose">${absDetJ.toFixed(2)}x</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (window.renderMathInElement) {
            window.renderMathInElement(container, {
                delimiters: [{ left: '$', right: '$', display: false }],
                throwOnError: false
            });
        }
    }

    mount() {
        this.plano.showVVec = false;
        this.plano.showVPrime = false;
        this.plano.showDisplacementVec = false;
        this.plano.showEigen = false;
        this.plano.showGhostGrid = true;
        this.plano.showDetArea = false;
        this.plano.showUnitCircle = false;
        this.plano.showBasisVectors = false;
        this.plano.allowedDragTargets = ['surface-center', 'surface-resize'];

        this.updatePlanoTransform();
    }

    unmount() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animRequestId);
        this.plano.probeSurfaces = [];
        this.plano.customTransformFn = null;
    }
}
