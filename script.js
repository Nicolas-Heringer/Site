// Esta função lida com a posição do mouse e muda a propriedade de posição do mouse
// de maneira relativa a cada card. Isso possibilita criar o efeito de "sombra"
const handleOnMouseMove = e => {
	const { currentTarget: target } = e;
	const rect = target.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	console.log(`Mouse x:${x} Mouse y:${y}`);

	target.style.setProperty("--mouse-X", `${x}px`);
	target.style.setProperty("--mouse-Y", `${y}px`);
};

for (const card of document.querySelectorAll(".card")) {
	card.onmousemove = e => handleOnMouseMove(e);
}
// -

// Aqui eu lido com o menu e a mudança entre seções
document.addEventListener("DOMContentLoaded", function() {
  // Seleciona todas as seções da página
  const secoes = document.querySelectorAll(".section");

  // Oculta todas as seções ao carregar a página
  secoes.forEach(secao => {
    secao.classList.add("hidden");
  });

  // Exibe a seção padrão ao carregar a página
  const secaoPadrao = document.getElementById("secao-sobre"); // Escolha da seção padrão
  if (secaoPadrao) {
    secaoPadrao.classList.remove("hidden");
  }

  // Seleciona os links do menu
  const links = document.querySelectorAll(".menu a");

  // Adiciona o evento de clique para cada link do menu
  links.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();

      // Obtém o ID da seção a ser exibida a partir do href do link
      const idSecao = this.getAttribute("href").substring(1);

      // Oculta todas as seções novamente ao clicar em um link do menu
      secoes.forEach(secao => {
        secao.classList.add("hidden");
      });

      // Exibe apenas a seção correspondente ao link clicado
      document.getElementById(idSecao).classList.remove("hidden");
    });
  });
});



// -
