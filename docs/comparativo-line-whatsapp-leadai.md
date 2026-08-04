# Comparativo: LINE · WhatsApp · LINE Lead AI

> Pesquisa de agosto/2026. Complementa `line-for-business.md` e `line-atendimento-tradutores.md`.
> Projeto analisado: **LINE Lead AI** (`ai-lead-captura`, Lovable) — https://ai-lead-captura.lovable.app
> ⚠️ = fonte secundária, confirmar antes de decidir.

---

## 0. Corrigindo o eixo da comparação

As três coisas não competem entre si. Estão em camadas diferentes:

```
CAMADA 1 — CANAL (onde o cliente está)
   LINE  ·  WhatsApp
        └── decisão de mercado, não de produto

CAMADA 2 — ORGANIZAÇÃO (como as mensagens viram trabalho)
   OA grátis · Chat Pro · Opção CRM · LINE Lead AI
        └── decisão de custo × capacidade
```

**LINE Lead AI não substitui o LINE — ele exige o LINE.** É uma camada de automação construída
sobre o LINE Official Account, via Messaging API. Comparar "LINE vs LINE Lead AI" é comparar
estrada com carro. A comparação real é *dentro da camada 2*: qual camada de organização vale
o custo.

---

## 1. Camada 1 — LINE vs WhatsApp (para operar no Japão)

| | LINE | WhatsApp |
|---|---|---|
| Base no Japão | **~99M MAU · 78%+ da população** | Penetração desprezível |
| Papel | Superapp: chat, pagamento, cupom, mini-apps | App de mensagem |
| Encontrabilidade | Busca por nome (com selo azul), QR, ID | Só por telefone |
| Menu persistente | **Rich menu** nativo | ❌ |
| Janela de atendimento | **Não existe** — fala quando quiser | 24h após o cliente falar |
| Chat 1:1 | Grátis | Grátis dentro da janela |
| Disparo ativo | Cobrado por destinatário | Cobrado por mensagem (template) |

**No Japão isso não é escolha, é fato consumado.** Um brasileiro no Japão precisa do LINE para
falar com prefeitura, hospital, escola, imobiliária e emprego. O WhatsApp existe na comunidade,
mas para falar **com o Brasil** — família, remessa, saudade. São dois canais com finalidades
diferentes e sobrepostos apenas em parte.

**Implicação para um serviço de tradução:** o LINE é o canal do trabalho (cliente japonês,
documento, prazo, órgão público). O WhatsApp é canal de origem do cliente (indicação de parente
no Brasil, grupo de comunidade). Faz sentido **existir nos dois, mas operar a triagem no LINE** —
é lá que o cliente já está quando o problema aparece.

### Custo do WhatsApp, se for usar
- **WhatsApp Business App (grátis):** etiquetas coloridas, respostas rápidas (`/`), mensagem de
  saudação e ausência, catálogo, até 5 dispositivos (10 com Meta Verified), lista de transmissão
  limitada a 256. **Sem CRM e sem integração de terceiros.**
- **WhatsApp Business Platform (API):** desde 01/07/2025 cobra **por mensagem**, não por conversa.
  Resposta dentro da janela de 24h é grátis. No Brasil ⚠️: marketing ~R$0,31–0,38 · utilidade
  ~R$0,04–0,05 · autenticação ~R$0,15–0,19. Some o BSP: **R$149–500/mês** ⚠️ + markup.

> Estruturalmente WhatsApp e LINE cobram a mesma coisa: **conversa é grátis, iniciativa é paga.**
> A diferença está no alcance e na riqueza de produto — e no Japão o LINE ganha nos dois.

---

## 2. Camada 2 — as quatro opções de organização

| | **A. OA grátis** | **B. + Chat Pro** | **C. + Opção CRM** | **D. + LINE Lead AI** |
|---|---|---|---|---|
| Setup | ¥0 | ¥0 | ¥0 (¥20.000 opc.) | **¥80.000–150.000** |
| Mensal | ¥0 | ¥3.300 | ¥5.500 ⚠️ | **¥15.000+** (+infra) |
| Tags | 5 · **1 por conversa** | 300 · 30 por pessoa | 300 · 30 | Ilimitado (Supabase) |
| Histórico | **6 meses** | 5 anos | 5 anos | Próprio, permanente |
| Triagem | Manual | Manual | **Formulário → tag automática** | **IA lê a intenção** |
| Resposta automática | Palavra-chave | AI chatbot (beta) | AI chatbot (beta) | **Claude, linguagem natural** |
| Nutrição/follow-up | ❌ | ❌ | Automação por gatilho | **Sequência inteligente** |
| Exige selo azul | ❌ | ❌ | **✅** | ❌ |
| Dono do dado | LINE | LINE | LINE | **Você (Supabase)** |
| Depende de fornecedor | Não | Não | Não | **Sim** |

**Custo do ano 1** (só a camada, sem plano de mensagem):

| | Ano 1 |
|---|---|
| A | ¥0 |
| B | ¥39.600 |
| C | ¥66.000 (¥86.000 com setup assistido) |
| **D** | **¥260.000+** (¥80k setup + ¥180k manutenção) |

**D custa ~4× C no primeiro ano.** Esse é o número que define todo o discurso comercial do
LINE Lead AI.

---

## 3. O projeto LINE Lead AI — leitura honesta

**O que existe hoje:** uma landing page trilíngue (PT/EN/JA) muito bem construída — TanStack Start,
i18n, rotas `/`, `/en`, `/ja`. **Não há backend, banco, edge function ou webhook do LINE no
repositório.** O produto é vendido como **serviço de implementação sob medida** (Claude + n8n +
Supabase), não como SaaS. Isso não é defeito — é um modelo. Mas define o teto.

**Posicionamento declarado:** contra "soluções tradicionais japonesas" — fluxos rígidos por
palavra-chave, custo de agência alto, configuração lenta.

### 3.1 O que mudou embaixo desse posicionamento

Em **24/06/2026 a LINE lançou a Opção CRM nativa** (¥5.500/mês): formulários que aplicam tag
automaticamente, lista de usuários, automação por gatilho, envio segmentado.

Isso não invalida o diferencial — o nativo continua **baseado em regra**, e "IA que entende
intenção real" segue verdadeiro. Mas **muda a âncora de preço**. Antes o prospect comparava
¥80.000 contra uma agência japonesa cara. Agora ele compara contra **¥5.500/mês da própria LINE**.
O argumento não pode mais ser "é mais barato que agência" — precisa ser "faz o que o nativo
não faz".

**O que o nativo genuinamente não faz** (e é onde o discurso deve se apoiar):
1. **Não entende linguagem natural.** Formulário exige que o cliente preencha campo. IA lê
   "preciso traduzir minha certidão de nascimento pra dar entrada no visto, é urgente" e extrai
   tipo, finalidade e urgência sozinha. **Esse é o produto.**
2. **Exige selo azul.** Quem ainda não tem verificação **não pode contratar a Opção CRM** — e o
   LINE Lead AI funciona em conta gratuita não verificada. Porta de entrada real.
3. **Só funciona no PC.** Sem app de celular.
4. **⚠️ Formulário sincroniza 1×/dia**, não em tempo real. Se isso atrasa a chegada do lead, é
   um furo grande — e é exatamente o argumento "responder em segundos".
5. **O dado fica na LINE.** No Supabase, o dado é do cliente, cruzável e portável.

### 3.2 Dois furos no modelo de custo

**(a) A nutrição é cobrada, e não está na conta.**

Regra do LINE: **reply é grátis, push é cobrado.** A etapa 3 ("responde na hora") usa reply token →
**custa ¥0 em taxa de mensagem**. Mas a etapa 4 ("nutrição automática nos dias seguintes") é push →
**cobrada por destinatário**.

Simulação: cliente com 1.000 leads e sequência de 5 mensagens = **5.000 mensagens/mês**. Estoura
o plano gratuito (200) e o Light (5.000, no limite) → precisa de **Standard, ¥15.000/mês**.

Ou seja: o ¥15.000 de manutenção do LINE Lead AI **dobra na prática** para ¥30.000, e essa segunda
metade vai para a LINE, não para vocês. Se isso não está explícito na proposta, vira fatura
surpresa e desgaste na primeira renovação.

**(b) A infra não aparece.** n8n, Supabase e consumo da API da Claude são custo recorrente real.
Precisa estar modelado no ¥15.000 — ou ele vira margem negativa conforme o cliente cresce.

### 3.3 O argumento mais forte, e ele não está sendo usado

**Resposta instantânea via IA custa ¥0 em taxa de mensagem.**

Porque reply é gratuito no LINE. Um concorrente que usa push para responder paga; vocês não.
Isso permite uma frase que nenhum concorrente pode copiar sem mudar de arquitetura:

> *"Responder na hora, quantas vezes for, sem pagar mensagem. Você só paga quando escolhe
> procurar o cliente — não quando ele procura você."*

Isso é diferencial técnico verificável, não promessa de marketing. Está na página de preços da
própria LINE.

---

## 4. Aplicando ao caso LB Traduções

**Fit parcial, e vale ser honesto sobre qual metade.**

A landing mira "infoprodutores com tráfego que perdem lead por demora" — o problema é
**captação e nutrição até a venda**. Um serviço de tradução tem outro problema:
**triagem operacional de demanda recorrente**. O cliente não precisa ser convencido; ele já tem
um documento na mão e um prazo.

| Etapa do LINE Lead AI | Serve para tradução? |
|---|---|
| ① Cliente manda mensagem no LINE | ✅ Idêntico |
| ② IA classifica a intenção | ✅ **É exatamente o que falta** — tipo de documento, idioma, prazo, finalidade |
| ③ Responde na hora e organiza | ✅ Forte — e sem custo de mensagem |
| ④ Nutrição nos dias seguintes | ⚠️ **Fit fraco** — e é a parte que custa. Vira lembrete de prazo/status, não funil de venda |

**Recomendação para LB Traduções:** as etapas ①②③ resolvem o problema declarado (filtrar e
organizar). A etapa ④ deveria ser reescrita como **acompanhamento de pedido** (orçamento enviado →
aguardando pagamento → em tradução → pronto para retirada), não como sequência de venda. Isso
reduz drasticamente o volume de push e mantém o custo do plano LINE no gratuito ou no Light.

**Caminho pragmático em duas fases:**
1. **Agora:** Chat Pro (¥3.300/mês) + rich menu + saudação. Resolve 80% da dor por 2% do custo do
   setup completo, e **gera o dado real** — quais perguntas chegam, em que volume, com que
   variação de linguagem.
2. **Em 60–90 dias:** com esse dado, a IA de classificação é treinada em cima de casos reais em
   vez de suposição. O setup do LINE Lead AI fica melhor e mais fácil de justificar.

Usar a própria operação da LB como **caso-piloto documentado** é provavelmente o ativo comercial
mais valioso que o LINE Lead AI pode ter agora — "reduzimos X% do tempo de triagem em uma operação
real de tradução no Japão" vende mais que qualquer página.

---

## 5. Matriz de decisão

| Situação | Escolha |
|---|---|
| Testando, volume baixo, sem orçamento | **A** — OA grátis + rich menu |
| Precisa organizar e guardar histórico **já** | **B** — Chat Pro ¥3.300 |
| Tem selo azul, quer triagem estruturada sem código | **C** — Opção CRM ¥5.500 |
| Volume alto, linguagem variada, quer o dado no próprio banco | **D** — LINE Lead AI |
| Público no Brasil, não no Japão | WhatsApp |
| Público brasileiro **no Japão** | **LINE na operação**, WhatsApp como canal secundário |

**Regra geral:** só suba de camada quando a anterior estiver saturada, com dado que comprove.
O erro caro aqui não é escolher a opção errada — é comprar a camada D antes de saber quais
perguntas realmente chegam.

---

## 6. Ações sugeridas para o LINE Lead AI (produto)

1. **Atualizar o comparativo da seção "Diferencial"** — o inimigo agora é a Opção CRM nativa
   (¥5.500), não a agência japonesa. Comparar contra o que existe hoje.
2. **Vender o reply gratuito.** É o argumento técnico mais forte e não está na página.
3. **Explicitar o custo do plano LINE na proposta.** Separar "o que você paga para a AI Lab" de
   "o que você paga para a LINE" evita a fatura surpresa.
4. **Reposicionar a etapa ④** — nutrição de venda para infoprodutor; acompanhamento de pedido para
   negócio de serviço. São dois produtos com a mesma engenharia.
5. **Segmentar quem não tem selo azul** — é o público que *não pode* comprar a opção nativa.
   Mercado cativo e defensável.
6. **Decidir a bifurcação:** serviço sob medida (¥80–150k, margem alta, não escala) ou produto
   multi-tenant (mensalidade menor, escala, compete de frente com o nativo). O modelo atual é o
   primeiro; a landing promete a linguagem do segundo.

---

## Fontes

- Projeto: [LINE Lead AI](https://ai-lead-captura.lovable.app) · [editor](https://lovable.dev/projects/f832f8a3-2420-4fa3-8b74-c69c6adc81dd)
- [Messaging API pricing — LINE Developers](https://developers.line.biz/en/docs/messaging-api/pricing/)
- [CRMオプション — Liny](https://line-sm.com/blog/loa-crm-option/) · [チャットProオプション — クウゼン](https://kuzen.io/blogs/line-official-LINEchatProOption)
- [WhatsApp Business API Pricing 2026 — Blueticks](https://blueticks.co/blog/whatsapp-business-api-pricing-2026) · [Brasil (BRL) — Message Central](https://www.messagecentral.com/blog/whatsapp-business-api-pricing-brazil) · [Whautomate](https://whautomate.com/whatsapp-business-api-pricing-brazil)
- [WhatsApp Business App guide 2026 — AiSensy](https://m.aisensy.com/blog/whatsapp-business-app-the-complete-guide/) · [Qiscus](https://www.qiscus.com/en/blog/whatsapp-business-features/)
- [Social Media in Japan 2026 — Hanami Social](https://hanamisocial.com/en/blog/social-media-japan-statistics-2026/) · [LINE vs WhatsApp in Japan — Charlesworth](https://www.charlesworth-group.com/blog/why-line-is-superior-messaging-app-in-japan/)
