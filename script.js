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
document.addEventListener("DOMContentLoaded", function () {
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

  // Adiciona o evento de clique para todos os links de seção (menu e botões CTA)
  const allSectionLinks = document.querySelectorAll('a[href^="#secao-"]');
  allSectionLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const idSecao = this.getAttribute("href").substring(1);
      const secaoAlvo = document.getElementById(idSecao);

      if (secaoAlvo) {
        resetSections();
        secaoAlvo.classList.add("active");

        // Destaca o link correspondente no menu da sidebar
        const linkCorrespondente = document.querySelector(`.menu a[href="#${idSecao}"]`);
        if (linkCorrespondente) {
          linkCorrespondente.classList.add("active");
        }

        // Atualiza a URL com o hash e rola até o topo
        history.pushState(null, null, '#' + idSecao);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // --- Lógica de filtragem de simulações ---
  const filterBtnsSim = document.querySelectorAll('#secao-simulacoes .filter-btn');
  const cardLinks = document.querySelectorAll('.card-link');
  const noResultsSim = document.getElementById('no-results');

  if (filterBtnsSim.length > 0) {
    filterBtnsSim.forEach(btn => {
      btn.addEventListener('click', function () {
        // Atualiza botão ativo
        filterBtnsSim.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filtro = this.getAttribute('data-filtro');
        let visiveis = 0;

        cardLinks.forEach(link => {
          const categorias = (link.getAttribute('data-categorias') || '').split(' ');
          const mostrar = filtro === 'todas' || categorias.includes(filtro);
          link.classList.toggle('card-hidden', !mostrar);
          if (mostrar) visiveis++;
        });

        // Exibe mensagem se nenhum card for encontrado
        if (noResultsSim) {
          noResultsSim.style.display = visiveis === 0 ? 'block' : 'none';
        }
      });
    });
  }

  // Inicializa seção de Material Bibliográfico
  initBibliograficaSection();
});

// --- Lógica da seção de Material Bibliográfico ---
async function initBibliograficaSection() {
  const gridLivros = document.getElementById("grid-livros");
  const searchInput = document.getElementById("biblio-search");
  const filterBtns = document.querySelectorAll("#biblio-filter-bar .filter-btn");
  const noResults = document.getElementById("biblio-no-results");

  if (!gridLivros) return;

  let livrosData = [];

  try {
    const response = await fetch("livros.json");
    if (!response.ok) throw new Error("Network response was not ok");
    livrosData = await response.json();
  } catch (error) {
    console.error("Erro ao carregar livros.json:", error);
    gridLivros.innerHTML = '<p class="no-results" style="display:block;">Não foi possível carregar a lista de livros.</p>';
    return;
  }

  function getLevelClass(nivel) {
    if (nivel.includes("Ensino Médio")) return "nivel-em";
    if (nivel.includes("Pós")) return "nivel-pos";
    return "nivel-grad";
  }

  function renderLivros(livros) {
    gridLivros.innerHTML = "";

    if (livros.length === 0) {
      if (noResults) noResults.style.display = "block";
      return;
    }

    if (noResults) noResults.style.display = "none";

    livros.forEach(livro => {
      const item = document.createElement("div");
      item.className = "biblio-item";
      item.setAttribute("data-categoria", livro.categoria);

      const nivelClass = getLevelClass(livro.nivel);

      item.innerHTML = `
        <div class="biblio-item-main">
          <div class="biblio-citacao-text">${livro.citacao}</div>
          <div class="biblio-item-meta">
            <span class="tag-nivel ${nivelClass}">${livro.nivel}</span>
            <span class="card-tag tag-fisica">${livro.categoriaNome}</span>
          </div>
        </div>
        
        <div class="biblio-actions">
          ${livro.link && livro.url ? `
            <a href="${livro.url}" target="_blank" rel="noopener noreferrer" class="btn-link-afiliado">
              <ion-icon name="cart-outline"></ion-icon>
              <span>Comprar</span>
            </a>
          ` : ''}
          <button class="btn-copiar-citacao" data-citacao="${livro.citacao.replace(/"/g, '&quot;')}">
            <ion-icon name="copy-outline"></ion-icon>
            <span>Copiar ABNT</span>
          </button>
        </div>
      `;

      gridLivros.appendChild(item);
    });

    // Evento dos botões de copiar citação
    gridLivros.querySelectorAll(".btn-copiar-citacao").forEach(btn => {
      btn.addEventListener("click", function () {
        const citacao = this.getAttribute("data-citacao");
        navigator.clipboard.writeText(citacao).then(() => {
          const span = this.querySelector("span");
          const originalText = span.textContent;
          span.textContent = "Copiado!";
          this.style.borderColor = "var(--accent-color)";
          this.style.color = "var(--accent-color)";
          setTimeout(() => {
            span.textContent = originalText;
            this.style.borderColor = "";
            this.style.color = "";
          }, 2000);
        }).catch(err => {
          console.error("Erro ao copiar citação:", err);
        });
      });
    });
  }

  function filterAndSearch() {
    const activeBtn = document.querySelector("#biblio-filter-bar .filter-btn.active");
    const categoriaFiltro = activeBtn ? activeBtn.getAttribute("data-filtro") : "todas";
    const termoBusca = (searchInput ? searchInput.value : "").toLowerCase().trim();

    const livrosFiltrados = livrosData.filter(livro => {
      const bateCategoria = categoriaFiltro === "todas" || livro.categoria === categoriaFiltro;
      
      const textoCompleto = `${livro.titulo} ${livro.autores} ${livro.editora} ${livro.ano} ${livro.descricao} ${(livro.tags || []).join(' ')}`.toLowerCase();
      const bateBusca = !termoBusca || textoCompleto.includes(termoBusca);

      return bateCategoria && bateBusca;
    });

    renderLivros(livrosFiltrados);
  }

  // Event Listeners para Filtros de Categoria
  filterBtns.forEach(btn => {
    btn.addEventListener("click", function () {
      filterBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      filterAndSearch();
    });
  });

  // Event Listener para Busca Textual
  if (searchInput) {
    searchInput.addEventListener("input", filterAndSearch);
  }

  // Renderização inicial
  renderLivros(livrosData);
}

