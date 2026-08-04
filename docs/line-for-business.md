# LINE para Empresas e Pequenos Negócios — Guia de Referência

> Estado da pesquisa: agosto de 2026. Preços e regras do LINE mudam por país e com frequência;
> cada bloco indica a fonte e o grau de confiança. Números marcados com ⚠️ vieram de fontes
> secundárias e devem ser reconferidos no site oficial do país antes de virar decisão comercial.

---

## 1. O que é o LINE, e onde ele importa

O LINE é o app de mensagens dominante no Japão, Taiwan e Tailândia, com presença relevante na
Indonésia. Ele não é "mais um WhatsApp": é um **superapp**, onde chat, pagamentos, delivery,
notícias, cupons e mini-aplicativos vivem dentro do mesmo binário. A operadora hoje é a
**LY Corporation** (fusão LINE + Yahoo! Japan).

Isso muda a natureza do canal para um negócio. No LINE, a empresa não tem "um perfil" — ela tem
**uma conta que vira um contato na lista de conversas do cliente**, com menu próprio, cartão de
fidelidade, cupons e loja. É um canal de retenção, não de descoberta.

### Realidade geográfica (importante antes de qualquer plano)

O LINE for Business é fortemente **region-locked**. O que existe de verdade depende do país:

| Recurso | Japão | Taiwan | Tailândia | EUA / Singapura / Indonésia | UE |
|---|---|---|---|---|---|
| Official Account (plano grátis) | ✅ | ✅ | ✅ | ✅ | ❌ não disponível |
| Planos pagos (Light/Standard) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Premium ID (ID customizado) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Conta verificada (selo azul) | ✅ | ✅ | ✅ | ❌ | ❌ |
| LINE Ads Platform | ✅ | ✅ | ✅ | ❌ | ❌ |

**Para o Brasil:** o LINE não tem operação comercial local. Na prática, um negócio brasileiro
ficaria com a conta gratuita (200 mensagens/mês), sem verificação, sem anúncios e sem ID premium —
inviável como canal principal. O LINE só faz sentido para (a) quem vende **para** Japão/Taiwan/
Tailândia, (b) quem atende turistas/comunidade japonesa, ou (c) quem constrói **produto/software**
para esses mercados. Esse é o enquadramento correto para decidir se vale investir aqui.

---

## 2. As peças do ecossistema

```
                        ┌─────────────────────────────────┐
                        │        LINE (app do cliente)     │
                        └─────────────────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        │               │               │               │               │
  Official Account   LINE Ads     Notification Msg   MINI App /      Comércio
  (o núcleo)         (aquisição)  (não-amigos)       LIFF (web)      (MyShop/Pay)
        │
        ├── OA Manager (console no-code) ──► pequeno negócio opera aqui
        └── Messaging API (webhook)     ──► dev/agência constrói aqui
```

- **LINE Official Account (OA)** — o núcleo. Conta da empresa, lista de "amigos" (seguidores),
  envio de mensagens, menu rico, chat 1:1.
- **OA Manager** — console web/app no-code. É onde 90% dos pequenos negócios operam, sem escrever
  uma linha de código.
- **Messaging API** — a mesma conta, mas dirigida por servidor. Habilita chatbot, CRM externo,
  integração com estoque/agenda.
- **LINE Ads Platform (LAP)** — mídia paga, incluindo um objetivo nativo de "ganhar amigo".
- **LINE Notification Messages** — envio para quem **não** é amigo, via casamento de telefone.
- **LIFF / LINE MINI App** — web apps que rodam dentro do LINE (agendamento, ficha de sócio,
  pedido em mesa).
- **Comércio** — MyShop/LINE SHOPPING (forte na Tailândia); LINE Pay (encerrado no Japão).

---

## 3. LINE Official Account — o núcleo

### 3.1 Tipos de conta (o sistema de selos)

| Selo | Tipo | O que muda |
|---|---|---|
| 🛡️ Cinza | Não verificada | Criação imediata e grátis. **Não aparece na busca** — o cliente só acha via QR, link ou ID exato. |
| 🛡️ Azul | Verificada | Passa por análise da LY Corp. **Aparece na busca por nome**, ganha credibilidade, destrava LINE Ads. |
| 🛡️ Verde | Premium | Concedida por critério próprio da LINE (grandes marcas, celebridades). Não se "compra". |

O salto **cinza → azul é o mais importante para um pequeno negócio**: sem ele, o cliente
literalmente não consegue encontrar a loja pesquisando o nome dela. A verificação é gratuita, mas
exige documentação do negócio e aprovação.

### 3.2 Premium ID

Por padrão a conta recebe um Basic ID aleatório (ex.: `@123abcde`). O **Premium ID** permite
escolher algo memorizável (ex.: `@cafedaesquina`), até 18 caracteres, por uma taxa anual
(≈ US$ 12/ano ⚠️, varia por país). É pré-requisito prático para material impresso e para o processo
de verificação.

### 3.3 Planos e preços

**Japão** (fonte primária: LINE Developers — alta confiança):

| Plano | Mensalidade | Mensagens grátis/mês | Mensagens adicionais |
|---|---|---|---|
| Communication (コミュニケーション) | ¥0 | 200 | ❌ não permitido |
| Light (ライト) | ¥5.000 | 5.000 | ❌ não permitido |
| Standard (スタンダード) | ¥15.000 | 30.000 | ✅ até ¥3/msg |

Estourar a cota sem plano que permita adicionais **não gera cobrança — gera erro**: a API retorna
falha e a mensagem simplesmente não sai. Isso é uma armadilha operacional clássica.

**Tailândia** ⚠️ (fonte secundária, conferir em `lineforbusiness.com/th`):
grátis 200 msgs · Light ฿599/4.000 msgs · Standard ฿1.599/10.000 msgs.

**Demais regiões (tabela em USD)** ⚠️: Light US$ 50/10.000 msgs · Standard US$ 150/40.000 msgs,
com adicionais a partir de ~US$ 0,05. Lembrando que esses planos **não existem** em EUA, UE,
Singapura e Indonésia.

### 3.4 Reajuste anunciado para 1º de outubro de 2026 (Japão)

A LY Corporation anunciou em 16/02/2026 a mudança na tarifa de **mensagens adicionais**
(só afeta o plano Standard).

- **Hoje:** escada regressiva de 5 faixas — ¥3,0 até 50 mil; ¥2,8 até 100 mil; ¥2,6 até 200 mil;
  ¥2,4 até 300 mil; e assim por diante.
- **A partir de 01/10/2026:** apenas 2 faixas — **¥3,0/msg até 200.000** e **¥2,5/msg acima disso**.

**Quem sente:** contas acima de ~50 mil mensagens adicionais/mês. Abaixo disso, nada muda — ou seja,
**o pequeno negócio não é afetado**. Quem manda entre 50 mil e 200 mil paga de ¥0,2 a ¥0,4 a mais
por mensagem.

### 3.5 A regra de contagem — onde o dinheiro realmente vai

Esta é a parte que mais gera erro de orçamento:

1. **Conta-se por pessoa, não por envio.** Um broadcast para 1.000 amigos = 1.000 mensagens.
2. **1 "mensagem" = até 3 balões.** Texto + sticker + banner enviados juntos contam como 1. Isso é
   uma alavanca de eficiência enorme: sempre empacote o conteúdo em até 3 balões.
3. **Cobrado:** broadcast, push, multicast, narrowcast (segmentado), step delivery, envios via
   Messaging API.
4. **Grátis:** mensagem de resposta (*reply*), mensagem de saudação ao adicionar amigo,
   respostas automáticas, e o chat 1:1.
5. Mensagem para quem bloqueou a conta ou para ID inválido **não conta**.

> Consequência de negócio: o modelo do LINE cobra **broadcast** e libera **conversa**. Isso empurra
> o design certo — atender e responder é barato; disparar em massa é o que custa.

---

## 4. O que o OA Manager entrega (o que um pequeno negócio de fato usa)

### Envio
- **Broadcast** — para todos os amigos.
- **Segmentação** — por *audiences* (quem abriu uma campanha anterior, quem viu ou clicou no rich
  menu, quem veio de um anúncio) e por *atributos* (tempo como amigo, gênero, faixa etária, região).
  Os atributos são estimativas da LINE, e há um mínimo de destinatários para poder usar o filtro.
- **Step delivery (ステップ配信)** — sequência automática disparada por um gatilho, tipicamente
  "adicionou como amigo". É o *drip* / automação de boas-vindas. **Conta como mensagem cobrada.**
- **Mensagem de saudação** — automática no momento em que a pessoa adiciona a conta. **Grátis.**
  É o ativo mais subutilizado: é o único momento com 100% de atenção e custo zero.

### Formatos
- **Rich message** — imagem única dividida em áreas clicáveis.
- **Card-type message** — carrossel de cards (produto, local, pessoa) com preço e mapa.
- **Rich video message** — vídeo com CTA.
- **Rich menu** — o menu fixo no rodapé da conversa. Para um pequeno negócio é o item de maior
  retorno: vira a "home" do negócio (cardápio, agendar, promoções, falar com atendente). Pode ser
  trocado por segmento de cliente.

### Retenção e conversão
- **Cupons** — com controle de validade, quantidade e sorteio.
- **Shop Card (ショップカード)** — cartão de fidelidade digital por pontos, com carimbo via QR no
  balcão. Substitui o cartãozinho de papel e ainda gera dado.
- **Research (リサーチ)** — enquetes e pesquisas dentro do app.

### Atendimento
- **LINE Chat** — conversa 1:1, com **tags** e **notas** por cliente. Não é cobrado.
- **Resposta automática** — por palavra-chave e por horário (ex.: fora do expediente).
- **AI Chatbot (beta)** — substituto atual da antiga "AI応答メッセージ", que foi descontinuada.
- **Estatísticas** — amigos, bloqueios, aberturas, cliques, alcance.

---

## 5. Aquisição: como o negócio ganha "amigos"

O LINE tem uma limitação estrutural que define toda a estratégia:

> **Não existe importar contatos.** A base de amigos é construída do zero, e **o cliente precisa
> iniciar** (adicionar a conta). Em compensação, uma vez adicionado, **não há janela de 24h** — a
> empresa pode falar quando quiser.

Canais de aquisição:

1. **QR code no ponto de venda** — o mais eficiente para varejo/restaurante. Cupom de boas-vindas
   na saudação converte muito bem.
2. **Link "adicionar amigo"** — funciona em mobile; no desktop cai em QR.
3. **Busca por nome** — só funciona com selo azul ou verde.
4. **LINE Ads com objetivo CPF ("Add Friend")** — anúncio cujo resultado é o amigo adicionado.
   Benchmark no Japão: **≈ ¥75 (~US$ 0,50) por amigo** ⚠️.
5. **LINE Points / campanhas de incentivo.**

### Métricas de saúde
- **Taxa de bloqueio:** manter **abaixo de 3% por disparo** ⚠️. Acima disso, é sinal de frequência
  ou relevância errada — e cada bloqueio é permanente e não recuperável.
- **Custo real por amigo:** CPF do anúncio **+** o custo recorrente de mensagear aquele amigo todo
  mês. Essa é a conta que a maioria esquece.

> Observação sobre o modelo de negócio da LINE: o objetivo CPF é a ponte entre a receita de
> publicidade e a de assinatura. Cada amigo adquirido vira um contato pelo qual a empresa paga
> mensalmente para conseguir falar. Não é acidente — é o desenho.

---

## 6. LINE Ads Platform (LAP)

- **Modelos:** CPM (alcance), CPC (tráfego/conversão), **CPF (custo por amigo)**.
- **Segmentação:** ampla, por interesse, *lookalike*, audiências customizadas de visitantes do site,
  e **audiências construídas a partir dos amigos do OA**.
- **Inventário:** dentro do próprio LINE e da rede de apps parceiros.
- **Dynamic Ads (DPA)** para catálogo/e-commerce.
- **Diferencial real:** os dados são *first-party* da LINE, então não sofrem com o ATT da Apple nem
  com o fim dos cookies de terceiros. Atribuição e segmentação seguem robustas onde outras
  plataformas degradaram.
- Disponível apenas em **Japão, Taiwan e Tailândia**, com processo de aprovação.

---

## 7. Camada de desenvolvedor

### Messaging API
Arquitetura padrão de webhook:

```
Cliente envia msg ──► Plataforma LINE ──POST HTTPS──► servidor do bot (webhook URL)
                                       ◄──resposta── (reply token, grátis)
```

- Eventos de webhook: mensagem recebida, adicionou como amigo, bloqueou, postback (clique em botão),
  entrou em grupo, etc.
- **Reply message** usa um *reply token* de uso único e **é gratuita**. Push/multicast/broadcast são
  cobrados. Desenhar o bot para responder em vez de empurrar é literalmente mais barato.
- Configuração por *channel* no LINE Developers Console.
- **Mark-as-Read API:** por padrão, ao integrar plataformas terceiras, a mensagem é marcada como
  lida imediatamente mesmo sem ter sido lida. Confirmações de leitura corretas exigem permissão
  específica. Detalhe que quebra relatórios de atendimento se ignorado.

### LIFF e LINE MINI App
Ambos são web apps rodando no navegador embutido do LINE (LIFF browser).

| | LIFF | LINE MINI App |
|---|---|---|
| Análise/certificação da LY Corp | Não exigida | **Exigida** |
| Distribuição | Dentro da sua conta | Ganha vitrine e recursos extras |
| Atualização | Livre | Livre, se não mexer na config do console |

Casos de uso típicos de pequeno negócio: **agendamento**, **carteirinha de sócio digital**,
**pedido pelo celular na mesa**, **senha de fila**, **catálogo**. Vantagem forte: como o usuário já
está logado no LINE, a identificação acontece sem cadastro — o negócio emite a carteirinha **sem
coletar nem armazenar dados pessoais**, o que reduz custo e risco de vazamento.

⚠️ **Mudança:** o período de isenção da taxa de compra in-app em MINI Apps terminou em
**01/07/2026** — transações passaram a ser tarifadas.

---

## 8. LINE Notification Messages (LINE通知メッセージ)

Recurso à parte, e estrategicamente relevante: permite entregar mensagem a **quem não é amigo da
conta**, casando o telefone cadastrado do usuário no LINE com a base de telefones da empresa.

- **Uso permitido:** apenas mensagens úteis e transacionais — confirmação de pedido, aviso de envio,
  lembrete de reserva, senha de atendimento.
- **Proibido:** publicidade e conteúdo promocional. A LY Corp filtra pelo critério de utilidade.
- **Requisitos:** aderência à UX Guideline da LY Corp e mapeamento dos cenários de disparo.
- ⚠️ **Mudança 2025–2026:** o modelo migrou de puro consumo para **mensalidade fixa + consumo**,
  com transição até o fim de maio/2026. Em **junho/2026** entrou um plano **só por consumo**, o que
  tornou o recurso acessível a empresas que não fazem disparo em massa — inclusive negócios menores.

---

## 9. Comércio

- **LINE MyShop / LINE SHOPPING (Tailândia)** — ferramenta de venda para o pequeno lojista:
  vitrine ligada ao OA, gestão de estoque, fechamento do pedido e emissão da cobrança **dentro da
  própria conversa**, além de logística/entrega. É o caminho de "chat commerce" mais maduro do
  ecossistema.
- **LINE MAN Wongnai (Tailândia)** — delivery de comida, mercado, mobilidade e pagamentos.
- **LINE Pay (Japão): encerrado em 30/04/2025**, absorvido pelo PayPay. Saldos foram migrados
  (jan–abr/2025) e os lojistas foram direcionados a PayPay/au PAY/Rakuten Pay. **Não construa nada
  contando com LINE Pay no Japão.** Fora do Japão (ex.: Taiwan, Tailândia) o LINE Pay segue.

---

## 10. Linha do tempo de mudanças (2025 → 2026)

| Data | Mudança | Impacto para pequeno negócio |
|---|---|---|
| 30/04/2025 | **LINE Pay encerrado no Japão** (→ PayPay) | Alto — trocar meio de pagamento |
| 2025–mai/2026 | Notification Messages migra para mensalidade + consumo | Médio |
| 08/06/2026 | App de gestão redesenhado; login com Yahoo! JAPAN ID | Baixo |
| 10/06/2026 | MINI Apps certificados integram ao Business Manager | Médio (dev) |
| 15/06/2026 | Revisão das diretrizes (conteúdo sensível / restrito por idade) | Revisar conteúdo |
| **24/06/2026** | **Opção CRM** — listas de usuários, formulários, segmentação, automação, chat ampliado | **Alto** — traz nativamente o que antes exigia Lステップ/Liny |
| 24/06/2026 | **LINE Restaurant Plus** — pacote OA + pedidos + PDV | Alto (food service) |
| 30/06/2026 | 2FA obrigatório (autenticação por e-mail ativada automaticamente) | Operacional |
| 01/07/2026 | Fim da isenção de taxa em compras in-app de MINI App | Médio |
| 15/07/2026 | Anúncio do fim do LINE VOOM | — |
| ~ago/2026 | Fim da postagem simultânea mensagem + VOOM | Ajustar rotina |
| ~set/2026 | Estreia do **"OA Post"** — postagem de imagem/vídeo/texto em tempo real pela loja | Substituto do VOOM |
| 16/09/2026 | Dados analíticos do VOOM deixam de existir | **Exportar antes** |
| **30/09/2026** | **LINE VOOM encerrado**; aba VOOM vira aba **Shopping** | Alto se dependia de VOOM |
| **01/10/2026** | Nova tarifa de mensagens adicionais (2 faixas) | Só acima de 50 mil msgs |

**Leitura estratégica das duas maiores mudanças:**

1. **Fim do VOOM + aba Shopping** — a LY Corp está abandonando a ambição de rede social e apostando
   em **e-commerce e serviços do dia a dia**. Para o negócio, o alcance orgânico via feed acaba; o
   valor migra para a **base de amigos** e para a vitrine comercial. A conta em si, os disparos,
   rich menu, cupons, shop card e chat **continuam intactos**.
2. **Opção CRM nativa (jun/2026)** — a LINE está internalizando funções que sustentavam um mercado
   inteiro de ferramentas terceiras (Lステップ, Liny, MAAC, ReadyPlanet). Antes de contratar uma
   plataforma externa, vale checar o que já vem nativo.

---

## 11. A conta que o pequeno negócio precisa fazer

Custo total mensal ≈

```
mensalidade do plano
+ (amigos × disparos por mês − cota grátis) × preço da mensagem adicional
+ Premium ID (anual, diluído)
+ mídia de aquisição (CPF × novos amigos)
+ plataforma terceira, se houver
```

**Exemplo, restaurante no Japão com 4.000 amigos:**

| Frequência | Msgs/mês | Plano indicado | Custo mensal |
|---|---|---|---|
| 1 disparo/mês | 4.000 | Light (¥5.000 / 5.000) | ¥5.000 |
| 2 disparos/mês | 8.000 | Standard (¥15.000 / 30.000) | ¥15.000 |
| 7 disparos/mês | 28.000 | Standard | ¥15.000 |
| 10 disparos/mês | 40.000 | Standard + 10.000 adicionais | ¥15.000 + ¥30.000 = ¥45.000 |

Três lições que saltam da tabela:

1. Há um **degrau brutal** entre 5.000 e 5.001 mensagens — vale ajustar a frequência para caber.
2. Dentro do Standard, disparar 2 ou 7 vezes **custa o mesmo**. Quem paga Standard e dispara pouco
   está desperdiçando; quem dispara demais queima a base em bloqueios.
3. Acima da cota, o custo vira linear e cresce rápido. **Segmentar não é refinamento — é controle
   de custo direto**, porque cada destinatário a menos é dinheiro economizado.

---

## 12. Playbook prático para um pequeno negócio

**Fase 1 — Fundação (semana 1)**
1. Criar o OA (grátis, ~10 min).
2. Comprar o Premium ID e solicitar a **verificação (selo azul)** — sem ela, ninguém acha o negócio.
3. Configurar a **mensagem de saudação** com uma oferta concreta (é grátis e tem atenção máxima).
4. Montar o **rich menu** com 4–6 ações reais: cardápio/catálogo, agendar, promoções, localização,
   falar com humano.
5. Ativar resposta automática fora do horário.

**Fase 2 — Aquisição (mês 1–2)**
6. QR code visível no balcão, na mesa, na sacola, na nota.
7. Incentivo claro para adicionar: cupom de primeira compra ou pontos iniciais no Shop Card.
8. Ativar o **Shop Card** — fidelidade é o que transforma seguidor em recorrência.

**Fase 3 — Operação (contínuo)**
9. Manter a frequência **dentro da cota grátis do plano**. Frequência maior quase nunca compensa:
   custa mais e aumenta bloqueio.
10. Empacotar sempre em **até 3 balões** por envio.
11. **Segmentar** por audiência antes de disparar — corta custo e bloqueio ao mesmo tempo.
12. Usar **tags no chat 1:1** para construir a segmentação que a plataforma sozinha não dá.
13. Acompanhar semanalmente: novos amigos, **taxa de bloqueio (< 3%)**, cliques no rich menu.

**Fase 4 — Escala (quando fizer sentido)**
14. Step delivery para onboarding do novo amigo.
15. LIFF/MINI App para agendamento ou carteirinha.
16. Notification Messages para transacional (confirmação, lembrete) — atinge até não-amigos.
17. LINE Ads com objetivo CPF, medindo o custo **total** do amigo (aquisição + mensageria).

---

## 13. Armadilhas e limitações

- **Não dá para importar contatos.** A base começa em zero, sempre.
- **Conta cinza é invisível na busca.** Sem verificação, o negócio depende 100% de QR/link.
- **Estourar a cota gera erro, não cobrança** — a campanha simplesmente não sai. Monitore a cota.
- **Bloqueio é irreversível.** Diferente de descadastro em e-mail, não há caminho de volta.
- **Cada país é um produto diferente.** Não presuma que um recurso do Japão existe na Tailândia.
- **Read receipts falsos** em integrações de terceiros sem a Mark-as-Read API.
- **Dependência de plataforma:** com a opção CRM nativa (jun/2026), reavalie contratos de
  ferramentas terceiras antes de renovar.
- **VOOM acaba em 30/09/2026** — exporte os dados analíticos antes de 16/09/2026.

---

## 14. Comparação estrutural com WhatsApp Business

Útil para quem vem do mercado brasileiro. *(Comparação conceitual; a tarifação atual do WhatsApp
não foi verificada nesta pesquisa.)*

| Dimensão | LINE OA | WhatsApp Business |
|---|---|---|
| Modelo de cobrança | Assinatura + pacote de mensagens | Por mensagem/conversa iniciada |
| Janela de atendimento | **Sem janela** — pode falar quando quiser | Janela de 24h após o cliente falar |
| Início do contato | Cliente **precisa** adicionar | Empresa pode iniciar com template |
| Menu persistente | **Rich menu** nativo e visual | Sem equivalente direto |
| Fidelidade/cupom nativos | ✅ Shop Card, cupons | ❌ requer construir |
| Mini apps no chat | ✅ LIFF / MINI App | Limitado |
| Alcance geográfico | JP / TW / TH / ID | Global |

O LINE é **mais rico em produto e mais restrito em geografia**. O WhatsApp é o inverso.

---

## Fontes

- [Messaging API pricing — LINE Developers](https://developers.line.biz/en/docs/messaging-api/pricing/) · [fonte no GitHub](https://github.com/line/line-developers-docs-source/blob/main/docs/en/docs/messaging-api/pricing/index.html.md)
- [Messaging API overview](https://developers.line.biz/en/docs/messaging-api/overview/) · [Receive messages (webhook)](https://developers.line.biz/en/docs/messaging-api/receiving-messages/) · [Rich menus overview](https://developers.line.biz/en/docs/messaging-api/rich-menus-overview/)
- [Native apps vs LINE MINI Apps — LINE Developers](https://developers.line.biz/en/docs/line-mini-app/discover/native-mini/) · [LINE MINI App — LINE API Use Case](https://lineapiusecase.com/en/api/miniliff.html) · [Membership cards use case](https://lineapiusecase.com/en/usecase/membership.html)
- [LINE Business: The Ultimate Guide to LINE Official Account — respond.io](https://respond.io/blog/line-business)
- [【2026年最新】LINE公式アカウント費用 — CrescLab](https://blog.cresclab.com/ja/line-price)
- [【2026年10月予定】LINE公式アカウント料金改定 — Liny](https://line-sm.com/blog/202610-price-change/)
- [LINE公式アカウントの従量課金とは — デジマール](https://digimarl.com/service/line-official-account/pay-as-you-go/)
- [LINE公式アカウントのセグメント配信とは — Lステップ](https://linestep.jp/2022/06/17/lineofficial-segment/) · [オーディエンスとは](https://linestep.jp/2022/05/29/line-official-account-audience/)
- [LINE公式アカウントのメッセージの種類まとめ — SocialPLUS](https://blog.socialplus.jp/knowledge/line-official-account-types-of-messages/) · [あいさつメッセージ](https://blog.socialplus.jp/knowledge/line-greeting-message/) · [ニュース＆アップデート 2026/06](https://blog.socialplus.jp/news/summary-202606/)
- [2026年9月でLINE VOOMが廃止に — LINEXT](https://linext-media.com/2026/07/30/line-voom-2/)
- [【2026年版】LINE通知メッセージとは — SocialPLUS](https://blog.socialplus.jp/knowledge/line-notification-message/) · [クウゼン](https://kuzen.io/blogs/line-official-notification-message)
- [LINE Ads Platform (LAP): Definitive Guide — Sphere Agency](https://sphereagency.com/articles/line-ads-platform) · [LINE Advertising Guide 2026 — RedClaw](https://redclawey.com/en/blog/2026-03-14-line-ads-platform-complete-guide/) · [LINE Ads Platform Media Guide (PDF)](https://vos.line-scdn.net/lbstw-static/images/uploads/download_files/81a1d9aa9642857e9693e5b718454022/EN_LINE%20Ads%20Platform%20Media%20Guide_2024%20ver..pdf)
- [Advertising on LINE in Japan — ULPA](https://www.ulpa.jp/post/advertising-on-line-in-japan-a-complete-guide)
- [Termination of LINE Pay Service in Japan — LY Corporation](https://www.lycorp.co.jp/en/news/release/008632/) · [PayPay balance transfer](https://about.paypay.ne.jp/en/pr/20250127/01/)
- [เกี่ยวกับ MyShop — LINE SHOPPING Seller](https://lineshoppingseller.com/about) · [LINE for Business — MyShop](https://lineforbusiness.com/th/service/myshop)
- [LINE Official Account Guidelines](https://terms2.line.me/official_account_guideline_oth)
- [LINE公式アカウント プロダクト媒体資料 (PDF, LY Corp)](https://www.lycbiz.com/sites/default/files/media/jp/download/LINE_Official_Account_ProductGuide.pdf)
