// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.6 Flash
// Simulação: Movimento 1D e 2D (Posição × Tempo & Encontro de Dois Corpos)
// Descrição: Simulação cinemática de movimento unidimensional e bidimensional,
//            extrusão espaço-temporal, gráficos de trajetória e ponto de encontro.
// =============================================================================

class MovimentoSimulation {
    constructor() {
        // Elementos DOM
        this.canvas = document.getElementById('simCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.readoutSingle = document.getElementById('readoutSingle');
        this.valTime = document.getElementById('valTime');
        this.valPos = document.getElementById('valPos');
        this.valVel = document.getElementById('valVel');
        this.valAccel = document.getElementById('valAccel');

        this.readoutDual = document.getElementById('readoutDual');
        this.valTimeDual = document.getElementById('valTimeDual');
        this.valPosA = document.getElementById('valPosA');
        this.valPosB = document.getElementById('valPosB');
        this.valVelA = document.getElementById('valVelA');
        this.valVelB = document.getElementById('valVelB');

        this.intersectionCard = document.getElementById('intersectionCard');
        this.intersectionValue = document.getElementById('intersectionValue');

        this.modeBadge = document.getElementById('modeBadge');
        this.canvasHint = document.getElementById('canvasHint');

        this.tabManual = document.getElementById('tabManual');
        this.tabEq1 = document.getElementById('tabEq1');
        this.tabEq2 = document.getElementById('tabEq2');

        this.btnPlayPause = document.getElementById('btnPlayPause');
        this.btnReset = document.getElementById('btnReset');
        this.btnViewGraph = document.getElementById('btnViewGraph');
        this.btnToggleAxis = document.getElementById('btnToggleAxis');
        this.btnBackTo1D = document.getElementById('btnBackTo1D');

        this.equationPanelA = document.getElementById('equationPanelA');
        this.equationDisplayA = document.getElementById('equationDisplayA');
        this.inputS0A = document.getElementById('inputS0A');
        this.inputV0A = document.getElementById('inputV0A');
        this.inputAA = document.getElementById('inputAA');

        this.equationPanelB = document.getElementById('equationPanelB');
        this.equationDisplayB = document.getElementById('equationDisplayB');
        this.inputS0B = document.getElementById('inputS0B');
        this.inputV0B = document.getElementById('inputV0B');
        this.inputAB = document.getElementById('inputAB');

        this.groupPosSlider = document.getElementById('groupPosSlider');
        this.sliderPos = document.getElementById('sliderPos');
        this.lblPosSlider = document.getElementById('lblPosSlider');

        this.groupScrubber = document.getElementById('groupScrubber');
        this.sliderScrubber = document.getElementById('sliderScrubber');
        this.lblScrubberTime = document.getElementById('lblScrubberTime');

        this.infoTitle = document.getElementById('infoTitle');
        this.infoText = document.getElementById('infoText');

        // Modos de Simulação
        // Mode: '1D' | '2D_EXTRUDED' | '2D_CONVENTIONAL'
        this.mode = '1D';

        // Tipo de Movimento: 'manual' | 'equation_1' | 'equation_2'
        this.motionType = 'manual';

        // Parâmetros do Objeto A
        this.s0A = -5.0;
        this.v0A = 3.0;
        this.aA = 0.0;
        this.xA = -5.0;
        this.vA = 3.0;

        // Parâmetros do Objeto B
        this.s0B = 5.0;
        this.v0B = -2.0;
        this.aB = 0.0;
        this.xB = 5.0;
        this.vB = -2.0;

        // Tempo Instantâneo
        this.t = 0;

        this.isPlaying = false;
        this.isDragging = false;

        // Histórico de Gravados
        this.recordingA = [];
        this.recordingB = [];
        this.lastFrameTimestamp = 0;
        this.prevXA = 0;

        // Limites de Exibição do Eixo X
        this.xMin = -10;
        this.xMax = 10;
        this.tMax = 10;

        // Tempo Selecionado no Scrubber (Modos 2D)
        this.selectedTimeIndex = 0;

        // Animações de Transição
        this.transitionProgress = 0;
        this.targetTransition = 0;

        this.axisRotateProgress = 0;
        this.targetAxisRotate = 0;

        this.ballRadius = 16;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => this.resize());
            ro.observe(this.canvas.parentElement);
        }

        this.setupEvents();
        this.updateEquationDisplays();
        this.updateUI();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        this.ctx.scale(dpr, dpr);
    }

    setupEvents() {
        this.tabManual.addEventListener('click', () => this.setMotionType('manual'));
        this.tabEq1.addEventListener('click', () => this.setMotionType('equation_1'));
        this.tabEq2.addEventListener('click', () => this.setMotionType('equation_2'));

        this.btnPlayPause.addEventListener('click', () => this.togglePlay());
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnViewGraph.addEventListener('click', () => this.enter2DMode());
        this.btnToggleAxis.addEventListener('click', () => this.toggleAxisView());
        this.btnBackTo1D.addEventListener('click', () => this.backTo1DMode());

        // Entradas do Objeto A
        const onParamChangeA = () => {
            this.s0A = parseFloat(this.inputS0A.value) || 0;
            this.v0A = parseFloat(this.inputV0A.value) || 0;
            this.aA = parseFloat(this.inputAA.value) || 0;

            this.updateEquationDisplays();
            if (this.motionType !== 'manual' && !this.isPlaying && this.t === 0) {
                this.xA = this.s0A;
                this.vA = this.v0A;
            }
            this.updateUI();
        };

        this.inputS0A.addEventListener('input', onParamChangeA);
        this.inputV0A.addEventListener('input', onParamChangeA);
        this.inputAA.addEventListener('input', onParamChangeA);

        // Entradas do Objeto B
        const onParamChangeB = () => {
            this.s0B = parseFloat(this.inputS0B.value) || 0;
            this.v0B = parseFloat(this.inputV0B.value) || 0;
            this.aB = parseFloat(this.inputAB.value) || 0;

            this.updateEquationDisplays();
            if (this.motionType === 'equation_2' && !this.isPlaying && this.t === 0) {
                this.xB = this.s0B;
                this.vB = this.v0B;
            }
            this.updateUI();
        };

        this.inputS0B.addEventListener('input', onParamChangeB);
        this.inputV0B.addEventListener('input', onParamChangeB);
        this.inputAB.addEventListener('input', onParamChangeB);

        // Slider de Posição Manual (1D)
        this.sliderPos.addEventListener('input', (e) => {
            if (this.motionType === 'manual') {
                const val = parseFloat(e.target.value);
                this.setPos(val);
            }
        });

        // Scrubber de Tempo (2D)
        this.sliderScrubber.addEventListener('input', (e) => {
            const timeVal = parseFloat(e.target.value);
            this.seekToTime(timeVal);
        });

        // Eventos de Canvas (Mouse & Touch)
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
                    const ballCanvasPos = this.getBallCanvasPos1D(this.xA);
                    const dist = Math.hypot(pos.x - ballCanvasPos.x, pos.y - ballCanvasPos.y);

                    if (dist <= this.ballRadius * 2.5) {
                        this.isDragging = true;
                    } else {
                        this.isDragging = true;
                        this.updatePosFromCanvasX(pos.x);
                    }
                }
            } else {
                this.seekFromCanvasCoords(pos);
                this.isDragging = true;
            }
        };

        const onMove = (e) => {
            if (!this.isDragging) return;
            const pos = getCanvasCoords(e);

            if (this.mode === '1D') {
                if (this.motionType === 'manual') {
                    this.updatePosFromCanvasX(pos.x);
                }
            } else {
                this.seekFromCanvasCoords(pos);
            }
        };

        const onEnd = () => {
            this.isDragging = false;
        };

        this.canvas.addEventListener('mousedown', onStart);
        this.canvas.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        this.canvas.addEventListener('touchstart', onStart, { passive: true });
        this.canvas.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
    }

    setMotionType(type) {
        if (this.isPlaying) this.togglePlay();

        this.motionType = type;

        this.tabManual.classList.toggle('active', type === 'manual');
        this.tabEq1.classList.toggle('active', type === 'equation_1');
        this.tabEq2.classList.toggle('active', type === 'equation_2');

        if (this.t === 0) {
            if (type === 'manual') {
                this.xA = 0;
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
        this.equationDisplayA.innerHTML = this.formatEquationString('S<sub>A</sub>', this.s0A, this.v0A, this.aA);
        this.equationDisplayB.innerHTML = this.formatEquationString('S<sub>B</sub>', this.s0B, this.v0B, this.aB);
    }

    formatEquationString(prefix, s0, v0, a) {
        let str = `${prefix}(t) = ${s0.toFixed(1)}`;

        if (v0 >= 0) str += ` + ${v0.toFixed(1)}t`;
        else str += ` - ${Math.abs(v0).toFixed(1)}t`;

        const halfA = 0.5 * a;
        if (halfA !== 0) {
            if (halfA > 0) str += ` + ${halfA.toFixed(2)}t²`;
            else str += ` - ${Math.abs(halfA).toFixed(2)}t²`;
        }

        return str;
    }

    calculateIntersection() {
        // Resolve S_A(t) = S_B(t)
        // 0.5*(aA - aB)*t^2 + (v0A - v0B)*t + (s0A - s0B) = 0
        const A = 0.5 * (this.aA - this.aB);
        const B = this.v0A - this.v0B;
        const C = this.s0A - this.s0B;

        let intersectionTimes = [];

        if (Math.abs(A) < 1e-6) {
            // Equação de 1º Grau (MRU)
            if (Math.abs(B) > 1e-6) {
                const t = -C / B;
                if (t >= 0) intersectionTimes.push(t);
            }
        } else {
            // Equação de 2º Grau (MRUV)
            const delta = B * B - 4 * A * C;
            if (delta >= 0) {
                const t1 = (-B + Math.sqrt(delta)) / (2 * A);
                const t2 = (-B - Math.sqrt(delta)) / (2 * A);

                if (t1 >= 0) intersectionTimes.push(t1);
                if (t2 >= 0) intersectionTimes.push(t2);
            }
        }

        if (intersectionTimes.length === 0) return null;

        // Pega o menor tempo futuro
        intersectionTimes.sort((a, b) => a - b);
        const tEnc = intersectionTimes[0];
        const xEnc = this.s0A + this.v0A * tEnc + 0.5 * this.aA * tEnc * tEnc;

        return { t: tEnc, x: xEnc };
    }

    setPos(val) {
        this.xA = Math.max(this.xMin, Math.min(this.xMax, val));
        this.sliderPos.value = this.xA.toFixed(1);
        this.lblPosSlider.textContent = `${this.xA.toFixed(1)} m`;

        if (this.isPlaying) {
            this.recordCurrentPoint();
        }
        this.updateUI();
    }

    updatePosFromCanvasX(canvasX) {
        let margin = 60;
        if (this.mode !== '1D') margin = 80;

        const effectiveWidth = this.width - margin * 2;
        const norm = (canvasX - margin) / effectiveWidth;
        const physicsX = this.xMin + norm * (this.xMax - this.xMin);

        this.setPos(physicsX);
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.btnPlayPause.classList.add('is-playing');
            this.btnPlayPause.innerHTML = 'Pausar Tempo';

            if (this.recordingA.length === 0) {
                if (this.motionType !== 'manual') {
                    this.xA = this.s0A;
                    this.vA = this.v0A;
                    this.xB = this.s0B;
                    this.vB = this.v0B;
                }
                this.recordCurrentPoint();
            }
        } else {
            this.btnPlayPause.classList.remove('is-playing');
            this.btnPlayPause.innerHTML = 'Continuar Tempo';
        }
        this.updateUI();
    }

    reset() {
        this.isPlaying = false;
        this.t = 0;

        this.xA = this.motionType !== 'manual' ? this.s0A : 0;
        this.vA = this.motionType !== 'manual' ? this.v0A : 0;
        this.xB = this.s0B;
        this.vB = this.v0B;

        this.recordingA = [];
        this.recordingB = [];
        this.selectedTimeIndex = 0;
        this.tMax = 10;
        this.xMin = -10;
        this.xMax = 10;

        this.mode = '1D';
        this.targetTransition = 0;
        this.targetAxisRotate = 0;

        this.btnPlayPause.classList.remove('is-playing');
        this.btnPlayPause.innerHTML = 'Iniciar Tempo';

        this.updateUI();
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

            // Expande eixos dinamicamente se qualquer objeto sair
            const maxX = Math.max(this.xA, this.motionType === 'equation_2' ? this.xB : -Infinity);
            const minX = Math.min(this.xA, this.motionType === 'equation_2' ? this.xB : Infinity);

            if (maxX > this.xMax - 2) this.xMax = Math.ceil(maxX / 5) * 5 + 5;
            if (minX < this.xMin + 2) this.xMin = Math.floor(minX / 5) * 5 - 5;
        }
    }

    enter2DMode() {
        if (this.recordingA.length === 0) return;

        this.isPlaying = false;
        this.btnPlayPause.classList.remove('is-playing');
        this.btnPlayPause.innerHTML = 'Iniciar Tempo';

        this.mode = '2D_EXTRUDED';
        this.targetTransition = 1;
        this.targetAxisRotate = 0;
        this.selectedTimeIndex = this.recordingA.length - 1;

        this.sliderScrubber.max = this.t.toFixed(2);
        this.sliderScrubber.value = this.t.toFixed(2);

        this.updateUI();
    }

    toggleAxisView() {
        if (this.mode === '2D_EXTRUDED') {
            this.mode = '2D_CONVENTIONAL';
            this.targetAxisRotate = 1;
        } else if (this.mode === '2D_CONVENTIONAL') {
            this.mode = '2D_EXTRUDED';
            this.targetAxisRotate = 0;
        }
        this.updateUI();
    }

    backTo1DMode() {
        this.mode = '1D';
        this.targetTransition = 0;
        this.targetAxisRotate = 0;
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
        const ptB = this.recordingB[closestIdx];

        this.valTime.textContent = `${ptA.t.toFixed(2)} s`;
        this.valTimeDual.textContent = `${ptA.t.toFixed(2)} s`;

        this.valPos.textContent = `${ptA.x.toFixed(2)} m`;
        this.valVel.textContent = `${ptA.v.toFixed(2)} m/s`;

        if (ptA) {
            this.valPosA.textContent = `${ptA.x.toFixed(2)} m`;
            this.valVelA.textContent = `${ptA.v.toFixed(2)} m/s`;
        }

        if (ptB) {
            this.valPosB.textContent = `${ptB.x.toFixed(2)} m`;
            this.valVelB.textContent = `${ptB.v.toFixed(2)} m/s`;
        }

        this.lblScrubberTime.textContent = `${ptA.t.toFixed(2)} s`;
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

        this.sliderScrubber.value = targetT.toFixed(2);
        this.seekToTime(targetT);
    }

    updateUI() {
        const isDual = this.motionType === 'equation_2';

        if (this.mode === '1D') {
            if (this.motionType === 'manual') {
                this.equationPanelA.style.display = 'none';
                this.equationPanelB.style.display = 'none';
                this.intersectionCard.style.display = 'none';
                this.groupPosSlider.style.display = 'flex';
                this.modeBadge.textContent = 'Modo 1D: Manual (Livre)';
                this.canvasHint.innerHTML = 'Arraste a esfera amarela ao longo do eixo X';
            } else if (this.motionType === 'equation_1') {
                this.equationPanelA.style.display = 'flex';
                this.equationPanelB.style.display = 'none';
                this.intersectionCard.style.display = 'none';
                this.groupPosSlider.style.display = 'none';
                this.modeBadge.textContent = 'Modo 1D: Função horária da posição';
                this.canvasHint.innerHTML = 'Digite os parâmetros e clique em Iniciar Tempo';
            } else {
                this.equationPanelA.style.display = 'flex';
                this.equationPanelB.style.display = 'flex';
                this.intersectionCard.style.display = 'flex';
                this.groupPosSlider.style.display = 'none';
                this.modeBadge.textContent = 'Modo 1D: Encontro de 2 Objetos';
                this.canvasHint.innerHTML = 'Digite as equações S<sub>A</sub> e S<sub>B</sub> para ver o ponto de encontro';

                // Atualiza Previsão do Encontro
                const meeting = this.calculateIntersection();
                if (meeting) {
                    this.intersectionValue.innerHTML = `<span class="highlight-yellow">t = ${meeting.t.toFixed(2)}s</span> &nbsp;|&nbsp; <span class="highlight-cyan">x = ${meeting.x.toFixed(2)}m</span>`;
                } else {
                    this.intersectionValue.innerHTML = `<span style="color: #94a3b8;">Nenhum ponto de encontro futuro no mesmo sentido.</span>`;
                }
            }

            this.readoutSingle.style.display = isDual ? 'none' : 'grid';
            this.readoutDual.style.display = isDual ? 'grid' : 'none';

            this.btnViewGraph.style.display = 'inline-block';
            this.btnToggleAxis.style.display = 'none';
            this.btnBackTo1D.style.display = 'none';
            this.groupScrubber.style.display = 'none';
            this.btnViewGraph.disabled = this.recordingA.length < 2;

            if (this.motionType === 'manual') {
                this.infoTitle.textContent = 'Etapa 1: Movimento Livre (1D)';
                this.infoText.innerHTML = `
                    1. Arraste a esfera amarela livremente ao longo do eixo horizontal X.<br>
                    2. Clique em <strong>Iniciar Tempo</strong> para gravar a posição a cada segundo.<br>
                    3. Pause e clique em <strong>Ver Movimento</strong> para revelar o gráfico!
                `;
            } else if (this.motionType === 'equation_1') {
                this.infoTitle.textContent = 'Etapa 2: Movimento por Equação';
                this.infoText.innerHTML = `
                    1. Digite a posição inicial (S<sub>0</sub>), velocidade (v<sub>0</sub>) e aceleração (a).<br>
                    2. Clique em <strong>Iniciar Tempo</strong> para ver a esfera se mover por S(t).<br>
                    3. Clique em <strong>Ver Movimento</strong> para analisar a reta ou parábola!
                `;
            } else {
                this.infoTitle.textContent = 'Etapa 3: Encontro de 2 Corpos';
                this.infoText.innerHTML = `
                    1. Preencha os parâmetros das equações S<sub>A</sub>(t) e S<sub>B</sub>(t) nos painéis.<br>
                    2. Confira o instante e posição previstos no card <strong> Ponto de Encontro</strong>.<br>
                    3. Clique em <strong>Iniciar Tempo</strong> e veja o cruzamento das esferas!
                `;
            }
        } else if (this.mode === '2D_EXTRUDED' || this.mode === '2D_CONVENTIONAL') {
            this.equationPanelA.style.display = 'none';
            this.equationPanelB.style.display = 'none';
            this.intersectionCard.style.display = isDual ? 'flex' : 'none';
            this.groupPosSlider.style.display = 'none';

            this.readoutSingle.style.display = isDual ? 'none' : 'grid';
            this.readoutDual.style.display = isDual ? 'grid' : 'none';

            this.btnViewGraph.style.display = 'none';
            this.btnToggleAxis.style.display = 'inline-block';
            this.btnToggleAxis.textContent = this.mode === '2D_EXTRUDED' ? 'Visão Convencional (t no X)' : 'Visão Desdobrada (t no Y)';
            this.btnBackTo1D.style.display = 'inline-block';
            this.groupScrubber.style.display = 'flex';

            if (isDual) {
                const meeting = this.calculateIntersection();
                if (meeting) {
                    this.intersectionValue.innerHTML = `<span class="highlight-yellow">t = ${meeting.t.toFixed(2)}s</span> &nbsp;|&nbsp; <span class="highlight-cyan">x = ${meeting.x.toFixed(2)}m</span>`;
                } else {
                    this.intersectionValue.innerHTML = `<span style="color: #94a3b8;">Sem cruzamento no gráfico</span>`;
                }
            }

            if (this.mode === '2D_EXTRUDED') {
                this.infoTitle.textContent = 'Visão 2D: Eixo do Tempo (T)';
                this.infoText.innerHTML = `
                    1. Observe o eixo do tempo ($T$) se desdobrando na vertical a partir de $X$.<br>
                    2. Arraste o slider <strong>Histórico Temporal</strong> para inspecionar instantes passados.<br>
                    3. Clique em <strong>Visão Convencional</strong> para ver o gráfico padrão!
                `;
            } else {
                this.infoTitle.textContent = 'Visão 2D: Gráfico Convencional x(t)';
                this.infoText.innerHTML = `
                    1. Veja o gráfico padrão: <strong>Tempo (t)</strong> na horizontal e <strong>Posição (x)</strong> na vertical.<br>
                    2. Deslize no histórico para acompanhar as posições e velocidades.<br>
                    3. Localize o ponto exato onde as curvas se cruzam!
                `;
            }
        }

        if (this.mode === '1D') {
            this.valTime.textContent = `${this.t.toFixed(2)} s`;
            this.valTimeDual.textContent = `${this.t.toFixed(2)} s`;
            this.valPos.textContent = `${this.xA.toFixed(2)} m`;
            this.valVel.textContent = `${this.vA.toFixed(2)} m/s`;
            this.valPosA.textContent = `${this.xA.toFixed(2)} m`;
            this.valPosB.textContent = `${this.xB.toFixed(2)} m`;
            this.valVelA.textContent = `${this.vA.toFixed(2)} m/s`;
            this.valVelB.textContent = `${this.vB.toFixed(2)} m/s`;
        }
    }

    loop(timestamp) {
        if (!this.lastFrameTimestamp) this.lastFrameTimestamp = timestamp;
        const dt = (timestamp - this.lastFrameTimestamp) / 1000;
        this.lastFrameTimestamp = timestamp;

        if (this.isPlaying && this.mode === '1D') {
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

            this.valTime.textContent = `${this.t.toFixed(2)} s`;
            this.valTimeDual.textContent = `${this.t.toFixed(2)} s`;
            this.valPosA.textContent = `${this.xA.toFixed(2)} m`;
            this.valPosB.textContent = `${this.xB.toFixed(2)} m`;
            this.valVelA.textContent = `${this.vA.toFixed(2)} m/s`;
            this.valVelB.textContent = `${this.vB.toFixed(2)} m/s`;
        }

        this.transitionProgress += (this.targetTransition - this.transitionProgress) * 0.1;
        this.axisRotateProgress += (this.targetAxisRotate - this.axisRotateProgress) * 0.1;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.render();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    getBallCanvasPos1D(physX) {
        const margin = 70;
        const effectiveWidth = this.width - margin * 2;
        const normX = (physX - this.xMin) / (this.xMax - this.xMin);

        const canvasX = margin + normX * effectiveWidth;
        const canvasY = this.height / 2;

        return { x: canvasX, y: canvasY };
    }

    render() {
        const p = this.transitionProgress;
        const rot = this.axisRotateProgress;

        this.drawGrid(p, rot);

        if (p < 0.99) {
            this.drawMode1D(1 - p);
        }

        if (p > 0.01) {
            this.drawMode2D(p, rot);
        }
    }

    drawGrid(p, rot) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;

        const gridSize = 40;
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }

        for (let y = 0; y < this.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }
        ctx.restore();
    }

    drawMode1D(alpha) {
        if (alpha <= 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = alpha;

        const margin = 70;
        const axisY = this.height / 2;
        const effectiveWidth = this.width - margin * 2;

        // Eixo X
        ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(margin, axisY);
        ctx.lineTo(this.width - margin, axisY);
        ctx.stroke();

        this.drawArrow(this.width - margin + 15, axisY, 0);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const step = Math.max(2, Math.ceil((this.xMax - this.xMin) / 10));
        for (let meter = Math.ceil(this.xMin); meter <= this.xMax; meter += step) {
            const norm = (meter - this.xMin) / (this.xMax - this.xMin);
            const tickX = margin + norm * effectiveWidth;

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(tickX, axisY - 8);
            ctx.lineTo(tickX, axisY + 8);
            ctx.stroke();

            ctx.fillText(`${meter}m`, tickX, axisY + 12);
        }

        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText('Eixo X (Posição)', this.width - margin + 25, axisY - 5);

        // Desenhar Objeto A (Amarelo)
        this.drawBall1D(this.xA, '#facc15', 'A');

        // Desenhar Objeto B (Ciano) se estiver no modo 2 objetos
        if (this.motionType === 'equation_2') {
            this.drawBall1D(this.xB, '#38bdf8', 'B');

            // Destaque de Encontro se os corpos se cruzarem (distância < 0.4m)
            if (Math.abs(this.xA - this.xB) < 0.4) {
                const posA = this.getBallCanvasPos1D(this.xA);
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(posA.x, posA.y, this.ballRadius * 2.2, 0, Math.PI * 2);
                ctx.stroke();

                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('⚡ ENCONTRO!', posA.x, posA.y - 30);
            }
        }

        ctx.restore();
    }

    drawBall1D(physX, colorHex, label) {
        const ctx = this.ctx;
        const ballPos = this.getBallCanvasPos1D(physX);

        // Glow
        const gradient = ctx.createRadialGradient(ballPos.x, ballPos.y, 2, ballPos.x, ballPos.y, this.ballRadius * 2);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ballPos.x, ballPos.y, this.ballRadius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Corpo
        ctx.fillStyle = colorHex;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ballPos.x, ballPos.y, this.ballRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, ballPos.x, ballPos.y);
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
            // Desenhar Curva do Objeto A (Amarelo)
            this.drawTrajectoryCurve2D(this.recordingA, '#facc15', margin, w, h, rot);

            // Desenhar Curva do Objeto B (Ciano) se existir
            if (this.motionType === 'equation_2' && this.recordingB.length > 0) {
                this.drawTrajectoryCurve2D(this.recordingB, '#38bdf8', margin, w, h, rot);
            }

            // Marcador de Interseção do Ponto de Encontro
            if (this.motionType === 'equation_2') {
                const meeting = this.calculateIntersection();
                if (meeting && meeting.t <= this.tMax) {
                    const posEnc = this.mapPointToCanvas(meeting, margin, w, h, rot);

                    ctx.fillStyle = '#ef4444';
                    ctx.shadowColor = '#ef4444';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(posEnc.x, posEnc.y, 9, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('⚡ Encontro', posEnc.x, posEnc.y - 14);
                }
            }

            this.drawScrubberIndicator2D(margin, w, h, rot);
        }

        ctx.restore();
    }

    drawAxes2D(margin, w, h, rot) {
        const ctx = this.ctx;
        ctx.save();

        const xOrigin = margin;
        const yOrigin = this.height - margin;

        ctx.strokeStyle = 'rgba(248, 250, 252, 0.7)';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.moveTo(xOrigin, yOrigin);
        ctx.lineTo(this.width - margin + 10, yOrigin);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(xOrigin, yOrigin);
        ctx.lineTo(xOrigin, margin - 10);
        ctx.stroke();

        this.drawArrow(this.width - margin + 15, yOrigin, 0);
        this.drawArrow(xOrigin, margin - 15, -Math.PI / 2);

        ctx.font = 'bold 13px Inter, sans-serif';

        if (rot < 0.5) {
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'right';
            ctx.fillText('Posição (x) [m]', this.width - margin + 10, yOrigin + 35);

            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'left';
            ctx.fillText('Tempo (t) [s]', xOrigin + 10, margin - 15);
        } else {
            ctx.fillStyle = '#facc15';
            ctx.textAlign = 'right';
            ctx.fillText('Tempo (t) [s]', this.width - margin + 10, yOrigin + 35);

            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'left';
            ctx.fillText('Posição (x) [m]', xOrigin + 10, margin - 15);
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px Inter, sans-serif';

        const numTicksX = 8;
        for (let i = 0; i <= numTicksX; i++) {
            const frac = i / numTicksX;
            const px = xOrigin + frac * w;

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.beginPath();
            ctx.moveTo(px, yOrigin);
            ctx.lineTo(px, yOrigin + 6);
            ctx.stroke();

            let label = '';
            if (rot < 0.5) {
                const valX = this.xMin + frac * (this.xMax - this.xMin);
                label = `${valX.toFixed(0)}m`;
            } else {
                const valT = frac * this.tMax;
                label = `${valT.toFixed(1)}s`;
            }
            ctx.textAlign = 'center';
            ctx.fillText(label, px, yOrigin + 18);
        }

        const numTicksY = 6;
        for (let i = 0; i <= numTicksY; i++) {
            const frac = i / numTicksY;
            const py = yOrigin - frac * h;

            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.beginPath();
            ctx.moveTo(xOrigin - 6, py);
            ctx.lineTo(xOrigin, py);
            ctx.stroke();

            let label = '';
            if (rot < 0.5) {
                const valT = frac * this.tMax;
                label = `${valT.toFixed(1)}s`;
            } else {
                const valX = this.xMin + frac * (this.xMax - this.xMin);
                label = `${valX.toFixed(0)}m`;
            }
            ctx.textAlign = 'right';
            ctx.fillText(label, xOrigin - 10, py + 4);
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
        ctx.lineWidth = 3.5;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        let first = true;
        for (let pt of recording) {
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
        for (let i = 0; i < recording.length; i += Math.max(1, Math.floor(recording.length / 20))) {
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
        if (!activePtA) return;

        const posA = this.mapPointToCanvas(activePtA, margin, w, h, rot);

        // Marcador A
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(posA.x, posA.y, 7, 0, Math.PI * 2);
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
                ctx.arc(posB.x, posB.y, 7, 0, Math.PI * 2);
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
        ctx.fillStyle = 'rgba(248, 250, 252, 0.8)';
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
