const { chromium } = require('playwright');
const { ProxyAgent, request } = require('undici');
const fs = require('fs');
const agent = new ProxyAgent({ uri: process.env.HTTPS_PROXY, requestTls: { ca: fs.readFileSync('/root/.ccr/ca-bundle.crt') } });
async function route(page){ await page.route('**/*', async r0 => { const r = r0.request();
  try { const res = await request(r.url(), { dispatcher: agent, method: r.method(), headers: r.headers(), body: r.postData() || undefined });
    const buf = Buffer.from(await res.body.arrayBuffer()); const h={...res.headers}; delete h['content-encoding']; delete h['content-length'];
    await r0.fulfill({ status: res.statusCode, headers: h, body: buf }); } catch(e){ await r0.abort(); } }); }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await route(p);
  await p.goto('https://casa-jp-f.lovable.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  await p.addStyleTag({ content: '#lovable-badge{display:none!important}' });
  const y = await p.evaluate(() => {
    const els = [...document.querySelectorAll('*')].filter(e => parseFloat(getComputedStyle(e).fontSize) > 34 && /¥[\d.]{5,}/.test(e.textContent) && e.children.length === 0);
    return els.length ? Math.round(els[0].getBoundingClientRect().top + window.scrollY) : null;
  });
  console.log('big yen y', y);
  for (const off of [200, 320, 440]) {
    await p.evaluate(v => window.scrollTo(0, v), Math.max(0, (y || 2600) - off));
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `c-res-${off}.png` });
  }
  await b.close();
})();
