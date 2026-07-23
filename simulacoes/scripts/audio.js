// =============================================================================
// Autor: Nicolas Heringer
// Coautor / Revisor: Gemini 3.6 Flash
// Simulação: Análise e Síntese de Áudio (Espectrograma FFT e Sintetizador)
// Descrição: Processamento de áudio via Web Audio API, análise espectral FFT em
//            tempo real (domínio do tempo e frequência) e síntese por aditiva.
// =============================================================================

// =============================================================================
// 1. ELEMENTOS DOM E CONFIGURAÇÕES DE CANVAS
// =============================================================================
const startButton  = document.getElementById('startButton');
const stopButton   = document.getElementById('stopButton');
const modeButton   = document.getElementById('modeButton');
const clearButton  = document.getElementById('clearButton');
const clearGroup   = document.getElementById('clearGroup');
const scaleButton  = document.getElementById('scaleButton');
const infoText     = document.getElementById('infoText');
const timeCanvas   = document.getElementById('timeCanvas');
const freqCanvas   = document.getElementById('freqCanvas');

const WIDTH  = 800;
const HEIGHT = 300;

timeCanvas.width = freqCanvas.width = WIDTH;
timeCanvas.height = freqCanvas.height = HEIGHT;

const ML = 60;   // margin left
const MB = 50;   // margin bottom
const MT = 20;   // margin top
const MR = 20;   // margin right
const DW = WIDTH  - ML - MR;   // drawable width
const DH = HEIGHT - MT - MB;   // drawable height

// =============================================================================
// 2. ESTADO GLOBAL DO ÁUDIO E SINTETIZADOR
// =============================================================================
let audioContext;
let analyser;
let dataArray;
let animationId;
let bufferLength;
let isLogScale = false;

let currentMode = 'analysis'; // 'analysis' | 'generator'

const NUM_OSCS    = 48;   // number of oscillators in the bank
const MIN_FREQ    = 20;   // Hz
const MAX_FREQ    = 20000; // Hz (may be capped by sampleRate/2 after init)

let oscillators     = [];   // OscillatorNode[]
let oscGains        = [];   // GainNode[] — one per oscillator
let masterGain;             // GainNode
let generatorSpectrum = new Float32Array(NUM_OSCS); // amplitude 0..1 per band
let oscFrequencies  = [];   // centre frequency of each oscillator (Hz)
let isDrawing       = false;

// =============================================================================
// 3. FUNÇÕES AUXILIARES DE ESCALA E CONVERSÃO
// =============================================================================

/** Map a normalised x position [0,1] → frequency in Hz, honoring scale mode. */
function xNormToFreq(xNorm, maxFreq) {
    if (isLogScale) {
        const logMin = Math.log10(MIN_FREQ);
        const logMax = Math.log10(maxFreq);
        return Math.pow(10, logMin + xNorm * (logMax - logMin));
    }
    return xNorm * maxFreq;
}

/** Map a frequency → normalised x position [0,1]. */
function freqToXNorm(freq, maxFreq) {
    if (isLogScale) {
        const logMin = Math.log10(MIN_FREQ);
        const logMax = Math.log10(maxFreq);
        return (Math.log10(Math.max(freq, MIN_FREQ)) - logMin) / (logMax - logMin);
    }
    return freq / maxFreq;
}

/** Return the oscillator-bank index whose centre frequency is closest to `freq`. */
function freqToOscIndex(freq) {
    let best = 0;
    let bestDist = Infinity;
    for (let k = 0; k < NUM_OSCS; k++) {
        const d = Math.abs(oscFrequencies[k] - freq);
        if (d < bestDist) { bestDist = d; best = k; }
    }
    return best;
}

// =============================================================================
// 4. RENDERIZAÇÃO DE EIXOS E GRADES
// =============================================================================

function drawFreqAxes(ctx, maxFreq) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Vertical ticks
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const xTicks = isLogScale
        ? [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].filter(f => f <= maxFreq)
        : [0, 4000, 8000, 12000, 16000, 20000].filter(f => f <= maxFreq);

    xTicks.forEach(freq => {
        const xPos = ML + freqToXNorm(freq, maxFreq) * DW;
        ctx.moveTo(xPos, MT);
        ctx.lineTo(xPos, MT + DH);
        const label = freq >= 1000 ? (freq / 1000) + 'k' : freq + '';
        ctx.fillText(label, xPos, MT + DH + 8);
    });

    // Horizontal ticks (dB)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#aaa';
    for (let dB = -100; dB <= 0; dB += 20) {
        const yPos = MT + DH - ((dB + 100) / 100) * DH;
        ctx.moveTo(ML, yPos);
        ctx.lineTo(ML + DW, yPos);
        ctx.fillText(dB + ' dB', ML - 8, yPos);
    }
    ctx.stroke();

    // Axis titles
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Frequência (Hz)', ML + DW / 2, HEIGHT - 16);

    ctx.save();
    ctx.translate(12, MT + DH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Intensidade (dB)', 0, 0);
    ctx.restore();
}

// =============================================================================
// 5. INICIALIZAÇÃO DE MODOS (ANÁLISE E SINTETIZADOR)
// =============================================================================

async function initAnalysis() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext  = new (window.AudioContext || window.webkitAudioContext)();
        analyser      = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        bufferLength  = analyser.frequencyBinCount;
        dataArray     = new Uint8Array(bufferLength);

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        startVisualization();
        startButton.disabled = true;
        stopButton.disabled  = false;
    } catch (err) {
        alert('Erro ao acessar o microfone: ' + err.message);
    }
}

// ─── Generator mode ───────────────────────────────────────────────────────────

function initGenerator() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const maxFreq = audioContext.sampleRate / 2;

    analyser         = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength     = analyser.frequencyBinCount;
    dataArray        = new Uint8Array(bufferLength);

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(analyser);
    analyser.connect(audioContext.destination);

    // Build logarithmically-spaced oscillator bank
    oscFrequencies = [];
    oscillators    = [];
    oscGains       = [];
    generatorSpectrum = new Float32Array(NUM_OSCS);

    for (let k = 0; k < NUM_OSCS; k++) {
        const t    = k / (NUM_OSCS - 1);
        const freq = Math.pow(10, Math.log10(MIN_FREQ) + t * Math.log10(Math.min(maxFreq, MAX_FREQ) / MIN_FREQ));
        oscFrequencies.push(freq);

        const osc  = audioContext.createOscillator();
        osc.type   = 'sine';
        osc.frequency.value = freq;

        const gain = audioContext.createGain();
        gain.gain.value = 0; // silent by default

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        oscillators.push(osc);
        oscGains.push(gain);
    }

    startVisualization();
    startButton.disabled = true;
    stopButton.disabled  = false;
}

function clearGeneratorSpectrum() {
    generatorSpectrum.fill(0);
    oscGains.forEach(g => g.gain.setTargetAtTime(0, audioContext.currentTime, 0.05));
}

// ─── Mode management ─────────────────────────────────────────────────────────

function stopAll() {
    cancelAnimationFrame(animationId);
    animationId = null;

    // Stop oscillators
    oscillators.forEach(osc => { try { osc.stop(); } catch (_) {} });
    oscillators = [];
    oscGains    = [];

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    startButton.disabled = false;
    stopButton.disabled  = true;
}

function setMode(mode) {
    stopAll();
    currentMode = mode;

    if (mode === 'analysis') {
        modeButton.textContent  = '⚡ Modo: Análise';
        startButton.textContent = '▶ Iniciar (microfone)';
        clearGroup.style.display = 'none';
        infoText.textContent = 'Modo Análise: clique em Iniciar para capturar o áudio do microfone e visualizar o espectro em tempo real.';
        freqCanvas.style.cursor = 'default';
        freqCanvas.classList.remove('generator-active');
    } else {
        modeButton.textContent  = '🏙 Modo: Gerar Sinal';
        startButton.textContent = '▶ Iniciar Gerador';
        clearGroup.style.display = '';
        infoText.textContent = 'Modo Gerador: clique em Iniciar e depois arraste no gráfico de frequências para desenhar e ouvir o sinal sintetizado.';
        freqCanvas.style.cursor = 'crosshair';
        freqCanvas.classList.add('generator-active');
    }
}

// =============================================================================
// 6. VISUALIZAÇÃO E DESENHO DOS GRÁFICOS (TEMPO E FREQUÊNCIA)
// =============================================================================

function drawTimeDomain() {
    const ctx = timeCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    for (let t = 0; t <= 1000; t += 200) {
        const xPos = ML + (t / 1000) * DW;
        ctx.moveTo(xPos, MT);
        ctx.lineTo(xPos, MT + DH);
        ctx.fillText(t + 'ms', xPos, HEIGHT - 22);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const amplitudes = [-1, -0.5, 0, 0.5, 1];
    amplitudes.forEach(amp => {
        const yPos = MT + (1 - (amp + 1) / 2) * DH;
        ctx.moveTo(ML, yPos);
        ctx.lineTo(ML + DW, yPos);
        ctx.fillText(amp.toFixed(1), ML - 8, yPos);
    });
    ctx.stroke();

    // Axis titles
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Tempo (ms)', ML + DW / 2, HEIGHT - 6);

    ctx.save();
    ctx.translate(12, MT + DH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();

    // Waveform
    if (!analyser) return;
    analyser.getByteTimeDomainData(dataArray);

    ctx.save();
    ctx.beginPath();
    ctx.rect(ML, MT, DW, DH);
    ctx.clip();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ffcc';
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#00ffcc';
    ctx.beginPath();

    const sliceWidth = DW / bufferLength;
    let xw = ML;
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 - 1;
        const y = MT + (1 - (v + 1) / 2) * DH;
        i === 0 ? ctx.moveTo(xw, y) : ctx.lineTo(xw, y);
        xw += sliceWidth;
    }
    ctx.stroke();
    ctx.restore();
}

// ─── Draw: frequency spectrum ─────────────────────────────────────────────────

function drawFrequency() {
    const ctx = freqCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (!analyser) return;
    const maxFreq = audioContext.sampleRate / 2;

    // Grid + axes
    drawFreqAxes(ctx, maxFreq);

    ctx.save();
    ctx.beginPath();
    ctx.rect(ML, MT, DW, DH);
    ctx.clip();

    if (currentMode === 'analysis') {
        // ── Analysis: draw FFT bars ──────────────────────────────────────────
        analyser.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            const f_low  = (i * maxFreq) / bufferLength;
            const f_high = ((i + 1) * maxFreq) / bufferLength;

            const xN  = freqToXNorm(f_low, maxFreq);
            const xN2 = freqToXNorm(f_high, maxFreq);
            const bx  = ML + xN  * DW;
            const bw  = (xN2 - xN) * DW;

            const barHeight = (dataArray[i] / 255) * DH;

            if (bx < ML + DW && bw > 0 && barHeight > 0) {
                const grad = ctx.createLinearGradient(0, MT + DH - barHeight, 0, MT + DH);
                grad.addColorStop(0, `hsla(${i * 2}, 100%, 60%, 1)`);
                grad.addColorStop(1, `hsla(${i * 2}, 100%, 30%, 0.3)`);
                ctx.fillStyle = grad;
                ctx.fillRect(bx, MT + DH - barHeight, Math.max(Math.ceil(bw), 1), barHeight);
            }
        }
    } else {
        // ── Generator: draw painted spectrum bars + live analyser overlay ────

        // Painted bars (white)
        for (let k = 0; k < NUM_OSCS; k++) {
            const amp = generatorSpectrum[k];
            if (amp <= 0) continue;

            const freq = oscFrequencies[k];
            const xN   = freqToXNorm(freq, maxFreq);

            // Bar width spans to next oscillator
            let bw;
            if (k < NUM_OSCS - 1) {
                const xN2 = freqToXNorm(oscFrequencies[k + 1], maxFreq);
                bw = (xN2 - xN) * DW;
            } else {
                bw = DW * 0.02;
            }

            const bx        = ML + xN * DW;
            const barHeight = amp * DH;

            const hue = 180 + k * (180 / NUM_OSCS);
            const grad = ctx.createLinearGradient(0, MT + DH - barHeight, 0, MT + DH);
            grad.addColorStop(0, `hsla(${hue}, 90%, 65%, 0.95)`);
            grad.addColorStop(1, `hsla(${hue}, 90%, 35%, 0.3)`);
            ctx.fillStyle = grad;
            ctx.fillRect(bx, MT + DH - barHeight, Math.max(Math.ceil(bw), 1), barHeight);
        }

        // Live FFT overlay (thin cyan line)
        analyser.getByteFrequencyData(dataArray);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
        ctx.lineWidth = 1.5;
        let started = false;
        for (let i = 0; i < bufferLength; i++) {
            const f   = (i * maxFreq) / bufferLength;
            const xN  = freqToXNorm(f, maxFreq);
            const bx  = ML + xN * DW;
            const y   = MT + DH - (dataArray[i] / 255) * DH;
            if (!started) { ctx.moveTo(bx, y); started = true; }
            else ctx.lineTo(bx, y);
        }
        ctx.stroke();
    }

    ctx.restore();
}

// ─── Animation loop ───────────────────────────────────────────────────────────

function animate() {
    drawTimeDomain();
    drawFrequency();
    animationId = requestAnimationFrame(animate);
}

function startVisualization() {
    animate();
}

function stopVisualization() {
    stopAll();
    // Clear canvases
    ['timeCanvas', 'freqCanvas'].forEach(id => {
        const c = document.getElementById(id);
        c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
}

// =============================================================================
// 7. LOOP DE ANIMAÇÃO E INTERAÇÃO COM O USUÁRIO (EVENTOS)
// =============================================================================

function getCanvasPaintCoords(e) {
    const rect   = freqCanvas.getBoundingClientRect();
    const scaleX = WIDTH  / rect.width;
    const scaleY = HEIGHT / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top)  * scaleY;
    return { cx, cy };
}

function paintAtCoords(cx, cy) {
    if (!audioContext || currentMode !== 'generator') return;
    if (cx < ML || cx > ML + DW || cy < MT || cy > MT + DH) return;

    const maxFreq = audioContext.sampleRate / 2;
    const xNorm   = (cx - ML) / DW;
    const yNorm   = 1 - (cy - MT) / DH;   // 0 = silent, 1 = max
    const amp     = Math.max(0, Math.min(1, yNorm));

    const targetFreq = xNormToFreq(xNorm, maxFreq);
    const idx        = freqToOscIndex(targetFreq);

    generatorSpectrum[idx] = amp;
    oscGains[idx].gain.setTargetAtTime(amp * 0.4, audioContext.currentTime, 0.02);
}

freqCanvas.addEventListener('mousedown', e => {
    if (currentMode !== 'generator') return;
    isDrawing = true;
    const { cx, cy } = getCanvasPaintCoords(e);
    paintAtCoords(cx, cy);
});

freqCanvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const { cx, cy } = getCanvasPaintCoords(e);
    paintAtCoords(cx, cy);
});

freqCanvas.addEventListener('mouseup',    () => { isDrawing = false; });
freqCanvas.addEventListener('mouseleave', () => { isDrawing = false; });

// Touch support
freqCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    if (currentMode !== 'generator') return;
    isDrawing = true;
    const touch = e.touches[0];
    const { cx, cy } = getCanvasPaintCoords(touch);
    paintAtCoords(cx, cy);
}, { passive: false });

freqCanvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const { cx, cy } = getCanvasPaintCoords(touch);
    paintAtCoords(cx, cy);
}, { passive: false });

freqCanvas.addEventListener('touchend', () => { isDrawing = false; });

// ─── Button wiring ────────────────────────────────────────────────────────────

startButton.addEventListener('click', () => {
    if (currentMode === 'analysis') initAnalysis();
    else initGenerator();
});

stopButton.addEventListener('click', stopVisualization);
stopButton.disabled = true;

modeButton.addEventListener('click', () => {
    const next = currentMode === 'analysis' ? 'generator' : 'analysis';
    setMode(next);
});

clearButton.addEventListener('click', () => {
    if (currentMode === 'generator') clearGeneratorSpectrum();
});

scaleButton.addEventListener('click', () => {
    isLogScale = !isLogScale;
    scaleButton.textContent = `Escala: ${isLogScale ? 'Logarítmica' : 'Linear'}`;
});

// Initialise UI text
setMode('analysis');
