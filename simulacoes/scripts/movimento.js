/**
 * =============================================================================
 * Simulação: Funções Horárias & Encontro de Móveis (Cinemática Escalar 1D)
 * Autor: Nicolas Heringer
 * Design System 2.0 — Baixa Carga Cognitiva: Vetores, Estroboscopia e Pistas Paralelas
 * =============================================================================
 */

import {
    initToggleButton,
    initSidebarCollapse,
    initBottomSheet,
    initModal,
    inlineSVGImages
} from './sim-ui.js';

class MovimentoSimulation {
    constructor() {
        // Elementos do Canvas
        this.canvas = document.getElementById('simCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvasHint = document.getElementById('canvasHint');
        this.canvasHintText = document.getElementById('canvasHintText');

        // Botões de Top Actions
        this.btnToggleView = document.getElementById('btn-toggle-view');
        this.lblToggleView = document.getElementById('lbl-toggle-view');
        this.btnToggleAxis = document.getElementById('btn-toggle-axis');
        this.lblToggleAxis = document.getElementById('lbl-toggle-axis');

        // Abas de Modo (Navegação Principal)
        this.tabBtnManual = document.getElementById('tab-btn-manual');
        this.tabBtnEq1 = document.getElementById('tab-btn-eq1');
        this.tabBtnEq2 = document.getElementById('tab-btn-eq2');
        this.tabBtnTheory = document.getElementById('tab-btn-theory');

        // Painéis das Abas
        this.simTransportBar = document.getElementById('sim-transport-bar');
        this.panelTabManual = document.getElementById('panel-tab-manual');
        this.panelTabEq1 = document.getElementById('panel-tab-eq1');
        this.panelTabEq2 = document.getElementById('panel-tab-eq2');
        this.panelTabTheory = document.getElementById('panel-tab-theory');

        // Sliders e Labels Minimalistas
        // Manual
        this.sliderPos = document.getElementById('sliderPos');
        this.lblPosManual = document.getElementById('lbl-pos-manual');

        // 1 Móvel
        this.equationDisplayA = document.getElementById('equationDisplayA');
        this.badgeTipoSingle = document.getElementById('badge-tipo-single');
        this.badgeTipoTextSingle = document.getElementById('badge-tipo-text-single');
        this.sliderS0A = document.getElementById('sliderS0A');
        this.lblS0A = document.getElementById('lbl-s0A');
        this.sliderV0A = document.getElementById('sliderV0A');
        this.lblV0A = document.getElementById('lbl-v0A');
        this.chkAccelSingle = document.getElementById('chk-accel-single');
        this.groupAccelSingle = document.getElementById('group-accel-single');
        this.sliderAA = document.getElementById('sliderAA');
        this.lblAA = document.getElementById('lbl-aA');

        // 2 Móveis
        this.equationDisplayA_dual = document.getElementById('equationDisplayA_dual');
        this.badgeTipoA = document.getElementById('badge-tipo-a');
        this.sliderS0A_dual = document.getElementById('sliderS0A_dual');
        this.lblS0A_dual = document.getElementById('lbl-s0A_dual');
        this.sliderV0A_dual = document.getElementById('sliderV0A_dual');
        this.lblV0A_dual = document.getElementById('lbl-v0A_dual');
        this.chkAccelDualA = document.getElementById('chk-accel-dual-a');
        this.groupAccelDualA = document.getElementById('group-accel-dual-a');
        this.sliderAA_dual = document.getElementById('sliderAA_dual');
        this.lblAA_dual = document.getElementById('lbl-aA_dual');

        this.equationDisplayB = document.getElementById('equationDisplayB');
        this.badgeTipoB = document.getElementById('badge-tipo-b');
        this.sliderS0B = document.getElementById('sliderS0B');
        this.lblS0B = document.getElementById('lbl-s0B');
        this.sliderV0B = document.getElementById('sliderV0B');
        this.lblV0B = document.getElementById('lbl-v0B');
        this.chkAccelDualB = document.getElementById('chk-accel-dual-b');
        this.groupAccelDualB = document.getElementById('group-accel-dual-b');
        this.sliderAB = document.getElementById('sliderAB');
        this.lblAB = document.getElementById('lbl-aB');

        // Scrubber
        this.groupScrubber = document.getElementById('groupScrubber');
        this.sliderScrubber = document.getElementById('sliderScrubber');
        this.lblScrubberVal = document.getElementById('lbl-scrubber-val');

        // Rodapé de Telemetria
        this.footerStatusBadge = document.getElementById('footer-status-badge');
        this.footerStatusText = document.getElementById('footer-status-text');
        this.footerSimTimer = document.getElementById('footer-sim-timer');

        // Modos de Exibição
        // mode: '1D' | '2D_EXTRUDED' | '2D_CONVENTIONAL'
        this.mode = '1D';

        // motionType: 'manual' | 'equation_1' | 'equation_2'
        this.motionType = 'manual';

        // Parâmetros Físicos do Móvel A (Amarelo)
        this.s0A = -5.0;
        this.v0A = 3.0;
        this.aA = 0.0;
        this.xA = -5.0;
        this.vA = 3.0;

        // Parâmetros Físicos do Móvel B (Ciano)
        this.s0B = 5.0;
        this.v0B = -2.0;
        this.aB = 0.0;
        this.xB = 5.0;
        this.vB = -2.0;

        // Relógio e Execução
        this.t = 0.0;
        this.simSpeed = 1.0;
        this.isPlaying = false;
        this.isDragging = false;
        this.isHoveringBallA = false;

        // Histórico Contínuo e Estroboscopia (Marcas a cada 1s)
        this.recordingA = [];
        this.recordingB = [];
        this.strobePointsA = [];
        this.strobePointsB = [];
        this.lastStrobeSec = 0;
        this.lastFrameTimestamp = 0;
        this.prevXA = 0;

        // Limites de Exibição do Eixo
        this.xMin = -15;
        this.xMax = 15;
        this.tMax = 10;

        // Índice no Scrubber Temporal
        this.selectedTimeIndex = 0;

        // Animações Suaves de Transição
        this.transitionProgress = 0.0;
        this.targetTransition = 0.0;
        this.axisRotateProgress = 0.0;
        this.targetAxisRotate = 0.0;

        this.ballRadius = 16;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (window.ResizeObserver && this.canvas.parentElement) {
            new ResizeObserver(() => this.resize()).observe(this.canvas.parentElement);
        }

        this.setupDesignSystemControls();
        this.setupSliderEvents();
        this.setupEvents();
        this.updateEquationDisplays();
        this.updateUI();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);
    }

    setupDesignSystemControls() {
        // 1. Botão de Play/Pause com Toggle Controller
        this.playControl = initToggleButton('#btn-play-sim', (active) => {
            if (active) {
                this.start();
            } else {
                this.pause();
            }
        });

        // 2. Botão de Passo Único (+0.1s)
        document.getElementById('btn-step-sim')?.addEventListener('click', () => {
            if (this.isPlaying) {
                this.playControl?.setState(0);
                this.pause();
            }
            this.step(0.1);
        });

        // 3. Botão de Reiniciar
        document.getElementById('btn-reset-sim')?.addEventListener('click', () => {
            this.reset();
        });

        // 4. Seletor de Velocidade Temporal (Pills)
        document.querySelectorAll('#sim-speed-pills .speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#sim-speed-pills .speed-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.simSpeed = parseFloat(btn.dataset.speed || '1.0');
            });
        });

        // 5. Navegação entre as 4 Abas Principais
        this.tabBtnManual?.addEventListener('click', () => this.switchTab('manual'));
        this.tabBtnEq1?.addEventListener('click', () => this.switchTab('equation_1'));
        this.tabBtnEq2?.addEventListener('click', () => this.switchTab('equation_2'));
        this.tabBtnTheory?.addEventListener('click', () => this.switchTab('theory'));

        // 6. Modal de Teoria Didática
        const modalTeoria = initModal('#modal-teoria');
        document.getElementById('btn-abrir-modal-teoria')?.addEventListener('click', () => {
            modalTeoria?.open();
        });

        // 7. Modo Foco (Sidebar Collapse)
        initSidebarCollapse({
            layoutSelector: '.sim-layout',
            collapseBtnSelector: '#btn-collapse-sidebar',
            expandBtnSelector: '#btn-expand-sidebar',
            onResize: () => this.resize()
        });

        // 8. Mobile Bottom Sheet
        initBottomSheet({
            panelSelector: '.controls-panel',
            handleSelector: '#sheet-drag-handle',
            tabNavSelector: '.tab-nav',
            collapseBtnSelector: '#btn-collapse-sidebar',
            defaultState: 'peek'
        });

        // 9. Inline SVGs
        inlineSVGImages();
    }

    setupSliderEvents() {
        // Slider Manual
        this.sliderPos?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setPos(val);
            if (this.lblPosManual) this.lblPosManual.textContent = `${val.toFixed(1)} m`;
        });

        // Sliders Móvel A (1 Móvel)
        this.sliderS0A?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamS0A(val);
        });
        this.sliderV0A?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamV0A(val);
        });
        this.sliderAA?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamAA(val);
        });

        // Sliders Móvel A (2 Móveis)
        this.sliderS0A_dual?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamS0A(val);
        });
        this.sliderV0A_dual?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamV0A(val);
        });
        this.sliderAA_dual?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamAA(val);
        });

        // Sliders Móvel B (2 Móveis)
        this.sliderS0B?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamS0B(val);
        });
        this.sliderV0B?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamV0B(val);
        });
        this.sliderAB?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.setParamAB(val);
        });

        // Scrubber 2D
        this.sliderScrubber?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.seekToTime(val);
            if (this.lblScrubberVal) this.lblScrubberVal.textContent = `${val.toFixed(2)} s`;
        });

        // Switches de Aceleração Opcional (MRUV)
        this.chkAccelSingle?.addEventListener('change', (e) => {
            const checked = e.target.checked;
            this.groupAccelSingle.style.display = checked ? 'flex' : 'none';
            if (!checked) {
                this.setParamAA(0.0);
            }
        });

        this.chkAccelDualA?.addEventListener('change', (e) => {
            const checked = e.target.checked;
            this.groupAccelDualA.style.display = checked ? 'flex' : 'none';
            if (!checked) {
                this.setParamAA(0.0);
            }
        });

        this.chkAccelDualB?.addEventListener('change', (e) => {
            const checked = e.target.checked;
            this.groupAccelDualB.style.display = checked ? 'flex' : 'none';
            if (!checked) {
                this.setParamAB(0.0);
            }
        });
    }

    setParamS0A(val) {
        this.s0A = val;
        if (this.sliderS0A) this.sliderS0A.value = val;
        if (this.sliderS0A_dual) this.sliderS0A_dual.value = val;
        const text = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m`;
        if (this.lblS0A) this.lblS0A.textContent = text;
        if (this.lblS0A_dual) this.lblS0A_dual.textContent = text;
        this.onParamChangeA();
    }

    setParamV0A(val) {
        this.v0A = val;
        if (this.sliderV0A) this.sliderV0A.value = val;
        if (this.sliderV0A_dual) this.sliderV0A_dual.value = val;
        const text = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m/s`;
        if (this.lblV0A) this.lblV0A.textContent = text;
        if (this.lblV0A_dual) this.lblV0A_dual.textContent = text;
        this.onParamChangeA();
    }

    setParamAA(val) {
        this.aA = val;
        if (this.sliderAA) this.sliderAA.value = val;
        if (this.sliderAA_dual) this.sliderAA_dual.value = val;
        const text = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m/s²`;
        if (this.lblAA) this.lblAA.textContent = text;
        if (this.lblAA_dual) this.lblAA_dual.textContent = text;
        this.onParamChangeA();
    }

    setParamS0B(val) {
        this.s0B = val;
        if (this.sliderS0B) this.sliderS0B.value = val;
        if (this.lblS0B) this.lblS0B.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m`;
        this.onParamChangeB();
    }

    setParamV0B(val) {
        this.v0B = val;
        if (this.sliderV0B) this.sliderV0B.value = val;
        if (this.lblV0B) this.lblV0B.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m/s`;
        this.onParamChangeB();
    }

    setParamAB(val) {
        this.aB = val;
        if (this.sliderAB) this.sliderAB.value = val;
        if (this.lblAB) this.lblAB.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(1)} m/s²`;
        this.onParamChangeB();
    }

    switchTab(tabKey) {
        [this.tabBtnManual, this.tabBtnEq1, this.tabBtnEq2, this.tabBtnTheory].forEach(btn => btn?.classList.remove('active'));

        this.panelTabManual.style.display = 'none';
        this.panelTabEq1.style.display = 'none';
        this.panelTabEq2.style.display = 'none';
        this.panelTabTheory.style.display = 'none';

        if (tabKey === 'manual') {
            this.tabBtnManual?.classList.add('active');
            this.panelTabManual.style.display = 'block';
            this.simTransportBar.style.display = 'block';
            this.setMotionType('manual');
        } else if (tabKey === 'equation_1') {
            this.tabBtnEq1?.classList.add('active');
            this.panelTabEq1.style.display = 'block';
            this.simTransportBar.style.display = 'block';
            this.setMotionType('equation_1');
        } else if (tabKey === 'equation_2') {
            this.tabBtnEq2?.classList.add('active');
            this.panelTabEq2.style.display = 'block';
            this.simTransportBar.style.display = 'block';
            this.setMotionType('equation_2');
        } else if (tabKey === 'theory') {
            this.tabBtnTheory?.classList.add('active');
            this.panelTabTheory.style.display = 'block';
            this.simTransportBar.style.display = 'none';
            this.renderKaTeXIn(this.panelTabTheory);
        }
    }

    renderKaTeXIn(element) {
        if (window.renderMathInElement && element) {
            window.renderMathInElement(element, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    }

    setupEvents() {
        this.btnToggleView?.addEventListener('click', () => this.toggleViewMode());
        document.getElementById('btnPanelToggleViewManual')?.addEventListener('click', () => this.toggleViewMode());
        document.getElementById('btnPanelToggleViewEq1')?.addEventListener('click', () => this.toggleViewMode());
        document.getElementById('btnPanelToggleViewEq2')?.addEventListener('click', () => this.toggleViewMode());
        this.btnToggleAxis?.addEventListener('click', () => this.toggleAxisView());

        const getCanvasCoords = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const onStart = (e) => {
            const pos = getCanvasCoords(e);
            if (this.mode === '1D') {
                if (this.motionType === 'manual') {
                    const ballCanvasPos = this.getBallCanvasPos1D(this.xA, this.height / 2);
                    const dist = Math.hypot(pos.x - ballCanvasPos.x, pos.y - ballCanvasPos.y);

                    if (dist <= this.ballRadius * 2.5) {
                        this.isDragging = true;
                    } else {
                        this.isDragging = true;
                        this.updatePosFromCanvasX(pos.x);
                    }
                    this.canvas.classList.add('cursor-grabbing');
                }
            } else {
                this.seekFromCanvasCoords(pos);
                this.isDragging = true;
            }
        };

        const onMove = (e) => {
            const pos = getCanvasCoords(e);

            if (this.mode === '1D') {
                if (this.motionType === 'manual') {
                    const ballCanvasPos = this.getBallCanvasPos1D(this.xA, this.height / 2);
                    const dist = Math.hypot(pos.x - ballCanvasPos.x, pos.y - ballCanvasPos.y);
                    const isHover = dist <= this.ballRadius * 2.5;

                    if (isHover !== this.isHoveringBallA && !this.isDragging) {
                        this.isHoveringBallA = isHover;
                        this.canvas.classList.toggle('cursor-grab', isHover);
                    }

                    if (this.isDragging) {
                        this.updatePosFromCanvasX(pos.x);
                    }
                }
            } else {
                if (this.isDragging) {
                    this.seekFromCanvasCoords(pos);
                }
            }
        };

        const onEnd = () => {
            this.isDragging = false;
            this.canvas.classList.remove('cursor-grabbing');
            if (this.isHoveringBallA && this.mode === '1D') {
                this.canvas.classList.add('cursor-grab');
            }
        };

        this.canvas.addEventListener('mousedown', onStart);
        this.canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.canvas.addEventListener('touchstart', onStart, { passive: true });
        this.canvas.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    onParamChangeA() {
        this.updateEquationDisplays();
        if (this.motionType !== 'manual' && !this.isPlaying && this.t === 0) {
            this.xA = this.s0A;
            this.vA = this.v0A;
        }
        this.updateUI();
    }

    onParamChangeB() {
        this.updateEquationDisplays();
        if (this.motionType === 'equation_2' && !this.isPlaying && this.t === 0) {
            this.xB = this.s0B;
            this.vB = this.v0B;
        }
        this.updateUI();
    }

    setMotionType(type) {
        if (this.isPlaying) {
            this.playControl?.setState(0);
            this.pause();
        }

        this.motionType = type;

        if (this.t === 0) {
            if (type === 'manual') {
                this.xA = 0.0;
                if (this.sliderPos) this.sliderPos.value = 0.0;
                if (this.lblPosManual) this.lblPosManual.textContent = '0.0 m';
            } else if (type === 'equation_1') {
                this.xA = this.s0A;
                this.vA = this.v0A;
            } else if (type === 'equation_2') {
                this.xA = this.s0A;
                this.vA = this.v0A;
                this.xB = this.s0B;
                this.vB = this.v0B;
            }
        }

        this.updateUI();
    }

    updateEquationDisplays() {
        const texA = this.formatEquationKaTeX('s_A', this.s0A, this.v0A, this.aA);
        const texB = this.formatEquationKaTeX('s_B', this.s0B, this.v0B, this.aB);

        if (this.equationDisplayA) this.equationDisplayA.innerHTML = texA;
        if (this.equationDisplayA_dual) this.equationDisplayA_dual.innerHTML = texA;
        if (this.equationDisplayB) this.equationDisplayB.innerHTML = texB;

        const isMRUVA = Math.abs(this.aA) > 1e-4;
        const isMRUVB = Math.abs(this.aB) > 1e-4;

        if (this.badgeTipoA) this.badgeTipoA.textContent = isMRUVA ? 'MRUV' : 'MRU';
        if (this.badgeTipoTextSingle) this.badgeTipoTextSingle.textContent = isMRUVA ? 'MRUV' : 'MRU';
        if (this.badgeTipoB) this.badgeTipoB.textContent = isMRUVB ? 'MRUV' : 'MRU';

        if (this.equationDisplayA) this.renderKaTeXIn(this.equationDisplayA);
        if (this.equationDisplayA_dual) this.renderKaTeXIn(this.equationDisplayA_dual);
        if (this.equationDisplayB) this.renderKaTeXIn(this.equationDisplayB);
    }

    formatEquationKaTeX(prefix, s0, v0, a) {
        let tex = `$$${prefix}(t) = ${s0 >= 0 ? s0.toFixed(1) : `- ${Math.abs(s0).toFixed(1)}`}`;

        if (v0 >= 0) tex += ` + ${v0.toFixed(1)}t`;
        else tex += ` - ${Math.abs(v0).toFixed(1)}t`;

        const halfA = 0.5 * a;
        if (Math.abs(halfA) > 1e-4) {
            if (halfA > 0) tex += ` + ${halfA.toFixed(2)}t^2`;
            else tex += ` - ${Math.abs(halfA).toFixed(2)}t^2`;
        }

        tex += `$$`;
        return tex;
    }

    calculateIntersections() {
        const A = 0.5 * (this.aA - this.aB);
        const B = this.v0A - this.v0B;
        const C = this.s0A - this.s0B;

        let intersectionTimes = [];

        if (Math.abs(A) < 1e-6) {
            if (Math.abs(B) > 1e-6) {
                const t = -C / B;
                if (t >= 0) intersectionTimes.push(t);
            }
        } else {
            const delta = B * B - 4 * A * C;
            if (delta >= -1e-6) {
                const safeDelta = Math.max(0, delta);
                const sqrtDelta = Math.sqrt(safeDelta);
                const t1 = (-B - sqrtDelta) / (2 * A);
                const t2 = (-B + sqrtDelta) / (2 * A);

                if (t1 >= 0) intersectionTimes.push(t1);
                if (t2 >= 0 && Math.abs(t2 - t1) > 0.01) intersectionTimes.push(t2);
            }
        }

        if (intersectionTimes.length === 0) return [];

        intersectionTimes.sort((a, b) => a - b);

        return intersectionTimes.map((tEnc, i) => {
            const xEnc = this.s0A + this.v0A * tEnc + 0.5 * this.aA * tEnc * tEnc;
            return {
                t: tEnc,
                x: xEnc,
                index: i + 1
            };
        });
    }

    setPos(val) {
        this.xA = Math.max(this.xMin, Math.min(this.xMax, val));

        if (this.isPlaying) {
            this.recordCurrentPoint();
        }
        this.updateUI();
    }

    updatePosFromCanvasX(canvasX) {
        const margin = this.mode === '1D' ? 70 : 80;
        const effectiveWidth = this.width - margin * 2;
        const norm = (canvasX - margin) / effectiveWidth;
        const physicsX = this.xMin + norm * (this.xMax - this.xMin);

        this.setPos(physicsX);
        if (this.sliderPos) this.sliderPos.value = parseFloat(this.xA.toFixed(1));
        if (this.lblPosManual) this.lblPosManual.textContent = `${this.xA.toFixed(1)} m`;
    }

    start() {
        this.isPlaying = true;
        this.footerStatusText.textContent = 'Simulação em Andamento';
        this.footerStatusBadge.className = 'sim-badge badge-active';

        if (this.recordingA.length === 0) {
            if (this.motionType !== 'manual') {
                this.xA = this.s0A;
                this.vA = this.v0A;
                this.xB = this.s0B;
                this.vB = this.v0B;
            }
            this.recordCurrentPoint();
        }
        this.updateUI();
    }

    pause() {
        this.isPlaying = false;
        this.footerStatusText.textContent = 'Pausado';
        this.footerStatusBadge.className = 'sim-badge';
        this.updateUI();
    }

    step(dt = 0.1) {
        this.advancePhysics(dt);
        this.updateUI();
    }

    reset() {
        this.isPlaying = false;
        this.playControl?.setState(0);

        this.t = 0.0;
        this.xA = this.motionType !== 'manual' ? this.s0A : 0.0;
        this.vA = this.motionType !== 'manual' ? this.v0A : 0.0;
        this.xB = this.s0B;
        this.vB = this.v0B;

        this.recordingA = [];
        this.recordingB = [];
        this.strobePointsA = [];
        this.strobePointsB = [];
        this.lastStrobeSec = 0;
        this.selectedTimeIndex = 0;
        this.tMax = 10;
        this.xMin = -15;
        this.xMax = 15;

        this.mode = '1D';
        this.targetTransition = 0.0;
        this.targetAxisRotate = 0.0;

        this.footerStatusText.textContent = 'Simulação Pronta';
        this.footerStatusBadge.className = 'sim-badge';

        if (this.sliderPos) this.sliderPos.value = this.xA;
        if (this.lblPosManual) this.lblPosManual.textContent = `${this.xA.toFixed(1)} m`;
        this.updateUI();
    }

    advancePhysics(dt) {
        this.t += dt;

        if (this.motionType === 'manual') {
            if (dt > 0) this.vA = (this.xA - this.prevXA) / dt;
        } else if (this.motionType === 'equation_1') {
            this.xA = this.s0A + this.v0A * this.t + 0.5 * this.aA * (this.t * this.t);
            this.vA = this.v0A + this.aA * this.t;
        } else if (this.motionType === 'equation_2') {
            this.xA = this.s0A + this.v0A * this.t + 0.5 * this.aA * (this.t * this.t);
            this.vA = this.v0A + this.aA * this.t;

            this.xB = this.s0B + this.v0B * this.t + 0.5 * this.aB * (this.t * this.t);
            this.vB = this.v0B + this.aB * this.t;
        }

        this.prevXA = this.xA;
        this.recordCurrentPoint();

        // Registro Estroboscópico a cada 1 segundo exato
        const currentSec = Math.floor(this.t);
        if (currentSec > 0 && currentSec !== this.lastStrobeSec) {
            this.lastStrobeSec = currentSec;
            this.strobePointsA.push({ sec: currentSec, x: this.xA });
            if (this.motionType === 'equation_2') {
                this.strobePointsB.push({ sec: currentSec, x: this.xB });
            }
        }
    }

    recordCurrentPoint() {
        const lastA = this.recordingA[this.recordingA.length - 1];
        if (!lastA || Math.abs(this.t - lastA.t) >= 0.02) {
            this.recordingA.push({
                t: this.t,
                x: this.xA,
                v: this.vA,
                a: this.aA
            });

            if (this.motionType === 'equation_2') {
                this.recordingB.push({
                    t: this.t,
                    x: this.xB,
                    v: this.vB,
                    a: this.aB
                });
            }

            if (this.t > this.tMax) {
                this.tMax = Math.ceil(this.t / 5) * 5;
            }

            const maxX = Math.max(this.xA, this.motionType === 'equation_2' ? this.xB : -Infinity);
            const minX = Math.min(this.xA, this.motionType === 'equation_2' ? this.xB : Infinity);

            if (maxX > this.xMax - 2) this.xMax = Math.ceil(maxX / 5) * 5 + 5;
            if (minX < this.xMin + 2) this.xMin = Math.floor(minX / 5) * 5 - 5;
        }
    }

    toggleViewMode() {
        if (this.mode === '1D') {
            this.enter2DMode();
        } else {
            this.backTo1DMode();
        }
    }

    enter2DMode() {
        if (this.recordingA.length === 0) return;

        if (this.isPlaying) {
            this.playControl?.setState(0);
            this.pause();
        }

        this.mode = '2D_CONVENTIONAL';
        this.targetTransition = 1.0;
        this.targetAxisRotate = 1.0;
        this.axisRotateProgress = 1.0;
        this.selectedTimeIndex = this.recordingA.length - 1;

        if (this.sliderScrubber) {
            this.sliderScrubber.max = this.t.toFixed(2);
            this.sliderScrubber.value = this.t.toFixed(2);
        }
        if (this.lblScrubberVal) {
            this.lblScrubberVal.textContent = `${this.t.toFixed(2)} s`;
        }

        this.updateUI();
    }

    toggleAxisView() {
        if (this.mode === '2D_EXTRUDED') {
            this.mode = '2D_CONVENTIONAL';
            this.targetAxisRotate = 1.0;
        } else if (this.mode === '2D_CONVENTIONAL') {
            this.mode = '2D_EXTRUDED';
            this.targetAxisRotate = 0.0;
        }
        this.updateUI();
    }

    backTo1DMode() {
        this.mode = '1D';
        this.targetTransition = 0.0;
        this.targetAxisRotate = 0.0;
        this.updateUI();
    }

    seekToTime(timeVal) {
        if (this.recordingA.length === 0) return;

        let closestIdx = 0;
        let minDiff = Infinity;

        for (let i = 0; i < this.recordingA.length; i++) {
            const diff = Math.abs(this.recordingA[i].t - timeVal);
            if (diff < minDiff) {
                minDiff = diff;
                closestIdx = i;
            }
        }

        this.selectedTimeIndex = closestIdx;
        const ptA = this.recordingA[closestIdx];

        if (ptA) {
            this.footerSimTimer.textContent = `t = ${ptA.t.toFixed(2)}s`;
        }
    }

    seekFromCanvasCoords(pos) {
        if (this.recordingA.length === 0) return;

        const margin = 70;
        let normTime = 0;
        const rot = this.axisRotateProgress;

        if (rot < 0.5) {
            const graphHeight = this.height - margin * 2;
            const yFromBottom = (this.height - margin) - pos.y;
            normTime = Math.max(0, Math.min(1, yFromBottom / graphHeight));
        } else {
            const graphWidth = this.width - margin * 2;
            const xFromLeft = pos.x - margin;
            normTime = Math.max(0, Math.min(1, xFromLeft / graphWidth));
        }

        const maxRecordedT = this.recordingA[this.recordingA.length - 1].t;
        const targetT = normTime * maxRecordedT;

        if (this.sliderScrubber) this.sliderScrubber.value = targetT.toFixed(2);
        if (this.lblScrubberVal) this.lblScrubberVal.textContent = `${targetT.toFixed(2)} s`;
        this.seekToTime(targetT);
    }

    updateUI() {
        const isDual = this.motionType === 'equation_2';
        const isSingle = this.motionType === 'equation_1';
        const isManual = this.motionType === 'manual';

        // 1. Visibilidade do Scrubber
        this.groupScrubber.style.display = (this.mode !== '1D' && this.recordingA.length > 0) ? 'block' : 'none';

        // 2. Dicas da Área do Canvas
        if (this.mode === '1D') {
            this.canvasHintText.textContent = isManual
                ? 'Arraste a esfera livremente na pista para observar a velocidade escalar instantânea.'
                : isSingle
                    ? 'Inicie o tempo para ver o móvel se deslocar, os vetores de velocidade/aceleração e as marcas estroboscópicas a cada 1s.'
                    : 'Observe as duas faixas paralelas: a linha vertical vermelha conecta os móveis no instante exato do encontro!';

            this.lblToggleView.textContent = 'Ver Gráfico 2D';
            document.querySelectorAll('.lbl-panel-graph').forEach(el => el.textContent = 'Ver Gráfico Espaço-Tempo (2D)');
            this.btnToggleAxis.style.display = 'none';

            const hasData = this.recordingA.length > 2;
            this.btnToggleView.disabled = !hasData;
            document.querySelectorAll('.lbl-panel-graph').forEach(el => {
                const btn = el.closest('button');
                if (btn) btn.disabled = !hasData;
            });
        } else {
            this.canvasHintText.textContent = 'Arraste no gráfico para inspecionar posições e momentos de encontro em qualquer instante do passado.';
            this.lblToggleView.textContent = 'Voltar à Pista 1D';
            document.querySelectorAll('.lbl-panel-graph').forEach(el => el.textContent = 'Voltar à Pista 1D');
            this.btnToggleAxis.style.display = 'flex';
            this.lblToggleAxis.textContent = this.mode === '2D_EXTRUDED'
                ? 'Visão Convencional (t no X)'
                : 'Visão Desdobrada (t no Y)';

            this.btnToggleView.disabled = false;
            document.querySelectorAll('.lbl-panel-graph').forEach(el => {
                const btn = el.closest('button');
                if (btn) btn.disabled = false;
            });
        }

        // 3. Telemetria no Rodapé
        this.footerSimTimer.textContent = `t = ${this.t.toFixed(2)}s`;
    }

    loop(timestamp) {
        if (!this.lastFrameTimestamp) this.lastFrameTimestamp = timestamp;
        const dt = ((timestamp - this.lastFrameTimestamp) / 1000) * this.simSpeed;
        this.lastFrameTimestamp = timestamp;

        if (this.isPlaying && this.mode === '1D') {
            this.advancePhysics(dt);
            this.updateUI();
        }

        this.transitionProgress += (this.targetTransition - this.transitionProgress) * 0.12;
        this.axisRotateProgress += (this.targetAxisRotate - this.axisRotateProgress) * 0.12;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.render();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    getBallCanvasPos1D(physX, yPos) {
        const margin = 70;
        const effectiveWidth = this.width - margin * 2;
        const normX = (physX - this.xMin) / (this.xMax - this.xMin);

        const canvasX = margin + normX * effectiveWidth;
        const canvasY = yPos !== undefined ? yPos : this.height / 2;

        return { x: canvasX, y: canvasY };
    }

    render() {
        const p = this.transitionProgress;
        const rot = this.axisRotateProgress;

        if (p < 0.99) {
            this.drawMode1D(1 - p);
        }

        if (p > 0.01) {
            this.drawMode2D(p, rot);
        }
    }

    drawMode1D(alpha) {
        if (alpha <= 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;

        const margin = 70;
        const axisY = this.height / 2;
        const effectiveWidth = this.width - margin * 2;
        const isDual = this.motionType === 'equation_2';

        const laneA_Y = isDual ? axisY - 38 : axisY;
        const laneB_Y = isDual ? axisY + 38 : axisY;

        // 1. Linhas de Faixas Sutis (quando houver 2 móveis)
        if (isDual) {
            ctx.strokeStyle = 'rgba(250, 204, 21, 0.12)';
            ctx.lineWidth = 1;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(margin, laneA_Y);
            ctx.lineTo(this.width - margin, laneA_Y);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
            ctx.beginPath();
            ctx.moveTo(margin, laneB_Y);
            ctx.lineTo(this.width - margin, laneB_Y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // 2. Reta Métrica Central (Régua Limpa)
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(margin, axisY);
        ctx.lineTo(this.width - margin, axisY);
        ctx.stroke();

        this.drawArrow(this.width - margin + 14, axisY, 0);

        // Marcações Limpas na Régua (a cada 5m)
        ctx.font = '500 11px var(--font-sans, sans-serif)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const step = 5;
        for (let meter = -15; meter <= 15; meter += step) {
            const norm = (meter - this.xMin) / (this.xMax - this.xMin);
            const tickX = margin + norm * effectiveWidth;

            const isOrigin = meter === 0;
            ctx.strokeStyle = isOrigin ? 'var(--accent-color, #facc15)' : 'rgba(148, 163, 184, 0.4)';
            ctx.lineWidth = isOrigin ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(tickX, axisY - (isOrigin ? 8 : 5));
            ctx.lineTo(tickX, axisY + (isOrigin ? 8 : 5));
            ctx.stroke();

            ctx.fillStyle = isOrigin ? 'var(--accent-color, #facc15)' : '#94a3b8';
            ctx.fillText(`${meter}m`, tickX, axisY + 9);
        }

        ctx.font = '600 12px var(--font-sans, sans-serif)';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('Eixo s [m]', this.width - margin + 22, axisY - 6);

        // 3. Rastro Estroboscópico (Marcadores a cada 1s)
        this.drawStrobeTrail(this.strobePointsA, '#facc15', laneA_Y);
        if (isDual) {
            this.drawStrobeTrail(this.strobePointsB, '#38bdf8', laneB_Y);
        }

        // 4. Linha Vertical e Alerta de Encontro entre Faixas Paralelas
        if (isDual) {
            const dist = Math.abs(this.xA - this.xB);
            if (dist < 0.45) {
                const posA = this.getBallCanvasPos1D(this.xA, laneA_Y);
                const posB = this.getBallCanvasPos1D(this.xB, laneB_Y);

                // Feixe vertical luminoso conectando os móveis
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(posA.x, posA.y);
                ctx.lineTo(posB.x, posB.y);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Badge de Encontro Flutuante
                ctx.fillStyle = '#ef4444';
                ctx.font = '700 12px var(--font-sans, sans-serif)';
                ctx.textAlign = 'center';
                ctx.fillText(`⚡ ENCONTRO (s = ${this.xA.toFixed(1)}m)`, (posA.x + posB.x) / 2, laneA_Y - 32);
            }
        }

        // 5. Desenho das Esferas e seus Vetores (v e a)
        this.drawBallWithVectors(this.xA, laneA_Y, this.vA, this.aA, '#facc15', 'A', isDual ? 'Faixa A' : null);

        if (isDual) {
            this.drawBallWithVectors(this.xB, laneB_Y, this.vB, this.aB, '#38bdf8', 'B', 'Faixa B');
        }

        ctx.restore();
    }

    drawStrobeTrail(points, colorHex, laneY) {
        const ctx = this.ctx;
        ctx.save();

        points.forEach(pt => {
            const pos = this.getBallCanvasPos1D(pt.x, laneY);

            // Círculo estroboscópico semitransparente
            ctx.fillStyle = colorHex;
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = colorHex;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Rótulo do segundo (ex: "1s", "2s")
            ctx.globalAlpha = 0.7;
            ctx.font = '500 9px var(--font-mono, monospace)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${pt.sec}s`, pos.x, pos.y);
        });

        ctx.restore();
    }

    drawBallWithVectors(physX, laneY, v, a, colorHex, label, laneLabel) {
        const ctx = this.ctx;
        const ballPos = this.getBallCanvasPos1D(physX, laneY);

        // Halo de Brilho
        const gradient = ctx.createRadialGradient(ballPos.x, ballPos.y, 2, ballPos.x, ballPos.y, this.ballRadius * 1.8);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ballPos.x, ballPos.y, this.ballRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Corpo da Esfera
        ctx.fillStyle = colorHex;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ballPos.x, ballPos.y, this.ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = '700 11px var(--font-mono, monospace)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, ballPos.x, ballPos.y);

        // Rótulo da Faixa
        if (laneLabel) {
            ctx.font = '500 10px var(--font-sans, sans-serif)';
            ctx.fillStyle = colorHex;
            ctx.textAlign = 'right';
            ctx.fillText(laneLabel, this.width - 76, laneY - 10);
        }

        // 1. Vetor Velocidade (Verde Esmeralda)
        if (Math.abs(v) > 0.05) {
            const vLen = Math.max(16, Math.min(65, Math.abs(v) * 9)) * Math.sign(v);
            const startX = ballPos.x + Math.sign(v) * (this.ballRadius + 2);
            const endX = startX + vLen;

            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, ballPos.y);
            ctx.lineTo(endX, ballPos.y);
            ctx.stroke();

            this.drawVectorArrowHead(endX, ballPos.y, Math.sign(v) > 0 ? 0 : Math.PI, '#22c55e');

            ctx.fillStyle = '#22c55e';
            ctx.font = '600 10px var(--font-mono, monospace)';
            ctx.textAlign = 'center';
            ctx.fillText(`v = ${v >= 0 ? '+' : ''}${v.toFixed(1)}`, (startX + endX) / 2, ballPos.y - 12);
        }

        // 2. Vetor Aceleração (Roxo / Púrpura)
        if (Math.abs(a) > 0.05) {
            const aLen = Math.max(16, Math.min(50, Math.abs(a) * 12)) * Math.sign(a);
            const aY = laneY + 22; // Abaixo da esfera
            const startX = ballPos.x;
            const endX = startX + aLen;

            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(startX, aY);
            ctx.lineTo(endX, aY);
            ctx.stroke();

            this.drawVectorArrowHead(endX, aY, Math.sign(a) > 0 ? 0 : Math.PI, '#c084fc');

            ctx.fillStyle = '#c084fc';
            ctx.font = '600 10px var(--font-mono, monospace)';
            ctx.textAlign = 'center';
            ctx.fillText(`a = ${a >= 0 ? '+' : ''}${a.toFixed(1)}`, (startX + endX) / 2, aY + 12);
        }
    }

    drawVectorArrowHead(x, y, angle, colorHex) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = colorHex;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, -4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawMode2D(p, rot) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = p;

        const margin = 70;
        const w = this.width - margin * 2;
        const h = this.height - margin * 2;

        this.drawAxes2D(margin, w, h, rot);

        if (this.recordingA.length > 0) {
            // Curva do Móvel A (Amarelo)
            this.drawTrajectoryCurve2D(this.recordingA, '#facc15', margin, w, h, rot);

            // Curva do Móvel B (Ciano) se houver
            if (this.motionType === 'equation_2' && this.recordingB.length > 0) {
                this.drawTrajectoryCurve2D(this.recordingB, '#38bdf8', margin, w, h, rot);
            }

            // Rastro Estroboscópico no Gráfico 2D (a cada 1s)
            this.drawStrobeMarkers2D(this.strobePointsA, '#facc15', margin, w, h, rot);
            if (this.motionType === 'equation_2') {
                this.drawStrobeMarkers2D(this.strobePointsB, '#38bdf8', margin, w, h, rot);
            }

            // Marcadores de Encontro no Gráfico
            if (this.motionType === 'equation_2') {
                const encounters = this.calculateIntersections();
                encounters.forEach(enc => {
                    if (enc.t <= this.tMax) {
                        const posEnc = this.mapPointToCanvas(enc, margin, w, h, rot);

                        ctx.fillStyle = '#ef4444';
                        ctx.shadowColor = '#ef4444';
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.arc(posEnc.x, posEnc.y, 7, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;

                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 2;
                        ctx.stroke();

                        const label = encounters.length > 1
                            ? `⚡ ${enc.index}º Encontro (${enc.t.toFixed(1)}s, ${enc.x.toFixed(1)}m)`
                            : `⚡ Encontro (${enc.t.toFixed(1)}s, ${enc.x.toFixed(1)}m)`;

                        ctx.fillStyle = '#ffffff';
                        ctx.font = '600 11px var(--font-sans, sans-serif)';
                        ctx.textAlign = 'center';
                        ctx.fillText(label, posEnc.x, posEnc.y - 12);
                    }
                });
            }

            this.drawScrubberIndicator2D(margin, w, h, rot);
        }

        ctx.restore();
    }

    drawStrobeMarkers2D(strobePoints, colorHex, margin, w, h, rot) {
        if (!strobePoints || strobePoints.length === 0) return;
        const ctx = this.ctx;
        ctx.save();

        const isConventional = rot >= 0.5;
        const originCanvas = this.mapPointToCanvas({ t: 0, x: 0 }, margin, w, h, rot);

        strobePoints.forEach(pt => {
            if (pt.sec <= this.tMax) {
                const pos = this.mapPointToCanvas({ t: pt.sec, x: pt.x }, margin, w, h, rot);

                // Linhas de projeção pontilhadas aos eixos
                ctx.strokeStyle = colorHex;
                ctx.globalAlpha = 0.25;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);

                if (isConventional) {
                    // Projeção ao eixo do tempo (horizontal em originCanvas.y)
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x, originCanvas.y);
                    ctx.stroke();

                    // Projeção ao eixo da posição (vertical em originCanvas.x)
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(originCanvas.x, pos.y);
                    ctx.stroke();
                } else {
                    // Projeção na visão desdobrada
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(pos.x, this.height - margin);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y);
                    ctx.lineTo(originCanvas.x, pos.y);
                    ctx.stroke();
                }

                ctx.setLineDash([]);
                ctx.globalAlpha = 1.0;

                // Marcador Circular Estroboscópico
                ctx.fillStyle = colorHex;
                ctx.shadowColor = colorHex;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Rótulo do Segundo
                ctx.fillStyle = '#ffffff';
                ctx.font = '600 10px var(--font-mono, monospace)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`${pt.sec}s`, pos.x, pos.y - 6);
            }
        });

        ctx.restore();
    }

    drawAxes2D(margin, w, h, rot) {
        const ctx = this.ctx;
        ctx.save();

        const isConventional = rot >= 0.5;

        // Ponto de Origem Cartesiana Real (0, 0)
        const originCanvas = this.mapPointToCanvas({ t: 0, x: 0 }, margin, w, h, rot);

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
        ctx.lineWidth = 2.5;

        if (isConventional) {
            // =========================================================================
            // VISÃO CONVENCIONAL DE FÍSICA E MATEMÁTICA:
            // Eixo Horizontal = Tempo t (passa exatamente na linha s = 0)
            // Eixo Vertical = Posição s (passa na linha t = 0)
            // Cruzamento RIGOROSO e EXATO na Origem (0, 0)!
            // =========================================================================
            const yZero = originCanvas.y;
            const xZero = margin; // t = 0

            // 1. Eixo Horizontal do Tempo t (linha s = 0)
            ctx.beginPath();
            ctx.moveTo(xZero, yZero);
            ctx.lineTo(this.width - margin + 14, yZero);
            ctx.stroke();
            this.drawArrow(this.width - margin + 14, yZero, 0);

            // 2. Eixo Vertical da Posição s (linha t = 0)
            ctx.beginPath();
            ctx.moveTo(xZero, this.height - margin + 6);
            ctx.lineTo(xZero, margin - 14);
            ctx.stroke();
            this.drawArrow(xZero, margin - 14, -Math.PI / 2);

            // Rótulos dos Eixos
            ctx.font = '600 13px var(--font-sans, sans-serif)';
            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'right';
            ctx.fillText('Tempo t [s]', this.width - margin + 14, yZero + 24);

            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'left';
            ctx.fillText('Posição s [m]', xZero + 10, margin - 14);

            // Marcação Clara da Origem O (0, 0)
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 11px var(--font-mono, monospace)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText('O (0, 0)', xZero - 8, yZero + 6);

            // Ticks no Eixo do Tempo (a cada 2s)
            ctx.font = '11px var(--font-sans, sans-serif)';
            const numTicksT = 5;
            for (let i = 1; i <= numTicksT; i++) {
                const valT = (i / numTicksT) * this.tMax;
                const px = margin + (valT / this.tMax) * w;

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.moveTo(px, yZero - 5);
                ctx.lineTo(px, yZero + 5);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${valT.toFixed(0)}s`, px, yZero + 8);
            }

            // Ticks no Eixo da Posição (a cada 5m, positivos acima, negativos abaixo)
            for (let s = -15; s <= 15; s += 5) {
                if (s === 0) continue; // Origem já assinalada
                const normS = (s - this.xMin) / (this.xMax - this.xMin);
                const py = (this.height - margin) - normS * h;

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.moveTo(xZero - 5, py);
                ctx.lineTo(xZero + 5, py);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${s}m`, xZero - 8, py);
            }

        } else {
            // =========================================================================
            // VISÃO DESDOBRADA (EXTRUDED):
            // Eixo Horizontal = Posição s (passando em t = 0 na base)
            // Eixo Vertical = Tempo t (passando em s = 0 no centro)
            // Cruzamento na Origem (0, 0)!
            // =========================================================================
            const xZero = originCanvas.x;
            const yZero = this.height - margin;

            // 1. Eixo Horizontal da Posição s
            ctx.beginPath();
            ctx.moveTo(margin, yZero);
            ctx.lineTo(this.width - margin + 14, yZero);
            ctx.stroke();
            this.drawArrow(this.width - margin + 14, yZero, 0);

            // 2. Eixo Vertical do Tempo t (linha s = 0)
            ctx.beginPath();
            ctx.moveTo(xZero, yZero);
            ctx.lineTo(xZero, margin - 14);
            ctx.stroke();
            this.drawArrow(xZero, margin - 14, -Math.PI / 2);

            // Rótulos dos Eixos
            ctx.font = '600 13px var(--font-sans, sans-serif)';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'right';
            ctx.fillText('Posição s [m]', this.width - margin + 14, yZero + 24);

            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'left';
            ctx.fillText('Tempo t [s]', xZero + 10, margin - 14);

            // Marcação da Origem O (0, 0)
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 11px var(--font-mono, monospace)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('O (0, 0)', xZero, yZero + 8);

            // Ticks de Posição
            ctx.font = '11px var(--font-sans, sans-serif)';
            for (let s = -15; s <= 15; s += 5) {
                if (s === 0) continue;
                const normS = (s - this.xMin) / (this.xMax - this.xMin);
                const px = margin + normS * w;

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.moveTo(px, yZero - 5);
                ctx.lineTo(px, yZero + 5);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(`${s}m`, px, yZero + 8);
            }

            // Ticks de Tempo
            const numTicksT = 5;
            for (let i = 1; i <= numTicksT; i++) {
                const valT = (i / numTicksT) * this.tMax;
                const py = yZero - (valT / this.tMax) * h;

                ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
                ctx.beginPath();
                ctx.moveTo(xZero - 5, py);
                ctx.lineTo(xZero + 5, py);
                ctx.stroke();

                ctx.fillStyle = '#94a3b8';
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${valT.toFixed(0)}s`, xZero - 8, py);
            }
        }

        ctx.restore();
    }

    mapPointToCanvas(pt, margin, w, h, rot) {
        const normX = (pt.x - this.xMin) / (this.xMax - this.xMin);
        const normT = Math.min(1, pt.t / this.tMax);

        let px, py;
        if (rot < 0.5) {
            px = margin + normX * w;
            py = (this.height - margin) - normT * h;
        } else {
            px = margin + normT * w;
            py = (this.height - margin) - normX * h;
        }

        return { x: px, y: py };
    }

    drawTrajectoryCurve2D(recording, colorHex, margin, w, h, rot) {
        const ctx = this.ctx;
        ctx.save();

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        let first = true;
        for (const pt of recording) {
            const pos = this.mapPointToCanvas(pt, margin, w, h, rot);
            if (first) {
                ctx.moveTo(pos.x, pos.y);
                first = false;
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        const sampleStep = Math.max(1, Math.floor(recording.length / 20));
        for (let i = 0; i < recording.length; i += sampleStep) {
            const pos = this.mapPointToCanvas(recording[i], margin, w, h, rot);
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawScrubberIndicator2D(margin, w, h, rot) {
        const ctx = this.ctx;
        ctx.save();

        const activePtA = this.recordingA[this.selectedTimeIndex] || this.recordingA[this.recordingA.length - 1];
        if (!activePtA) {
            ctx.restore();
            return;
        }

        const posA = this.mapPointToCanvas(activePtA, margin, w, h, rot);

        // Marcador A
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(posA.x, posA.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Marcador B (se ativo)
        if (this.motionType === 'equation_2' && this.recordingB.length > 0) {
            const activePtB = this.recordingB[this.selectedTimeIndex] || this.recordingB[this.recordingB.length - 1];
            if (activePtB) {
                const posB = this.mapPointToCanvas(activePtB, margin, w, h, rot);
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(posB.x, posB.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawArrow(x, y, angle) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = 'rgba(248, 250, 252, 0.75)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.simulacao = new MovimentoSimulation();
});
