const { chromium } = require('playwright');
const fs = require('fs');
const jobs = [
  ['c-hero.png', 'hero', 560, 0.82],
  ['c-res-320.png', 'res', 560, 0.82],
  ['c-prequal.png', 'prequal', 560, 0.82],
  ['c-d-hero.png', 'dhero', 1100, 0.8],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage();
  const out = {};
  for (const [file, key, w, q] of jobs) {
    const b64 = fs.readFileSync(file).toString('base64');
    const dataUrl = await p.evaluate(async ({ b64, w, q }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = w; c.height = Math.round(img.height * w / img.width);
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', q);
    }, { b64, w, q });
    out[key] = dataUrl;
    console.log(key, Math.round(dataUrl.length / 1024) + 'KB');
  }
  fs.writeFileSync('assets.json', JSON.stringify(out));
  await b.close();
})();
