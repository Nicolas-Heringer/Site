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
    console.warn("Falha ao carregar livros.json via fetch. Usando fallback embutido.", error);
    livrosData = [
      {
        "id": "maximo-alvarenga-v2",
        "titulo": "Curso de física (Vol. 2)",
        "autores": "Antônio Máximo, Beatriz Alvarenga",
        "citacao": "MÁXIMO, Antônio; ALVARENGA, Beatriz. Curso de física. São Paulo: Scipione, v. 2, 2000.",
        "editora": "Scipione",
        "ano": 2000,
        "volume": "Vol. 2",
        "categoria": "ensino-medio",
        "categoriaNome": "Ensino Médio & Conceitual",
        "nivel": "Ensino Médio",
        "descricao": "Volume focado em Termologia, Óptica e Ondas. Apresentação didática consagrada para introdução aos conceitos fundamentais da física.",
        "tags": ["Física", "Termologia", "Óptica", "Ondas", "Ensino Médio"]
      },
      {
        "id": "maximo-alvarenga-guimaraes-contexto",
        "titulo": "Física: contexto & aplicações",
        "autores": "Antônio Máximo, Beatriz Alvarenga, Carla Guimarães",
        "citacao": "MÁXIMO, Antônio; ALVARENGA, Beatriz; GUIMARÃES, Carla. Física: contexto & aplicações. São Paulo: Scipione, 2013.",
        "editora": "Scipione",
        "ano": 2013,
        "volume": null,
        "categoria": "ensino-medio",
        "categoriaNome": "Ensino Médio & Conceitual",
        "nivel": "Ensino Médio",
        "descricao": "Abordagem moderna conectando os princípios da física a fenômenos do cotidiano, tecnologias atuais e aplicações práticas.",
        "tags": ["Física", "Aplicações", "Cotidiano", "Ensino Médio"]
      },
      {
        "id": "maximo-alvarenga-vu",
        "titulo": "Física: volume único",
        "autores": "Antônio Máximo, Beatriz Alvarenga",
        "citacao": "MÁXIMO, Antônio; ALVARENGA, Beatriz. Física: volume único. São Paulo: Scipione, 1997.",
        "editora": "Scipione",
        "ano": 1997,
        "volume": "Volume Único",
        "categoria": "ensino-medio",
        "categoriaNome": "Ensino Médio & Conceitual",
        "nivel": "Ensino Médio",
        "descricao": "Visão abrangente e condensada de todo o programa de física do ensino médio em um único volume de fácil consulta.",
        "tags": ["Física Geral", "Mecânica", "Eletromagnetismo", "Ensino Médio"]
      },
      {
        "id": "hewitt-fisica-conceitual",
        "titulo": "Física conceitual",
        "autores": "Paul G. Hewitt",
        "citacao": "HEWITT, Paul G. Física conceitual. Bookman Editora, 2023.",
        "editora": "Bookman Editora",
        "ano": 2023,
        "volume": null,
        "categoria": "ensino-medio",
        "categoriaNome": "Ensino Médio & Conceitual",
        "nivel": "Ensino Médio / Introdução",
        "descricao": "Referência mundial na compreensão intutiva da física. Prioriza ideias e conceitos físicos antes das formalizações matemáticas pesadas.",
        "tags": ["Física Conceitual", "Intuição", "Mecânica", "Física Geral"]
      },
      {
        "id": "nussenzveig-vol1",
        "titulo": "Curso de física básica: Mecânica (vol. 1)",
        "autores": "Herch Moysés Nussenzveig",
        "citacao": "NUSSENZVEIG, Herch Moysés. Curso de física básica: Mecânica (vol. 1). Editora Blucher, 2013.",
        "editora": "Editora Blucher",
        "ano": 2013,
        "volume": "Vol. 1",
        "categoria": "fisica-geral",
        "categoriaNome": "Física Geral (Graduação)",
        "nivel": "Graduação",
        "descricao": "Clássico da física universitária brasileira. Apresenta a mecânica clássica com rigor conceitual, cálculo vetorial e elegante profundidade física.",
        "tags": ["Mecânica", "Cálculo", "Cinemática", "Dinâmica", "Graduação"]
      },
      {
        "id": "nussenzveig-vol3",
        "titulo": "Curso de física básica: Eletromagnetismo (vol. 3)",
        "autores": "Herch Moysés Nussenzveig",
        "citacao": "NUSSENZVEIG, Herch Moysés. Curso de física básica: Eletromagnetismo (vol. 3). Editora Blucher, 2015.",
        "editora": "Editora Blucher",
        "ano": 2015,
        "volume": "Vol. 3",
        "categoria": "eletromagnetismo",
        "categoriaNome": "Eletromagnetismo",
        "nivel": "Graduação",
        "descricao": "Trata de eletrostática, magnetostática, equações de Maxwell e circuitos elétricos com clareza exemplar e aplicações físicas marcantes.",
        "tags": ["Eletromagnetismo", "Eletrostática", "Maxwell", "Graduação"]
      },
      {
        "id": "nussenzveig-vol4",
        "titulo": "Curso de física básica: Ótica, relatividade, física quântica (vol. 4)",
        "autores": "Herch Moysés Nussenzveig",
        "citacao": "NUSSENZVEIG, Herch Moysés. Curso de física básica: Ótica, relatividade, física quântica (vol. 4). Editora Blucher, 2014.",
        "editora": "Editora Blucher",
        "ano": 2014,
        "volume": "Vol. 4",
        "categoria": "fisica-quantica",
        "categoriaNome": "Física Quântica & Moderna",
        "nivel": "Graduação",
        "descricao": "Introdução primorosa à física moderna: ondas eletromagnéticas, ótica física, relatividade restrita e origens da mecânica quântica.",
        "tags": ["Ótica", "Relatividade", "Física Moderna", "Física Quântica", "Graduação"]
      },
      {
        "id": "eisberg-resnick-quantica",
        "titulo": "Física Quântica: Átomos, Moléculas, Sólidos, Núcleos e Partículas",
        "autores": "Robert Eisberg, Robert Resnick",
        "citacao": "EISBERG, Robert; RESNICK, Robert. Física Quântica: Átomos, Moléculas, Sólidos, Núcleos e Partículas. Rio de Janeiro: Campus, 1979.",
        "editora": "Campus",
        "ano": 1979,
        "volume": null,
        "categoria": "fisica-quantica",
        "categoriaNome": "Física Quântica & Moderna",
        "nivel": "Graduação",
        "descricao": "Texto de referência indispensável para física quântica aplicada à matéria. Cobre de espectroscopia atômica a física nuclear e estado sólido.",
        "tags": ["Física Quântica", "Átomos", "Sólidos", "Partículas", "Graduação"]
      },
      {
        "id": "griffiths-electrodynamics",
        "titulo": "Introduction to electrodynamics",
        "autores": "David J. Griffiths",
        "citacao": "GRIFFITHS, David J. Introduction to electrodynamics. Cambridge University Press, 2023.",
        "editora": "Cambridge University Press",
        "ano": 2023,
        "volume": null,
        "categoria": "eletromagnetismo",
        "categoriaNome": "Eletromagnetismo",
        "nivel": "Graduação",
        "descricao": "O livro-texto definitivo de eletrodinâmica para graduação em física. Linguagem extremamente acessível, pedagógica e repleta de problemas excelentes.",
        "tags": ["Eletrodinâmica", "Campos Vetoriais", "Relatividade", "Graduação"]
      },
      {
        "id": "griffiths-quantum",
        "titulo": "Introduction to quantum mechanics",
        "autores": "David J. Griffiths, Darrell F. Schroeter",
        "citacao": "GRIFFITHS, David J.; SCHROETER, Darrell F. Introduction to quantum mechanics. Cambridge University Press, 2018.",
        "editora": "Cambridge University Press",
        "ano": 2018,
        "volume": null,
        "categoria": "fisica-quantica",
        "categoriaNome": "Física Quântica & Moderna",
        "nivel": "Graduação",
        "descricao": "Abordagem física direta da equação de Schrödinger, perturbações e formalismo quântico, consagrado mundialmente no ensino universitário.",
        "tags": ["Mecânica Quântica", "Equação de Schrödinger", "Graduação"]
      },
      {
        "id": "mattuck-feynman-diagrams",
        "titulo": "A guide to Feynman diagrams in the many-body problem",
        "autores": "Richard D. Mattuck",
        "citacao": "MATTUCK, Richard D. A guide to Feynman diagrams in the many-body problem. Courier Corporation, 2012.",
        "editora": "Courier Corporation (Dover)",
        "ano": 2012,
        "volume": null,
        "categoria": "muitos-corpos",
        "categoriaNome": "Física de Muitos Corpos",
        "nivel": "Pós-Graduação / Avançado",
        "descricao": "Guia intuitivo e incrivelmente didático sobre teorias de muitos corpos, funções de Green e diagramas de Feynman aplicados à matéria condensada.",
        "tags": ["Diagramas de Feynman", "Funções de Green", "Matéria Condensada", "Pós-Graduação"]
      },
      {
        "id": "pavarini-manybody",
        "titulo": "Many-body physics: from Kondo to Hubbard",
        "autores": "Eva Pavarini, Piers Coleman, Erik Koch",
        "citacao": "PAVARINI, Eva; COLEMAN, Piers; KOCH, Erik. Many-body physics: from Kondo to Hubbard. Theoretische Nanoelektronik, 2015.",
        "editora": "Theoretische Nanoelektronik",
        "ano": 2015,
        "volume": null,
        "categoria": "muitos-corpos",
        "categoriaNome": "Física de Muitos Corpos",
        "nivel": "Pós-Graduação / Avançado",
        "descricao": "Texto avançado focado em elétrons fortemente correlacionados, modelo de Hubbard, efeito Kondo e técnicas quânticas modernas de muitos corpos.",
        "tags": ["Matéria Condensada", "Elétrons Correlacionados", "Modelo de Hubbard", "Pós-Graduação"]
      }
    ];
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
      const card = document.createElement("div");
      card.className = "card-livro";
      card.setAttribute("data-categoria", livro.categoria);
      card.onmousemove = e => handleOnMouseMove(e);

      const nivelClass = getLevelClass(livro.nivel);

      card.innerHTML = `
        <div>
          <div class="card-livro-header">
            <div class="card-livro-tags">
              <span class="tag-nivel ${nivelClass}">${livro.nivel}</span>
              <span class="card-tag tag-fisica">${livro.categoriaNome}</span>
            </div>
            <h3 class="card-livro-titulo">${livro.titulo}</h3>
            <div class="card-livro-autores">${livro.autores}</div>
            <div class="card-livro-meta">${livro.editora} • ${livro.ano}${livro.volume ? ` • ${livro.volume}` : ''}</div>
          </div>
          <p class="card-livro-desc">${livro.descricao}</p>
        </div>
        
        <div class="livro-citacao-box">
          <div>${livro.citacao}</div>
          <button class="btn-copiar-citacao" data-citacao="${livro.citacao.replace(/"/g, '&quot;')}">
            <ion-icon name="copy-outline"></ion-icon>
            <span>Copiar citação ABNT</span>
          </button>
        </div>
      `;

      gridLivros.appendChild(card);
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

