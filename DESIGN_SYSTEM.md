# Wakaru — Design System

Exportado de `fabiokataoka-sketch/japan-guide-bot@main`, o app em produção em
**wakaruapp.app**. Toda medida abaixo foi lida do código, não reconstruída de
memória: os tokens vêm de `src/styles.css`, os componentes de `src/components/`
e `src/routes/`, e os contrastes foram calculados, não estimados.

> **Aviso de divergência.** Existe um segundo design system chamado "Wakaru", em
> `wakaru/css/` neste mesmo repo (PR #2, nunca mergeado), e ele **não** é uma
> variação deste — é outro sistema:
>
> | | Em produção (este doc) | `wakaru/css/` (PR #2) |
> | --- | --- | --- |
> | Acento | vermelho `#B22C1B` | laranja `#FF4D00` |
> | Tinta | `#241610` (marrom quente) | `#111110` (quase preto) |
> | Fundo | `#F6F2EA` | `#FAF8F2` |
> | Neutros | derivados do marrom | escala cinza de 8 tons |
> | Urgência | dois estados, sem amarelo | três, com amarelo `#FFB020` |
> | Prefixo | `--red`, `--ink`, via Tailwind | `--wk-*`, CSS puro |
>
> Aquele foi um exercício de landing page inspirado no rabbit r1. Este documento
> descreve o que o produto realmente usa. Unificar os dois é uma decisão de
> marca a tomar, não um detalhe a resolver por conta.

---

## 1. Princípios

1. **Papel, não tela.** O fundo é um creme quente (`#F6F2EA`), não branco. O
   produto lida com papelada oficial japonesa; a interface imita o documento.
2. **Um vermelho só.** `#B22C1B` é a única cor saturada de uma tela. Ação
   primária, urgência e marca falam com a mesma voz.
3. **Dourado nunca é semântico.** `#B08432` é ornamento de marca (eyebrow,
   assistente, foco). Prazo e urgência jamais usam dourado — usam vermelho ou
   verde.
4. **Alvo grande, texto grande.** Corpo a 17–18px e alvos de toque de 44px para
   cima. O público lê em japonês burocrático traduzido, no celular, com pressa.
5. **Movimento é opcional.** Tudo que anima desliga em `prefers-reduced-motion`.

---

## 2. Cor

### 2.1 Primitivas

| Token | Hex | Papel |
| --- | --- | --- |
| `--red` | `#B22C1B` | Marca, ação primária |
| `--red-d` | `#8E2214` | Vermelho escuro: destrutivo, urgência, estado ativo |
| `--red-ink` | `#9C2414` | Vermelho para texto longo |
| `--red-soft` | `#F7E2DC` | Fundo de chip urgente |
| `--paper` | `#F6F2EA` | Fundo da página |
| `--cream` | `#FFF6EC` | Superfície secundária, texto sobre vermelho |
| `--card` | `#FFFDF8` | Cartão elevado |
| `--ink` | `#241610` | Texto principal |
| `--ink-2` | `#5A4137` | Texto secundário |
| `--line` | `#E3D9C9` | Bordas e réguas |
| `--ok` | `#2F6B52` | Verde de "tudo certo" |
| `--ok-soft` | `#E0EFE7` | Fundo de chip calmo |
| `--gold` | `#B08432` | Ornamento de marca, anel de foco |
| `--footer` | `#2A1109` | Rodapé e superfície de câmera |
| `--footer-ink` | `#FFF6EC` | Texto sobre rodapé |

### 2.2 Aliases semânticos

Derivados das primitivas — **mude a primitiva, não o alias**.

| Alias | Resolve para | Uso |
| --- | --- | --- |
| `--background` | `--paper` | Fundo do documento |
| `--foreground` | `--ink` | Texto do documento |
| `--surface` / `--card` | `#FFFDF8` | Cartões |
| `--surface-2` / `--muted` / `--accent` | `--cream` | Blocos internos, realces suaves |
| `--primary` | `--red` | Ação primária |
| `--primary-foreground` | `--cream` | Texto sobre ação primária |
| `--primary-soft` | `--red-soft` | Fundo de realce da marca |
| `--secondary` | `--cream` | Ação secundária |
| `--destructive` | `--red-d` | Ação destrutiva |
| `--border` / `--rule` | `--line` | Bordas |
| `--input` / `--rule-strong` | `color-mix(--line 72%, --ink)` | Borda de campo (mais escura) |
| `--ring` | `--gold` | Anel de foco |
| `--ink-3` | `--ink-2` | Rótulo mono |
| `--camera-ground` / `--camera-ink` | `--footer` / `--cream` | A câmera fica quase preta nos dois temas — é funcional, não decorativa |

### 2.3 Urgência

Três estados, e só três. O amarelo não existe: "em breve" usa o mesmo vermelho
de "urgente", com peso tipográfico e cópia fazendo a distinção.

| Estado | Texto | Fundo | Borda | Utilitário |
| --- | --- | --- | --- | --- |
| Urgente | `--red-d` `#8E2214` | `--red-soft` `#F7E2DC` | `color-mix(--red 38%, --line)` | `.chip-urgent` |
| Em breve | `--red-d` `#8E2214` | `--red-soft` `#F7E2DC` | `color-mix(--red 38%, --line)` | `.chip-soon` |
| Calmo | `--ok` `#2F6B52` | `--ok-soft` `#E0EFE7` | `color-mix(--ok 35%, --line)` | `.chip-calm` |
| Informativo | `--ink-2` `#5A4137` | — | — | `--info` |

### 2.4 Tema escuro

**Não existe.** `.dark { color-scheme: light; }` neutraliza qualquer tentativa do
sistema operacional de inverter a paleta. É deliberado: o produto imita papel.

### 2.5 Marca

| Aplicação | Fundo | Marca |
| --- | --- | --- |
| Ícone do app (`public/icon.svg`) | `#B22C1B`, raio 118/512 | 分 em `#FFF6EC`, 300/512 |
| Favicon (`public/favicon.svg`) | `#B22C1B`, raio 104/512 | 分 em `#FFF6EC`, 350/512 (maior, para ler a 16px) |

O glifo 分 é a forma real do Noto Sans JP Bold, extraída da fonte — não um
desenho aproximado.

---

## 3. Tipografia

### 3.1 Famílias

| Token | Pilha | Uso |
| --- | --- | --- |
| `--font-display` | `Archivo`, Noto Sans JP, system-ui | Títulos, botões, números |
| `--font-sans` | `Zen Kaku Gothic New`, Noto Sans JP, system-ui | Páginas públicas, corpo padrão |
| `--font-friendly` | `Zen Maru Gothic`, Noto Sans JP, system-ui | Telas internas (`/app/*`) — arredondada, menos oficial |
| `--font-jp` | `Noto Sans JP`, Hiragino Sans, Yu Gothic | Trechos em japonês |
| `--font-jp-old` | `Zen Old Mincho`, Noto Sans JP, serif | Documento japonês original (mincho, como o papel) |
| `--font-mono` | `ui-monospace`, SFMono-Regular, Menlo… | Rótulos e dados. **Herdado do tema padrão do Tailwind**, não escolhido pelo projeto |

Carregadas em `src/routes/__root.tsx` via Google Fonts com `display=swap`:
`Archivo:wght@400;600;800`, `Zen Kaku Gothic New:wght@400;500;700`,
`Zen Maru Gothic:wght@400;500;700`, `Zen Old Mincho:wght@400;600`,
`Noto Sans JP:wght@400;500;700`.

### 3.2 Escala

Tamanhos em px absolutos, por escolha: o público ajusta o zoom do sistema e a
escala precisa ser previsível.

| px | Frequência | Papel |
| --- | --- | --- |
| 11 | utilitário | `mono-label`, `eyebrow` — versalete |
| 12–13 | raro | Legendas, nota de rodapé de impressão |
| 14 | 6× | Metadados |
| **17** | **124×** | **Corpo padrão, botões, rótulos — o tamanho do sistema** |
| 18 | 26× | Corpo do `<body>` e das páginas; texto de passo |
| 19–20 | 18× | Resposta principal ("o que essa carta diz") |
| 22–24 | 10× | Títulos de seção |
| 26–28 | 7× | Número de dias restantes |
| 40 | 3× | Valor a pagar |
| 64 | 2× | Display de marca |

### 3.3 Pesos

| Elemento | Peso |
| --- | --- |
| `h1`, `h2` | 700 |
| `h3`, `h4`, `.font-display` | 800 |
| Botão | 600 (`font-semibold`) |
| Ação primária (`wk-primary-action`) | 800 |
| Corpo | 400 |
| Ênfase no corpo | 500 |
| `mono-label` | 500 |

`letter-spacing: 0` e `text-transform: none` em todos os títulos — nada de
versalete ou tracking negativo, que atrapalham o japonês.
O único versalete é `mono-label` / `eyebrow`: `0.12em`, uppercase, 11px.

### 3.4 Altura de linha

| Classe | Valor | Uso |
| --- | --- | --- |
| `leading-none` | 1 | Números grandes (valor, dias) |
| `leading-tight` | 1.25 | Títulos |
| `leading-5` / `leading-6` | 1.25rem / 1.5rem | Metadados, chips |
| **`leading-7`** | **1.75rem** | **Corpo — o padrão, 39 usos** |
| `leading-8` | 2rem | Texto longo traduzido e resposta principal |
| `.jp` | 1.7 | Japonês — respiro maior entre linhas |

---

## 4. Espaçamento e layout

### 4.1 Escala

Escala padrão do Tailwind v4, base `0.25rem` (4px): `1`=4, `2`=8, `3`=12,
`4`=16, `5`=20, `6`=24, `7`=28, `8`=32, `10`=40, `12`=48, `16`=64, `20`=80.

Ritmo observado: **`gap-2`/`gap-3`** dentro de um componente, **`mt-5`…`mt-8`**
entre blocos, **`p-4`** em cartão compacto, **`p-5 sm:p-6`** ou **`p-5 sm:p-7`**
em cartão de conteúdo.

### 4.2 Containers

| Largura | Uso |
| --- | --- |
| `max-w-[660px]` | Coluna de leitura de documento — a medida principal do app |
| `max-w-md` (28rem) | Barra de abas, folhas modais, formulários |
| `max-w-3xl` / `max-w-6xl` | Seções da página pública |
| `px-4 sm:px-5` | Medianiz padrão |

### 4.3 Breakpoints

`sm:` (640px) faz 87 dos 107 ajustes responsivos; `md:` (768px) 16; `lg:` 4.
Na prática o sistema tem **dois estados**: telefone e o resto.

### 4.4 Cromo fixo

```css
--app-nav-h: calc(72px + 1px + env(safe-area-inset-bottom));
```

A altura real da barra de abas: 72px de alvo de toque, 1px de borda superior, e
a área que o aparelho reserva para o *home indicator*. **Toda** coisa fixa acima
da barra lê este valor — o padding das telas, o campo de pergunta, o botão da
assistente e o balão dela. Números mágicos repetidos aqui já causaram bug.

---

## 5. Raios

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-sm` | 8px | Elementos miúdos |
| `--radius-md` | 10px | Campos, controles |
| `--radius-lg` | 12px | Cartão pequeno |
| `--radius-xl` | 16px | Cartão de passo, bloco interno |
| `--radius-2xl`, `--radius-3xl` | 16px | Iguais ao `xl` de propósito: o sistema não passa de 16px em cartão |
| `rounded-[18px]`, `rounded-[24px]` | 18/24px | Superfícies grandes (folha modal, cartão herói) |
| `rounded-full` | 9999px | **85 usos** — botões, chips, avatar, campo de texto |

A regra prática: **controle é pílula, superfície é 16px**.

---

## 6. Sombras e elevação

| Token | Valor | Uso |
| --- | --- | --- |
| `--shadow-elegant` | `0 20px 50px color-mix(in oklab, var(--ink) 18%, transparent)` | Elevação genérica |
| `--hero-card-shadow` | `0 30px 60px -26px rgba(60, 8, 0, 0.65)` | Cartão do herói na landing |
| `--primary-action-shadow` | `0 14px 30px -16px rgba(120, 20, 0, 0.65)` | Botão primário grande |
| Campo de pergunta | `0 -8px 24px color-mix(in oklab, var(--ink) 10%, transparent)` | Sombra **para cima**, separando do conteúdo |
| Assistente em hover | `0 10px 22px -8px rgba(27, 24, 50, 0.55)` | — |
| Assistente aberta | `0 2px 8px -4px rgba(27, 24, 50, 0.5)` | Recuada quando ativa |

Sombras são quentes (base marrom-avermelhada), nunca cinza neutro.

---

## 7. Movimento

| Token | Valor |
| --- | --- |
| `--ease-device` | `cubic-bezier(0.22, 1, 0.36, 1)` — a curva assinatura |
| Transição padrão | `200ms` (botões), `240ms` (assistente) |
| `active:scale-[0.98]` | Resposta tátil de todo botão |

Animações nomeadas: `wk-sweep` (varredura da câmera, 2.4s linear infinite),
`wk-ticker` (esteira, 38s), `aya-press` (420ms), `aya-ripple` (520ms).

**Todas** desligam sob `prefers-reduced-motion: reduce`, por uma regra global
(`animation-duration: 0.01ms !important`) mais desligamentos específicos: a
varredura some, a esteira para, e a assistente troca transformação por um anel
sólido de 3px.

---

## 8. Componentes

### 8.1 Botão (`src/components/ui/button.tsx`)

Base: `rounded-full font-display text-[17px] font-semibold`, ícone 20px.

| Variante | Repouso | Hover | Foco | Desabilitado |
| --- | --- | --- | --- | --- |
| `default` | `bg-primary` / `text-primary-foreground` | `opacity-90` | anel global | `opacity-50`, sem ponteiro |
| `destructive` | `bg-destructive` / `text-destructive-foreground` | `opacity-90` | " | " |
| `outline` | borda `--border`, fundo transparente | borda e texto viram `--primary` | " | " |
| `secondary` | `bg-secondary` / `text-secondary-foreground` | `bg-accent` | " | " |
| `ghost` | transparente | `bg-accent` / `text-accent-foreground` | " | " |
| `link` | `text-primary` | sublinhado | " | " |

| Tamanho | Altura | Padding |
| --- | --- | --- |
| `sm` | `min-h-11` (44px) | `px-4` |
| `default` | `min-h-11` (44px) | `px-5 py-2` |
| `lg` | `min-h-14` (56px) | `px-8` |
| `icon` | `h-11 w-11` | — |
| `.wk-primary-action` | **68px**, largura total | `px-6`, 20px/800 |

Estado ativo: `scale(0.98)` em todos.

### 8.2 Chip de urgência

Pílula, `min-h-11`, `px-4 py-2`, 17px/700, com um ponto de 6px em
`bg-current` antes do rótulo. Cores na §2.3. A borda carrega o significado
junto com o fundo — navegador descarta fundo ao imprimir, a borda sobrevive.

### 8.3 Cartão

`rounded-2xl border border-line bg-card p-5 sm:p-6`. Variante de conteúdo longo
usa `sm:p-7`. Bloco interno de destaque: `rounded-xl bg-cream p-4`.

### 8.4 Barra de abas (`bottom-nav.tsx`)

Fixa, `bottom-0`, `z-40`, `border-t border-line`, `bg-card/95 backdrop-blur`,
`padding-bottom: env(safe-area-inset-bottom)`. Cada aba: `min-h-[72px]`,
coluna ícone+rótulo, 17px/500.

| Estado | Cor | Traço do ícone |
| --- | --- | --- |
| Ativa | `text-primary` | 2.4 |
| Inativa | `text-ink-2` | 1.8 |

Colunas dinâmicas — `repeat(N, minmax(0, 1fr))`:

| Sessão | Abas |
| --- | --- |
| Com sessão, ou ainda desconhecida | Analisar · Prazos · Documentos · Conta |
| **Sem** sessão (`false` definitivo) | Analisar · Entrar |

O sinal vem de `useHasSession()` (`getSession()`, sem rede). Usar `getUser()`
aqui faria a navegação de um assinante colapsar num soluço de conexão.

### 8.5 Campo de pergunta

Fixo em `bottom: var(--app-nav-h)`, `z-30`, `border-t`, `bg-paper`, `p-3`.
Campo: `h-14 rounded-full border border-line bg-card px-5 text-[17px]`.
Enviar: `h-14 w-14 rounded-full bg-primary`, `opacity-40` quando vazio.

### 8.6 Assistente flutuante (Aya)

`h-14 w-14`, `rounded-full`, fixa em `calc(var(--app-nav-h) + 6rem)`, `z-40`.
Três camadas: `.aya-ring` (z0, ondulação), `.aya-halo` (z1, anel dourado com
topo transparente), `.aya-face` (z2, avatar com borda `--gold-bright`).

| Estado | Face | Halo |
| --- | --- | --- |
| Repouso | — | invisível |
| Hover (só ponteiro fino) | `translateY(-3px) scale(1.07) rotate(-2.5deg)` | aparece, gira 180° em 1400ms |
| Pressionada | `aya-press` 420ms | ondulação `aya-ripple` 520ms |
| Aberta | `scale(0.94)`, sombra recuada | visível, sem rotação |
| Foco | contorno `--gold-bright` 2px, offset 4px | — |
| Movimento reduzido | sem transformação; anel sólido de 3px | — |

### 8.7 Folha de impressão

Janela própria, aberta no clique (antes de qualquer `await`, senão o navegador
bloqueia). Paleta espelhada: `--paper #F6F2EA`, `--ink #241610`,
`--ink-2 #5A4137`, `--line #E3D9C9`, `--red #B22C1B`, `--gold #B08432`.
Fundo branco no papel; o selo de urgência é desenhado **com borda**, porque
navegador descarta cor de fundo ao imprimir.

Barra fixa no topo com **Imprimir / Salvar PDF** e **Fechar**, escondida em
`@media print`. Sem ela, quem cancela o diálogo fica sem saída.
`.section, .actions li { break-inside: avoid }`.

### 8.8 Ornamentos

- `.eyebrow` — 11px mono, versalete `0.12em`, dourado, entre `[ ]` a 60% de opacidade.
- `.wk-bracket-{tl,tr,bl,br}` — cantos de 28px, borda 2px dourada, raio 10px no canto externo. Moldura de câmera.
- `.wk-arrow` — desloca 4px no hover do grupo.
- `.camera-surface` — fundo `--footer`, texto `--cream`, borda a 22% de opacidade.

---

## 9. Acessibilidade

### 9.1 Foco

```css
:focus-visible { outline: 3px solid var(--gold); outline-offset: 3px; }
```

Global, nunca removido. A assistente troca por dourado-vivo de 2px com offset 4px.

### 9.2 Alvos de toque

Mínimo **44px** (`min-h-11`) em tudo que é tocável — inclusive links de texto e
o botão de fechar de um chip. Abas de navegação: 72px. Ação primária: 68px.

### 9.3 Contraste medido

Calculado sobre os hex reais (WCAG 2.1, texto normal exige 4.5:1, texto grande
e elementos não-textuais 3:1):

| Par | Razão | Texto | Grande / não-texto |
| --- | --- | --- | --- |
| `--ink` sobre `--paper` | **15.71** | ✅ | ✅ |
| `--ink` sobre `--card` | **17.25** | ✅ | ✅ |
| `--ink-2` sobre `--paper` | **8.37** | ✅ | ✅ |
| `--ink-2` sobre `--card` | **9.20** | ✅ | ✅ |
| `--cream` sobre `--red` (botão primário) | **6.01** | ✅ | ✅ |
| `--red` sobre `--paper` | **5.75** | ✅ | ✅ |
| `--red-ink` sobre `--paper` | **7.03** | ✅ | ✅ |
| `--red-d` sobre `--red-soft` (chip urgente) | **7.06** | ✅ | ✅ |
| `--ok` sobre `--ok-soft` (chip calmo) | **5.28** | ✅ | ✅ |
| `--ok` sobre `--paper` | **5.62** | ✅ | ✅ |
| `--footer-ink` sobre `--footer` | **16.61** | ✅ | ✅ |
| `--gold` sobre `--paper` | **3.04** | ❌ | ✅ (por 0.04) |
| `--gold` sobre `--card` | **3.34** | ❌ | ✅ |
| `--line` sobre `--paper` | **1.25** | ❌ | ❌ (decorativo) |

**Duas ressalvas honestas:**

1. O dourado **reprova** para texto normal, e é justamente onde `eyebrow` e
   `mono-label` o usam — a **11px**. Esses rótulos são decorativos e repetem
   informação disponível em outro lugar, mas se algum dia carregarem conteúdo
   único, a cor precisa escurecer (≈`#8A6626` resolve).
2. O anel de foco é dourado sobre papel: **3.04:1**, contra o mínimo de 3:1. Passa
   por 0.04. Sobre cartão fica 3.34. É pouca folga — vale escurecer o dourado do
   anel se a paleta de fundo mudar.

`--line` a 1.25:1 é intencional: régua decorativa, nunca a única pista de
separação.

### 9.4 Movimento

Regra global sob `prefers-reduced-motion: reduce` derruba animação e transição
para `0.01ms`, mais desligamentos específicos (§7). Nenhum estado depende só de
movimento para ser percebido.

### 9.5 Cor não é o único canal

Urgência sempre traz **texto** ("Requer ação") junto do chip colorido, e um
ponto antes do rótulo. "Urgente" e "em breve" compartilham a cor de propósito —
a distinção é a cópia, não o matiz, para não depender de discriminação fina.

### 9.6 Idioma e semântica

`lang` acompanha o locale (pt-BR, es, en). Trechos em japonês vão em `.jp` /
`.jp-old`. Campos têm `<label>` (muitas vezes `sr-only`), ícones interativos têm
`aria-label`, e avisos que mudam sozinhos usam `aria-live="polite"`.

---

## 10. Pendências conhecidas

| Item | Situação |
| --- | --- |
| Dourado a 11px | Reprova AA para texto (3.04:1). Decorativo hoje; escurecer se virar conteúdo. |
| Anel de foco dourado | 3.04:1 sobre papel — passa por 0.04. Pouca folga. |
| `--font-mono` | Herdado do tema padrão do Tailwind, não escolhido. Rótulos mono usam a pilha do sistema. |
| Dois "design systems" | O de `wakaru/css/` (PR #2) é outro sistema, não uma variação: acento laranja, neutros cinzas, urgência com amarelo. Nunca mergeado. |
| `--radius-2xl` e `--radius-3xl` | Iguais a `--radius-xl` (16px). Intencional, mas os três nomes sugerem uma escala que não existe. |
