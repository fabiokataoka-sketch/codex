# Nota interna — negociação LB Traduções

> **Documento interno. Não enviar ao cliente.**
> A proposta que vai para fora é `proposta-lb-traducoes.html`.

---

## 1. Vale fazer parceria? Sim — mas por um motivo específico

Não é pelo dinheiro da LB. É por três coisas que dinheiro não compra agora:

1. **Volume real de mensagens.** O LINE Lead AI hoje é uma landing page — não existe backend.
   Construir o classificador contra pedidos de tradução reais, em português, com a variação de
   escrita da comunidade brasileira no Japão, é o caminho mais rápido para o produto existir de
   verdade. Comprar esse dado não é possível; gerar sozinho levaria meses.
2. **Prova social zero → um caso documentado.** A página não tem nenhum número real. No mercado
   brasileiro no Japão, indicação é o canal principal — e indicação precisa de caso.
3. **Distribuição.** Tradutor é **hub**: todo pequeno negócio brasileiro no Japão que precisa de
   documento passa por ele. É exatamente o ICP declarado do LINE Lead AI. Esse é o ativo mais
   subestimado da conversa.

**Enquadramento correto:** o desconto de ¥40.000 é **verba de marketing**, não venda perdida. Ele
compra o caso que permite vender o Caminho C a ¥150.000 para os próximos dez. Se pensar como
"abri mão de metade", a negociação fica azeda; se pensar como "paguei ¥40.000 por um caso e uma
porta de entrada num nicho", fica barato.

---

## 2. A armadilha clássica, e como a proposta já se protege

**A armadilha:** dar desconto agora contra promessa de indicação depois. Na prática as indicações
não vêm, e sobra o desconto.

**Proteções já embutidas na proposta:**
- Contrapartidas **nomeadas e contáveis** (3 apresentações, direito de publicação, permuta),
  não "vamos divulgar você".
- **Prazo fechado** de 90 dias.
- **Saída escrita**: se não vier, fatura a diferença, parcela, ou encerra sem custo. Está lá em
  linguagem amigável justamente para não virar conflito depois.

### Por que a permuta de tradução saiu

Estava na primeira versão e foi removida: **não há demanda real de tradução na AI Lab**. Aceitar
permuta que você não precisa é pior do que não pedir contrapartida nenhuma — infla o valor
aparente do que a LB "pagou", cria uma obrigação de consumir algo que não serve, e ainda enfraquece
a contrapartida que importa, porque dilui o pedido em quatro itens onde um deles é decorativo.

**Princípio para as próximas negociações:** só aceite como contrapartida aquilo que você pagaria em
dinheiro se não viesse de graça. Se não pagaria, não vale como moeda.

### O que entrou no lugar

**Autorização de uso do histórico de mensagens para calibrar o classificador.** Essa sempre foi a
contrapartida mais valiosa — é literalmente o motivo nº 1 da seção 1 desta nota — e estava apenas
implícita. Agora está nomeada.

**Defina o escopo por escrito antes da reunião**, porque é aqui que a confiança se ganha ou se
perde:

- **Entra:** o padrão da pergunta — como a pessoa formula o pedido, que tipo de serviço menciona,
  como expressa urgência.
- **Não entra:** nome, telefone, ID do LINE, conteúdo de documento, qualquer imagem, qualquer
  dado identificável de cliente da LB.
- **Controle da LB:** revisa e aprova antes do uso, e pode revogar quando quiser.
- **Decida e deixe claro:** o dado calibra só a instância da LB, ou também o produto que você vai
  vender para outros? As duas respostas são defensáveis; a que destrói confiança é não ter
  resposta quando perguntarem. Se for a segunda, diga na reunião — não deixe para o contrato.

Chegar com isso pronto num negócio que custodia passaporte e certidão vale mais que qualquer
argumento de venda.

---

## 3. O que não conceder

| Item | Por quê |
|---|---|
| **Exclusividade no segmento** | Mata justamente o valor de distribuição que você está comprando. Se a LB pedir, a resposta é não — e é fácil explicar: o caso dela só vale se você puder usá-lo. |
| **Código-fonte / propriedade do sistema** | Você entrega operação funcionando, não o motor. |
| **Manutenção gratuita "enquanto durar a parceria"** | Manutenção é custo recorrente real (n8n, Supabase, API). Se for zerar, zere por prazo determinado, nunca aberto. |
| **Escopo aberto no piloto** | Piloto tem escopo fechado. Ajuste de resposta sim; funcionalidade nova não. |
| **Desconto adicional no Caminho B** | Ver seção 4. |

---

## 4. A regra de ouro da negociação de preço

**Se pedirem desconto no Caminho B, não baixe o B. Ofereça o A.**

Isso é o mais importante desta nota. Pedido de desconto quase nunca é sobre preço — é sinal de que
o valor percebido não chegou lá. Baixar o B destrói a integridade da tabela e você nunca mais
vende a ¥80.000. Descer a escada preserva o preço **e** costuma ser a recomendação tecnicamente
correta de qualquer forma.

Frase pronta:

> "Consigo ajustar o escopo, não o preço do escopo. Se o orçamento agora é outro, o Caminho A
> resolve a maior parte do problema por ¥45.000 e a gente sobe daqui a três meses com o dado na
> mão — inclusive fica melhor feito assim."

**Ponto de desistência:** se quiserem o Caminho B com desconto **mas sem** o direito de publicar o
caso, a lógica inteira do desconto some. Aí é Caminho C no preço cheio ou Caminho A. Sem
ressentimento — é só aritmética.

---

## 5. Se a conversa evoluir para parceria de verdade

Se a LB quiser ir além de cliente-piloto e virar canal de indicação recorrente:

- **Comissão fixa por cliente fechado**, algo entre 10% e 15% do setup, paga só no recebimento.
  Simples, limitada, sem obrigação contínua.
- **Evite** revenue share sobre mensalidade, sociedade, ou qualquer coisa com participação —
  complexidade jurídica desproporcional ao tamanho do negócio, e amarra você a um parceiro antes
  de saber se ele performa.
- **Co-venda** é a versão interessante: a LB oferece "atendimento organizado" como serviço
  adicional aos clientes empresariais dela, você entrega por trás. Aí sim faz sentido discutir
  divisão — mas só depois do piloto provar que funciona.

Ordem certa: **piloto → caso → indicação → co-venda.** Não pule etapa.

---

## 6. Riscos honestos deste negócio

1. **O produto ainda não existe como software.** O Caminho B é entrega sob medida, e o prazo
   depende de você construir n8n + Supabase + classificador. Não prometa semana que não consegue
   cumprir — atraso no piloto queima justamente o caso que você quer.
2. **A LINE lançou a Opção CRM nativa (jun/2026) a ¥5.500/mês.** Se a LB pesquisar, vai encontrar.
   Melhor você mesmo trazer o assunto: o nativo é baseado em regra e formulário, **exige selo
   azul**, só roda no PC. Chegar na frente disso demonstra domínio; ser pego de surpresa custa caro.
3. **Documentos pessoais.** Passaporte, certidão, papel de visto. Antes de qualquer coisa passar
   por Supabase ou por API externa, defina o que é armazenado, por quanto tempo e onde. Ter essa
   resposta pronta na reunião é diferencial de confiança — e não tê-la é risco real.
4. **Concentração.** Um piloto descontado com um cliente do mesmo nicho de quem vai indicar você
   cria dependência. Bom para começar, ruim para ficar.

---

## 7. Checklist antes de enviar

- [ ] Nome do contato na LB
- [ ] Data e validade (sugestão: 30 dias)
- [ ] **Confirmar os ¥45.000 do Caminho A** — é um SKU novo, menor que o "Setup Essencial" de
      ¥80.000 da sua tabela, porque não inclui IA nem Supabase. Precisa fazer sentido para você.
- [ ] Confirmar o desconto de 50% no Caminho B
- [ ] Definir por escrito o escopo de uso do histórico de mensagens (entra / não entra / revogação
      / se calibra só a instância da LB ou também o produto) — ver seção 2
- [ ] Preencher os prazos de implementação (dias úteis / semanas)
- [ ] Seu contato no rodapé (email e/ou LINE ID)
- [ ] Decidir se a seção 05 (parceria) vai na primeira versão ou fica para a reunião —
      **recomendação: manter**. Em comunidade pequena, transparência antecipada acelera; e
      segurar a oferta só gera uma segunda rodada.

---

## 8. Como eu abriria a conversa

Não mande a proposta fria. Mande uma mensagem curta pedindo os 45 minutos, com **uma** observação
técnica específica — a de que o histórico do LINE apaga em 6 meses. É verificável, é concreta,
e é o tipo de coisa que quem opera no plano gratuito nunca percebeu. A proposta vai **depois** da
conversa, já ajustada ao volume real.

Proposta enviada a frio compete por preço. Proposta enviada depois do diagnóstico compete por
entendimento do problema — e aí o Caminho A a ¥45.000 parece barato em vez de parecer caro.
