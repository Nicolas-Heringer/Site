let grade = [];
let tamanhoGrade = 50;
let tamanhoPonto = 10;

function setup() {
  createCanvas(800, 800);
  noStroke();
  for (let i = 0; i < tamanhoGrade; i++) {
    for (let j = 0; j < tamanhoGrade; j++) {
      let x = map(i, 0, tamanhoGrade - 1, 0, width);
      let y = map(j, 0, tamanhoGrade - 1, 0, height);
      grade.push(new Ponto(x, y));
    }
  }
}

function draw() {
  background(120);
  for (let ponto of grade) {
    ponto.atualizar();
    ponto.exibir();
  }
  creditos()
}

function mouseMoved() {
  for (let ponto of grade) {
    let d = dist(mouseX, mouseY, ponto.x, ponto.y);
    if (d < 100) {
      // Atração quando o mouse está próximo
      let angulo = atan2(mouseY - ponto.y, mouseX - ponto.x);
      ponto.velocidadeX += cos(angulo) * 0.5;
      ponto.velocidadeY += sin(angulo) * 0.5;
    }
  }
}

function creditos() {
  // Desenha um retângulo no canto inferior direito
  stroke(0); //Borda preta
  fill(50, 50, 50);//
  rect(width - 142, height - 20, 255, 55);

  // Define as configurações de texto
  noStroke();
  textSize(12);
  textAlign(RIGHT, BOTTOM);
  fill(255);

  // Escreve o nome e o e-mail no retângulo
  text("nicolasheringer@ufmg.br", width - 5, height - 5);

}

class Ponto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.velocidadeX = random(-1, 1);
    this.velocidadeY = random(-1, 1);
    this.posicaoOriginalX = x;
    this.posicaoOriginalY = y;
  }

  atualizar() {
    this.x += this.velocidadeX;
    this.y += this.velocidadeY;

    // Mantém os pontos dentro do canvas
    this.x = constrain(this.x, 0, width);
    this.y = constrain(this.y, 0, height);

    // Movimento aleatório
    if (random(1) < 0.02) {
      this.velocidadeX = random(-1, 1);
      this.velocidadeY = random(-1, 1);
    }
  }

  exibir() {
    fill(120,0,120);
    ellipse(this.x, this.y, tamanhoPonto, tamanhoPonto);
  }
}
