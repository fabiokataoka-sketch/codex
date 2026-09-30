# Wakaru — Design System

Instruções de design para o Wakaru (wakaruapp.app), app que fotografa cartas japonesas
e devolve, na língua do usuário, o que é o documento, qual o prazo e o que fazer.

Este documento é normativo. Ao gerar qualquer interface, copie os valores daqui
literalmente — não invente cor, fonte, raio ou tamanho.

**Stack:** React + TanStack Start, Tailwind CSS v4 (`@theme inline`), shadcn/ui, Supabase.
Tokens em CSS custom properties no `:root`, com ponte para o contrato do shadcn.

---

## 1. Direção

Papel japonês. Fundo creme quente, tinta marrom-escura, **um único vermelho**, ouro
apenas em borda e foco. Tipografia display Archivo com corpo Zen Kaku Gothic New.

Quem usa está estressado com uma carta que não consegue ler. A interface tem que ser
calma, grande e legível — nunca sofisticada às custas de clareza.

**Acessibilidade é restrição de projeto, não acabamento:** texto nunca abaixo de 17px,
texto secundário sempre em `ink-2`, alvo de toque nunca abaixo de 44px.

## 2. Tema

Claro apenas. Não existe tema escuro: `.dark { color-scheme: light }` neutraliza
qualquer ativação acidental. A alternância visual entre seções é `paper` ↔ `cream`,
nunca claro ↔ escuro.

## 3. Cor

### Primitivas

| Token | Valor | Papel |
| --- | --- | --- |
| `--red` | `#b22c1b` | Ação primária e marca. O único saturado da tela |
| `--red-d` | `#8e2214` | Hover/press, destrutivo, urgência |
| `--red-ink` | `#9c2414` | Kanji decorativo sobre o vermelho |
| `--red-soft` | `#f7e2dc` | Fundo de realce, glossário, chip de urgência |
| `--paper` | `#f6f2ea` | Fundo da página |
| `--cream` | `#fff6ec` | Seção alternada, superfície secundária, texto sobre vermelho |
| `--card` | `#fffdf8` | Superfície elevada |
| `--ink` | `#241610` | Texto primário |
| `--ink-2` | `#5a4137` | Texto secundário — o tom mais fraco permitido em texto |
| `--line` | `#e3d9c9` | Divisórias e bordas |
| `--ok` | `#2f6b52` | Estado calmo, "sem ação necessária" |
| `--ok-soft` | `#e0efe7` | Fundo do estado calmo |
| `--gold` | `#b08432` | Foco, borda, forma. **Nunca em texto** |
| `--footer` | `#2a1109` | Fundo do rodapé e da câmera |
| `--footer-ink` | `#fff6ec` | Texto sobre o rodapé |

### Derivadas

```css
--ground: var(--paper);      --surface: var(--card);    --surface-2: var(--cream);
--ink-3: var(--ink-2);       --rule: var(--line);
--rule-strong: color-mix(in oklab, var(--line) 72%, var(--ink));
--urgent: var(--red-d);      --urgent-bg: var(--red-soft);
--soon:   var(--red-d);      --soon-bg:   var(--red-soft);
--info:   var(--ink-2);      --gold-bright: var(--gold);
--camera-ground: var(--footer);  --camera-ink: var(--cream);
```

### Contrato shadcn

```
background paper · foreground ink · card #fffdf8 · primary red · primary-foreground cream
secondary cream · muted cream · muted-foreground ink-2 · accent cream · accent-foreground ink
destructive red-d · border line · input rule-strong · ring gold
```

### Sombras

```css
--hero-card-shadow:      0 30px 60px -26px rgba(60, 8, 0, 0.65);
--primary-action-shadow: 0 14px 30px -16px rgba(120, 20, 0, 0.65);
```

### Regras de cor

1. **Uma voz alta.** O vermelho marca a ação primária e a urgência. Nunca decoração,
   nunca mais de um momento de destaque por tela.
2. **Ouro não é texto.** Só borda, anel de foco e forma. Sobre papel ele dá ~3:1 —
   passa como elemento de interface, reprova como texto.
3. **Cor nunca sozinha.** Todo estado vem acompanhado de rótulo textual.
4. **Nada abaixo de `ink-2` em texto.** Cinza fraco está banido.
5. **Sobre preenchimento colorido não existe texto secundário.** Nada de `opacity` para
   criar hierarquia sobre o vermelho ou sobre o rodapé — a hierarquia vem de peso,
   tamanho e espaço. O token `ink-2` foi calibrado contra papel (7,9:1); sobre o
   rodapé `#2a1109` ele cai para ~1,9:1 e some.

## 4. Tipografia

| Token | Família | Uso |
| --- | --- | --- |
| `--font-display` | Archivo 700/800 | Títulos, botões, nav. Caixa natural, tracking 0 |
| `--font-sans` | Zen Kaku Gothic New 400/500/700 | Corpo das páginas públicas |
| `--font-friendly` | Zen Maru Gothic 400/500/700 | Corpo das telas internas |
| `--font-jp` | Noto Sans JP | Texto japonês corrente |
| `--font-jp-old` | Zen Old Mincho 400/600 | Texto-fonte japonês, kanji decorativo |

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Zen+Maru+Gothic:wght@400;500;700&family=Zen+Old+Mincho:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&display=swap">
```

- `body`: **18px**. Mínimo absoluto em qualquer tela: **17px**.
- `h1` da landing: `clamp(38px, 6.4vw, 70px)`, leading `.97`, peso 800.
- Título de seção: 32px → 44px em `sm`, leading `1.05`.
- Título de card: 19–27px. Corpo: 17–20px, leading 1.55–1.6.
- `h1..h4` e `.font-display`: Archivo, `letter-spacing: 0`, `text-transform: none`.
- Rótulo de seção: 14px, `font-bold`, `uppercase`, `tracking-[.1em]`, cor `ink-2` —
  texto normal, não monoespaçado.
- Japonês nunca recebe `text-transform` nem tracking negativo.

**Duas superfícies, dois corpos:**

```css
.public-page   { font-family: var(--font-sans);     font-size: 18px; }  /* landing, login, legal */
.internal-page { font-family: var(--font-friendly); font-size: 18px; }  /* app logado */
```

## 5. Forma

```
--radius-sm 8px · --radius-md 10px · --radius-lg 12px · --radius-xl 16px
--radius-2xl e --radius-3xl também 16px — o sistema tem teto de 16px
```

- **Botão:** pílula (`rounded-full`), `font-display`, 17px, `font-semibold`,
  `active:scale-[0.98]`. Alturas: default min 44px, `lg` min 56px, `icon` 44×44.
- **Ação primária de hero** (`wk-primary-action`): 68px de altura, largura total,
  `rounded-xl`, Archivo 20px `font-extrabold`, `--primary-action-shadow`.
- **Ação secundária empilhada:** mínimo 50px, `rounded-xl`, borda 2px `line`.
- **Card:** `rounded-xl`, borda `line`, fundo `card`.
  Card do hero: `rounded-[18px]` + `--hero-card-shadow`.
- **Zona de upload:** borda tracejada 2px `line` sobre `paper`.

## 6. Movimento e foco

- Easing assinatura: `cubic-bezier(0.22, 1, 0.36, 1)`. Duração padrão 200ms.
- `prefers-reduced-motion: reduce` zera animação e transição (`0.01ms`) globalmente.
- Foco: `outline: 3px solid var(--gold); outline-offset: 3px` em todo interativo.
- A varredura do scanner (`.wk-sweep`) é exclusiva da câmera. Não use como decoração.

## 7. Ritmo de página

- Container `max-w-6xl`, `px-4 sm:px-6`. Seções `py-16 sm:py-20`.
- Seções alternam `bg-paper` e `bg-cream`.
- **Hero** sobre `bg-primary` com texto `cream`, e um kanji gigante em Zen Old Mincho,
  cor `red-ink`, sangrando no canto inferior direito como marca d'água (`aria-hidden`).
- **CTA final** em faixa `bg-primary` centralizada, com a ação primária invertida
  (fundo `card`, texto `primary`).
- **Rodapé** em `--footer` com texto `--footer-ink` e links em pílula de borda.
- Passos numerados: numeral Archivo 64px em `primary`, ou badge redondo de 26px
  com fundo `primary` e numeral creme.
- FAQ: `<details>` separados por `line`, `summary` de 64px, `+` / `−` em `primary`.
- Chat: balão do usuário em `bg-primary` com texto `cream`; resposta em `card` com
  borda `line`.

## 8. Componentes do produto

- **Superfície de câmera** (`camera-surface`): fica quase preta (`--footer`) com texto
  creme. É funcional, não decorativa — a foto precisa de fundo escuro para ser julgada.
- **Cantoneiras do visor** (`wk-bracket-*`): quatro cantos de 28px, borda 2px em ouro.
- **Chips de estado:** `chip-urgent` e `chip-soon` (vermelho sobre `red-soft`),
  `chip-calm` (verde sobre `ok-soft`). Exatamente **um** por documento, sempre com rótulo.
- **Par bilíngue:** japonês de origem em cima (Zen Old Mincho), tradução embaixo em
  corpo normal.
- **Barra de navegação interna:** altura real reservada em
  `--app-nav-h: calc(72px + 1px + env(safe-area-inset-bottom))`. Qualquer elemento fixo
  acima dela precisa descontar os três termos — um valor fixo de 76px passa por baixo
  da barra em iPhone com indicador de home.

## 9. Voz

Simples, calma, prática. Diga o que o documento é, quando vence e o que fazer — sem
jargão, sem juridiquês. Frase normal em vez de rótulo técnico: nada de maiúscula
monoespaçada para dizer quanta cota sobrou. A venda só aparece quando a cota acaba.

O Wakaru é ferramenta de tradução e orientação. Ele **não** prepara nem submete
documentos, e não dá aconselhamento jurídico.

## 10. Armadilhas verificadas

**CSS fora de `@layer` vence todas as utilidades do Tailwind.** No cascade, declaração
sem camada tem precedência sobre qualquer `@layer`, e as utilidades do Tailwind v4 vivem
em `@layer utilities`. Duas consequências já observadas neste projeto:

- Um `.aya { position: relative }` solto derrubou o `fixed` do botão flutuante para o
  meio da lista de mensagens. A correção é envolver em `@layer components`, onde a
  utilidade volta a vencer e o `relative` ainda vale onde nenhuma utilidade é aplicada.
- Uma tentativa de garantir o piso de 17px com
  `.public-page :where(*) { font-size: max(17px, 1em) }` fora de camada não cria piso:
  ela **substitui** o `font-size` de todo descendente, inclusive os que declaram
  tamanho, e achata a hierarquia inteira — um `h1` de 52px passa a renderizar no
  tamanho do pai. Em CSS puro não há como distinguir "elemento sem tamanho declarado"
  de "elemento com tamanho declarado". O piso se obtém corrigindo elemento a elemento.

**Auditoria que só mede o mínimo não prova nada.** Um documento sem hierarquia nenhuma
satisfaz qualquer piso de tamanho de fonte. Meça sempre o menor **e** o maior por rota.

**`style` inline vence classe.** Um `style={{ color: ... }}` com token de papel aplicado
sobre o rodapé escuro não é salvo pela regra de cor da faixa.

## 11. Checagem antes de entregar tela

- [ ] Menor texto ≥ 17px, e a hierarquia tem topo bem acima disso
- [ ] Texto secundário em `ink-2`, nunca mais fraco
- [ ] Um único momento de vermelho na tela
- [ ] Ouro só em borda, foco e forma
- [ ] Contraste calculado, não estimado
- [ ] Alvo de toque ≥ 44px; ação secundária empilhada ≥ 50px; ação primária 68px
- [ ] Anel de foco visível em todo interativo
- [ ] Estado com rótulo, nunca só cor
- [ ] Japonês em Noto Sans JP, ou Zen Old Mincho quando é texto-fonte
- [ ] `prefers-reduced-motion` respeitado
- [ ] Sem rolagem horizontal em 360px
