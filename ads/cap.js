const { chromium } = require('playwright');
const { ProxyAgent, request } = require('undici');
const fs = require('fs');
const agent = new ProxyAgent({ uri: process.env.HTTPS_PROXY, requestTls: { ca: fs.readFileSync('/root/.ccr/ca-bundle.crt') } });
async function route(page){ await page.route('**/*', async r0 => { const r = r0.request();
  try { const res = await request(r.url(), { dispatcher: agent, method: r.method(), headers: r.headers(), body: r.postData() || undefined });
    const buf = Buffer.from(await res.body.arrayBuffer()); const h={...res.headers}; delete h['content-encoding']; delete h['content-length'];
    await r0.fulfill({ status: res.statusCode, headers: h, body: buf }); } catch(e){ await r0.abort(); } }); }
const hide = `#lovable-badge{display:none!important}`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await route(p);
  await p.goto('https://casa-jp-f.lovable.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(6000);
  await p.addStyleTag({ content: hide });
  await p.screenshot({ path: 'c-hero.png' });
  // find the payment result block
  const y = await p.evaluate(() => {
    const el = [...document.querySelectorAll('*')].find(e => /parcela mensal/i.test(e.textContent) && e.children.length < 6 && e.getBoundingClientRect().height < 400);
    return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : null;
  });
  console.log('result block y', y);
  await p.evaluate(v => window.scrollTo(0, v), Math.max(0, (y||2400) - 120));
  await p.waitForTimeout(1500); await p.screenshot({ path: 'c-sim.png' });
  await p.evaluate(v => window.scrollTo(0, v), 3002 - 40); await p.waitForTimeout(1200); await p.screenshot({ path: 'c-prequal.png' });
  await p.evaluate(v => window.scrollTo(0, v), 6393 - 20); await p.waitForTimeout(1200); await p.screenshot({ path: 'c-contato.png' });
  await p.evaluate(v => window.scrollTo(0, v), 3652); await p.waitForTimeout(1200); await p.screenshot({ path: 'c-como.png' });
  await p.evaluate(v => window.scrollTo(0, v), 4706); await p.waitForTimeout(1200); await p.screenshot({ path: 'c-serv.png' });
  await p.screenshot({ path: 'c-fullpage.png', fullPage: true });
  const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await route(d);
  await d.goto('https://casa-jp-f.lovable.app', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await d.waitForTimeout(6000); await d.addStyleTag({ content: hide });
  await d.screenshot({ path: 'c-d-hero.png' });
  await d.evaluate(() => document.querySelector('#simulador').scrollIntoView()); await d.waitForTimeout(1500);
  await d.screenshot({ path: 'c-d-sim.png' });
  await d.evaluate(() => document.querySelector('#pre-qualificacao').scrollIntoView()); await d.waitForTimeout(1500);
  await d.screenshot({ path: 'c-d-prequal.png' });
  await b.close();
})();
