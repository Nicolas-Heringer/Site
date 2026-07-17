// Esta função lida com a posição do mouse e muda a propriedade de posição do mouse
// de maneira relativa a cada card. Isso possibilita criar o efeito de "sombra"
const handleOnMouseMove = e => {
	const { currentTarget: target } = e;
	const rect = target.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	target.style.setProperty("--mouse-X", `${x}px`);
	target.style.setProperty("--mouse-Y", `${y}px`);
};

for (const card of document.querySelectorAll(".card")) {
	card.onmousemove = e => handleOnMouseMove(e);
}

// Aqui eu lido com o menu e a mudança entre seções
document.addEventListener("DOMContentLoaded", function() {
  const secoes = document.querySelectorAll(".section");
  const links = document.querySelectorAll(".menu a");

  // Oculta todas as seções e remove 'active' dos links
  function resetSections() {
    secoes.forEach(secao => {
      secao.classList.remove("active");
    });
    links.forEach(link => {
      link.classList.remove("active");
    });
  }

  // Verifica se há um hash na URL (ex: #secao-simulacoes)
  const hash = window.location.hash;
  let secaoInicial = "secao-sobre"; // Padrão
  
  if (hash) {
      const secaoTentativa = hash.substring(1); // Remove o #
      if (document.getElementById(secaoTentativa)) {
          secaoInicial = secaoTentativa;
      }
  }

  // Define aba inicial ativa
  const secaoPadrao = document.getElementById(secaoInicial);
  const linkPadrao = document.querySelector(`.menu a[href="#${secaoInicial}"]`);
  
  if (secaoPadrao && linkPadrao) {
    resetSections();
    secaoPadrao.classList.add("active");
    linkPadrao.classList.add("active");
  }

  // Adiciona o evento de clique para cada link do menu
  links.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      
      const idSecao = this.getAttribute("href").substring(1);
      const secaoAlvo = document.getElementById(idSecao);

      if (secaoAlvo) {
          resetSections();
          secaoAlvo.classList.add("active");
          this.classList.add("active");
          // Atualiza a URL com o hash
          history.pushState(null, null, '#' + idSecao);
      }
    });
  });
});
