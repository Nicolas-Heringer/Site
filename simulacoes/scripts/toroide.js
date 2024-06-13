function setup() {
    let canvas = createCanvas(600, 600, WEBGL);
    canvas.parent("espacoSim"); // Associe o canvas à div com ID "meuCanvas"
    normalMaterial();
    noStroke();
  }

  function densidade(x,y,z) {
    let d = sqrt(x*x + y*y +z*z);
    //let rho = (10)/(sqrt(x*x + y*y +z*z));
    let rho = 1
    return rho;
  }

  function draw() {
    background(20);
    orbitControl();
    //rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.05)
    //rotateZ(frameCount * 0.01);

    let passo = 2;
    let L = 15  ;
    let h =8;
    let r=50;
    for (var i = -L; i <= L; i++) {
      let x = i * passo * 2;
      for (var j = -L; j <= L; j++) {
        let y = j * passo * 2;
        for (var k = 0; k <= h; k++) {
          

          let z = -sqrt((k)**2 - (r - sqrt(x*x + y*y))**2);
          translate(x,y,z);
          let rho = densidade(x,y,z);
          sphere(rho);
          translate(-2*x,-2*y,-2*z);
          sphere(rho);
          translate(x,y,z);
          //let tamanhoPonto = map(rho, 0, 10, 0.1, 10);
          //let opacidadePonto = map(tamanhoPonto, 0.1, 100, 1, 255);
          //fill(255,255,255,opacidadePonto)
          

          
        }
      }        
    }
  }