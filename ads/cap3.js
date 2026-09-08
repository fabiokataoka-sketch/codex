const { chromium } = require('playwright');
const { ProxyAgent, request } = require('undici');
const fs = require('fs');
const agent = new ProxyAgent({ uri: process.env.HTTPS_PROXY, requestTls: { ca: fs.readFileSync('/root/.ccr/ca-bundle.crt') } });
async function route(page){ await page.route('**/*', async r0 => { const r = r0.request();
  try { const res = await request(r.url(), { dispatcher: agent, method: r.method(), headers: r.headers(), body: r.postData() || undefined });
    const buf = Buffer.from(await res.body.arrayBuffer()); const h={...res.headers}; delete h['content-encoding']; delete h['content-length'];
    await r0.fulfill({ status: res.statusCode, headers: h, body: buf }); } catch(e){ await r0.abort(); } }); }

const REDACT = `#lovable-badge{display:none!important}
.ai-blur{filter:blur(13px)!important;-webkit-filter:blur(13px)!important}`;

async function redact(page){
  await page.addStyleTag({ content: REDACT });
  return await page.evaluate(() => {
    const re = /eloisa|matsuuchi|home station|wa\.me|\+81|080-|090-|@gmail|instagram\.com/i;
    let n = 0; const hit = [];
    document.querySelectorAll('body *').forEach(el => {
      const t = (el.textContent || '').trim();
      if (!t || t.length > 130) return;
      if (!re.test(t)) return;
      if (el.querySelectorAll('*').length > 2) return;
      if (el.closest('.ai-blur')) return;
      el.classList.add('ai-blur'); n++; hit.push(t.slice(0, 60));
    });
    return { n, hit };
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await route(p);
  await p.goto('https://casa-jp-f.lovable.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6500);
  console.log('mobile redacted:', JSON.stringify(await redact(p)));
  const shots = { 'b-hero': 0, 'b-sim': 1660, 'b-res': 2190, 'b-prequal': 2965, 'b-steps': 3690, 'b-serv': 4740 };
  for (const [name, y] of Object.entries(shots)) {
    await p.evaluate(v => window.scrollTo(0, v), y);
    await p.waitForTimeout(900);
    await p.screenshot({ path: name + '.png' });
  }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
  await p.screenshot({ path: 'b-full.png', fullPage: true });

  const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await route(d);
  await d.goto('https://casa-jp-f.lovable.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await d.waitForTimeout(6500);
  console.log('desktop redacted:', JSON.stringify(await redact(d)));
  await d.screenshot({ path: 'b-d-hero.png' });
  await b.close();
})();
