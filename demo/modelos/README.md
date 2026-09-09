# Modelos da página de demonstração

Retratos gerados por IA (Higgsfield, modelo `soul_2`, 3:4 · 2k, recortados em 4:5)
para ocupar o espaço da foto do corretor na página Consultora Demo.

| Arquivo | Uso |
|---|---|
| `consultora.jpg` (1200×1500) | foto principal, modelo feminina |
| `consultor.jpg` (1200×1500) | foto principal, modelo masculino |
| `consultora-mini.jpg` (240×300) | miniatura do seletor |
| `consultor-mini.jpg` (240×300) | miniatura do seletor |

**Não são pessoas reais.** São composições sintéticas, sem semelhança buscada com
ninguém, usadas apenas como espaço reservado numa página de demonstração. A página
diz isso em todos os idiomas. Quando um corretor real assumir a página, estas
imagens saem e entra a foto dele.

## Onde estas imagens são servidas

A partir de setembro/2026 elas ficam dentro do próprio projeto da Lovable, em
`public/modelos/`, servidas por `https://consultoriademo.ailabglobal.com`. Os
arquivos aqui no repositório são a cópia de origem — se precisar repor, é daqui
que se sobe.

Antes disso eram servidas por jsDelivr apontando para um commit deste repositório,
o que amarrava a página ao GitHub. Não volte a fazer isso.

## og.jpg

`../og.jpg` (1200×630) é a imagem de compartilhamento da página. Foi montada em
HTML (`../og-card.html`), com a paleta e as fontes do próprio site (Fraunces e
Manrope), e traz o print real da página num celular. Para regerar depois de mudar
o site: atualize o print embutido no HTML e capture em 1200×630 a 2x.
