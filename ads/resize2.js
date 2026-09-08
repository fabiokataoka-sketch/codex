const { chromium } = require('playwright');
const fs = require('fs');
const jobs = [['b-hero.png','hero',760,.85],['b-sim.png','sim',760,.85],['b-res.png','res',760,.85],
              ['b-prequal.png','prequal',760,.85],['b-steps.png','steps',760,.85],['b-d-hero.png','dhero',1200,.82]];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
  const p = await b.newPage(); const out = {};
  for (const [f,k,w,q] of jobs) {
    const b64 = fs.readFileSync(f).toString('base64');
    out[k] = await p.evaluate(async ({b64,w,q}) => { const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
      const c=document.createElement('canvas'); c.width=w; c.height=Math.round(img.height*w/img.width);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height); return c.toDataURL('image/jpeg',q); }, {b64,w,q});
    console.log(k, Math.round(out[k].length/1024)+'KB');
  }
  fs.writeFileSync('assets2.json', JSON.stringify(out)); await b.close();
})();
