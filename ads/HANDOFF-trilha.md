# Handoff — aplicar a trilha nos reels da campanha

Estado: **feito em 08/09/2026**, exceto a ligação dos canais no painel do Epidemic,
que só o Fabio pode fazer (ver "O que falta" no fim).

Os 28 posts de reel do Metricool (09–22/09, 20h, duas contas) agora apontam para os
14 MP4 com trilha licenciada. Os 28 carrosséis não foram tocados.

## O que já está pronto neste repositório

- `ads/media/reel_*.mp4` — os 14 reels **com a trilha dentro** (1080x1920, H.264/AAC, 14,6–17,5 s)
- `ads/mix_reels.js` — aplica as trilhas e verifica duração/formato
- `ads/plan.json` — os 56 payloads como foram agendados
- `.claude/settings.json` — permissão do createScheduledPost já registrada

## Passo 1 — baixar as faixas (conector Epidemic Sound) — feito

| Arquivo | Faixa | ID | Perfil |
|---|---|---|---|
| `trilhas/t1.mp3` | Luxx — Out To The World | `0005db4e-ce08-463f-b43c-b32539837dc5` | minimal tensa, 96 bpm |
| `trilhas/t2.mp3` | Neutral State — Blue Saga | `f5962eae-e078-4356-9b86-ec1a336cac34` | pad ambiente, 80 bpm |
| `trilhas/t3.mp3` | Jupiter Aurora — David Celeste | `3aaf6486-4f8e-35cc-b853-f77dd52dffa6` | pulso marcado, 81 bpm |

A t1 e a t3 foram aprovadas pelo Fabio em 08/09/2026, ouvidas sobre o reel A1. A t2
ficou "a definir" no handoff original e foi escolhida com o Fabio no mesmo dia, entre
três candidatas sem vocal e sem stem de bateria (Neutral State, Vildmark, Zae). A faixa
usada no sample 2 continua não identificada no catálogo e não foi usada.

`DownloadRecording` com `{ fileType: "MP3", stemType: "FULL" }`, salvar em `trilhas/`.
`trilhas/` está no `.gitignore`: o repositório é público e a licença cobre o uso na
peça, não a redistribuição da faixa solta.

## Passo 2 — montar — feito

    cd ads && npm install && node mix_reels.js   # escreve video_music/reel_*.mp4

Mapeamento: t1 → A1 A2 C1 C2 D1 D2 · t2 → B1 B2 G1 G2 · t3 → E1 E2 F1 F2.
Corte na duração exata do reel, -16 LUFS, fade de 0,5 s na entrada e 1,1 s na saída.

Duas correções no script durante a execução: ele lia de `video/`, o diretório de
rascunho que o `build_reels.js` escreve e que não existe num clone limpo, em vez de
`media/`; e o muxer mp4 transformava os capítulos ID3 da Jupiter Aurora numa faixa
de texto `bin_data` nos reels E e F, agora removida com `-dn -map_chapters -1`.

Conferido nos 14: duração idêntica à origem, 1080x1920 preservado (vídeo é `-c:v copy`),
áudio entre -14,9 e -17,1 LUFS. A origem media -91 dB (silêncio).

## Passo 3 — hospedar — feito

Os MP4 com trilha foram commitados sobre `ads/media/`. Sha:

    a384fcea0ba0c7b0145421721306f29160b972d9

    https://cdn.jsdelivr.net/gh/fabiokataoka-sketch/codex@a384fcea0ba0c7b0145421721306f29160b972d9/ads/media/reel_XX.mp4

Os 14 conferidos com `curl`: `200`, `video/mp4`, e o corpo byte a byte igual ao arquivo local.
As capas (`thumb_*.jpg`) não mudaram e seguem no sha antigo `5208707`, que o jsDelivr
continua servindo.

## Passo 4 — atualizar os 28 posts de reel — feito

Reenviado o payload completo do `plan.json` trocando só a URL em `info.media`. O `uuid`
sobreviveu; o `id` mudou em todos. Para uma próxima atualização, usar o id novo abaixo
com o uuid antigo.

Uma divergência encontrada: no mercari 19/09 o `tiktokData.title` agendado
("Se tudo passa pelo direct, o gargalo é você") não é o do `plan.json`
("Enquanto você dorme, a página trabalha"). Foi preservado o que estava agendado —
o objetivo era trocar o vídeo, não reverter texto. Os outros 27 batem com o `plan.json`.

| Data | Reel | Conta | id novo | uuid |
|---|---|---|---|---|
| 09/09 | E1 | ailab | 372720244 | 4783877875613647924 |
| 09/09 | E1 | mercari | 372721300 | -2376993988483922878 |
| 10/09 | B1 | ailab | 372721409 | -9089816861245225182 |
| 10/09 | B1 | mercari | 372721488 | -7010398090185521750 |
| 11/09 | D1 | ailab | 372721575 | 3432580238431177087 |
| 11/09 | D1 | mercari | 372721706 | 1616810228787790690 |
| 12/09 | A1 | ailab | 372722036 | 1336580307457556767 |
| 12/09 | A1 | mercari | 372722121 | -2083566787560651289 |
| 13/09 | G1 | ailab | 372722222 | 1435704916010550996 |
| 13/09 | G1 | mercari | 372722390 | 1622921694811604180 |
| 14/09 | C1 | ailab | 372722575 | 3109685270088076359 |
| 14/09 | C1 | mercari | 372722674 | 3021963045901389765 |
| 15/09 | F1 | ailab | 372722801 | -6270458393829225466 |
| 15/09 | F1 | mercari | 372722903 | -3329663222895524340 |
| 16/09 | E2 | ailab | 372723065 | -2990363448217419580 |
| 16/09 | E2 | mercari | 372723156 | -3046744975376758619 |
| 17/09 | B2 | ailab | 372723245 | 3086949581174751783 |
| 17/09 | B2 | mercari | 372723336 | -7572280999112847944 |
| 18/09 | D2 | ailab | 372723907 | 4548677215929909999 |
| 18/09 | D2 | mercari | 372724034 | -3668078624921729370 |
| 19/09 | A2 | ailab | 372724134 | -2459320250157612509 |
| 19/09 | A2 | mercari | 372724481 | 9094151831372778946 |
| 20/09 | G2 | ailab | 372724579 | 1530649193772632378 |
| 20/09 | G2 | mercari | 372724676 | -6896666680438862980 |
| 21/09 | C2 | ailab | 372724841 | 3098104439908222926 |
| 21/09 | C2 | mercari | 372724948 | 7180381294414220319 |
| 22/09 | F2 | ailab | 372725066 | 729195142851412289 |
| 22/09 | F2 | mercari | 372725352 | -1101060758896360759 |

O Metricool não guarda a URL do jsDelivr: ele baixa o arquivo e guarda uma cópia
própria em `static.metricool.com`. As 28 cópias foram baixadas de volta e comparadas
byte a byte com os reels locais — as 28 conferem, ou seja, o que vai publicar é mesmo
a versão com trilha.

## O que falta — só o Fabio pode fazer

Ligar os canais no painel do Epidemic Sound (@ailab_global, @ailabglobal, @fabiokataoka,
@mestredomercari e as duas páginas do Facebook) **antes de 09/09 20:00 JST**, quando o
primeiro reel publica. Sem isso o Content ID do Meta pode mutar o Reel mesmo com licença
válida. É uma ação no dashboard do Epidemic, fora do alcance do conector.

## Cuidados

- `autoAddMusic` do TikTok não funciona com vídeo (a API recusa) — por isso a trilha
  está dentro do MP4.
- `updateScheduledPost` SUBSTITUI o post inteiro: qualquer atualização futura precisa
  reenviar o payload completo, não só o campo que muda.
- `raw.githubusercontent` serve mp4 como `application/octet-stream` e o Metricool recusa;
  usar sempre jsDelivr fixado num sha.
