const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const timeCanvas = document.getElementById('timeCanvas');
const freqCanvas = document.getElementById('freqCanvas');
const scaleButton = document.getElementById('scaleButton');

const WIDTH = 800;
const HEIGHT = 300;
const MARGIN = 40;

timeCanvas.width = freqCanvas.width = WIDTH;
timeCanvas.height = freqCanvas.height = HEIGHT;

let audioContext;
let analyser;
let dataArray;
let animationId;
let bufferLength;
let isLogScale = false;

async function initAudio() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();

        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 2048;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        startVisualization();
        startButton.disabled = true;
        stopButton.disabled = false;
    } catch (err) {
        alert('Erro ao acessar o microfone: ' + err.message);
    }
}

function drawTimeDomain() {
    const ctx = timeCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const MARGIN_LEFT = 60;
    const MARGIN_BOTTOM = 50;
    const MARGIN_TOP = 20;
    const MARGIN_RIGHT = 20;
    const DRAW_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const DRAW_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

    // Desenha a grade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Linhas verticais e labels de tempo (X)
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 1000; t += 200) {
        const xPos = MARGIN_LEFT + (t / 1000) * DRAW_WIDTH;
        ctx.moveTo(xPos, MARGIN_TOP);
        ctx.lineTo(xPos, MARGIN_TOP + DRAW_HEIGHT);
        ctx.fillText(t + 'ms', xPos, HEIGHT - 20);
    }

    // Título do eixo X
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Tempo (ms)', MARGIN_LEFT + DRAW_WIDTH / 2, HEIGHT - 5);

    // Linhas horizontais e labels de amplitude (Y)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    const amplitudes = [-1, -0.5, 0, 0.5, 1];
    amplitudes.forEach(amp => {
        const yPos = MARGIN_TOP + (1 - (amp + 1) / 2) * DRAW_HEIGHT;
        ctx.moveTo(MARGIN_LEFT, yPos);
        ctx.lineTo(MARGIN_LEFT + DRAW_WIDTH, yPos);
        ctx.fillText(amp.toFixed(1), MARGIN_LEFT - 10, yPos);
    });

    ctx.stroke();

    // Título do eixo Y
    ctx.save();
    ctx.translate(15, MARGIN_TOP + DRAW_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Amplitude', 0, 0);
    ctx.restore();

    // Desenha a forma de onda
    analyser.getByteTimeDomainData(dataArray);

    ctx.save(); // Salvar contexto para o clip
    ctx.beginPath();
    ctx.rect(MARGIN_LEFT, MARGIN_TOP, DRAW_WIDTH, DRAW_HEIGHT);
    ctx.clip();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00ffcc'; // Cor neon
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ffcc';
    ctx.beginPath();

    const sliceWidth = DRAW_WIDTH / bufferLength;
    let x = MARGIN_LEFT;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 - 1;
        const y = MARGIN_TOP + (1 - (v + 1) / 2) * DRAW_HEIGHT;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.stroke();
    ctx.restore(); // Remover clip e shadow
}

function drawFrequency() {
    const ctx = freqCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const MARGIN_LEFT = 60;
    const MARGIN_BOTTOM = 50;
    const MARGIN_TOP = 20;
    const MARGIN_RIGHT = 20;
    const DRAW_WIDTH = WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
    const DRAW_HEIGHT = HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

    const maxFreq = audioContext.sampleRate / 2;
    const minFreqLog = 20; // 20 Hz minimum for log scale

    // Desenha a grade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Linhas verticais e labels de frequência (X)
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    let xTicks = [100, 500, 1000, 2000, 4000, 8000, 16000];
    if (!isLogScale) {
        xTicks = [0, 4000, 8000, 12000, 16000, 20000].filter(f => f <= maxFreq);
    }

    xTicks.forEach(freq => {
        let xPos;
        if (isLogScale) {
            const logMin = Math.log10(minFreqLog);
            const logMax = Math.log10(maxFreq);
            xPos = ((Math.log10(Math.max(freq, minFreqLog)) - logMin) / (logMax - logMin)) * DRAW_WIDTH;
        } else {
            xPos = (freq / maxFreq) * DRAW_WIDTH;
        }

        const absoluteX = MARGIN_LEFT + xPos;
        ctx.moveTo(absoluteX, MARGIN_TOP);
        ctx.lineTo(absoluteX, MARGIN_TOP + DRAW_HEIGHT);

        const text = freq >= 1000 ? (freq / 1000) + 'kHz' : freq + 'Hz';
        ctx.fillText(text, absoluteX, MARGIN_TOP + DRAW_HEIGHT + 8);
    });

    // Título eixo X
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Frequência (Hz)', MARGIN_LEFT + DRAW_WIDTH / 2, HEIGHT - 15);

    // Linhas horizontais e labels de dB (Y)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#aaa';
    ctx.font = '12px Arial';
    for (let dB = -100; dB <= 0; dB += 20) {
        const yPos = MARGIN_TOP + DRAW_HEIGHT - ((dB + 100) / 100) * DRAW_HEIGHT;
        ctx.moveTo(MARGIN_LEFT, yPos);
        ctx.lineTo(MARGIN_LEFT + DRAW_WIDTH, yPos);
        ctx.fillText(dB + ' dB', MARGIN_LEFT - 10, yPos);
    }
    ctx.stroke();

    // Título eixo Y
    ctx.save();
    ctx.translate(5, MARGIN_TOP + DRAW_HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Intensidade (dB)', 0, 0);
    ctx.restore();

    // Desenha o espectro
    analyser.getByteFrequencyData(dataArray);

    ctx.save();
    ctx.beginPath();
    ctx.rect(MARGIN_LEFT, MARGIN_TOP, DRAW_WIDTH, DRAW_HEIGHT);
    ctx.clip();

    for (let i = 0; i < bufferLength; i++) {
        const f_low = (i * maxFreq) / bufferLength;
        const f_high = ((i + 1) * maxFreq) / bufferLength;

        let x, nextX, barWidth;

        if (isLogScale) {
            const logMin = Math.log10(minFreqLog);
            const logMax = Math.log10(maxFreq);

            const logF_low = Math.log10(Math.max(f_low, minFreqLog));
            const logF_high = Math.log10(Math.max(f_high, minFreqLog));

            x = ((logF_low - logMin) / (logMax - logMin)) * DRAW_WIDTH;
            nextX = ((logF_high - logMin) / (logMax - logMin)) * DRAW_WIDTH;
            barWidth = nextX - x;
        } else {
            x = (f_low / maxFreq) * DRAW_WIDTH;
            nextX = (f_high / maxFreq) * DRAW_WIDTH;
            barWidth = nextX - x;
        }

        const barHeight = (dataArray[i] / 255) * DRAW_HEIGHT;

        if (x < DRAW_WIDTH && barWidth > 0 && barHeight > 0) {
            const absoluteX = MARGIN_LEFT + x;

            const gradient = ctx.createLinearGradient(0, MARGIN_TOP + DRAW_HEIGHT - barHeight, 0, MARGIN_TOP + DRAW_HEIGHT);
            gradient.addColorStop(0, `hsla(${i * 2}, 100%, 60%, 1)`);
            gradient.addColorStop(1, `hsla(${i * 2}, 100%, 30%, 0.3)`);

            ctx.fillStyle = gradient;
            ctx.fillRect(absoluteX, MARGIN_TOP + DRAW_HEIGHT - barHeight, Math.ceil(barWidth), barHeight);
        }
    }
    ctx.restore();
}

function animate() {
    drawTimeDomain();
    drawFrequency();
    animationId = requestAnimationFrame(animate);
}

function startVisualization() {
    animate();
}

function stopVisualization() {
    cancelAnimationFrame(animationId);
    if (audioContext) {
        audioContext.close();
    }
    startButton.disabled = false;
    stopButton.disabled = true;
}

startButton.addEventListener('click', initAudio);
stopButton.addEventListener('click', stopVisualization);
stopButton.disabled = true;

if (scaleButton) {
    scaleButton.addEventListener('click', () => {
        isLogScale = !isLogScale;
        scaleButton.textContent = `Escala: ${isLogScale ? 'Logarítmica' : 'Linear'}`;
    });
}
