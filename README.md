# Olá
Este é meu repositório utilizado como site.

Este repositório (bem como a página que nele está contida) deve ser atualizado de forma constante para que novas simulações e funcionalidades na interface sejam adicionadas. Estou aprendendo a utiliza html, css e javascript no momento, então as atualizações podem ser lentas.

Grande parte deste projeto (dada a minha pouca intimidade com html, css e javascript) só se fez possivel graças ao uso cuidadoso de ferramentas generativas de Inteligência Artifical (GPTs). Planejo inserir uma seção em breve sobre os usos deste tipo de ferramenta para produzir simulações educacionais de física e matemática.

Cada simulação é encapsulada dentro de um arquivo html próprio. E também recebe um css e um js proprio. Essa estrutura modularizada faz com que a página de um simulador tenha um formato muito simples de adaptar sem que os outros simuladores sejam afetados. A estrutura geral do projeto pode ser vista abaixo:

```text
Site/
│
├── favicon.svg
├── index.html
├── livros.json
├── README.md
├── script.js
├── styles.css
│
└── simulacoes/
    ├── atomo_de_hidrogenio.html
    ├── audio.html
    ├── drude.html
    ├── estacionarias2d.html
    ├── fonons.html
    ├── gravidade.html
    ├── movimento.html
    ├── particulas.html
    ├── quedalivre.html
    ├── snell.html
    │
    ├── css/
    │   ├── atomo_de_hidrogenio.css
    │   ├── base.css
    │   ├── buttons.css
    │   ├── drude.css
    │   ├── fonons.css
    │   ├── gravidade.css
    │   ├── movimento.css
    │   ├── particulas.css
    │   ├── quedalivre.css
    │   └── snell.css
    │
    └── scripts/
        ├── atomo_de_hidrogenio.js
        ├── audio.js
        ├── buttons.js
        ├── drude.js
        ├── estacionarias2d.js
        ├── fonons.js
        ├── gravidade.js
        ├── movimento.js
        ├── particulas.js
        ├── quedalivre.js
        ├── snell.js
        └── snell.worker.js
```


