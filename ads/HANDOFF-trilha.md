# Handoff — aplicar a trilha nos reels da campanha

Estado: 56 posts agendados no Metricool (09–22/09, 12h e 20h, duas contas).
Os 28 reels estão no ar com faixa de áudio silenciosa. Falta trocar por trilha
licenciada do Epidemic Sound. Os 28 carrosséis não são tocados.

## O que já está pronto neste repositório

- `ads/media/reel_*.mp4` — os 14 reels (1080x1920, H.264/AAC, 14,6–17,5 s)
- `ads/mix_reels.js` — aplica as trilhas e verifica duração/formato
- `ads/plan.json` — os 56 payloads exatamente como foram agendados
- `.claude/settings.json` — permissão do createScheduledPost já registrada

## Passo 1 — baixar as faixas (conector Epidemic Sound)

Aprovadas pelo Fabio em 08/09/2026, ouvidas sobre o reel A1:

| Arquivo | Faixa | ID | Perfil |
|---|---|---|---|
| `trilhas/t1.mp3` | Luxx — Out To The World | `0005db4e-ce08-463f-b43c-b32539837dc5` | minimal tensa, 96 bpm |
| `trilhas/t2.mp3` | **a definir** | — | pad ambiente, sem percussão, sem vocal |
| `trilhas/t3.mp3` | Jupiter Aurora — David Celeste | `3aaf6486-4f8e-35cc-b853-f77dd52dffa6` | pulso marcado, 81 bpm |

A t2 precisa ser escolhida com o Fabio: a faixa usada no sample 2 não pôde ser
identificada no catálogo, então não entra sem confirmação.

`DownloadRecording` com `{ fileType: "MP3", stemType: "FULL" }`, salvar em `trilhas/`.

## Passo 2 — montar

    cd ads && node mix_reels.js      # escreve video_music/reel_*.mp4

Mapeamento: t1 → A1 A2 C1 C2 D1 D2 · t2 → B1 B2 G1 G2 · t3 → E1 E2 F1 F2.
Corte na duração exata do reel, -16 LUFS, fade de 0,5 s na entrada e 1,1 s na saída.

## Passo 3 — hospedar

Commitar `video_music/reel_*.mp4` sobre `ads/media/` e usar jsDelivr fixado no
NOVO sha: `https://cdn.jsdelivr.net/gh/fabiokataoka-sketch/codex@<sha>/ads/media/reel_XX.mp4`
(raw.githubusercontent serve mp4 como application/octet-stream e o Metricool recusa).
Confirmar com `curl -o /dev/null -w "%{content_type}"` que volta `video/mp4`.

## Passo 4 — atualizar os 28 posts de reel

`updateScheduledPost` SUBSTITUI o post inteiro: reenviar o payload completo do
`plan.json` (mesmo texto, capa, horário, redes) trocando só a URL em `info.media`.
O `uuid` sobrevive à atualização; o `id` muda — para atualizar duas vezes, usar o
id novo com o uuid antigo.

Prazo: antes de 09/09 20:00 JST, quando o primeiro reel publica.

## Cuidados

- `autoAddMusic` do TikTok não funciona com vídeo (a API recusa) — a trilha tem
  que estar dentro do MP4, que é justamente o que este handoff faz.
- Ligar os canais no painel do Epidemic (@ailab_global, @ailabglobal,
  @fabiokataoka, @mestredomercari e as duas páginas do Facebook) antes de publicar,
  senão o Content ID do Meta pode mutar o Reel mesmo com licença válida.
