const canvas = document.getElementById('drudeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// Elementos da UI
const inputCampo = document.getElementById('campoEletrico');
const valCampo = document.getElementById('valCampo');
const inputTemp = document.getElementById('temperatura');
const valTemp = document.getElementById('valTemp');
const selectRede = document.getElementById('tipoRede');
let campoEletrico = parseFloat(inputCampo.value);
let temperatura = parseFloat(inputTemp.value);
let tipoRede = selectRede.value;

inputCampo.addEventListener('input', (e) => {
    campoEletrico = parseFloat(e.target.value);
    valCampo.innerText = campoEletrico.toFixed(2);
});

inputTemp.addEventListener('input', (e) => {
    temperatura = parseFloat(e.target.value);
    valTemp.innerText = temperatura;
});

selectRede.addEventListener('change', (e) => {
    tipoRede = e.target.value;
    iniciarSimulacao();
});

const btnZerar = document.getElementById('btnZerar');
btnZerar.addEventListener('click', () => {
    for (let e of eletrons) {
        e.vx = 0;
        e.vy = 0;
    }
});

// Limites do "Fio"
const wireTop = 150;
const wireBottom = 450;
const wireHeight = wireBottom - wireTop;

class Nucleo {
    constructor(x, y, radius) {
        this.fixedX = x;
        this.fixedY = y;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.faseX = Math.random() * Math.PI * 2;
        this.faseY = Math.random() * Math.PI * 2;
    }

    update() {
        // Agitação térmica - Movimento ao redor do ponto fixo
        let amplitude = temperatura * 0.15;
        // Os átomos oscilam em frequências ligeiramente diferentes
        this.faseX += 0.08 + (Math.random() * 0.04);
        this.faseY += 0.08 + (Math.random() * 0.04);
        this.x = this.fixedX + amplitude * Math.cos(this.faseX);
        this.y = this.fixedY + amplitude * Math.sin(this.faseY);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 150, 150, 0.8)';
        ctx.fill();
        ctx.closePath();
    }
}

class Eletron {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        // Velocidade inicial térmica (aleatória em direção)
        let angle = Math.random() * Math.PI * 2;
        let speed = 1 + (temperatura * 0.05); // Velocidade térmica inicial
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);
    }

    update(nucleos) {
        // Modelo de Drude: Entre as colisões, o elétron sofre a ação do campo elétrico
        // O campo elétrico é definido positivo para a direita. 
        // Aceleração = Força / massa. Aqui simplificamos incrementando a velocidade X.
        this.vx += campoEletrico * 0.05;

        this.x += this.vx;
        this.y += this.vy;

        // Limites do fio (ricocheteia de forma perfeitamente elástica na borda do fio)
        if (this.y - this.radius < wireTop) {
            this.y = wireTop + this.radius;
            this.vy *= -1; // Inversão perfeitamente elástica
        } else if (this.y + this.radius > wireBottom) {
            this.y = wireBottom - this.radius;
            this.vy *= -1;
        }

        // Condições de contorno periódicas em X para simular um fio contínuo
        if (this.x > canvas.width) {
            this.x = 0; // Sai pela direita, entra pela esquerda
            this.vx *= 0.8;
        } else if (this.x < 0) {
            this.x = canvas.width; // Volta pela direita
            this.vx *= 0.8;
        }

        // Colisões apenas com os Núcleos
        for (let n of nucleos) {
            let dx = this.x - n.x;
            let dy = this.y - n.y;
            let dist = Math.hypot(dx, dy);

            if (dist < this.radius + n.radius) {
                // Ao colidir, modelo assume que elétron é re-termalizado (sai em direção aleatória)
                // e "esquece" sua velocidade de deriva anterior.
                let angle = Math.random() * Math.PI * 2;
                let vTermal = 0.5 + (temperatura * 0.05);
                this.vx = vTermal * Math.cos(angle);
                this.vy = vTermal * Math.sin(angle);

                // Evitar que o elétron fique preso dentro do átomo
                let overlap = (this.radius + n.radius) - dist + 1;
                this.x += (dx / dist) * overlap;
                this.y += (dy / dist) * overlap;

                break; // No máximo uma colisão processada por frame para evitar bugs
            }
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 200, 180, 1)';
        ctx.fill();
        ctx.closePath();
    }
}

let nucleos = [];
let eletrons = [];
const numEletrons = 200;

function gerarRede() {
    nucleos = [];
    const rNucleo = 8;
    const paddingX = 40;
    const paddingY = 40;

    // Pequeno offset para centralizar a grade
    const offsetX = 10;
    const offsetY = 10;

    if (tipoRede === 'triangular') {
        let cols = Math.floor(canvas.width / paddingX) + 1;
        let rows = Math.floor(wireHeight / paddingY) + 1;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let x = j * paddingX + offsetX;
                let y = wireTop + i * paddingY + offsetY;
                if (i % 2 !== 0) {
                    x += paddingX / 2;
                }
                // Adiciona apenas se couber dentro do fio (levando em conta raio e oscilação)
                if (y > wireTop + rNucleo * 2 && y < wireBottom - rNucleo * 2 && x < canvas.width + paddingX) {
                    nucleos.push(new Nucleo(x, y, rNucleo));
                }
            }
        }
    } else if (tipoRede === 'hexagonal') {
        // Hexagonal (Grafeno)
        let s = 30; // Lado
        let h = Math.sqrt(3) / 2 * s;
        let cols = Math.floor(canvas.width / (1.5 * s)) + 1;
        let rows = Math.floor(wireHeight / (2 * h)) + 1;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                let cx = j * 1.5 * s + offsetX;
                let cy = wireTop + i * 2 * h + offsetY;

                if (j % 2 !== 0) cy += h;

                if (cy > wireTop + rNucleo * 2 && cy < wireBottom - rNucleo * 2) {
                    nucleos.push(new Nucleo(cx, cy, rNucleo));
                }

                let cy2 = cy + s;
                if (j % 2 === 0) cy2 = cy - s; // alterna posições da segunda partícula
                // (Na verdade, para formar o honeycomb certinho):
                // Vamos usar a regra padrão do favo de mel:
            }
        }
        // Refatorando a malha honeycomb (grafeno) para ser mais precisa:
        nucleos = [];
        const raioFavo = 25;
        const hFavo = Math.sqrt(3) * raioFavo;
        for (let row = 0; row < wireHeight / hFavo + 2; row++) {
            for (let col = 0; col < canvas.width / (1.5 * raioFavo) + 2; col++) {
                let x = col * 1.5 * raioFavo;
                let y = wireTop + row * hFavo;
                if (col % 2 === 1) y += hFavo / 2;

                if (y > wireTop + rNucleo * 2 && y < wireBottom - rNucleo * 2) {
                    nucleos.push(new Nucleo(x, y, rNucleo));
                }
            }
        }

    } else if (tipoRede === 'armchair') {
        // Armchair é análogo a rotacionar a honeycomb em 90 graus.
        const raioFavo = 25;
        const hFavo = Math.sqrt(3) * raioFavo;
        for (let row = 0; row < wireHeight / (1.5 * raioFavo) + 2; row++) {
            for (let col = 0; col < canvas.width / hFavo + 2; col++) {
                let y = wireTop + row * 1.5 * raioFavo;
                let x = col * hFavo;
                if (row % 2 === 1) x += hFavo / 2;

                if (y > wireTop + rNucleo * 2 && y < wireBottom - rNucleo * 2) {
                    nucleos.push(new Nucleo(x, y, rNucleo));
                }
            }
        }
    }
}

function iniciarSimulacao() {
    gerarRede();
    eletrons = [];
    for (let i = 0; i < numEletrons; i++) {
        let x = Math.random() * canvas.width;
        let y = wireTop + 10 + Math.random() * (wireHeight - 20); // Distribui os elétrons dentro do fio
        eletrons.push(new Eletron(x, y));
    }
}

function desenharFundo() {
    // Background geral
    ctx.fillStyle = 'rgba(20,20,20,1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cor do Fio
    ctx.fillStyle = 'rgba(30, 30, 30, 1)';
    ctx.fillRect(0, wireTop, canvas.width, wireHeight);

    // Bordas do fio
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, wireTop);
    ctx.lineTo(canvas.width, wireTop);
    ctx.moveTo(0, wireBottom);
    ctx.lineTo(canvas.width, wireBottom);
    ctx.stroke();

    // Opcional: Desenhar setas de Campo Elétrico no fundo
    if (Math.abs(campoEletrico) > 0.001) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;

        const eAbs = Math.abs(campoEletrico);
        const dir = Math.sign(campoEletrico);

        // Tamanho proporcional ao campo, max 40 para E=0.5
        const arrowLen = Math.max(5, eAbs * 80);
        const headSize = Math.max(3, arrowLen * 0.25);

        let startX = (Date.now() / 20 * campoEletrico) % 60;
        if (startX < 0) startX += 60;

        for (let y = wireTop + 20; y < wireBottom; y += 40) {
            for (let x = startX - 60; x < canvas.width + 60; x += 60) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + dir * arrowLen, y);
                ctx.lineTo(x + dir * (arrowLen - headSize), y - headSize);
                ctx.moveTo(x + dir * arrowLen, y);
                ctx.lineTo(x + dir * (arrowLen - headSize), y + headSize);
                ctx.stroke();
            }
        }
    }
}

function update() {
    for (let n of nucleos) n.update();
    for (let e of eletrons) e.update(nucleos);
}

function draw() {
    desenharFundo();
    // Desenha primeiro os núcleos, depois os elétrons
    for (let n of nucleos) n.draw(ctx);
    for (let e of eletrons) e.draw(ctx);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Inicia
iniciarSimulacao();
loop();