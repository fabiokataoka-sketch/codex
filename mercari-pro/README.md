# Mercari Pro — Design System

Sistema de design para o console de vendedores profissionais da Mercari: uma
ferramenta de trabalho densa (milhares de anúncios, importação em massa,
precificação automática, analytics) vestida com uma linguagem visual editorial.

**Referência estética:** [ai-in-banking-ux-design.videinfra.com](https://ai-in-banking-ux-design.videinfra.com/)
— tipografia grotesca em escala máxima com tracking negativo, fios de 1px no
lugar de caixas, um único acento cromático por tela, temas claro/escuro trocáveis
por subárvore e divulgação progressiva via modais em vez de navegação.

**Marca:** vermelho Mercari `#FF0211`, azul Mercari `#4DC9FF`, preto `#222222`.

| Página | O que é |
| --- | --- |
| `index.html` | Guia de estilo vivo — tokens, componentes, regras de uso, do/don't |
| `preview.html` | Tela real do console (Anúncios) construída inteiramente sobre o sistema |

Abra qualquer um dos dois direto no navegador; não há build.

## Estrutura

```
css/
  tokens.css        Primitivas --mp-c-* + semânticas --mp-t-*, temas, densidade
  base.css          Reset, tipografia editorial, primitivas de layout, a11y
  components.css    Botões, selos, campos, abas, chips, cards, modais, toasts…
  patterns.css      Shell do app, tabela de dados, KPIs, toolbar, slider editorial
  mercari-pro.css   Entrada única (@import das quatro camadas)
tokens/
  tokens.json       Fonte legível por máquina (Figma / Style Dictionary)
assets/
  mark.svg          Marca placeholder — trocar pelo wordmark oficial
  icons.svg         Sprite de ícones (16px, stroke, currentColor)
```

## Uso

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400..800;1,400..800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/mercari-pro.css">
```

Todas as classes usam o prefixo `mp-`; todas as custom properties usam `--mp-`.

```html
<button class="mp-btn mp-btn--primary">Publicar anúncio</button>
<span class="mp-badge mp-badge--live"><i class="mp-badge__dot"></i>Ativo</span>
```

### Temas

O tema é um mapa de tokens semânticos, não um override de componentes. Por isso
qualquer subárvore pode inverter — é assim que um bloco editorial preto convive
dentro de um console branco:

```html
<html data-theme="dark">            <!-- documento inteiro -->
<section class="mp-dark">…</section> <!-- só este bloco -->
<div class="mp-light">…</div>        <!-- volta ao claro dentro do escuro -->
```

### Densidade

```html
<html data-density="compact">  <!-- linha de 40px em vez de 52px -->
```

## Princípios

1. **O vermelho é a voz, não o alarme.** O vermelho da Mercari é a marca, então
   ele não pode ser também o único sinal de perigo. Ações destrutivas são
   contornadas (`.mp-btn--destructive`), nunca preenchidas; todo estado de erro
   carrega ícone e texto além da cor.
2. **Uma ação preenchida por tela.** Só o caminho feliz recebe fundo vermelho.
3. **Fios, não caixas.** A estrutura vem de linhas de 1px e de espaço. Sombras
   existem apenas para o que realmente flutua: modais, drawers, toasts.
4. **Números são tipografia.** Preço, GMV e conversão usam figuras tabulares e
   peso display. Em uma ferramenta de vendas, o número é o conteúdo.
5. **Densidade é do vendedor.** `data-density` é token de primeira classe.

## Os dois vermelhos

A decisão mais consequente do sistema. `#FF0211` é o vermelho hero da Mercari,
mas texto branco sobre ele fica em **3,99:1** — abaixo do piso de 4,5:1 do
WCAG AA. Em vez de alterar a cor da marca ou ignorar o contraste, o papel foi
dividido:

| Token | Valor (claro) | Papel |
| --- | --- | --- |
| `--mp-t-accent` | `#FF0211` | Marca: selo Pro, fios de destaque, tipografia display, preenchimentos sem texto |
| `--mp-t-action` | `#E00010` | Ação: fundo de botão e texto vermelho — **5,0:1 contra branco nos dois sentidos** |

No tema escuro o par se inverte: sobre quase-preto quem carrega texto com
folga é o `#FF0211` (5,3:1), e o vermelho escuro não. Componentes nunca
consomem as primitivas — só `--mp-t-*` — então a inversão é invisível para eles.

`.mp-btn--brand` existe para superfícies de marketing onde o rótulo é grande e
bold: ali o `#FF0211` puro passa no critério de texto grande (3:1).

### Variante "brick" — para produtos que não são a Mercari

`css/theme-brick.css` reancora o sistema em `#C6372A`, um vermelho tijolo
dessaturado. É a escolha certa para ferramentas de terceiros, cursos e
mentorias sobre a Mercari: usar o hex registrado da marca ali sugeriria
produto oficial.

```css
@import "tokens.css";
@import "theme-brick.css";  /* só reescreve primitivas */
@import "base.css";
```

Como a variante toca **apenas as primitivas**, nenhum componente muda — e é
aí que a arquitetura de duas camadas se paga. Uma coisa inclusive simplifica:
`#C6372A` já entrega 5,28:1 contra branco nos dois sentidos, então o split
entre vermelho de marca e vermelho de ação deixa de ser necessário e
`--mp-t-accent` e `--mp-t-action` colapsam no mesmo valor. A *regra* continua
valendo (destrutivo contornado, status com ponto); o que some é a divisão de
hex, que existia só por causa do contraste do `#FF0211`.

## Referência rápida de tokens

| Token | Valor | Papel |
| --- | --- | --- |
| `--mp-c-red-500` | `#FF0211` | Vermelho Mercari (marca) |
| `--mp-c-red-600` | `#E00010` | Vermelho de ação (texto e fills) |
| `--mp-c-blue-400` | `#4DC9FF` | Azul Mercari (dados, seleção) |
| `--mp-c-gray-900` | `#222222` | Preto Mercari |
| `--mp-font-display` | Inter Tight | Títulos, KPIs, preços |
| `--mp-font-body` | Inter | Interface e corpo |
| `--mp-font-mono` | JetBrains Mono | SKUs, sobrelinhas, cabeçalhos de coluna |
| `--mp-radius-lg` | `14px` | Cards e superfícies |
| `--mp-radius-pill` | `999px` | Botões, selos, chips |
| `--mp-ease-out` | `cubic-bezier(0.22,1,0.36,1)` | Easing assinatura |
| `--mp-row-h` | `52px` / `40px` | Altura de linha por densidade |

Inter Tight substitui a PP Neue Montreal da referência (licença paga) — é o
grotesco livre mais próximo que aguenta 9rem com tracking negativo.

## Aplicando em Tailwind v4 + shadcn

O sistema nasceu em CSS puro, mas foi aplicado num app Tailwind v4 + shadcn
(new-york). Três coisas que só apareceram na prática e que valem para qualquer
port futuro:

**1. O contrato do shadcn vira alias das semânticas, não uma paleta paralela.**

```css
:root {
  --primary:    var(--mp-t-action);
  --background: var(--mp-t-bg);
  --border:     var(--mp-t-line);
  /* … */
}
```

Com isso os 40+ componentes shadcn herdam o sistema sem nenhum ser tocado. Se
o projeto já tiver outros conjuntos de variáveis (modos de tema, paletas de
marketing), transforme-os em alias também — dois mapas de cor concorrentes é
como o sistema morre.

**2. Helpers de tipografia vão em `@layer components`, nunca em `utilities`.**

Uma classe como `.type-eyebrow` que define `color` dentro de `@layer utilities`
empata em especificidade com o `text-*` do Tailwind, e vence por ordem de
saída. Resultado: `class="type-eyebrow text-on-action"` ignora o `text-on-action`
— e uma sobrelinha sobre superfície colorida fica ilegível. Em
`@layer components` a ordem `components → utilities` resolve: o helper dá o
padrão, a utility sobrescreve. Isso vale para qualquer helper que fixe cor.

**3. Blocos "sempre escuros" não precisam de tokens próprios.**

Com `@custom-variant dark (&:is(.dark *))` e o mapa escuro declarado em `.dark`,
a classe funciona em qualquer nível — não só na raiz:

```tsx
<section className="dark bg-bg text-text">  {/* escuro independente do tema */}
```

É o mesmo mecanismo do `.mp-dark` deste sistema. Um herói editorial preto dentro
de um app claro custa uma classe, não um conjunto novo de variáveis.

## Acessibilidade

Garantido pelos tokens:

- Texto sobre fundo em 15,8:1 (claro) e 16,1:1 (escuro); texto secundário
  acima de 4,5:1 nos dois temas.
- `--mp-t-action` em 5,0:1 contra branco, servindo como fundo e como texto.
- Anel de foco de 2px com offset em todo elemento interativo
  (`:focus-visible`, via `--mp-focus-ring`).
- Status sempre com ponto (`.mp-badge__dot`) além da cor; item de navegação
  ativo marcado por fio, preenchimento e peso.
- `prefers-reduced-motion` desliga o ticker e todas as transições.

Continua sendo responsabilidade de quem implementa:

- Gerenciar foco ao abrir modal/drawer e devolvê-lo ao fechar (o
  `preview.html` mostra o padrão mínimo).
- Manter `aria-selected`, `aria-sort` e `aria-current` refletindo o estado real.
- Anunciar ações em massa em uma região `aria-live`.
- Trocar `assets/mark.svg` pelo wordmark oficial da marca antes de qualquer
  uso público — a marca incluída é um placeholder geométrico, não a script
  da Mercari.

## Escopo

Este é um sistema de design proposto, produzido a partir de material público
sobre o programa Mercari Pro (selo Pro, importação em massa do eBay, gestão de
estoque, rede de anúncios, analytics, atendimento VIP) e das cores publicadas na
identidade da Mercari. Não é um artefato oficial da Mercari, e os dados nas telas
de exemplo são fictícios.
