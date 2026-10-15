// =============================================================================
// Autor: Nicolas Heringer
// Projeto: Simulações Matemáticas & Científicas (Design System 2.0)
// Arquivo: matrizes-modo-construir.js
// Modo 2: Construir a Matriz a partir de Imagens de Vetores e Acompanhar v -> v'
// =============================================================================

import { setFieldState, eigen2x2, renderMath } from '../sim-ui.js';

export class ModoConstruir {
    /**
     * @param {PlanoCartesiano} planoLeft - Canvas do espaço inicial
     * @param {PlanoCartesiano} planoRight - Canvas do espaço transformado
     * @param {Object} domElements
     */
    constructor(planoLeft, planoRight, domElements) {
        this.planoLeft = planoLeft;
        this.planoRight = planoRight;
        this.dom = domElements;

        // Base inicial
        this.baseInitLocked = true; // Começa fixo na base canônica
        this.iHatInit = { x: 1, y: 0 };
        this.jHatInit = { x: 0, y: 1 };

        // Base transformada
        this.iHatPrime = { x: 1.5, y: 0.5 };
        this.jHatPrime = { x: -0.5, y: 1.5 };

        // Vetor de prova v
        this.vVec = { x: 2, y: 1 };

        // Matriz M calculada
        this.M = { a: 1, b: 0, c: 0, d: 1 };
        this.invInit = null;

        this.isAnimating = false;
        this.animRequestId = null;

        this.initDOM();
    }

    initDOM() {
        const { chkLockInitialBase, chkShowEigenModo2, chkShowGhostModo2, btnAnimateModo2, btnResetModo2 } = this.dom;

        if (chkLockInitialBase) {
            chkLockInitialBase.addEventListener('change', (e) => {
                this.baseInitLocked = e.target.checked;
                this.updatePlanoLeftDragPermissions();
                const hintEl = document.getElementById('construir-base-lock-hint');
                if (hintEl) {
                    hintEl.textContent = this.baseInitLocked
                        ? 'Base inicial travada na canônica (1,0) e (0,1)'
                        : 'Base inicial liberada! Arraste i e j livremente à esquerda';
                }
            });
        }

        if (chkShowEigenModo2) {
            chkShowEigenModo2.addEventListener('change', (e) => {
                const show = e.target.checked;
                this.planoLeft.showEigen = show;
                this.planoRight.showEigen = show;
                this.planoLeft.draw();
                this.planoRight.draw();
            });
        }

        if (chkShowGhostModo2) {
            chkShowGhostModo2.addEventListener('change', (e) => {
                this.planoRight.showGhostGrid = e.target.checked;
                this.planoRight.draw();
            });
        }

        if (btnAnimateModo2) {
            btnAnimateModo2.addEventListener('click', () => {
                this.triggerAnimation();
            });
        }

        if (btnResetModo2) {
            btnResetModo2.addEventListener('click', () => {
                this.resetDefaults();
            });
        }

        // Conectar callbacks do canvas esquerdo (inicial)
        this.planoLeft.onTargetChange = (target, pos) => {
            if (target.type === 'i') {
                this.iHatInit = { ...pos };
            } else if (target.type === 'j') {
                this.jHatInit = { ...pos };
            } else if (target.type === 'v') {
                this.vVec = { ...pos };
            }
            this.recalculateTransformation();
        };

        // Conectar callbacks do canvas direito (transformado)
        this.planoRight.onTargetChange = (target, pos) => {
            if (target.type === 'i') {
                this.iHatPrime = { ...pos };
                this.recalculateTransformation();
            } else if (target.type === 'j') {
                this.jHatPrime = { ...pos };
                this.recalculateTransformation();
            } else if (target.type === 'vPrime') {
                // Ao arrastar v', recalculamos v se M for inversível
                const detM = this.M.a * this.M.d - this.M.b * this.M.c;
                if (Math.abs(detM) > 1e-4) {
                    const invDet = 1 / detM;
                    const vx = invDet * (this.M.d * pos.x - this.M.b * pos.y);
                    const vy = invDet * (-this.M.c * pos.x + this.M.a * pos.y);
                    this.vVec = { x: Math.round(vx * 20) / 20, y: Math.round(vy * 20) / 20 };
                    this.planoLeft.vVec = { ...this.vVec };
                    this.planoLeft.draw();
                    this.recalculateTransformation();
                }
            }
        };
    }

    toggleBaseLock() {
        this.baseInitLocked = !this.baseInitLocked;
        if (this.dom.chkLockInitialBase) {
            this.dom.chkLockInitialBase.checked = this.baseInitLocked;
        }
        this.updatePlanoLeftDragPermissions();
        const hintEl = document.getElementById('construir-base-lock-hint');
        if (hintEl) {
            hintEl.textContent = this.baseInitLocked
                ? 'Base inicial travada na canônica (1,0) e (0,1)'
                : 'Base inicial liberada! Arraste i e j livremente à esquerda';
        }
        const focusLockText = document.getElementById('focus-lock-text');
        if (focusLockText) {
            focusLockText.textContent = this.baseInitLocked ? 'Base Canônica (Fixa)' : 'Base Livre (Móvel)';
        }
        this.planoLeft.draw();
        return this.baseInitLocked;
    }

    updatePlanoLeftDragPermissions() {
        this.planoLeft.allowedDragTargets = this.baseInitLocked ? ['v'] : ['i', 'j', 'v'];
    }

    resetDefaults() {
        this.iHatInit = { x: 1, y: 0 };
        this.jHatInit = { x: 0, y: 1 };
        this.iHatPrime = { x: 1.5, y: 0.5 };
        this.jHatPrime = { x: -0.5, y: 1.5 };
        this.vVec = { x: 2, y: 1 };

        if (this.dom.chkLockInitialBase) {
            this.dom.chkLockInitialBase.checked = true;
            this.baseInitLocked = true;
        }
        this.updatePlanoLeftDragPermissions();
        this.recalculateTransformation();
    }

    /**
     * Calcula M = [i' j'] * [i j]^(-1)
     */
    recalculateTransformation() {
        const B = {
            a: this.iHatInit.x,
            b: this.jHatInit.x,
            c: this.iHatInit.y,
            d: this.jHatInit.y
        };

        const detB = B.a * B.d - B.b * B.c;
        const baseBox = document.getElementById('construir-system-card');

        if (Math.abs(detB) < 1e-4) {
            // Base inicial degenerada
            setFieldState(baseBox, 'invalid', 'Base inicial degenerada: î e ĵ são colineares (det = 0). O operador não pode ser determinado.');
            return;
        }

        // Inversa da base inicial
        const invDetB = 1 / detB;
        const invB = {
            a: B.d * invDetB,
            b: -B.b * invDetB,
            c: -B.c * invDetB,
            d: B.a * invDetB
        };

        // Matriz das imagens [i' j']
        const P = {
            a: this.iHatPrime.x,
            b: this.jHatPrime.x,
            c: this.iHatPrime.y,
            d: this.jHatPrime.y
        };

        // M = P * invB
        const M = {
            a: P.a * invB.a + P.b * invB.c,
            b: P.a * invB.b + P.b * invB.d,
            c: P.c * invB.a + P.d * invB.c,
            d: P.c * invB.b + P.d * invB.d
        };
        this.M = M;

        // V' = M * v
        const vPrime = {
            x: M.a * this.vVec.x + M.b * this.vVec.y,
            y: M.c * this.vVec.x + M.d * this.vVec.y
        };

        // Deslocamento d = v' - v
        const dVec = {
            x: vPrime.x - this.vVec.x,
            y: vPrime.y - this.vVec.y
        };

        // Análise espectral
        const analysis = eigen2x2(M);

        // Atualizar estado visual no Plano Left
        this.planoLeft.iHat = { ...this.iHatInit };
        this.planoLeft.jHat = { ...this.jHatInit };
        this.planoLeft.vVec = { ...this.vVec };
        this.planoLeft.currentAnalysis = analysis;

        // Atualizar estado visual no Plano Right
        this.planoRight.iHat = { ...this.iHatPrime };
        this.planoRight.jHat = { ...this.jHatPrime };
        this.planoRight.iHatStart = { ...this.iHatInit };
        this.planoRight.jHatStart = { ...this.jHatInit };
        this.planoRight.vVec = { ...this.vVec };
        this.planoRight.vPrime = { ...vPrime };
        this.planoRight.currentAnalysis = analysis;

        this.updateMathDisplays(M, detB, vPrime, dVec, analysis);

        const detM = M.a * M.d - M.b * M.c;
        if (Math.abs(detM) < 1e-4) {
            setFieldState(baseBox, 'warning', 'Operador singular: colapsa o espaço (área = 0). O vetor v\' não pode ser invertido.');
        } else {
            setFieldState(baseBox, 'valid', 'Sistema linear determinado! Operador M construído com sucesso.');
        }

        this.planoLeft.draw();
        this.planoRight.draw();
    }

    updateMathDisplays(M, detB, vPrime, dVec, analysis) {
        const katexSystem = document.getElementById('construir-katex-system');
        const katexMatrix = document.getElementById('construir-katex-matrix');
        const katexEvolution = document.getElementById('construir-katex-evolution');

        if (katexMatrix) {
            const mTex = `M = \\begin{bmatrix} ${M.a.toFixed(2)} & ${M.b.toFixed(2)} \\\\ ${M.c.toFixed(2)} & ${M.d.toFixed(2)} \\end{bmatrix}`;
            renderMath(katexMatrix, mTex, { displayMode: true });
        }

        if (katexSystem) {
            const sysTex = `M\\hat{i} = \\begin{bmatrix} ${this.iHatPrime.x.toFixed(1)} \\\\ ${this.iHatPrime.y.toFixed(1)} \\end{bmatrix}, \\quad M\\hat{j} = \\begin{bmatrix} ${this.jHatPrime.x.toFixed(1)} \\\\ ${this.jHatPrime.y.toFixed(1)} \\end{bmatrix}`;
            renderMath(katexSystem, sysTex, { displayMode: false });
        }

        if (katexEvolution) {
            const evTex = `\\vec{v}' = \\begin{bmatrix} ${vPrime.x.toFixed(2)} \\\\ ${vPrime.y.toFixed(2)} \\end{bmatrix}, \\quad \\vec{d} = \\vec{v}' - \\vec{v} = \\begin{bmatrix} ${dVec.x.toFixed(2)} \\\\ ${dVec.y.toFixed(2)} \\end{bmatrix}`;
            renderMath(katexEvolution, evTex, { displayMode: false });
        }

        // Leitura do vetor v' e vetor deslocamento d
        const valVxP = document.getElementById('construir-val-vpx');
        const valVyP = document.getElementById('construir-val-vpy');
        const valDx = document.getElementById('construir-val-dx');
        const valDy = document.getElementById('construir-val-dy');
        const valDetM = document.getElementById('construir-val-detm');

        if (valVxP) valVxP.textContent = vPrime.x.toFixed(2);
        if (valVyP) valVyP.textContent = vPrime.y.toFixed(2);
        if (valDx) valDx.textContent = dVec.x.toFixed(2);
        if (valDy) valDy.textContent = dVec.y.toFixed(2);
        if (valDetM) {
            const det = M.a * M.d - M.b * M.c;
            valDetM.textContent = det.toFixed(2);
        }

        const focusBadge2 = document.getElementById('focus-badge-det2');
        if (focusBadge2) {
            const det = M.a * M.d - M.b * M.c;
            focusBadge2.textContent = `det(M) = ${det.toFixed(2)}`;
        }
    }

    /**
     * Animação que leva suavemente a base e v da posição inicial à posição final
     */
    triggerAnimation() {
        if (this.isAnimating) cancelAnimationFrame(this.animRequestId);

        const duration = 1200;
        const startTime = performance.now();
        this.isAnimating = true;

        const startI = { ...this.iHatInit };
        const startJ = { ...this.jHatInit };
        const targetI = { ...this.iHatPrime };
        const targetJ = { ...this.jHatPrime };
        const vInit = { ...this.vVec };

        const animateStep = (now) => {
            const elapsed = now - startTime;
            const p = Math.min(elapsed / duration, 1.0);
            const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

            const currI = {
                x: startI.x + (targetI.x - startI.x) * eased,
                y: startI.y + (targetI.y - startI.y) * eased
            };
            const currJ = {
                x: startJ.x + (targetJ.x - startJ.x) * eased,
                y: startJ.y + (targetJ.y - startJ.y) * eased
            };

            this.planoRight.iHat = currI;
            this.planoRight.jHat = currJ;

            // v viaja continuamente
            const curVx = vInit.x * currI.x + vInit.y * currJ.x;
            const curVy = vInit.x * currI.y + vInit.y * currJ.y;
            this.planoRight.vPrime = { x: curVx, y: curVy };

            this.planoRight.draw();

            if (p < 1.0) {
                this.animRequestId = requestAnimationFrame(animateStep);
            } else {
                this.isAnimating = false;
                this.recalculateTransformation();
            }
        };

        this.animRequestId = requestAnimationFrame(animateStep);
    }

    mount() {
        // Configuração do plano inicial (esquerdo)
        this.planoLeft.showVVec = true;
        this.planoLeft.showVPrime = false;
        this.planoLeft.showDisplacementVec = false;
        this.planoLeft.showGhostGrid = false;
        this.planoLeft.showDetArea = false;
        this.planoLeft.showUnitCircle = false;
        this.planoLeft.showBasisVectors = true;
        this.updatePlanoLeftDragPermissions();

        // Configuração do plano transformado (direito)
        this.planoRight.showVVec = true;
        this.planoRight.showVPrime = true;
        this.planoRight.showDisplacementVec = true;
        this.planoRight.showGhostGrid = this.dom.chkShowGhostModo2 ? this.dom.chkShowGhostModo2.checked : true;
        this.planoRight.showDetArea = false;
        this.planoRight.showUnitCircle = false;
        this.planoRight.showBasisVectors = true;
        this.planoRight.allowedDragTargets = ['i', 'j', 'vPrime'];

        const showEigen = this.dom.chkShowEigenModo2 ? this.dom.chkShowEigenModo2.checked : true;
        this.planoLeft.showEigen = showEigen;
        this.planoRight.showEigen = showEigen;

        const focusLockText = document.getElementById('focus-lock-text');
        if (focusLockText) {
            focusLockText.textContent = this.baseInitLocked ? 'Base Canônica (Fixa)' : 'Base Livre (Móvel)';
        }

        this.recalculateTransformation();
    }

    unmount() {
        if (this.isAnimating) cancelAnimationFrame(this.animRequestId);
    }
}
