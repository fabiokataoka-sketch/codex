const fs = require('fs');
const A = JSON.parse(fs.readFileSync('angles.json', 'utf8'));
const CAP = { ailab: JSON.parse(fs.readFileSync('caps_ailab.json', 'utf8')),
              mercari: JSON.parse(fs.readFileSync('caps_mercari.json', 'utf8')) };
const SHA = process.argv[2];
const BASE = `https://cdn.jsdelivr.net/gh/fabiokataoka-sketch/codex@${SHA}/ads/media`;
const BRANDS = { ailab: '6499982', mercari: '6373460' };

const alt = (spec, v) => {
  const hl = (spec.headline || []).join(' ').replace(/<br>/g, ' ');
  switch (spec.layout) {
    case 'cover_shot': case 'shot':
      return `Peça em fundo preto com o título "${hl}" e a tela do site aberta em um celular / Black poster reading "${hl}" next to the site open on a phone.`;
    case 'cover_number':
      return `Peça em fundo preto com o valor ¥83.152 em corpo grande e a captura do simulador de financiamento abaixo / Black poster with ¥83,152 in large type above a screenshot of the mortgage simulator.`;
    case 'cover_split':
      return `Peça dividida: à esquerda mensagens soltas de direct, à direita uma ficha com visto, renda, entrada e parcela / Split poster: loose DM messages on the left, a filled profile card on the right.`;
    case 'cover_steps':
      return `Peça com o título "${hl}" e quatro passos numerados, do primeiro acesso até a conversa qualificada / Poster with four numbered steps from first visit to qualified conversation.`;
    case 'cover_log':
      return `Peça com registro de horários — 13h47 briefing, 14h48 publicado — ao lado da janela do navegador com o site / Poster with a ship log, 13:47 brief and 14:48 published, beside a browser window.`;
    case 'cover_type': case 'quote':
      return `Peça tipográfica em fundo preto com a frase "${hl}" / Typographic black poster reading "${hl}".`;
    case 'list':
      return `Lista em fundo preto sob o título "${hl}", com os campos e valores da ficha do cliente / Black list slide under "${hl}" with the client's fields and values.`;
    case 'cta':
      return `Peça final em fundo preto com a chamada "Manda site no direct" em botão vermelho / Final black slide with the red call to action "DM me SITE".`;
    default: return `Peça da campanha AI Lab em fundo preto / AI Lab campaign slide on black.`;
  }
};

const posts = [];
for (const day of A.grid) {
  for (const [slot, time] of [['noon', '12:00:00'], ['night', '20:00:00']]) {
    const { angle, v } = day[slot];
    const ang = A.angles[angle];
    const key = angle + v;
    const isCarousel = slot === 'noon';
    const media = isCarousel
      ? [`${BASE}/cap_${key}.jpg`, ...ang.slides.map((_, i) => `${BASE}/sl_${angle}${i+1}.jpg`)]
      : [`${BASE}/reel_${key}.mp4`];
    const alts = isCarousel
      ? [alt(Object.assign({}, ang.cover, { headline: ang.cover['headline_v'+v] }), v), ...ang.slides.map(s => alt(s, v))]
      : [alt(Object.assign({}, ang.cover, { headline: ang.cover['headline_v'+v] }), v)];

    for (const [brandKey, blogId] of Object.entries(BRANDS)) {
      const c = CAP[brandKey][key];
      const text = isCarousel ? c.long : c.short;
      const info = {
        text,
        media,
        mediaAltText: alts,
        autoPublish: true,
        draft: false,
        shortener: false,
        hasNotReadNotes: false,
        publicationDate: { dateTime: `${day.date}T${time}`, timezone: 'Asia/Tokyo' },
        providers: isCarousel
          ? [{ network: 'instagram' }, { network: 'facebook' }, { network: 'tiktok' }]
          : [{ network: 'instagram' }, { network: 'tiktok' }],
        instagramData: isCarousel
          ? { type: 'POST', isAiGenerated: false }
          : { type: 'REEL', showReelOnFeed: true, isAiGenerated: false },
        tiktokData: isCarousel
          ? { privacyOption: 'PUBLIC_TO_EVERYONE', title: c.title, photoCoverIndex: 0 }
          : { privacyOption: 'PUBLIC_TO_EVERYONE', title: c.title, isAigc: false }
      };
      if (isCarousel) info.facebookData = { type: 'POST' };
      else info.videoThumbnailUrl = `${BASE}/thumb_${key}.jpg`;

      posts.push({
        n: posts.length + 1, brand: brandKey, blogId, angle, v, slot,
        date: `${day.date}T${time}+09:00`, dow: day.dow,
        format: isCarousel ? 'carrossel' : 'reel', info
      });
    }
  }
}
fs.writeFileSync('plan.json', JSON.stringify(posts, null, 1));
console.log('posts:', posts.length);
console.log('por marca:', Object.fromEntries(Object.keys(BRANDS).map(b => [b, posts.filter(p => p.brand === b).length])));
console.log('mídias distintas:', new Set(posts.flatMap(p => p.info.media)).size);
const dates = posts.map(p => p.date);
console.log('primeiro:', dates[0], 'último:', dates[dates.length-1]);
