const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  fs.mkdirSync('jpg', { recursive: true });
  const files = fs.readdirSync('out').filter(f => f.endsWith('.png'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage();
  let n = 0;
  for (const f of files) {
    const b64 = fs.readFileSync('out/' + f).toString('base64');
    const d = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const x = c.getContext('2d'); x.fillStyle = '#0A0A0B'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0);
      return c.toDataURL('image/jpeg', 0.92);
    }, b64);
    fs.writeFileSync('jpg/' + f.replace('.png', '.jpg'), Buffer.from(d.split(',')[1], 'base64'));
    n++;
  }
  await b.close();
  console.log('jpegs:', n);
})();
