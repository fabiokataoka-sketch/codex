# Wakaru Design System

Extraído de `src/styles.css`, `src/components/ui/button.tsx` e `src/routes/index.tsx` do projeto
Lovable **Wakaruapp** (`b1dc9829-409f-4268-9498-81cc9fb3196e`) em 2026-09-16.

Direção visual: **papel japonês**. Fundo creme quente, tinta marrom-escura, um único vermelho
de marca, ouro só em bordas e foco, tipografia display Archivo com corpo Zen Kaku Gothic New.
Acessibilidade AAA como restrição de projeto: texto nunca abaixo de 17px, secundário sempre em
`ink-2`, alvo de toque nunca abaixo de 44px.

> A *knowledge* do projeto Wakaru no Lovable ainda descreve o sistema antigo
> (laranja `#FF4D00`, Space Grotesk, tema escuro, "rabbit r1"). Está obsoleta —
> o CSS em produção é o que está documentado aqui.

## 1. Tema

Claro apenas. Não há tema escuro: `.dark { color-scheme: light }` neutraliza qualquer
ativação acidental. A alternância visual das seções é feita entre `paper` e `cream`,
não entre claro e escuro.

## 2. Cor

### Primitivas

| Token | Valor | Papel |
| --- | --- | --- |
| `--red` | `#b22c1b` | Ação primária, marca. O único saturado da tela |
| `--red-d` | `#8e2214` | Hover/press da ação, destrutivo, urgência |
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
| `--gold` | `#b08432` | Foco, bordas, formas. **Nunca em texto** |
| `--footer` | `#2a1109` | Fundo do rodapé |
| `--footer-ink` | `#fff6ec` | Texto do rodapé |

### Derivadas

```
--ground: paper          --surface: card         --surface-2: cream
--ink-3: ink-2           --rule: line            --rule-strong: color-mix(in oklab, line 72%, ink)
--urgent: red-d          --urgent-bg: red-soft   --soon: red-d
--info: ink-2            --gold-bright: gold     --camera-ground: footer / --camera-ink: cream
```

### Contrato shadcn

```
background paper · foreground ink · card #fffdf8 · primary red · primary-foreground cream
secondary cream · muted cream · muted-foreground ink-2 · accent cream · accent-foreground ink
destructive red-d · border line · input rule-strong · ring gold
```

### Sombras

```
--hero-card-shadow:      0 30px 60px -26px rgba(60, 8, 0, 0.65)
--primary-action-shadow: 0 14px 30px -16px rgba(120, 20, 0, 0.65)
```

### Regras

1. **Uma voz alta.** O vermelho marca a ação primária e a urgência. Nunca decoração,
   nunca mais de um momento de destaque por tela.
2. **Ouro não é texto.** Só borda, anel de foco e forma.
3. **Cor nunca sozinha.** Todo estado vem com rótulo textual.
4. **Nada abaixo de `ink-2`.** Cinza fraco está banido em texto.

## 3. Tipografia

| Token | Família | Uso |
| --- | --- | --- |
| `--font-display` | Archivo 700/800 | Títulos, botões, nav. Caixa natural, tracking 0 |
| `--font-sans` | Zen Kaku Gothic New 400/500/700 | Corpo das páginas públicas |
| `--font-friendly` | Zen Maru Gothic 400/500/700 | Corpo das telas internas (`.internal-page`) |
| `--font-jp` | Noto Sans JP | Texto japonês corrente |
| `--font-jp-old` | Zen Old Mincho 400/600 | Fonte japonesa de origem, kanji decorativo |

- Base do `body`: **18px**. Mínimo absoluto em qualquer tela: **17px**.
- `h1` da landing: `clamp(38px, 6.4vw, 70px)`, leading `.97`, peso 800.
- Título de seção: 32px → 44px em `sm`, leading `1.05`.
- Título de card: 19–27px. Corpo: 17–20px, leading 1.55–1.6.
- `.public-page` usa `--font-sans`; `.internal-page` usa `--font-friendly`. Ambos 18px.
- Sem `text-transform: uppercase` em display, e nunca em japonês.
- Rótulo de seção (eyebrow): 14px, `font-bold`, `uppercase`, `tracking-[.1em]`, cor `ink-2` —
  texto normal, **não** monoespaçado.

## 4. Forma

```
--radius-sm 8px · --radius-md 10px · --radius-lg 12px · --radius-xl 16px
--radius-2xl e --radius-3xl também 16px — o sistema tem teto de 16px
```

- **Botão**: pílula (`rounded-full`), `font-display`, 17px, `font-semibold`,
  `active:scale-[0.98]`. Alturas: `default` min 44px, `lg` min 56px, `icon` 44×44.
- **Ação primária de hero** (`wk-primary-action`): 68px de altura, largura total,
  `rounded-xl`, Archivo 20px `font-extrabold`, `--primary-action-shadow`.
- **Ação secundária empilhada**: no mínimo 50px, `rounded-xl`, borda 2px `line`.
- **Card**: `rounded-xl`, borda `line`, fundo `card`. Card do hero: `rounded-[18px]` +
  `--hero-card-shadow`.
- **Zona de upload**: borda tracejada 2px `line` sobre `paper`.

## 5. Movimento e foco

- Easing assinatura: `cubic-bezier(0.22, 1, 0.36, 1)`. Duração padrão 200ms.
- `prefers-reduced-motion: reduce` zera animação e transição globalmente (`0.01ms`).
- Foco: `outline: 3px solid var(--gold); outline-offset: 3px` em todo elemento interativo.

## 6. Ritmo de página

- Container `max-w-6xl`, `px-4 sm:px-6`. Seções `py-16 sm:py-20`.
- Seções alternam `bg-paper` e `bg-cream`.
- **Hero** sobre `bg-primary` com texto `cream`, e um kanji gigante em Zen Old Mincho,
  cor `red-ink`, sangrando no canto inferior direito como marca d'água.
- **CTA final** em faixa `bg-primary` centralizada, com a ação primária invertida
  (fundo `card`, texto `primary`).
- **Rodapé** em `--footer` com texto `--footer-ink` e links em pílula de borda.
- Passos numerados: numeral Archivo 64px em `primary`, ou badge redondo de 26px
  com fundo `primary`.
- FAQ: `<details>` separados por `line`, com `+` / `−` em `primary`, `summary` de 64px.
- Chat: balão do usuário em `bg-primary` com texto `cream`; resposta em `card` com borda `line`.

## 7. Acessibilidade

- Texto mínimo de 17px, secundário sempre em `ink-2`.
- Alvos de toque ≥ 44px; ações secundárias empilhadas ≥ 50px; ação primária 68px.
- Ouro apenas em borda, foco e forma — reprova como texto.
- Anel de foco visível em todo elemento interativo; estado nunca comunicado só por cor.

## 8. Voz

Simples, calma, prática. Frase normal em vez de rótulo técnico: nada de maiúsculas
monoespaçadas para dizer quanta cota sobrou. Venda só aparece quando a cota acaba.

## 9. Armadilhas no porte para outro projeto

**Piso de 17px não se faz com regra global.** A tentação é escrever algo como

```css
.public-page :where(*) { font-size: max(17px, 1em); }
```

fora de qualquer `@layer`, para que nenhuma utilidade legada derrube o texto. Não funciona:
declaração sem camada tem precedência sobre `@layer` no cascade, e as utilidades do
Tailwind v4 moram em `@layer utilities`. A regra não estabelece piso — ela **substitui** o
`font-size` de todo descendente, inclusive os que declaram um tamanho. Um `h1` com
`text-[52px]` passa a renderizar no tamanho do pai, e a página inteira vira um bloco de
texto de tamanho único. Em CSS puro não há como distinguir "elemento sem tamanho
declarado" de "elemento com tamanho declarado", então o piso se obtém corrigindo as
classes pequenas elemento a elemento.

Uma auditoria que só reporta o menor tamanho de fonte não pega esse defeito: um documento
sem hierarquia nenhuma satisfaz qualquer piso. Meça também o maior tamanho por rota.

**Texto secundário não atravessa para superfície escura ou saturada.** `ink-2` (`#5a4137`)
foi calibrado contra papel, onde dá 7,9:1. Sobre o rodapé (`#2a1109`) dá ~1,9:1, e sobre o
vermelho de marca não fica muito melhor. Um `style` inline com esse token vence a regra de
cor da própria faixa. Sobre preenchimento colorido não existe nível de texto secundário —
a hierarquia vem de peso, tamanho e espaço.
