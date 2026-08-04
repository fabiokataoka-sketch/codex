# Atendimento via LINE para serviço de tradução no Japão

> Análise aplicada ao caso: equipe de tradutores atendendo no Japão, com alto volume de
> mensagens diárias de entrada, precisando **filtrar e organizar**.
> Pesquisa de agosto/2026. Ver `line-for-business.md` para a base do ecossistema.
> Itens marcados ⚠️ vieram de fonte secundária — confirmar antes de contratar.

---

## 1. A primeira conclusão inverte a lógica de custo

Para um negócio de atendimento (e não de disparo em massa), **a régua de preço do LINE não se
aplica**. As regras de cobrança:

| | Cobrado? |
|---|---|
| Chat 1:1 com o cliente | **Grátis** |
| Resposta automática | **Grátis** |
| Mensagem de saudação | **Grátis** |
| Reply via API | **Grátis** |
| Broadcast / disparo em massa | Cobrado |

Ou seja: **um serviço de tradução pode operar 100% no plano gratuito** (Communication, ¥0) sem
nunca esbarrar na cota de 200 mensagens — porque essa cota é só de disparo. Quem responde não paga.

**Portanto a decisão de custo não é "qual plano".** É **"qual camada de organização do chat"** —
e é aí que estão os limites reais.

---

## 2. O gargalo real: o chat gratuito não organiza nada

Este é o achado mais importante para o caso de vocês.

| Recurso | Grátis | Chat Pro | Consequência prática |
|---|---|---|---|
| Tags criadas | **5** | 300 | — |
| Tags **por conversa** | **1** | 30 | ❗ No grátis não dá para marcar *tipo de serviço* **e** *status* ao mesmo tempo |
| Notas por cliente | **1** | 1.000 | Sem histórico de trabalho por cliente |
| Histórico de conversa | **6 meses** | 5 anos | ❗ Registro de serviços prestados **desaparece** |
| Exportar CSV | ❌ | ✅ semanal (até 100 mil) | Sem backup próprio |
| Filtros customizados | ❌ | 20 (por status/responsável) | Sem fila de trabalho |
| AI chatbot | Palavra-chave | Beta com linguagem natural | Triagem automática fraca |

O limite de **1 tag por conversa** é o que quebra a operação. Triagem exige pelo menos dois eixos
simultâneos — *o que a pessoa quer* e *em que pé está* — e o plano gratuito só permite um.

**O histórico de 6 meses é o segundo problema sério.** Para tradução, a conversa **é** o registro do
serviço: documento enviado, prazo combinado, valor acordado, entrega. Perder isso a cada 6 meses é
inaceitável para um negócio que atende cliente recorrente e lida com documentos oficiais.

---

## 3. As três configurações possíveis no LINE Official Account

| Configuração | Custo/mês | Entrega |
|---|---|---|
| **OA gratuito** | ¥0 | Porta de entrada, rich menu, auto-resposta. **Organização quase nula.** |
| **OA + Chat Pro** | ¥3.300 (c/ imposto) | 300 tags · 30 por pessoa · 1.000 notas · histórico 5 anos · export CSV · 20 filtros por status/responsável · AI chatbot beta |
| **OA + Opção CRM** | ¥5.500 ⚠️ (¥5.000 + imposto) | **Tudo do Chat Pro** + lista de usuários + **formulários com tag automática** + automação por gatilho + envio segmentado |

**O salto de Chat Pro para CRM custa só ~¥2.000/mês** e é ele que traz a triagem *automática*
(formulário responde → tag é aplicada sozinha → automação dispara). Custo-benefício claramente
melhor.

### Requisitos da Opção CRM (lançada em 24/06/2026) — atenção
- **Conta verificada (selo azul) obrigatória**
- Business Manager conectado e autenticado
- Menos de 100.000 amigos
- **Só funciona no console web (PC)** — sem app de celular
- Não combina com pacotes Restaurant/Beauty nem com Chat Pro já contratado
- ⚠️ **Respostas de formulário sincronizam 1× ao dia**, não em tempo real — confirmar o que
  exatamente isso afeta antes de desenhar a operação em cima disso

> Como o selo azul é pré-requisito da opção CRM **e** é o que torna vocês encontráveis na busca do
> LINE, ele deixa de ser "desejável" e vira o **primeiro item do roteiro**.

---

## 4. Arquitetura de triagem sugerida

Cinco camadas, da mais barata para a mais sofisticada:

```
① RICH MENU (o roteador visual — grátis)
   ┌─────────────┬─────────────┬─────────────┐
   │ Orçamento   │ Tradução    │ Interpretação│
   │ rápido      │ juramentada │ / acompanh.  │
   ├─────────────┼─────────────┼─────────────┤
   │ Meus        │ Prazos e    │ Falar com   │
   │ pedidos     │ preços      │ atendente   │
   └─────────────┴─────────────┴─────────────┘
                       ↓
② SAUDAÇÃO (grátis) — explica como pedir orçamento e o que enviar
                       ↓
③ FORMULÁRIO (opção CRM) — captura estruturada:
   tipo de documento · par de idiomas · prazo · finalidade (visto/prefeitura/hospital)
   → aplica TAGS automaticamente
                       ↓
④ TAGS EM DOIS EIXOS (Chat Pro/CRM)
   Serviço:  #juramentada #simples #interpretacao #urgente
   Status:   #novo #orcado #aguardando-pgto #em-traducao #entregue
                       ↓
⑤ RESPONSÁVEL (担当者) + FILTROS
   cada tradutor filtra a própria fila; nada cai no vão
```

**Por que o rich menu é o item de maior retorno:** ele é gratuito e resolve a maior parte da
filtragem *antes* da mensagem chegar. Boa parte do volume diário de um serviço de tradução é a mesma
pergunta repetida (preço, prazo, "vocês fazem X?"). Um menu bem desenhado com respostas prontas
elimina esse volume sem custo nenhum.

**Sobre o campo "responsável" (担当者):** a conta permite designar um responsável por cliente e
filtrar as conversas por responsável. Se ninguém for designado, **quem responder primeiro vira o
responsável automaticamente** — o que pode gerar atribuição acidental numa equipe. Vale definir a
convenção antes.

---

## 5. A alternativa: LINE WORKS

É a versão corporativa (concorre com Slack/Teams) e permite conversar com o **LINE pessoal** do
cliente.

| Plano | Preço | Limites |
|---|---|---|
| Free | ¥0 | 30 usuários · 5GB · ⚠️ **máx. 20 contatos LINE externos por conta** |
| Standard | ¥450/usuário/mês (anual) | Ilimitado · 1TB |
| Advanced | ¥800/usuário/mês (anual) | Ilimitado · 100TB |

⚠️ A tabela oficial de preços lista a conexão com usuários LINE de forma pouco clara entre os
planos — confirmar diretamente com a LINE WORKS antes de decidir.

**Não é o mesmo produto.** Comparação direta:

| | LINE Official Account | LINE WORKS |
|---|---|---|
| Cliente te **encontra** | ✅ busca (com selo azul), QR, link | ❌ precisa ser convidado |
| Rich menu / auto-resposta | ✅ | ❌ |
| Formulários e triagem automática | ✅ (opção CRM) | ❌ |
| Disparo para a base | ✅ | ❌ |
| Contas nominais por funcionário | ❌ (admins da conta) | ✅ |
| **Auditoria e log administrativo** | Limitado | ✅ forte |
| Custo | **Fixo, não por pessoa** | **Por usuário** |

**Leitura:** o OA é o **balcão de entrada** (encontrabilidade + triagem). O LINE WORKS é a
**mesa de trabalho interna** (coordenação da equipe, arquivos, auditoria). Não se substituem —
para uma equipe, o desenho natural é **OA na frente, WORKS atrás**.

Vantagem relevante do OA para vocês: **o custo é fixo, não por assento.** Três tradutores ou dez
pagam o mesmo ¥5.500. O LINE WORKS cobra por pessoa.

---

## 6. O que não fazer: atender pelo LINE pessoal

É o método mais comum e o mais arriscado — especialmente para tradução, que lida com passaporte,
certidões, documentos de visto e contratos.

- **Sem log e sem auditoria.** A empresa não consegue recuperar nem comprovar nada em caso de
  disputa ou incidente.
- **A carteira de clientes vai embora com a pessoa.** Se um tradutor sai, os contatos saem no
  celular dele. Numa conta oficial, o cliente é da empresa.
- **Sem controle de conformidade** no tratamento de dados pessoais de terceiros.
- Mistura vida pessoal e trabalho, sem horário nem repasse de plantão.

Para um serviço que custodia documentos oficiais de imigrantes, isso não é detalhe operacional —
é exposição direta.

---

## 7. Recomendação

**Roteiro em três etapas:**

**Etapa 1 — Fundação (custo ¥0, exceto Premium ID)**
1. Criar/consolidar **uma** conta oficial da empresa.
2. Comprar o Premium ID e **solicitar a verificação (selo azul)** — é pré-requisito da opção CRM e
   é o que faz vocês aparecerem na busca de quem procura "tradutor" no LINE.
3. Montar o rich menu com as 6 rotas de maior volume.
4. Escrever a saudação com a lista do que o cliente deve enviar para receber orçamento
   (isso sozinho já corta muito ruído).
5. Configurar auto-resposta de fora do horário.

**Etapa 2 — Organização (¥5.500/mês)**
6. Contratar a **opção CRM** assim que o selo sair. Se a verificação demorar, o **Chat Pro
   (¥3.300)** já resolve o problema mais urgente — as tags em dois eixos e o histórico de 5 anos.
7. Definir o dicionário de tags **antes** de aplicar: um eixo de serviço, um de status.
8. Definir a convenção de responsável, para evitar atribuição automática acidental.
9. Ligar a exportação CSV semanal — é o backup do registro de serviços.

**Etapa 3 — Escala (se/quando a equipe crescer)**
10. LINE WORKS para coordenação interna e auditoria.
11. LIFF/MINI App se o fluxo de orçamento merecer formulário próprio com upload de documento.

**Custo total estimado da operação organizada: ~¥5.500/mês** (+ ~¥450/usuário se adotarem WORKS).
Para um negócio de serviço, é baixo — o gargalo aqui nunca foi preço, foi ter escolhido a camada
errada e descobrir tarde que o histórico some em 6 meses.

---

## 8. Pontos a validar antes de contratar

1. ⚠️ Preço exato e condições da opção CRM na página oficial da LY Corp.
2. ⚠️ O que exatamente a sincronização "1× ao dia" dos formulários afeta — se atrasa a **chegada**
   do pedido, muda o desenho da triagem.
3. ⚠️ Conexão com LINE externo nos planos pagos do LINE WORKS.
4. Prazo e documentação exigida para a verificação (selo azul) no Japão.
5. Se a categoria de negócio tem alguma restrição para a opção CRM.
6. Política de retenção e tratamento de documentos pessoais — onde os arquivos ficam armazenados
   de fato, já que o chat do LINE não é sistema de gestão documental.

---

## Fontes

- [チャットProオプション比較 — クウゼン](https://kuzen.io/blogs/line-official-LINEchatProOption) · [提供開始 — LINEヤフー](https://www.lycorp.co.jp/ja/news/release/017044/) · [Lステップ](https://linestep.jp/2025/05/15/line-official-account-chat-pro/)
- [CRMオプションとは — Liny](https://line-sm.com/blog/loa-crm-option/) · [Lステップ](https://linestep.jp/2026/06/30/line-official-account-crmoption/)
- [チャット機能の使い方・運用のコツ — Lステップ](https://linestep.jp/2022/04/12/line-official-account-chat/) · [チャット — LINEヤフー公式マニュアル](https://www.lycbiz.com/jp/manual/OfficialAccountManager/chats/)
- [チャット対応のミス・漏れを防ぐ方法 — Liny](https://line-sm.com/blog/chat_response/)
- [利用料金 — LINE WORKS](https://line-works.com/pricing/) · [お客様や社外の方のLINEと接続](https://line-works.com/blog/line-works/lineworks_usage_line/) · [外部トーク連携](https://www.mobileworkplace.jp/column/lineworks_line_align)
- [法人がLINEを使用しない方が良い理由 — アスコネックス](https://asconnex.com/news/post-281/) · [LINEとLINE WORKSの違い — クウゼン](https://kuzen.io/blogs/line-lineworks-difference)
- [Messaging API pricing — LINE Developers](https://developers.line.biz/en/docs/messaging-api/pricing/)
