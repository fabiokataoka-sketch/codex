# -*- coding: utf-8 -*-
# Checklist de uma página para ligar os canais no painel do Epidemic Sound.
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

OUT = '/home/user/codex/ads/canais-epidemic.pdf'
INK = colors.HexColor('#111111')
MUTED = colors.HexColor('#6B6B6B')
RULE = colors.HexColor('#DDDDDD')
RED = colors.HexColor('#D0021B')

CANAIS = [
    ('@ailab_global',           'Instagram', 'Ai Lab Global'),
    ('@ailabglobal',            'TikTok',    'Ai Lab Global'),
    ('@fabiokataoka',           'Instagram', 'Mestre do Mercari'),
    ('@mestredomercari',        'TikTok',    'Mestre do Mercari'),
    ('Página 1098605763346780', 'Facebook',  'Ai Lab Global'),
    ('Página 1023856787468699', 'Facebook',  'Mestre do Mercari'),
]

# Cada nota é (título ou None, [linhas]).
NOTAS = [
    ('Por que as páginas do Facebook entram', [
        'Os Reels publicam só no Instagram e no TikTok. As duas páginas do Facebook estão na lista',
        'porque o Content ID da Meta varre as duas redes, e o carrossel da mesma campanha publica lá.',
    ]),
    ('O que acontece se um ficar de fora', [
        'O Content ID pode mutar o Reel mesmo com a licença válida. A trilha já está dentro do MP4,',
        'mas a licença só cobre o canal que estiver ligado no painel.',
    ]),
]

W, H = A4
L = 22 * mm
R = W - 22 * mm

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Canais a ligar no Epidemic Sound')
c.setAuthor('AI LAB')
c.setSubject('Checklist antes da campanha de 09–22/09/2026')

y = H - 26 * mm

c.setFillColor(MUTED)
c.setFont('Helvetica', 8.5)
c.drawString(L, y, 'AI LAB   ·   CAMPANHA 09–22/09/2026')
y -= 11 * mm

c.setFillColor(INK)
c.setFont('Helvetica-Bold', 20)
c.drawString(L, y, 'Ligar os canais no Epidemic Sound')
y -= 8 * mm

c.setFillColor(MUTED)
c.setFont('Helvetica', 10.5)
c.drawString(L, y, 'Seis canais, duas contas. Marque conforme for ligando.')
y -= 12 * mm

# Faixa do prazo
box_h = 15 * mm
c.setFillColor(colors.HexColor('#FBF3F4'))
c.rect(L, y - box_h, R - L, box_h, stroke=0, fill=1)
c.setFillColor(RED)
c.rect(L, y - box_h, 1.6 * mm, box_h, stroke=0, fill=1)
c.setFont('Helvetica-Bold', 11)
c.drawString(L + 7 * mm, y - 6.2 * mm, 'Antes de 09/09/2026, 20:00 JST')
c.setFillColor(INK)
c.setFont('Helvetica', 9.5)
c.drawString(L + 7 * mm, y - 11.2 * mm, 'É o horário em que o primeiro Reel publica.')
y -= box_h + 14 * mm

COL_CANAL = L + 12 * mm
COL_REDE = L + 78 * mm
COL_CONTA = L + 116 * mm

c.setFillColor(MUTED)
c.setFont('Helvetica-Bold', 8)
c.drawString(COL_CANAL, y, 'CANAL')
c.drawString(COL_REDE, y, 'REDE')
c.drawString(COL_CONTA, y, 'CONTA')
y -= 3.5 * mm
c.setStrokeColor(INK)
c.setLineWidth(0.8)
c.line(L, y, R, y)
y -= 9 * mm

row_h = 12 * mm
box = 4.6 * mm
for i, (canal, rede, conta) in enumerate(CANAIS):
    c.setStrokeColor(colors.HexColor('#9A9A9A'))
    c.setLineWidth(0.9)
    c.rect(L, y - 1.2 * mm, box, box, stroke=1, fill=0)

    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(COL_CANAL, y, canal)

    c.setFont('Helvetica', 10.5)
    c.drawString(COL_REDE, y, rede)

    c.setFillColor(MUTED)
    c.drawString(COL_CONTA, y, conta)

    if i < len(CANAIS) - 1:
        c.setStrokeColor(RULE)
        c.setLineWidth(0.5)
        c.line(L, y - 4.6 * mm, R, y - 4.6 * mm)
    y -= row_h

# fecha a tabela na mesma distância que separa as linhas entre si
y += row_h - 7 * mm
c.setStrokeColor(INK)
c.setLineWidth(0.8)
c.line(L, y, R, y)
y -= 11 * mm

for titulo, linhas in NOTAS:
    c.setFillColor(INK)
    c.setFont('Helvetica-Bold', 9.5)
    c.drawString(L, y, titulo)
    y -= 5.6 * mm
    c.setFillColor(MUTED)
    c.setFont('Helvetica', 9.5)
    for linha in linhas:
        c.drawString(L, y, linha)
        y -= 5.2 * mm
    y -= 4 * mm

c.setStrokeColor(RULE)
c.setLineWidth(0.5)
c.line(L, 20 * mm, R, 20 * mm)
c.setFillColor(MUTED)
c.setFont('Helvetica', 7.5)
c.drawString(L, 15.5 * mm,
             'ads/HANDOFF-trilha.md   ·   reels no sha a384fce   '
             '·   28 posts de Reel atualizados em 08/09/2026')
c.setFillColor(RED)
c.circle(R - 1.2 * mm, 16.2 * mm, 1.2 * mm, stroke=0, fill=1)

c.showPage()
c.save()
print('escrito:', OUT)
