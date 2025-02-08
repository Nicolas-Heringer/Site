const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const timeCanvas = document.getElementById('timeCanvas');
const freqCanvas = document.getElementById('freqCanvas');

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
    } catch(err) {
        alert('Erro ao acessar o microfone: ' + err.message);
    }
}

function drawTimeDomain() {
    const ctx = timeCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Desenha a grade
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    for(let x = 0; x <= WIDTH; x += WIDTH/4) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
    }
    for(let y = 0; y <= HEIGHT; y += HEIGHT/2) {
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();

    // Desenha a forma de onda
    analyser.getByteTimeDomainData(dataArray);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(200, 80, 80)';
    ctx.beginPath();
    
    const sliceWidth = WIDTH / bufferLength;
    let x = 0;
    
    for(let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0 - 1;
        const y = (v * HEIGHT/2) + HEIGHT/2;
        
        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.stroke();

    // Escala de tempo
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    for(let t = 0; t <= 1000; t += 200) {
        const xPos = (t / 1000) * WIDTH;
        ctx.fillText(t + 'ms', xPos, HEIGHT - 5);
    }
}

function drawFrequency() {
    const ctx = freqCanvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Desenha a grade
    ctx.strokeStyle = '#eee';
    ctx.beginPath();
    for(let x = 0; x <= WIDTH; x += WIDTH/4) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
    }
    for(let y = 0; y <= HEIGHT; y += HEIGHT/4) {
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();

    // Desenha o espectro
    analyser.getByteFrequencyData(dataArray);
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let x = 0;
    
    // Calcula a escala de frequência
    const maxFreq = audioContext.sampleRate/2;
    
    for(let i = 0; i < bufferLength; i++) {
        const freq = (i * maxFreq) / bufferLength;
        const barHeight = (dataArray[i] / 255) * HEIGHT;
        
        const gradient = ctx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT);
        gradient.addColorStop(0, `hsl(${i * 2}, 100%, 50%)`);
        gradient.addColorStop(1, `hsl(${i * 2}, 100%, 20%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
    }

    // Escala de frequência
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    const freqLabels = [100, 500, 1000, 2000, 4000, 8000, 16000];
    freqLabels.forEach(freq => {
        const xPos = (freq / maxFreq) * WIDTH;
        if(freq >= 1000) {
            ctx.fillText((freq/1000) + 'kHz', xPos - 20, HEIGHT - 5);
        } else {
            ctx.fillText(freq + 'Hz', xPos - 15, HEIGHT - 5);
        }
    });

    // Escala de dB
    ctx.textAlign = 'right';
    for(let dB = -100; dB <= 0; dB += 20) {
        const yPos = HEIGHT - ((dB + 100) * HEIGHT/100);
        ctx.fillText(dB + ' dB', WIDTH - 5, yPos + 4);
    }
    ctx.textAlign = 'left';
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
    if(audioContext) {
        audioContext.close();
    }
    startButton.disabled = false;
    stopButton.disabled = true;
}

startButton.addEventListener('click', initAudio);
stopButton.addEventListener('click', stopVisualization);
stopButton.disabled = true;
