let circulos = []; // Array para armazenar os círculos
const c = 50; // Velocodade de propagação do circulo
let t = 0;
let dt=0.2
let aSerRemovido = false; // Condição de remoçao da cinrcunferência quando já fora da tela
let tamanhoCanva = 600; // Tamano da tela

function setup() {
  const canvas = createCanvas(tamanhoCanva, tamanhoCanva); // Cria a tela, note o fator multiplicativo
  canvas.parent('ondas-container')
}

function draw() {
  background(50); //Cor de fundo cinza
 
  // Emite o campo nas posição fixadas
  //emiteCampo(tamanhoCanva/2, tamanhoCanva/2+100,t);
  //emiteCampo(tamanhoCanva/2, tamanhoCanva/2-100,t);
  //emiteCampo(tamanhoCanva-tamanhoCanva/2+100, tamanhoCanva-tamanhoCanva/2,t);
  //emiteCampo(tamanhoCanva-tamanhoCanva/2-100, tamanhoCanva-tamanhoCanva/2,t);
  //emiteCampo(tamanhoCanva-tamanhoCanva/2, tamanhoCanva-tamanhoCanva/2,t);
  
  // Emite o campo da posição mouseX e mouseY
  emiteCampo(mouseX, mouseY,t);
  
  for (let i = circulos.length - 1; i >= 0; i--) {
    let circle = circulos[i];
    
    //Aqui, para cada circulo da lista de circulos as funções abaixo são rodadas
    circle.propagaCampo(); //Propaga radialmente
    circle.mostra(); //Atualiza a posição na tela
    circle.checarTempo(); //Checa se o tempo decorrido do início foi suficiente para a onda sair da tela

    if (circle.aSerRemovido) {
      circulos.splice(i, 1); // Remove o círculo da lista
    }

    t += dt;
    //console.log(t); //Debug
  }

  fill(0, 0, 255, 125); // cor do preenchimento, 4° parâmetro é o alfa
  stroke(255, 0, 255); // cor da linha de contorno, 4° parâmetro é o alfa
  tamanho_do_circulo = random(20, 35); // Oscila o raio
  circle(mouseX, mouseY, tamanho_do_circulo); // Círculo maior
  circle(mouseX, mouseY, 20); // Círculo menor

  creditos()

}

function emiteCampo(a, b) {
  let novoCirculo = new criaCirculo(a, b, t); // Cria uma onda no ponto (a,b), e no tempo t
  circulos.push(novoCirculo);
}

function mouseClicked() {
  emiteCampo(mouseX,mouseY)
  //emiteCampo(2*tamanhoCanva-mouseX,mouseY) //direita
  //emiteCampo(-mouseX,mouseY) //esquerda
  //emiteCampo(mouseX,2*tamanhoCanva-mouseY) //baixo
  //emiteCampo(mouseX,-mouseY) //cima
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

class criaCirculo {
  constructor(x, y, t) {
    this.x = x; // Posição x atual do círculo
    this.y = y; // Posição x atual inicial do círculo
    this.t = t; // Instante em que o círculo foi criado
    this.raio = 0; // Tamanho inicial do círculo
    this.x0= x; //Posição x inicial
    this.y0= y; //Posição y inicial
  }

  checarTempo() {
    if (this.raio > 1.25*tamanhoCanva) {
      this.aSerRemovido = true; //Condição de remoçao: se o circulo já estiver fora da tela
    }
  }

  propagaCampo() {
    this.raio += c*dt//c*(t-this.t); // Aumenta o raio do círculo
    //console.log(t-this.t)
  }

  mostra() {
    noFill(0);
    stroke(220, 100, 220, 255);
    ellipse(this.x, this.y, this.raio * 2, this.raio * 2);
  }
  
  

}
