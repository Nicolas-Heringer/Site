const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Função para projetar um ponto 3D em 2D
function project3DTo2D(x, y, z) {
    const focalLength = 500; // Distância focal
    const scale = focalLength / (focalLength + z);
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
        ctx.fillStyle = 'blue';
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

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar o Sol
    const sunPos = project3DTo2D(sun.x, sun.y, sun.z);
    ctx.beginPath();
    ctx.arc(sunPos.x, sunPos.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
    ctx.closePath();

    // Atualizar e desenhar o planeta
    planet.update(0.1, sun);
    planet.draw();

    requestAnimationFrame(animate);
}

animate();