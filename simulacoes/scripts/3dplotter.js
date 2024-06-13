function setup() {
    let canvas = createCanvas(600, 600, WEBGL);
    canvas.parent("espacoSim"); // Associe o canvas à div com ID "meuCanvas"
    normalMaterial();
    noStroke();
  }

  function densidade(x,y,z) {
    let d = sqrt(x*x + y*y +z*z);
    let rho = (10)/(d);
    return rho;
  }

  function draw() {
    background(100);
    orbitControl();
    //rotateX(frameCount * 0.01);
    //rotateY(frameCount * 0.05)
    //rotateZ(frameCount * 0.01);

    let passo = 10;
    let L = 15;
    for (var i = -L; i <= L; i++) {
      let x = i * passo * 2;
      for (var j = -L; j <= L; j++) {
        let y = j * passo * 2;
        for (var k = -L; k <= L; k++) {
          let z = k*passo *2;
          
          translate(x,y,z);
          
          let rho = densidade(x,y,z);
          let tamanhoPonto = map(rho, 0, 2, 0.5, 20);
          let opacidadePonto = map(tamanhoPonto, 0.1, 5, 1, 255);
          
          fill(0,0,255,opacidadePonto)
          
          sphere(tamanhoPonto);
          translate(-x,-y,-z);
        }
      }        
    }
  }