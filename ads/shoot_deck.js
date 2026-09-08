const { chromium } = require('playwright');
const { ProxyAgent, request } = require('undici');
const fs = require('fs');
const agent = new ProxyAgent({ uri: process.env.HTTPS_PROXY, requestTls: { ca: fs.readFileSync('/root/.ccr/ca-bundle.crt') } });
const only = process.argv.slice(2);
(async () => {
  fs.mkdirSync('out', { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  for (const host of ['fonts.googleapis.com','fonts.gstatic.com']) {
    await p.route('**/' + host + '/**', async r0 => { const r = r0.request();
      try { const res = await request(r.url(), { dispatcher: agent, headers: r.headers() });
        const buf = Buffer.from(await res.body.arrayBuffer()); const h = {...res.headers};
        delete h['content-encoding']; delete h['content-length'];
        await r0.fulfill({ status: res.statusCode, headers: h, body: buf }); } catch(e){ await r0.abort(); } });
  }
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + process.cwd() + '/deck.html', { waitUntil: 'load' });
  await p.waitForTimeout(3000);
  if (errs.length) { console.log('PAGE ERRORS:', errs.slice(0,3)); process.exit(1); }
  const ids = await p.evaluate(() => window.SLIDE_IDS);
  const targets = only.length ? ids.filter(i => only.some(o => i.startsWith(o))) : ids;
  console.log('slides:', ids.length, 'shooting:', targets.length);
  for (const id of targets) {
    const h = await p.$('.slide[data-id="' + id + '"]');
    await h.screenshot({ path: 'out/' + id + '.png', scale: 'css' });
  }
  await b.close();
  console.log('done');
})();
