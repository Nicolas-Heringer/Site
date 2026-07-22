const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    // Usa as dimensões do próprio canvas calculadas pelo CSS
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
}
window.addEventListener('resize', () => requestAnimationFrame(resizeCanvas));
// Aguarda o layout ser renderizado antes de medir
requestAnimationFrame(resizeCanvas);

// Referências aos controles
const showPositionCheckbox = document.getElementById('showPosition');
const showVelocityCheckbox = document.getElementById('showVelocity');

// Função para projetar um ponto 3D em 2D
function project3DTo2D(x, y, z) {
    const focalLength = 500; // Distância focal
    const scale = focalLength / (focalLength + z + 500); // Ajustado para evitar div por 0
    return {
        x: x * scale + canvas.width / 2,
        y: y * scale + canvas.height / 2
    };
}

class Planet {
    constructor(x, y, z, vx, vy, vz, mass) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.mass = mass;
    }

    // Função para atualizar a posição do planeta
    update(dt, sun) {
        const G = 1; // Constante gravitacional (simplificada)
        const dx = sun.x - this.x;
        const dy = sun.y - this.y;
        const dz = sun.z - this.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const force = (G * sun.mass * this.mass) / (distance * distance);

        const ax = (force * dx) / distance;
        const ay = (force * dy) / distance;
        const az = (force * dz) / distance;

        this.vx += ax * dt;
        this.vy += ay * dt;
        this.vz += az * dt;

        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;
    }

    // Função para desenhar o planeta
    draw() {
        const pos = project3DTo2D(this.x, this.y, this.z);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00aaff';
        ctx.fill();
        ctx.closePath();
    }
}

// Definição do Sol
const sun = {
    x: 0,
    y: 0,
    z: 0,
    mass: 1000
};

// Criação de um planeta
const planet = new Planet(200, 0, 0, 0, 5, 0, 10);

// Configuração global do Chart.js para melhorar leitura no tema escuro
Chart.defaults.color = '#f0f0f0';
Chart.defaults.font.size = 14;

// Gráfico de Energia Cinética
let kineticChart = null;
const ctxKinetic = document.getElementById('kineticChart');
if (ctxKinetic) {
    kineticChart = new Chart(ctxKinetic.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Energia Cinética (K)',
                borderColor: '#ff4d4d',
                data: [],
                fill: false,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { display: false },
                y: {
                    title: { display: true, text: 'Energia (J)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { font: { size: 16 } } }
            }
        }
    });
}

// Gráfico de Energia Potencial
let potentialChart = null;
const ctxPotential = document.getElementById('potentialChart');
if (ctxPotential) {
    potentialChart = new Chart(ctxPotential.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Energia Potencial (U)',
                borderColor: '#4d4dff',
                data: [],
                fill: false,
                pointRadius: 0,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: { display: false },
                y: {
                    title: { display: true, text: 'Energia (J)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                }
            },
            plugins: {
                legend: { labels: { font: { size: 16 } } }
            }
        }
    });
}

let frameCount = 0;

function updateChart() {
    if (!kineticChart || !potentialChart) return;
    
    // K = 1/2 m v^2
    const v2 = planet.vx * planet.vx + planet.vy * planet.vy + planet.vz * planet.vz;
    const K = 0.5 * planet.mass * v2;

    // U = - G M m / r
    const dx = sun.x - planet.x;
    const dy = sun.y - planet.y;
    const dz = sun.z - planet.z;
    const r = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const U = - (1 * sun.mass * planet.mass) / r;

    // Atualiza o gráfico a cada 5 frames para ficar mais suave
    if (frameCount % 5 === 0) {
        kineticChart.data.labels.push(frameCount);
        potentialChart.data.labels.push(frameCount);

        kineticChart.data.datasets[0].data.push(K);
        potentialChart.data.datasets[0].data.push(U);

        // Manter os últimos 100 pontos
        if (kineticChart.data.labels.length > 100) {
            kineticChart.data.labels.shift();
            kineticChart.data.datasets[0].data.shift();
            
            potentialChart.data.labels.shift();
            potentialChart.data.datasets[0].data.shift();
        }
        kineticChart.update();
        potentialChart.update();
    }
    frameCount++;
}

// Função para desenhar vetores
function drawArrow(x0, y0, x1, y1, color) {
    const headlen = 8; // tamanho da ponta da seta
    const angle = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - headlen * Math.cos(angle - Math.PI / 6), y1 - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 - headlen * Math.cos(angle + Math.PI / 6), y1 - headlen * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Atualizar o planeta
    planet.update(0.1, sun);
    
    // Atualizar Gráfico
    updateChart();

    // Projetar posições
    const sunPos = project3DTo2D(sun.x, sun.y, sun.z);
    const planetPos = project3DTo2D(planet.x, planet.y, planet.z);

    // Desenhar Vetor Posição (do sol ao planeta)
    if (showPositionCheckbox && showPositionCheckbox.checked) {
        drawArrow(sunPos.x, sunPos.y, planetPos.x, planetPos.y, '#2eb82e'); // Verde
    }

    // Desenhar o Sol
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffcc00';
    ctx.fill();
    ctx.closePath();
    ctx.shadowBlur = 0; // Resetar sombra

    // Desenhar o planeta
    planet.draw();

    // Desenhar Vetor Velocidade
    if (showVelocityCheckbox && showVelocityCheckbox.checked) {
        const velScale = 15; // Escalar para visualizar a velocidade
        const vEnd3D = {
            x: planet.x + planet.vx * velScale,
            y: planet.y + planet.vy * velScale,
            z: planet.z + planet.vz * velScale
        };
        const vEnd2D = project3DTo2D(vEnd3D.x, vEnd3D.y, vEnd3D.z);
        drawArrow(planetPos.x, planetPos.y, vEnd2D.x, vEnd2D.y, '#ff4d4d'); // Vermelho
    }

    requestAnimationFrame(animate);
}

animate();