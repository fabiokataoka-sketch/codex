# Análise do cut.pro e réplica funcional (ClipForge)

Análise feita em 20/10/2026 a partir das páginas públicas `cut.pro/`, `cut.pro/en/tools` e dos metadados do site.
A réplica reproduz **estrutura, fluxos e regras de negócio**. Marca, logo, imagens e textos de marketing
são próprios, para não copiar conteúdo protegido nem se passar pela empresa. O nome "ClipForge" é provisório.

## Como rodar

```bash
# testes das regras (Node 18+)
node --test cutpro-replica/tests/*.test.js

# interface: abra no navegador (não precisa de servidor)
cutpro-replica/index.html     # landing
cutpro-replica/app.html       # estúdio (cadastro → todas as funções)
```

Dentro do estúdio, **Conta → Autoteste** roda 21 verificações direto no navegador, sem tocar nos seus dados.

## Mapa do site original

| Área | URL original | Na réplica |
|---|---|---|
| Landing | `/` | `index.html` |
| Cadastro / login | `/auth?step=register` | `app.html#/register`, `#/login` |
| Ferramentas avulsas | `/en/tools` | `#/tools` |
| Personas IA | `/en/personas` | `#/personas` |
| Automações | `/en/automations` | `#/automations` |
| Campeonatos | `/en/championships` | removido da réplica |
| Streamers (lives) | `/en/solutions/streamers` | `#/live` |
| Métricas | `/studio/metrics` | `#/metrics` |
| Planos | `/en/pricing` | `#/billing` |
| API / MCP | `/docs/en/reference` | `#/settings` (chaves fictícias) + objeto `Core` |
| App mobile | `/en/app` | fora do escopo |

## Regras de negócio extraídas (e onde estão no código)

Todas em `core.js`, cobertas por `tests/core.test.js`.

| Regra observada no site | Implementação |
|---|---|
| 1 crédito = 1 minuto analisado, independe do número de clipes | `quoteClipping`, `createProject` |
| Plano grátis: 15 créditos/mês, sem cartão | `PLANS.free` |
| Starter US$ 9,90 / 100 cr · Plus US$ 19,90 / 1.000 cr · Pro US$ 29,90 / 2.500 cr | `PLANS` |
| Créditos acumulam por 90 dias nos planos pagos | `creditValidityDays` |
| Sem marca d’água a partir do Starter | `render` |
| Vídeos de até 3h no Starter e até 9h no topo | `maxVideoMin` |
| Clipes ao vivo (Twitch/Kick) em lotes de 10 min, só Plus e Pro | `createMonitor`, `tickMonitor` |
| 1 / 5 / 15 contas por rede (Starter / Plus / Pro) | `connect` |
| Exportação 4K só no Pro | `render` |
| 13 redes de publicação; Twitch e Kick só como fonte | `NETWORKS`, `detectSource` |
| Clipes 9:16 com rastreio de rosto, legenda e nota viral 0–100 | `buildClips` |
| Horário de postagem recomendado pelo histórico | `recommendedHour` (padrão 19h) |
| Auto-post opcional por fluxo | `setAutoPost` |
| Heatmap dia × hora, ranking de clipes, views por rede | `metrics` |
| Personas: pronta, até 6 fotos, ficha ou do zero | `createPersona` |
| Até 4 personas no mesmo vídeo pelo mesmo preço | `quoteSwap` |
| Preço antes de gerar e estorno automático em falha | `quoteSwap`, `swapPersona` |
| Comentário → DM com botão e link; pedir follow; coletar e-mail; replicar post | `createAutomation`, `simulateComment` |
| Workspace por cliente com equipe e contas próprias | `createWorkspace`, `inviteMember` |
| Download em massa e cancelamento sem multa | `bulkDownload`, `cancelSubscription` |
| Ferramentas: destaques, transcrição, tradução, remover silêncio, reenquadrar, redimensionar, comprimir, MP4, MP3, baixar de plataforma, títulos/hashtags | `runTool` |
| Editor: corte, proporção, velocidade, legendas editáveis, templates da comunidade e próprios | `updateClip`, `editCaption`, `applyTemplate`, `saveTemplate` |

### Regras que a réplica supôs (não estão públicas)

- Custo de ferramentas avulsas (1 crédito/min para as de IA, 0 para conversões).
- Custo de persona (5 créditos para criar, 2 para regenerar, 3 a cada 10 s para trocar).
- Clipes por projeto (≈ 1 a cada 3 min, máx. 30) e duração (15–60 s).
- Limite de 1h para vídeos no plano grátis.

## O que é real e o que é simulado

| Real | Simulado |
|---|---|
| Leitura da duração de um arquivo enviado (via `<video>`), usada para cobrar créditos | Análise de IA, escolha dos momentos e nota viral (determinísticas a partir do link) |
| Reprodução do arquivo enviado no editor, com legendas sobrepostas | Transcrição e tradução (texto gerado) |
| Geração e download de `.srt` / `.vtt` | Renderização, compressão, conversão, download de plataformas |
| Persistência no `localStorage` e exportação do estado em JSON | OAuth das redes, publicação e métricas |
| Todas as validações e regras de plano/créditos | Pagamento e cobrança |

## Cobertura de testes

- `tests/core.test.js`: 17 testes no Node, cobrindo todas as funções públicas do `Core`.
- `app.html#/selftest`: 21 verificações no navegador.
- Um roteiro Playwright passou por todas as telas (cadastro, upgrade, novo projeto, editor, contas,
  publicação, métricas, lives, ferramentas, personas, automações, templates, workspace,
  autoteste, persistência após recarregar) sem erros de JavaScript.

## Testar o serviço real

Esta sessão tem o conector **CurPro** (MCP oficial do produto) com ferramentas como `list_videos`,
`list_clips`, `create_render`, `create_post`, `create_monitor`, `create_persona`, `get_balance`.
Com ele dá para rodar os mesmos cenários contra a conta real e comparar com a réplica. Isso consome
créditos reais, então só faço com autorização explícita.
