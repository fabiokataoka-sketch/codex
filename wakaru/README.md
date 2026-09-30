# Wakaru — Design System

O sistema visual do [wakaruapp.app](https://wakaruapp.app) — o app que deixa quem mora no
Japão fotografar um documento em japonês e entender o que fazer.

**Consolidado com o produto em produção.** Os valores deste pacote são os mesmos que o app
serve; ele existe para usar o sistema fora do Tailwind: protótipo, e-mail, peça impressa,
Figma. Se um valor aqui divergir do app, o app é que está certo — abra uma correção aqui.

**Style guide:** abra `index.html` no navegador.
**Referência completa:** [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md).

## Estrutura

```
css/
  tokens.css       Tokens como custom properties (cor, tipo, espaço, raio, sombra, movimento)
  base.css         Reset, tipografia, primitivas de layout, utilitários de acessibilidade
  components.css   Botões, chips, nav, cartões, moldura de câmera, passos, pares JP/PT, chat
  wakaru.css       Entrada única (@import das três camadas)
tokens/
  tokens.json      Fonte legível por máquina (Figma, Style Dictionary)
index.html         Style guide vivo
preview-wakaruapp.html   Landing page montada sobre o sistema
```

## Uso

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Zen+Maru+Gothic:wght@400;500;700&family=Zen+Old+Mincho:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/wakaru.css">
```

Toda classe usa o prefixo `wk-`; toda custom property, `--wk-`.

```html
<button class="wk-btn wk-btn--primary">Fotografar a carta</button>
<span class="wk-badge wk-badge--urgent">Requer ação</span>
```

## Princípios

1. **Papel, não tela.** O fundo é creme quente (`#F6F2EA`), nunca branco. O produto lida com
   papelada oficial japonesa; a interface imita o documento.
2. **Um vermelho só.** `#B22C1B` é a única cor saturada de uma tela — ação primária, urgência
   e marca falam com a mesma voz.
3. **Dourado nunca é semântico.** `#B08432` é ornamento de marca. Prazo e urgência jamais
   usam dourado.
4. **Sem tema escuro.** O produto declara `color-scheme: light` e não oferece inversão: uma
   troca automática do sistema operacional destruiria a leitura de papel.
5. **Sem transformação de caixa.** `text-transform: none` e `letter-spacing: 0` em todo
   título. Caixa baixa forçada e versalete atrapalham o japonês, que convive com o texto
   latino em quase toda tela. A exceção é o rótulo mono de 11px.
6. **Alvo grande, texto grande.** Corpo a 17–18px, alvo de toque nunca abaixo de 44px.
7. **Movimento é opcional.** Tudo desliga em `prefers-reduced-motion`.

## Referência rápida

| Token | Valor | Papel |
| --- | --- | --- |
| `--wk-red-500` | `#B22C1B` | Marca, ação primária |
| `--wk-red-700` | `#8E2214` | Urgência, destrutivo, estado ativo |
| `--wk-paper` | `#F6F2EA` | Fundo da página |
| `--wk-card` | `#FFFDF8` | Cartão |
| `--wk-ink` | `#241610` | Texto principal |
| `--wk-ink-600` | `#5A4137` | Texto secundário |
| `--wk-line` | `#E3D9C9` | Bordas |
| `--wk-ok` | `#2F6B52` | "Tudo certo" |
| `--wk-gold` | `#B08432` | Ornamento, anel de foco |
| `--wk-font-display` | Archivo | Títulos, botões, números |
| `--wk-font-body` | Zen Kaku Gothic New | Corpo |
| `--wk-font-friendly` | Zen Maru Gothic | Telas internas do app |
| `--wk-font-jp-old` | Zen Old Mincho | Documento japonês original |
| `--wk-radius-surface` | `16px` | Cartões e painéis |
| `--wk-radius-pill` | `999px` | Botões, chips, campos |
| `--wk-ease-out` | `cubic-bezier(0.22,1,0.36,1)` | Curva assinatura |
| `--wk-tap-min` | `44px` | Alvo de toque mínimo |

## Urgência

Dois degraus, não três. `urgent` e `soon` dividem o mesmo vermelho de propósito — a
distinção está na cópia, não no matiz, para não depender de discriminação fina de cor. Não
existe amarelo.

| Classe | Texto | Fundo |
| --- | --- | --- |
| `.wk-badge--urgent` | `#8E2214` | `#F7E2DC` |
| `.wk-badge--soon` | `#8E2214` | `#F7E2DC` |
| `.wk-badge--ok` | `#2F6B52` | `#E0EFE7` |

## Acessibilidade

- Texto sobre papel: 15.7:1. Texto secundário: 8.4:1. Creme sobre o vermelho primário: 6.0:1.
- Chips: 7.1:1 (urgente) e 5.3:1 (calmo).
- **O dourado a 11px dá 3.04:1 e reprova AA para texto normal.** Use só em rótulo decorativo
  que repita informação disponível em outro lugar. O anel de foco é a mesma cor e passa o
  mínimo de 3:1 por 0.04 — se o fundo mudar, escureça esta cor antes de qualquer outra.
- Urgência sempre traz rótulo textual junto da cor.
- `:focus-visible` com contorno de 3px e offset de 3px, nunca removido.
- `prefers-reduced-motion` desliga animação e transição.
