# Trilhas dos reels — Epidemic Sound

Licenciadas pela conta Epidemic Sound do cliente (download de MP3 completo via API,
não preview). Uso comercial coberto pela assinatura enquanto ela estiver ativa.

| Faixa | Título | Artista | Recording ID | Reels |
|---|---|---|---|---|
| t1 | Luxx | Out To The World | `0005db4e-ce08-463f-b43c-b32539837dc5` | A1 A2 C1 C2 D1 D2 |
| t2 | Abisko | Ström (comp. Joel Nyström Holm) | `021ac6d5-7271-3b46-852a-8f825fdcf91f` | B1 B2 G1 G2 |
| t3 | Jupiter Aurora | David Celeste | `3aaf6486-4f8e-35cc-b853-f77dd52dffa6` | E1 E2 F1 F2 |

Tratamento em `ads/mix_reels.js`: recorte a partir do offset da faixa, `afade` de
0,5 s na entrada e 1,1 s na saída, `loudnorm=I=-16:TP=-1.5:LRA=11` (padrão de
plataformas sociais), AAC 128 kbps 44,1 kHz, sem stream de dados e sem metadados
herdados.

Registrar os canais em Epidemic Sound (@ailab_global, @ailabglobal, @fabiokataoka,
@mestredomercari e as duas páginas de Facebook) evita reivindicação automática de
direitos autorais nas plataformas.
