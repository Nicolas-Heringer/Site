let particulas = [];
numParticulas = document.getElementById('num-particulas').value;
temperatura = document.getElementById('temperatura').value;
let graficoTemperatura, graficoEnergia;
let dadosTemperatura = [];
let dadosEnergia = [];
let tempo = 0;
let intervaloAtualizacao = 5;
let simular = false;

function setup() {
    const canvas = createCanvas(800, 400);
    canvas.parent('simulacao-container');
}

function draw() {
    if (!simular) return; // Verificação para continuar a simulação

    background(51);
    
    for (let i = 0; i < particulas.length; i++) {
        particulas[i].mover();
        particulas[i].mostrar();
        for (let j = i + 1; j < particulas.length; j++) {
            particulas[i].interagir(particulas[j]);
        }
    }
    
    if (frameCount % intervaloAtualizacao === 0) {
        atualizarGraficos();
    }
    console.log("Executando simulação de partículas.")
}

class Particula {
    constructor(x, y, vx, vy) {
        this.pos = createVector(x, y);
        this.vel = createVector(vx, vy);
        this.acc = createVector(0, 0);
    }

    mover() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.bordas();
    }

    aplicarForca(f) {
        this.acc.add(f);
    }

    interagir(outra) {
        let dir = p5.Vector.sub(outra.pos, this.pos);
        let d = dir.mag();
        d = constrain(d, 1, 500);
        let forca = 1 / (d * d);
        dir.setMag(forca);
        outra.aplicarForca(dir);
        dir.mult(-1);
        this.aplicarForca(dir);
    }

    bordas() {
        if (this.pos.x > width) this.pos.x = 0;
        if (this.pos.x < 0) this.pos.x = width;
        if (this.pos.y > height) this.pos.y = 0;
        if (this.pos.y < 0) this.pos.y = height;
    }

    mostrar() {
        stroke(255);
        strokeWeight(2);
        fill(255);
        ellipse(this.pos.x, this.pos.y, 8, 8);
    }
}

function inicializarParticulas() {
    particulas = [];
    for (let i = 0; i < numParticulas; i++) {
        for(let j = 0; j< numParticulas; j++) {
            let x = width/2 - (numParticulas*10)/2 + i*10;
            let y = height/2 - (numParticulas*10)/2 + j*10;
            let vx = random(0, 0);
            let vy = random(0, 0);
            particulas.push(new Particula(x, y, vx, vy));
        }
    }
}

function criarParticula() {
    let x = random(width);
    let y = random(height);
    let vx = random(-1, 1);
    let vy = random(-1, 1);
    return new Particula(x, y, vx, vy);
}

function iniciarSimulacao() {
    numParticulas = document.getElementById('num-particulas').value;
    temperatura = document.getElementById('temperatura').value;
    simular = true;
    inicializarGraficos();
    inicializarParticulas();
    normalizaTemperatura(temperatura)
    loop();
}

function pausarSimulacao() {
    simular = false;
    noLoop();
}

function reiniciarSimulacao() {
    numParticulas = document.getElementById('num-particulas').value;
    temperatura = document.getElementById('temperatura').value;
    inicializarParticulas();
    dadosTemperatura = [];
    dadosEnergia = [];
    tempo = 0;
    graficoTemperatura.data.labels = [];
    graficoTemperatura.data.datasets[0].data = [];
    graficoEnergia.data.labels = [];
    graficoEnergia.data.datasets[0].data = [];
    graficoTemperatura.update();
    graficoEnergia.update();
}

function inicializarGraficos() {
    let ctxTemp = document.getElementById('grafico-temperatura').getContext('2d');
    graficoTemperatura = new Chart(ctxTemp, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Temperatura',
                data: [],
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    let ctxEnergia = document.getElementById('grafico-energia').getContext('2d');
    graficoEnergia = new Chart(ctxEnergia, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Energia Potencial',
                data: [],
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom'
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function atualizarGraficos() {
    let temperaturaAtual = calcularTemperatura();
    let energiaPotencialAtual = calcularEnergiaPotencial();

    dadosTemperatura.push(temperaturaAtual);
    dadosEnergia.push(energiaPotencialAtual);
    tempo++;

    graficoTemperatura.data.labels.push(tempo);
    graficoTemperatura.data.datasets[0].data.push(temperaturaAtual);
    graficoTemperatura.update();

    graficoEnergia.data.labels.push(tempo);
    graficoEnergia.data.datasets[0].data.push(energiaPotencialAtual);
    graficoEnergia.update();
}

function calcularTemperatura() {
    let somaVelocidades = 0;
    for (let particula of particulas) {
        somaVelocidades += particula.vel.magSq();
    }
    return (somaVelocidades / particulas.length);
}

function normalizaTemperatura(temperatura) {
    // body...
}

function calcularEnergiaPotencial() {
    let energiaPotencial = 0;
    for (let i = 0; i < particulas.length; i++) {
        for (let j = i + 1; j < particulas.length; j++) {
            let dist = p5.Vector.dist(particulas[i].pos, particulas[j].pos);
            energiaPotencial += 1 / dist;
        }
    }
    return energiaPotencial;
}