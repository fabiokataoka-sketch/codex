// Testes de todas as funções da réplica. Rode com: node --test cutpro-replica/tests
const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../core.js');

const T0 = new Date('2026-10-20T10:00:00').getTime();
function fresh(planId) {
  let t = T0;
  const s = Core.createStore(null, { now: () => t });
  s.register({ email: 'teste@exemplo.com', password: 'senha-forte', name: 'Teste' });
  if (planId) s.subscribePlan(planId);
  s.advance = ms => { t += ms; };
  return s;
}
const code = c => e => e.code === c;

test('cadastro e login', () => {
  const s = Core.createStore(null);
  assert.throws(() => s.register({ email: 'x', password: '12345678' }), code('invalid_email'));
  assert.throws(() => s.register({ email: 'a@b.co', password: '123' }), code('weak_password'));
  s.register({ email: 'a@b.co', password: '12345678' });
  assert.equal(s.balance().credits, 15, 'plano grátis dá 15 créditos');
  s.logout(); assert.equal(s.isAuthed(), false);
  assert.throws(() => s.login({ email: 'a@b.co', password: 'errada00' }), code('bad_credentials'));
  s.login({ email: 'a@b.co', password: '12345678' }); assert.equal(s.isAuthed(), true);
});

test('detecção de fonte por link', () => {
  assert.equal(Core.detectSource('https://www.youtube.com/watch?v=abc').kind, 'youtube');
  assert.equal(Core.detectSource('https://youtu.be/abc').kind, 'youtube');
  assert.deepEqual([Core.detectSource('https://twitch.tv/canal').live, Core.detectSource('https://twitch.tv/videos/123').live], [true, false]);
  assert.equal(Core.detectSource('https://kick.com/canal').live, true);
  assert.equal(Core.detectSource({ file: 'entrevista.mp4' }).kind, 'file');
  assert.throws(() => Core.detectSource('nao é link'), code('invalid_source'));
  assert.throws(() => Core.detectSource('https://exemplo.org/v'), code('unsupported_source'));
});

test('créditos: 1 crédito = 1 minuto analisado', () => {
  const s = fresh('starter');
  const before = s.balance().credits;
  const { project, clips } = s.createProject({ file: 'aula.mp4', durationMin: 40 });
  assert.equal(project.credits, 40);
  assert.equal(s.balance().credits, before - 40);
  assert.ok(clips.length > 0);
  assert.ok(clips.every(c => c.score >= 0 && c.score <= 100 && c.aspect === '9:16'));
  assert.ok(clips[0].score >= clips[clips.length - 1].score, 'ordenado por score viral');
  // trecho parcial cobra só o trecho
  const p2 = s.createProject({ file: 'b.mp4', durationMin: 60 }, { range: { fromMin: 10, toMin: 20 } });
  assert.equal(p2.project.credits, 10);
});

test('créditos insuficientes e limite de duração do plano', () => {
  const s = fresh();
  assert.throws(() => s.createProject({ file: 'longo.mp4', durationMin: 50 }), code('insufficient_credits'));
  const s2 = fresh('pro');
  assert.throws(() => s2.createProject({ file: 'x.mp4', durationMin: 600 }), code('too_long'));
});

test('editor: corte, proporção, velocidade, legendas, template, silêncio', () => {
  const s = fresh('starter');
  const clip = s.createProject({ file: 'v.mp4', durationMin: 9 }).clips[0];
  assert.throws(() => s.updateClip(clip.id, { start: 50, end: 10 }), code('invalid_range'));
  assert.throws(() => s.updateClip(clip.id, { aspect: '3:2' }), code('invalid_aspect'));
  assert.throws(() => s.updateClip(clip.id, { speed: 4 }), code('invalid_speed'));
  s.updateClip(clip.id, { start: 10, end: 40, aspect: '1:1', speed: 1.5 });
  assert.equal(s.getClip(clip.id).aspect, '1:1');
  s.editCaption(clip.id, 0, 'texto corrigido');
  assert.equal(s.getClip(clip.id).captions[0].text, 'texto corrigido');
  s.applyTemplate(clip.id, 'neon'); assert.equal(s.getClip(clip.id).templateId, 'neon');
  assert.throws(() => s.applyTemplate(clip.id, 'nope'), code('not_found'));
  const tpl = s.saveTemplate({ name: 'Meu estilo', highlight: '#ff0' });
  s.applyTemplate(clip.id, tpl.id);
  const first = s.getClip(clip.id).captions[0].start;
  s.shiftCaptions(clip.id, 0.5);
  assert.equal(s.getClip(clip.id).captions[0].start, +(first + 0.5).toFixed(2));
  const r = s.removeSilences(clip.id); assert.ok(r.removedSec >= 0);
});

test('legendas: SRT, VTT e tradução', () => {
  const s = fresh('starter');
  const clip = s.createProject({ file: 'v.mp4', durationMin: 6 }).clips[0];
  const srt = s.toSRT(clip.captions);
  assert.match(srt, /^1\n\d\d:\d\d:\d\d,\d{3} --> \d\d:\d\d:\d\d,\d{3}\n/);
  assert.match(s.toVTT(clip.captions), /^WEBVTT/);
  const timings = clip.captions.map(c => c.start);
  s.translateCaptions(clip.id, 'en');
  assert.deepEqual(s.getClip(clip.id).captions.map(c => c.start), timings, 'tradução mantém o timing');
  assert.throws(() => s.translateCaptions(clip.id, 'xx'), code('invalid_language'));
});

test('render: marca d’água no grátis e 4K só no Pro', () => {
  const s = fresh();
  const clip = s.createProject({ file: 'v.mp4', durationMin: 3 }).clips[0];
  assert.equal(s.render(clip.id).watermark, true);
  assert.throws(() => s.render(clip.id, { resolution: '4k' }), code('plan_required'));
  s.subscribePlan('pro');
  assert.equal(s.render(clip.id, { resolution: '4k' }).resolution, '4k');
  assert.equal(s.render(clip.id).watermark, false);
});

test('títulos e hashtags', () => {
  const s = fresh('starter');
  const clip = s.createProject({ file: 'v.mp4', durationMin: 3 }).clips[0];
  const r = s.suggestTitles(clip.id);
  assert.equal(r.titles.length, 3); assert.ok(r.hashtags.length >= 1);
});

test('ferramentas avulsas', () => {
  const s = fresh('starter');
  for (const t of ['transcribe', 'translate', 'remove-silence', 'highlights', 'compress', 'to-mp4', 'to-mp3', 'titles']) {
    assert.equal(s.runTool(t, { name: 'a.mp4', durationMin: 2 }).status, 'done', t);
  }
  assert.equal(s.runTool('resize', { aspect: '4:5' }).output.aspect, '4:5');
  assert.throws(() => s.runTool('resize', { aspect: '7:3' }), code('invalid_aspect'));
  assert.equal(s.runTool('download', { url: 'https://kick.com/video/1' }).output.source, 'kick');
  assert.throws(() => s.runTool('download', { url: 'https://site.xyz/a' }), code('unsupported_source'));
  assert.throws(() => s.runTool('magica'), code('unknown_tool'));
});

test('clipes ao vivo: só Plus/Pro, lotes de 10 min', () => {
  const s = fresh('starter');
  assert.throws(() => s.createMonitor('https://twitch.tv/canal'), code('plan_required'));
  s.subscribePlan('plus');
  assert.throws(() => s.createMonitor('https://twitch.tv/videos/1'), code('not_live'));
  const m = s.createMonitor('https://kick.com/canal');
  assert.throws(() => s.tickMonitor(m.id), code('not_running'));
  s.startMonitor(m.id);
  const before = s.balance().credits;
  const clips = s.tickMonitor(m.id);
  assert.equal(before - s.balance().credits, 10);
  assert.ok(clips.length > 0);
  s.stopMonitor(m.id); s.deleteMonitor(m.id);
  assert.equal(s.workspace().monitors.length, 0);
  assert.throws(() => s.createProject('https://twitch.tv/canal'), code('use_monitor'));
});

test('conexões: 13 redes e limite de contas por plano', () => {
  const s = fresh('starter');
  assert.equal(Core.NETWORKS.length, 13);
  s.connect('tiktok');
  assert.throws(() => s.connect('tiktok'), code('plan_limit'));
  assert.throws(() => s.connect('twitch'), code('invalid_network'));
  s.subscribePlan('plus');
  for (let i = 0; i < 4; i++) s.connect('tiktok');
  assert.throws(() => s.connect('tiktok'), code('plan_limit'));
  s.subscribePlan('pro'); s.connect('tiktok');
  const c = s.connect('instagram'); s.disconnect(c.id);
  assert.equal(s.workspace().connections.filter(x => x.network === 'instagram').length, 0);
});

test('agendamento, publicação, cancelamento e métricas', () => {
  const s = fresh('plus');
  const clips = s.createProject({ file: 'v.mp4', durationMin: 30 }).clips;
  const tk = s.connect('tiktok'), ig = s.connect('instagram');
  assert.throws(() => s.schedulePost(clips[0].id, []), code('no_target'));
  assert.throws(() => s.schedulePost(clips[0].id, [tk.id], T0 - 864e5), code('past_date'));
  const p = s.schedulePost(clips[0].id, [tk.id, ig.id]);
  assert.equal(new Date(p.scheduledAt).getHours(), 19, 'horário padrão recomendado: 19h');
  assert.ok(s.getClip(clips[0].id).rendered, 'renderiza antes de agendar');
  s.publishNow(p.id);
  assert.throws(() => s.cancelPost(p.id), code('already_published'));
  const p2 = s.schedulePost(clips[1].id, [tk.id], T0 + 3600e3);
  s.cancelPost(p2.id); assert.throws(() => s.publishNow(p2.id), code('cancelled'));
  for (let i = 2; i < 6; i++) s.publishNow(s.schedulePost(clips[i].id, [tk.id], T0 + i * 3600e3).id);
  s.advance(864e5 * 2);
  const m = s.metrics(30);
  assert.equal(m.posts, 5);
  assert.ok(m.views > 0 && m.engagement > 0);
  assert.equal(m.heat.length, 7); assert.equal(m.heat[0].length, 24);
  assert.ok(m.ranking[0].views >= m.ranking[m.ranking.length - 1].views);
  assert.ok(m.byNetwork.tiktok > 0);
  assert.equal(typeof m.bestHour, 'number');
});

test('auto-post publica clipes novos', () => {
  const s = fresh('plus');
  s.connect('tiktok'); s.setAutoPost(true);
  s.createProject({ file: 'v.mp4', durationMin: 30 });
  assert.ok(s.workspace().posts.length > 0);
});

test('personas: 4 formas de criar, versões, troca e estorno', () => {
  const s = fresh('plus');
  const pre = s.createPersona({ kind: 'preset', presetId: 'p-orange' });
  assert.equal(pre.cost, 0);
  assert.throws(() => s.createPersona({ kind: 'photos', photos: Array(7).fill('f.jpg') }), code('invalid_photos'));
  const ph = s.createPersona({ kind: 'photos', photos: ['1.jpg', '2.jpg'], name: 'Eu' });
  s.createPersona({ kind: 'sheet', sheet: 'ficha.png' });
  s.createPersona({ kind: 'scratch', description: 'apresentadora ruiva de óculos' });
  assert.throws(() => s.createPersona({ kind: 'outra' }), code('invalid_kind'));
  s.regeneratePersona(ph.id); assert.equal(s.workspace().personas.find(p => p.id === ph.id).current, 2);
  s.restorePersonaVersion(ph.id, 1); assert.equal(s.workspace().personas.find(p => p.id === ph.id).current, 1);
  const clip = s.createProject({ file: 'v.mp4', durationMin: 3 }).clips[0];
  const q1 = s.quoteSwap(30, [pre.id]), q4 = s.quoteSwap(30, [1, 2, 3, 4]);
  assert.equal(q1.credits, q4.credits, 'collab com até 4 personas pelo mesmo preço');
  assert.throws(() => s.quoteSwap(30, [1, 2, 3, 4, 5]), code('too_many'));
  const before = s.balance().credits;
  const job = s.swapPersona(clip.id, [pre.id], { simulateFailure: true });
  assert.equal(job.status, 'failed'); assert.equal(s.balance().credits, before, 'créditos voltam se falhar');
  assert.equal(s.swapPersona(clip.id, [pre.id, ph.id]).status, 'done');
  s.deletePersona(ph.id); assert.ok(!s.workspace().personas.some(p => p.id === ph.id));
});

test('automações: comentário vira DM, pedido de follow e coleta de e-mail', () => {
  const s = fresh();
  assert.throws(() => s.createAutomation({ type: 'comment_to_dm' }), code('invalid_automation'));
  const a = s.createAutomation({ type: 'comment_to_dm', keyword: 'LINK', link: 'https://exemplo.com' });
  let out = s.simulateComment({ user: '@ana', text: 'manda o link!', follows: false });
  assert.equal(out[0].action, 'dm'); assert.equal(out[0].link, 'https://exemplo.com');
  const g = s.createAutomation({ type: 'follow_gate' });
  out = s.simulateComment({ user: '@bia', text: 'link', follows: false });
  assert.equal(out[0].action, 'follow_request');
  s.createAutomation({ type: 'collect_email' });
  s.simulateComment({ user: '@caio', text: 'Link pf', follows: true, email: 'caio@x.com' });
  assert.equal(s.workspace().contacts.length, 1);
  s.toggleAutomation(g.id); s.toggleAutomation(a.id);
  assert.equal(s.simulateComment({ user: '@d', text: 'link' }).length, 0);
  s.deleteAutomation(a.id);
  assert.throws(() => s.createAutomation({ type: 'x' }), code('invalid_type'));
});

test('workspaces, equipe, API keys, download em massa e cancelamento', () => {
  const s = fresh();
  const w2 = s.createWorkspace('Cliente B');
  assert.equal(s.workspace().id, w2.id);
  assert.equal(s.balance().credits, 15, 'créditos separados por workspace');
  s.switchWorkspace(s.state.workspaces[0].id);
  assert.throws(() => s.switchWorkspace('nope'), code('not_found'));
  s.inviteMember('edit@x.com'); assert.throws(() => s.inviteMember('edit@x.com'), code('duplicate'));
  const k = s.createApiKey('n8n'); assert.match(k.token, /^cf_live_/); s.revokeApiKey(k.id);
  assert.equal(s.workspace().apiKeys.length, 0);
  s.createProject({ file: 'v.mp4', durationMin: 6 });
  assert.equal(s.bulkDownload().count, s.workspace().clips.length);
  assert.ok(s.cancelSubscription() > 0);
  assert.ok(s.balanceHistory().length >= 2);
});

test('persistência: snapshot restaura o estado', () => {
  const s = fresh('starter');
  s.createProject({ file: 'v.mp4', durationMin: 6 });
  const s2 = Core.createStore(s.snapshot());
  assert.equal(s2.workspace().clips.length, s.workspace().clips.length);
  assert.equal(s2.balance().credits, s.balance().credits);
});
