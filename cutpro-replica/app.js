/* ClipForge Studio: SPA com rotas por hash sobre o Core. */
(function () {
  'use strict';
  const KEY = 'clipforge-state-v1';
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) {}
  let S = Core.createStore(saved);
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S.snapshot())); } catch (_) {} };
  S.subscribe(persist);
  const mediaUrls = {}; // projectId -> objectURL do arquivo enviado nesta sessão

  const $ = (sel, el) => (el || document).querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n);
  const fmtDate = t => new Date(t).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  function toast(msg, bad) { const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3500); }
  function act(fn, okMsg) { try { const r = fn(); if (okMsg) toast(okMsg); render(); return r; } catch (e) { toast(e.message, true); render(); } }
  // Diálogos na própria página (o sandbox do artifact bloqueia confirm/prompt e downloads).
  function modal(inner, onReady) {
    const ov = document.createElement('div'); ov.className = 'modal-ov';
    ov.innerHTML = `<div class="modal card" role="dialog" aria-modal="true">${inner}</div>`;
    document.body.appendChild(ov); const close = () => ov.remove();
    ov.addEventListener('keydown', e => { if (e.key === 'Escape') ov.querySelector('[data-no]') && ov.querySelector('[data-no]').click(); });
    onReady(ov, close); const f = ov.querySelector('input, textarea, button.primary'); if (f) f.focus();
  }
  const sure = msg => new Promise(res => modal(`<p style="margin-top:0">${esc(msg)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-no>Voltar</button><button class="btn primary" data-yes>Confirmar</button></div>`,
    (ov, close) => { ov.querySelector('[data-no]').onclick = () => { close(); res(false); }; ov.querySelector('[data-yes]').onclick = () => { close(); res(true); }; }));
  const ask = (msg, def) => new Promise(res => modal(`<form><label for="askIn">${esc(msg)}</label><input type="text" id="askIn" value="${esc(def || '')}"><div class="row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn" data-no>Cancelar</button><button class="btn primary">OK</button></div></form>`,
    (ov, close) => { ov.querySelector('[data-no]').onclick = () => { close(); res(null); }; ov.querySelector('form').onsubmit = e => { e.preventDefault(); const v = ov.querySelector('#askIn').value.trim(); close(); res(v || null); }; }));
  function download(name, text) {
    modal(`<div class="row" style="justify-content:space-between"><b>${esc(name)}</b><span class="faint" style="font-size:12px">${text.length.toLocaleString('pt-BR')} caracteres</span></div>
      <textarea id="dlText" rows="14" readonly style="margin-top:10px;font-family:ui-monospace,monospace;font-size:12px">${esc(text)}</textarea>
      <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" data-no>Fechar</button><button class="btn primary" data-copy>Copiar</button></div>`,
      (ov, close) => { ov.querySelector('[data-no]').onclick = close; const ta = ov.querySelector('#dlText');
        ov.querySelector('[data-copy]').onclick = () => { const done = () => toast('Copiado'); try { navigator.clipboard.writeText(text).then(done, () => { ta.select(); toast('Selecionado: use Ctrl+C'); }); } catch (_) { ta.select(); toast('Selecionado: use Ctrl+C'); } }; });
  }
  const gradient = id => { const h = Core.hash(id); return `linear-gradient(160deg, hsl(${h % 360} 55% 55%), hsl(${(h >> 8) % 360} 50% 28%))`; };
  const NET_LABEL = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', x: 'X', linkedin: 'LinkedIn', bluesky: 'Bluesky', pinterest: 'Pinterest', telegram: 'Telegram', mastodon: 'Mastodon', discord: 'Discord', dailymotion: 'Dailymotion', tumblr: 'Tumblr', slack: 'Slack' };

  const NAV = [
    ['Criar', [['home', 'Início'], ['new', 'Novo projeto'], ['live', 'Lives'], ['tools', 'Ferramentas']]],
    ['Conteúdo', [['projects', 'Projetos'], ['clips', 'Clipes'], ['templates', 'Templates'], ['personas', 'Personas IA']]],
    ['Distribuir', [['publish', 'Publicação'], ['connections', 'Contas'], ['automations', 'Automações'], ['metrics', 'Métricas']]],
    ['Conta', [['billing', 'Plano e créditos'], ['settings', 'Workspace e API'], ['selftest', 'Autoteste']]],
  ];

  function route() {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [path, qs] = h.split('?');
    const [name, arg] = path.split('/');
    return { name, arg, q: new URLSearchParams(qs || '') };
  }

  function render() {
    const r = route();
    const authed = S.isAuthed();
    if (!authed && !['login', 'register'].includes(r.name)) { location.hash = S.state.user ? '#/login' : '#/register'; return; }
    if (authed && ['login', 'register'].includes(r.name)) { location.hash = '#/home'; return; }
    document.body.classList.toggle('noauth', !authed);
    $('#side').style.display = authed ? '' : 'none';
    if (authed) renderSide(r.name);
    const view = VIEWS[r.name] || VIEWS.notfound;
    $('#view').innerHTML = view.html(r);
    if (view.bind) view.bind(r);
  }

  function renderSide(cur) {
    const w = S.workspace();
    $('#side').innerHTML = `
      <a class="logo" href="index.html"><span class="logo-mark"></span>ClipForge</a>
      <select id="wsSel" style="margin-bottom:6px">${S.state.workspaces.map(x => `<option value="${x.id}" ${x.id === w.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}<option value="__new">+ Novo workspace</option></select>
      <div class="row" style="justify-content:space-between;padding:6px 10px"><span class="credits">${w.credits} créditos</span><span class="pill">${S.plan().name}</span></div>
      <nav>${NAV.map(([g, items]) => `<div class="group">${g}</div>` + items.map(([id, label]) => `<a href="#/${id}" class="${cur === id || (cur === 'editor' && id === 'clips') ? 'on' : ''}">${label}</a>`).join('')).join('')}</nav>
      <div style="padding:14px 10px"><button class="btn sm" id="logout">Sair</button></div>`;
    $('#wsSel').onchange = e => {
      if (e.target.value === '__new') ask('Nome do workspace (ex.: nome do cliente)').then(n => { if (n) act(() => S.createWorkspace(n), 'Workspace criado'); else render(); });
      else act(() => S.switchWorkspace(e.target.value));
    };
    $('#logout').onclick = () => { S.logout(); location.hash = '#/login'; };
  }

  function topbar(title, extra) { return `<div class="topbar"><h1>${title}</h1><div class="row">${extra || ''}</div></div>`; }
  function clipCard(c) {
    const tpl = S.workspace().templates.find(t => t.id === c.templateId) || {};
    return `<div class="clip"><a href="#/editor/${c.id}" style="text-decoration:none"><div class="thumb" style="background:${gradient(c.id)}"><span class="score">${c.score}</span><span style="color:${tpl.highlight || '#fff'}">${esc(c.captions[0] ? c.captions[0].text.toUpperCase() : '')}</span></div></a>
      <div class="meta"><b>${esc(c.title)}</b><span class="faint">${Core.fmtTime(c.start)} · ${Math.round(c.end - c.start)}s · ${c.aspect}</span>
      <div class="row"><a class="btn sm" href="#/editor/${c.id}">Editar</a><button class="btn sm" data-pub="${c.id}">Publicar</button></div></div></div>`;
  }

  const VIEWS = {
    notfound: { html: () => `<div class="empty">Página não encontrada. <a href="#/home">Voltar</a></div>` },

    register: {
      html: () => `<div class="auth card"><a class="logo" href="index.html"><span class="logo-mark"></span>ClipForge</a><h2>Criar conta</h2>
        <form id="f" class="grid"><div><label>Nome</label><input type="text" name="name"></div><div><label>E-mail</label><input type="email" name="email" required></div>
        <div><label>Senha (8+ caracteres)</label><input type="password" name="password" required></div><button class="btn primary">Criar conta grátis</button></form>
        <p class="faint" style="font-size:13px">Já tem conta? <a href="#/login">Entrar</a>. Os dados ficam só neste navegador.</p></div>`,
      bind: () => { $('#f').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); (S.state.user ? sure('Já existe uma conta neste navegador. Substituir?') : Promise.resolve(true)).then(go => { if (!go) return; const prev = S; S = Core.createStore(null); S.subscribe(persist); try { S.register(d); toast('Conta criada: 15 créditos grátis'); persist(); location.hash = '#/home'; } catch (err) { S = prev; toast(err.message, true); } }); }; },
    },
    login: {
      html: () => `<div class="auth card"><a class="logo" href="index.html"><span class="logo-mark"></span>ClipForge</a><h2>Entrar</h2>
        <form id="f" class="grid"><div><label>E-mail</label><input type="email" name="email" required value="${esc(S.state.user ? S.state.user.email : '')}"></div>
        <div><label>Senha</label><input type="password" name="password" required></div><button class="btn primary">Entrar</button></form>
        <p class="faint" style="font-size:13px">Sem conta? <a href="#/register">Cadastre-se</a></p></div>`,
      bind: () => { $('#f').onsubmit = e => { e.preventDefault(); act(() => S.login(Object.fromEntries(new FormData(e.target)))); location.hash = '#/home'; }; },
    },

    home: {
      html: () => {
        const w = S.workspace(); const m = S.metrics(30);
        return topbar(`Olá, ${esc(S.state.user.name)}`, `<a class="btn primary" href="#/new">Novo projeto</a>`) + `
        <div class="grid cols-4">
          <div class="card"><div class="faint">Créditos</div><div class="stat">${w.credits}</div><div class="faint" style="font-size:12px">vencem em ${new Date(w.creditsExpireAt).toLocaleDateString('pt-BR')}</div></div>
          <div class="card"><div class="faint">Projetos</div><div class="stat">${w.projects.length}</div></div>
          <div class="card"><div class="faint">Clipes</div><div class="stat">${w.clips.length}</div></div>
          <div class="card"><div class="faint">Views 30d</div><div class="stat">${fmtN(m.views)}</div></div>
        </div>
        <h3 style="margin-top:28px">Melhores clipes</h3>
        ${w.clips.length ? `<div class="clip-grid">${S.listClips().slice(0, 6).map(clipCard).join('')}</div>` : `<div class="empty">Nenhum clipe ainda. <a href="#/new">Cole o primeiro link</a>.</div>`}`;
      },
      bind: bindPublishButtons,
    },

    new: {
      html: r => `${topbar('Novo projeto')}
        <div class="grid cols-2"><div class="card grid">
          <div class="tabs"><button class="on" data-t="link">Link</button><button data-t="file">Arquivo</button></div>
          <div id="srcLink"><label>Link do vídeo (YouTube, Twitch VOD, Kick, Instagram, TikTok, Vimeo)</label><input type="url" id="url" placeholder="https://www.youtube.com/watch?v=..." value="${esc(r.q.get('url') || '')}"></div>
          <div id="srcFile" style="display:none"><div class="drop" id="drop">Arraste um vídeo ou clique para escolher<input type="file" id="file" accept="video/*,audio/*" hidden></div><div id="fileInfo" class="faint" style="margin-top:6px"></div></div>
          <div class="grid cols-2"><div><label>Estratégia de corte</label><select id="strategy"><option value="viral">Viral (picos de energia)</option><option value="educational">Educacional (ideias completas)</option><option value="humor">Humor</option><option value="highlights">Melhores momentos</option></select></div>
          <div><label>Idioma da fala</label><select id="lang">${Core.LANGUAGES.map(l => `<option>${l}</option>`).join('')}</select></div></div>
          <div class="grid cols-2"><div><label>Analisar a partir de (min)</label><input type="number" id="from" min="0" value="0"></div><div><label>Até (min, vazio = fim)</label><input type="number" id="to" min="1"></div></div>
          <div id="quote" class="pill" style="justify-self:start">Cole um link para ver o custo</div>
          <button class="btn primary lg" id="go">Gerar clipes</button>
        </div>
        <div class="card"><h3>Como o custo é calculado</h3><p class="muted">1 crédito por minuto analisado, não importa quantos clipes saiam. Restrinja o trecho para gastar menos. Links de canal da Twitch/Kick (ao vivo) vão para <a href="#/live">Lives</a>.</p>
        <p class="muted">Seu plano aceita vídeos de até ${S.plan().maxVideoMin / 60}h.</p></div></div>`,
      bind: () => {
        let file = null, fileUrl = null;
        const input = () => file ? { file: file.name, durationMin: file.durationMin } : $('#url').value;
        const range = () => { const f = +$('#from').value || 0, t = +$('#to').value; return (f || t) ? { fromMin: f, toMin: t || Infinity } : undefined; };
        const quote = () => { try { const q = S.quoteClipping(input(), range()); $('#quote').className = 'pill ' + (q.source.live ? 'warn' : 'ok'); $('#quote').textContent = q.source.live ? `Canal ao vivo (${q.source.kind}): use Lives` : `${q.source.kind} · ${q.durationMin} min · custo ${q.credits} créditos`; } catch (e) { $('#quote').className = 'pill bad'; $('#quote').textContent = e.message; } };
        document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { document.querySelectorAll('.tabs button').forEach(x => x.classList.toggle('on', x === b)); $('#srcLink').style.display = b.dataset.t === 'link' ? '' : 'none'; $('#srcFile').style.display = b.dataset.t === 'file' ? '' : 'none'; if (b.dataset.t === 'link') file = null; });
        ['url', 'from', 'to'].forEach(id => $('#' + id).oninput = quote);
        const pick = f => {
          if (!f) return; fileUrl = URL.createObjectURL(f);
          const v = document.createElement('video'); v.preload = 'metadata'; v.src = fileUrl;
          v.onloadedmetadata = () => { file = { name: f.name, durationMin: Math.max(1, Math.ceil(v.duration / 60)) }; $('#fileInfo').textContent = `${f.name} · ${Core.fmtTime(v.duration)}`; quote(); };
          v.onerror = () => { file = { name: f.name, durationMin: Math.max(1, Math.round(f.size / 8e6)) }; $('#fileInfo').textContent = `${f.name} · duração estimada pelo tamanho`; quote(); };
        };
        const drop = $('#drop');
        drop.onclick = () => $('#file').click(); $('#file').onchange = e => pick(e.target.files[0]);
        drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); }; drop.ondragleave = () => drop.classList.remove('over');
        drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); pick(e.dataTransfer.files[0]); };
        quote();
        $('#go').onclick = () => {
          const res = act(() => S.createProject(input(), { strategy: $('#strategy').value, language: $('#lang').value, range: range() }));
          if (res) { if (fileUrl) mediaUrls[res.project.id] = fileUrl; toast(`${res.clips.length} clipes gerados (${res.project.credits} créditos)`); location.hash = '#/clips?project=' + res.project.id; }
        };
      },
    },

    projects: {
      html: () => { const w = S.workspace(); return topbar('Projetos', `<a class="btn primary" href="#/new">Novo</a>`) + (w.projects.length ? `<div class="card"><table><tr><th>Fonte</th><th>Duração</th><th>Estratégia</th><th>Créditos</th><th>Clipes</th><th>Criado</th><th></th></tr>
        ${w.projects.map(p => `<tr><td><span class="pill">${p.source.kind}</span> ${esc(p.source.name.slice(0, 48))}</td><td>${p.durationMin} min</td><td>${p.strategy}</td><td>${p.credits}</td><td><a href="#/clips?project=${p.id}">${p.clipIds.length}</a></td><td>${fmtDate(p.createdAt)}</td><td><button class="btn sm danger" data-del="${p.id}">Excluir</button></td></tr>`).join('')}</table></div>` : `<div class="empty">Sem projetos.</div>`); },
      bind: () => document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => sure('Excluir o projeto e todos os clipes dele?').then(ok => ok && act(() => S.deleteProject(b.dataset.del), 'Projeto excluído'))),
    },

    clips: {
      html: r => {
        const pid = r.q.get('project'); const min = +r.q.get('min') || 0; const sort = r.q.get('sort') || 'score';
        const cs = S.listClips({ projectId: pid, minScore: min, sort });
        return topbar('Clipes' + (pid ? ' do projeto' : ''), `
          <select id="sort" style="width:auto"><option value="score" ${sort === 'score' ? 'selected' : ''}>Maior nota</option><option value="recent" ${sort === 'recent' ? 'selected' : ''}>Mais recentes</option></select>
          <select id="min" style="width:auto">${[0, 50, 70, 85].map(v => `<option value="${v}" ${v === min ? 'selected' : ''}>Nota ≥ ${v}</option>`).join('')}</select>
          <button class="btn" id="bulk">Baixar todos (${cs.length})</button>`) +
          (cs.length ? `<div class="clip-grid">${cs.map(clipCard).join('')}</div>` : `<div class="empty">Nenhum clipe com esse filtro.</div>`);
      },
      bind: r => {
        const upd = () => { const q = new URLSearchParams(r.q); q.set('sort', $('#sort').value); q.set('min', $('#min').value); location.hash = '#/clips?' + q; };
        $('#sort').onchange = upd; $('#min').onchange = upd;
        $('#bulk').onclick = () => { const b = act(() => S.bulkDownload(S.listClips({ projectId: r.q.get('project') }).map(c => c.id))); if (b) download('Download em massa (simulado): ' + b.count + ' arquivos', b.files.join('\n')); };
        bindPublishButtons();
      },
    },

    editor: {
      html: r => {
        let c; try { c = S.getClip(r.arg); } catch (e) { return `<div class="empty">${e.message}</div>`; }
        const w = S.workspace(); const tpl = w.templates.find(t => t.id === c.templateId) || w.templates[0];
        const len = c.end - c.start; const proj = w.projects.find(p => p.id === c.projectId);
        const media = proj && mediaUrls[proj.id];
        return topbar(`<a href="#/clips" style="text-decoration:none" class="faint">Clipes /</a> ${esc(c.title)}`, `<span class="pill">nota ${c.score}</span><button class="btn" id="titles">Sugerir títulos</button><button class="btn primary" data-pub="${c.id}">Publicar</button>`) + `
        <div class="editor">
          <div>
            <div class="stage r${c.aspect.replace(':', 'x')}" id="stage">${media ? `<video id="vid" src="${media}#t=${c.start},${c.end}" muted playsinline></video>` : `<div class="bg" style="background:${gradient(c.id)}"></div>`}
              <div class="cap ${tpl.position === 'center' ? 'center' : tpl.position === 'bottom' ? 'bottom' : ''}" id="cap" style="color:${tpl.highlight}"></div>${c.watermark && S.plan().watermark ? '<div class="wm">ClipForge</div>' : ''}</div>
            <div class="row" style="margin-top:10px"><button class="btn sm" id="play">▶ Reproduzir</button><span class="faint" id="clock">0.0s / ${len.toFixed(1)}s</span></div>
          </div>
          <div class="grid">
            <div class="card grid"><h3 style="margin:0">Corte e formato</h3>
              <div class="grid cols-4"><div><label>Início (s)</label><input type="number" id="st" value="${c.start}"></div><div><label>Fim (s)</label><input type="number" id="en" value="${c.end}"></div>
              <div><label>Proporção</label><select id="asp">${Core.ASPECTS.map(a => `<option ${a === c.aspect ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
              <div><label>Velocidade</label><select id="spd">${[0.5, 0.75, 1, 1.25, 1.5, 2].map(v => `<option ${v === c.speed ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
              <label class="row" style="color:var(--text)"><input type="checkbox" id="face" ${c.faceTracking ? 'checked' : ''}> Rastreio de rosto (seguir quem fala)</label>
              <div class="row"><button class="btn primary sm" id="saveCut">Aplicar</button><button class="btn sm" id="silence">Remover silêncios</button></div></div>
            <div class="card grid"><h3 style="margin:0">Legendas</h3>
              <div class="timeline" id="tl">${c.captions.map((q, i) => `<div class="cue" style="left:${q.start / len * 100}%;width:${(q.end - q.start) / len * 100}%" title="${esc(q.text)}" data-i="${i}">${esc(q.text)}</div>`).join('')}</div>
              <div class="row"><label style="margin:0">Template</label><select id="tpl" style="width:auto">${w.templates.map(t => `<option value="${t.id}" ${t.id === c.templateId ? 'selected' : ''}>${esc(t.name)}${t.community ? '' : ' (meu)'}</option>`).join('')}</select>
                <label style="margin:0">Traduzir</label><select id="tr" style="width:auto"><option value="">—</option>${Core.LANGUAGES.map(l => `<option>${l}</option>`).join('')}</select>
                <button class="btn sm" id="shiftM">−0,5s</button><button class="btn sm" id="shiftP">+0,5s</button></div>
              <div style="max-height:220px;overflow:auto"><table>${c.captions.map((q, i) => `<tr><td class="faint" style="width:110px">${q.start.toFixed(1)}–${q.end.toFixed(1)}s</td><td><input type="text" data-cap="${i}" value="${esc(q.text)}"></td></tr>`).join('')}</table></div>
              <div class="row"><button class="btn sm" id="srt">Baixar .srt</button><button class="btn sm" id="vtt">Baixar .vtt</button></div></div>
            <div class="card grid"><h3 style="margin:0">Exportar</h3>
              <div class="row"><select id="res" style="width:auto"><option value="720p">720p</option><option value="1080p" selected>1080p</option><option value="4k">4K ${S.plan().export4k ? '' : '(Pro)'}</option></select><button class="btn primary sm" id="render">Renderizar</button>
              ${c.rendered ? `<span class="pill ok">Renderizado ${c.rendered.resolution}${c.rendered.watermark ? ' · com marca d’água' : ''}</span>` : '<span class="pill">Não renderizado</span>'}</div>
              ${c.hashtags.length ? `<div class="faint">Hashtags: ${c.hashtags.join(' ')}</div>` : ''}
              <div class="row"><button class="btn sm danger" id="delClip">Excluir clipe</button></div></div>
          </div>
        </div>`;
      },
      bind: r => {
        let c; try { c = S.getClip(r.arg); } catch (_) { return; }
        const id = c.id; const len = c.end - c.start;
        let t = 0, timer = null;
        const draw = () => { const q = c.captions.find(q => t >= q.start && t < q.end); $('#cap').textContent = q ? q.text.toUpperCase() : ''; $('#clock').textContent = `${t.toFixed(1)}s / ${len.toFixed(1)}s`; };
        draw();
        $('#play').onclick = () => {
          const vid = $('#vid');
          if (timer) { clearInterval(timer); timer = null; if (vid) vid.pause(); $('#play').textContent = '▶ Reproduzir'; return; }
          if (vid) { vid.currentTime = c.start + t; vid.playbackRate = c.speed; vid.play().catch(() => {}); }
          $('#play').textContent = '❚❚ Pausar';
          timer = setInterval(() => { t += 0.1 * c.speed; if (t >= len) t = 0; draw(); if (!document.body.contains($('#play'))) clearInterval(timer); }, 100);
        };
        $('#saveCut').onclick = () => act(() => S.updateClip(id, { start: +$('#st').value, end: +$('#en').value, aspect: $('#asp').value, speed: +$('#spd').value, faceTracking: $('#face').checked }), 'Clipe atualizado');
        $('#silence').onclick = () => { const res = act(() => S.removeSilences(id)); if (res) toast(`${res.removedSec}s de silêncio removidos`); };
        $('#tpl').onchange = e => act(() => S.applyTemplate(id, e.target.value), 'Template aplicado');
        $('#tr').onchange = e => e.target.value && act(() => S.translateCaptions(id, e.target.value), 'Legendas traduzidas (timing mantido)');
        $('#shiftM').onclick = () => act(() => S.shiftCaptions(id, -0.5)); $('#shiftP').onclick = () => act(() => S.shiftCaptions(id, 0.5));
        document.querySelectorAll('[data-cap]').forEach(i => i.onchange = () => act(() => S.editCaption(id, +i.dataset.cap, i.value)));
        $('#srt').onclick = () => download(`${id}.srt`, S.toSRT(S.getClip(id).captions));
        $('#vtt').onclick = () => download(`${id}.vtt`, S.toVTT(S.getClip(id).captions));
        $('#render').onclick = () => act(() => S.render(id, { resolution: $('#res').value }), 'Renderização concluída');
        $('#titles').onclick = () => { const res = act(() => S.suggestTitles(id)); if (!res) return;
          modal(`<b>Títulos sugeridos</b><div class="grid" style="margin-top:10px;gap:8px">${res.titles.map(x => `<button class="btn" data-t="${esc(x)}" style="white-space:normal;text-align:left">${esc(x)}</button>`).join('')}</div><p class="faint" style="font-size:13px">Hashtags: ${esc(res.hashtags.join(' '))}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-no>Fechar</button></div>`,
            (ov, close) => { ov.querySelector('[data-no]').onclick = close; ov.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { close(); act(() => S.updateClip(id, { title: b.dataset.t }), 'Título atualizado'); }); }); };
        $('#delClip').onclick = () => sure('Excluir este clipe?').then(ok => { if (ok) { act(() => S.deleteClip(id), 'Clipe excluído'); location.hash = '#/clips'; } });
        bindPublishButtons();
      },
    },

    templates: {
      html: () => { const w = S.workspace(); return topbar('Templates') + `<div class="grid cols-2"><div class="card"><table><tr><th>Nome</th><th>Fonte</th><th>Destaque</th><th>Posição</th><th>Origem</th></tr>
        ${w.templates.map(t => `<tr><td>${esc(t.name)}</td><td>${esc(t.font)}</td><td><span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:${esc(t.highlight)};vertical-align:middle"></span> ${esc(t.highlight)}</td><td>${t.position}</td><td>${t.community ? 'Comunidade' : 'Meu'}</td></tr>`).join('')}</table></div>
        <form class="card grid" id="f"><h3 style="margin:0">Salvar meu template</h3><div><label>Nome</label><input type="text" name="name" required></div><div><label>Fonte</label><input type="text" name="font" value="Poppins 700"></div>
        <div><label>Cor de destaque</label><input type="color" name="highlight" value="#ffd400"></div><div><label>Posição</label><select name="position"><option value="lower-center">Centro inferior</option><option value="center">Centro</option><option value="bottom">Rodapé</option></select></div><button class="btn primary">Salvar</button></form></div>`; },
      bind: () => { $('#f').onsubmit = e => { e.preventDefault(); act(() => S.saveTemplate(Object.fromEntries(new FormData(e.target))), 'Template salvo'); }; },
    },

    live: {
      html: () => { const w = S.workspace(); return topbar('Clipes ao vivo') + `
        ${S.plan().liveClips ? '' : `<div class="card" style="margin-bottom:16px;border-color:var(--warn)">Clipes ao vivo exigem o plano Plus ou Pro. <a href="#/billing">Ver planos</a></div>`}
        <form class="card row" id="f"><input type="url" id="url" placeholder="https://twitch.tv/canal ou https://kick.com/canal" style="flex:1;min-width:240px" required><button class="btn primary">Adicionar canal</button></form>
        <p class="faint">Cada lote cobre ${Core.LIVE_BATCH_MIN} minutos de transmissão e custa ${Core.LIVE_BATCH_MIN} créditos. Use "Simular lote" para avançar 10 min de live.</p>
        ${w.monitors.length ? `<div class="card"><table><tr><th>Canal</th><th>Status</th><th>Lotes</th><th>Clipes</th><th></th></tr>${w.monitors.map(m => `<tr><td><span class="pill">${m.source.kind}</span> ${esc(m.source.channel)}</td>
          <td>${m.status === 'live' ? '<span class="pill live">● monitorando</span>' : '<span class="pill">parado</span>'}</td><td>${m.batches}</td><td>${m.clips}</td>
          <td class="row">${m.status === 'live' ? `<button class="btn sm" data-tick="${m.id}">Simular lote</button><button class="btn sm" data-stop="${m.id}">Parar</button>` : `<button class="btn sm primary" data-start="${m.id}">Iniciar</button>`}<button class="btn sm danger" data-del="${m.id}">Remover</button></td></tr>`).join('')}</table></div>` : `<div class="empty">Nenhum canal monitorado.</div>`}`; },
      bind: () => {
        $('#f').onsubmit = e => { e.preventDefault(); act(() => S.createMonitor($('#url').value), 'Canal adicionado'); };
        document.querySelectorAll('[data-start]').forEach(b => b.onclick = () => act(() => S.startMonitor(b.dataset.start), 'Monitoramento iniciado'));
        document.querySelectorAll('[data-stop]').forEach(b => b.onclick = () => act(() => S.stopMonitor(b.dataset.stop)));
        document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => act(() => S.deleteMonitor(b.dataset.del)));
        document.querySelectorAll('[data-tick]').forEach(b => b.onclick = () => { const cs = act(() => S.tickMonitor(b.dataset.tick)); if (cs) toast(`Lote processado: ${cs.length} clipes`); });
      },
    },

    tools: {
      html: () => { const w = S.workspace(); const T = [
        ['highlights', 'Destaques', 'Encontra os picos do vídeo.', ['durationMin']], ['transcribe', 'Transcrição', 'Fala vira texto editável.', ['name', 'durationMin', 'language']],
        ['translate', 'Traduzir legendas', 'Mantém o timing de cada linha.', ['durationMin', 'language']], ['remove-silence', 'Remover silêncios', 'Corta pausas longas.', ['durationMin']],
        ['reframe', 'Reenquadrar', 'Deixa vertical seguindo quem fala.', ['aspect', 'durationMin']], ['resize', 'Redimensionar', '9:16, 1:1, 4:5 ou 16:9.', ['aspect']],
        ['compress', 'Comprimir', 'Arquivo menor.', ['name']], ['to-mp4', 'Converter para MP4', 'Qualquer vídeo em MP4.', ['name']], ['to-mp3', 'Extrair MP3', 'Só o áudio.', ['name']],
        ['download', 'Baixar de plataforma', 'Twitch, Kick, Instagram, YouTube…', ['url']], ['titles', 'Títulos e hashtags', 'Sugestões a partir do conteúdo.', ['name']]];
        const field = f => ({ durationMin: `<input type="number" name="durationMin" value="5" min="1" placeholder="min">`, name: `<input type="text" name="name" value="video.mp4">`, language: `<select name="language">${Core.LANGUAGES.map(l => `<option>${l}</option>`).join('')}</select>`, aspect: `<select name="aspect">${Core.ASPECTS.map(a => `<option>${a}</option>`).join('')}</select>`, url: `<input type="url" name="url" placeholder="https://...">` }[f]);
        return topbar('Ferramentas') + `<div class="grid cols-3">${T.map(([id, name, d, fs]) => `<form class="card grid" data-tool="${id}"><h3 style="margin:0">${name}</h3><span class="muted" style="font-size:14px">${d}</span>${fs.map(field).join('')}<button class="btn sm primary">Executar</button></form>`).join('')}</div>
        <h3 style="margin-top:28px">Histórico</h3>${w.jobs.length ? `<div class="card"><table><tr><th>Ferramenta</th><th>Custo</th><th>Resultado</th><th>Quando</th></tr>${w.jobs.slice(0, 20).map(j => `<tr><td>${j.tool}</td><td>${j.cost}</td><td><code style="font-size:12px">${esc(JSON.stringify(j.output))}</code></td><td>${fmtDate(j.at)}</td></tr>`).join('')}</table></div>` : '<div class="empty">Nada executado ainda.</div>'}`; },
      bind: () => document.querySelectorAll('[data-tool]').forEach(f => f.onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(f)); if (d.durationMin) d.durationMin = +d.durationMin; act(() => S.runTool(f.dataset.tool, d), 'Ferramenta executada'); }),
    },

    connections: {
      html: () => { const w = S.workspace(); return topbar('Contas conectadas', `<span class="faint">Limite: ${S.plan().accountsPerNetwork} por rede</span>`) + `<div class="grid cols-4">${Core.NETWORKS.map(n => { const cs = w.connections.filter(c => c.network === n); return `<div class="card grid"><b>${NET_LABEL[n]}</b>
        ${cs.map(c => `<div class="row" style="justify-content:space-between"><span>${esc(c.handle)}</span><button class="btn sm danger" data-dis="${c.id}">×</button></div>`).join('') || '<span class="faint">Nenhuma conta</span>'}
        <button class="btn sm" data-con="${n}">Conectar</button></div>`; }).join('')}</div><p class="faint">Conexão simulada: nenhum OAuth real é feito.</p>`; },
      bind: () => {
        document.querySelectorAll('[data-con]').forEach(b => b.onclick = () => ask(`Conta do ${NET_LABEL[b.dataset.con]} (@usuario)`, '@meucanal').then(h => { if (h) act(() => S.connect(b.dataset.con, h), 'Conta conectada'); }));
        document.querySelectorAll('[data-dis]').forEach(b => b.onclick = () => act(() => S.disconnect(b.dataset.dis), 'Conta desconectada'));
      },
    },

    publish: {
      html: r => { const w = S.workspace(); const clipId = r.q.get('clip'); const clip = clipId ? w.clips.find(c => c.id === clipId) : null;
        const label = id => { const c = w.connections.find(x => x.id === id); return c ? `${NET_LABEL[c.network]} ${esc(c.handle)}` : 'removida'; };
        return topbar('Publicação', `<label class="row" style="margin:0;color:var(--text)"><input type="checkbox" id="auto" ${w.autoPost ? 'checked' : ''}> Auto-post de clipes novos</label>`) + `
        ${clip ? `<form class="card grid" id="f" style="margin-bottom:20px"><h3 style="margin:0">Agendar: ${esc(clip.title)}</h3>
          ${w.connections.length ? `<div class="row">${w.connections.map(c => `<label class="row" style="margin:0;color:var(--text)"><input type="checkbox" name="con" value="${c.id}" checked> ${NET_LABEL[c.network]} ${esc(c.handle)}</label>`).join('')}</div>` : `<div class="faint">Nenhuma conta. <a href="#/connections">Conecte uma</a>.</div>`}
          <div class="grid cols-2"><div><label>Legenda do post</label><input type="text" name="caption" value="${esc(clip.title)} ${clip.hashtags.join(' ')}"></div>
          <div><label>Quando (vazio = horário recomendado: ${S.recommendedHour()}h)</label><input type="datetime-local" name="when"></div></div>
          <div class="row"><button class="btn primary">Agendar</button><button class="btn" type="button" id="now">Publicar agora</button></div></form>` : ''}
        <div class="card"><h3 style="margin-top:0">Fila</h3>${w.posts.length ? `<table><tr><th>Clipe</th><th>Contas</th><th>Quando</th><th>Status</th><th>Views</th><th></th></tr>
          ${w.posts.slice().sort((a, b) => a.scheduledAt - b.scheduledAt).map(p => { const c = w.clips.find(x => x.id === p.clipId); return `<tr><td>${esc(c ? c.title : p.caption)}</td><td style="font-size:12px">${p.connectionIds.map(label).join('<br>')}</td><td>${fmtDate(p.scheduledAt)}</td>
          <td><span class="pill ${p.status === 'published' ? 'ok' : p.status === 'cancelled' ? 'bad' : 'warn'}">${{ scheduled: 'agendado', published: 'publicado', cancelled: 'cancelado' }[p.status]}</span></td><td>${p.metrics ? fmtN(p.metrics.views) : '—'}</td>
          <td class="row">${p.status === 'scheduled' ? `<button class="btn sm" data-pubnow="${p.id}">Publicar agora</button><button class="btn sm danger" data-cancel="${p.id}">Cancelar</button>` : ''}</td></tr>`; }).join('')}</table>` : '<div class="faint">Fila vazia. Abra um clipe e clique em Publicar.</div>'}</div>`; },
      bind: r => {
        $('#auto').onchange = e => act(() => S.setAutoPost(e.target.checked), e.target.checked ? 'Auto-post ligado' : 'Auto-post desligado');
        const f = $('#f');
        const submit = now => { const d = new FormData(f); const ids = d.getAll('con'); const when = d.get('when') ? new Date(d.get('when')).getTime() : undefined;
          const p = act(() => S.schedulePost(r.q.get('clip'), ids, now ? Date.now() : when, d.get('caption')));
          if (p) { if (now) act(() => S.publishNow(p.id), 'Publicado'); else toast('Agendado para ' + fmtDate(p.scheduledAt)); location.hash = '#/publish'; } };
        if (f) { f.onsubmit = e => { e.preventDefault(); submit(false); }; $('#now').onclick = () => submit(true); }
        document.querySelectorAll('[data-pubnow]').forEach(b => b.onclick = () => act(() => S.publishNow(b.dataset.pubnow), 'Publicado'));
        document.querySelectorAll('[data-cancel]').forEach(b => b.onclick = () => act(() => S.cancelPost(b.dataset.cancel), 'Post cancelado'));
      },
    },

    metrics: {
      html: r => { const days = +r.q.get('d') || 30; const m = S.metrics(days); const w = S.workspace();
        const max = Math.max(1, ...m.heat.flat()); const days7 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const netMax = Math.max(1, ...Object.values(m.byNetwork));
        return topbar('Métricas', `<select id="d" style="width:auto">${[7, 30, 90].map(d => `<option value="${d}" ${d === days ? 'selected' : ''}>${d} dias</option>`).join('')}</select>`) + `
        <div class="grid cols-4"><div class="card"><div class="faint">Views</div><div class="stat">${fmtN(m.views)}</div></div><div class="card"><div class="faint">Engajamento</div><div class="stat">${m.engagement}%</div></div>
          <div class="card"><div class="faint">Posts publicados</div><div class="stat">${m.posts}</div></div><div class="card"><div class="faint">Melhor horário</div><div class="stat">${m.bestHour}h</div></div></div>
        <div class="grid cols-2" style="margin-top:16px"><div class="card"><h3 style="margin-top:0">Mapa de calor (dia × hora)</h3><div class="heatmap"><span></span>${Array.from({ length: 24 }, (_, h) => `<span class="faint" style="text-align:center">${h % 3 ? '' : h}</span>`).join('')}
          ${m.heat.map((row, d) => `<span class="faint">${days7[d]}</span>` + row.map(v => `<div style="background:var(--primary);opacity:${v ? 0.15 + 0.85 * v / max : 0.05}" title="${fmtN(v)} views"></div>`).join('')).join('')}</div></div>
          <div class="card"><h3 style="margin-top:0">Por rede</h3>${Object.entries(m.byNetwork).map(([n, v]) => `<div style="margin-bottom:8px"><div class="row" style="justify-content:space-between"><span>${NET_LABEL[n] || n}</span><span>${fmtN(v)}</span></div><div class="bar" style="width:${v / netMax * 100}%"></div></div>`).join('') || '<span class="faint">Sem dados.</span>'}</div></div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Ranking de clipes</h3>${m.ranking.length ? `<table><tr><th>#</th><th>Clipe</th><th>Views</th></tr>${m.ranking.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.title)}</td><td>${fmtN(x.views)}</td></tr>`).join('')}</table>` : '<span class="faint">Publique clipes para ver o ranking.</span>'}</div>
        <p class="faint">Métricas simuladas a partir dos posts publicados neste workspace (${w.name}).</p>`; },
      bind: () => { $('#d').onchange = e => location.hash = '#/metrics?d=' + e.target.value; },
    },

    personas: {
      html: () => { const w = S.workspace(); return topbar('Personas IA') + `<div class="grid cols-2">
        <form class="card grid" id="f"><h3 style="margin:0">Criar persona</h3>
          <div class="tabs">${[['preset', 'Pronta (grátis)'], ['photos', 'Minhas fotos'], ['sheet', 'Ficha'], ['scratch', 'Do zero']].map(([k, l], i) => `<button type="button" data-kind="${k}" class="${i ? '' : 'on'}">${l}</button>`).join('')}</div>
          <input type="hidden" name="kind" value="preset">
          <div data-k="preset"><label>Personagem</label><select name="presetId">${Core.PERSONA_PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
          <div data-k="photos" hidden><label>Até ${Core.MAX_PERSONA_PHOTOS} fotos</label><input type="file" name="photos" accept="image/*" multiple></div>
          <div data-k="sheet" hidden><label>Ficha do personagem</label><input type="file" name="sheet" accept="image/*"></div>
          <div data-k="scratch" hidden><label>Descrição</label><textarea name="description" rows="3" placeholder="ex.: apresentadora ruiva de óculos"></textarea></div>
          <div><label>Nome</label><input type="text" name="name"></div><button class="btn primary">Criar (${'grátis ou 5 créditos'})</button></form>
        <div class="card grid"><h3 style="margin:0">Trocar pessoa num clipe</h3>
          ${w.clips.length && w.personas.length ? `<div><label>Clipe</label><select id="sclip">${S.listClips().map(c => `<option value="${c.id}">${esc(c.title)} (${Math.round(c.end - c.start)}s)</option>`).join('')}</select></div>
          <div><label>Personas (até ${Core.MAX_PERSONAS_PER_VIDEO})</label><div class="row">${w.personas.map(p => `<label class="row" style="margin:0;color:var(--text)"><input type="checkbox" class="sp" value="${p.id}"> ${esc(p.name)}</label>`).join('')}</div></div>
          <div><label>Quem trocar</label><select id="target"><option>pessoa 1</option><option>pessoa 2</option><option>pessoa 3</option></select></div>
          <div id="sq" class="pill" style="justify-self:start">Escolha as personas</div>
          <label class="row" style="margin:0;color:var(--text)"><input type="checkbox" id="fail"> Simular falha (para testar o estorno)</label>
          <button class="btn primary" id="swap">Gerar vídeo</button>` : '<span class="faint">Crie uma persona e tenha pelo menos um clipe.</span>'}</div></div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Minhas personas</h3>${w.personas.length ? `<table><tr><th>Nome</th><th>Tipo</th><th>Versão</th><th>Custo</th><th></th></tr>${w.personas.map(p => `<tr><td>${esc(p.name)}</td><td>${p.kind}</td>
          <td><select data-ver="${p.id}" style="width:auto">${p.versions.map(v => `<option value="${v.v}" ${v.v === p.current ? 'selected' : ''}>v${v.v}</option>`).join('')}</select></td><td>${p.cost}</td>
          <td class="row"><button class="btn sm" data-regen="${p.id}">Regenerar (2)</button><button class="btn sm danger" data-del="${p.id}">Excluir</button></td></tr>`).join('')}</table>` : '<span class="faint">Nenhuma ainda.</span>'}</div>
        ${w.personaVideos.length ? `<div class="card" style="margin-top:16px"><h3 style="margin-top:0">Vídeos gerados</h3><table><tr><th>Clipe</th><th>Personas</th><th>Créditos</th><th>Status</th></tr>${w.personaVideos.slice().reverse().map(j => `<tr><td>${esc((w.clips.find(c => c.id === j.clipId) || {}).title || j.clipId)}</td><td>${j.personaIds.length}</td><td>${j.credits}</td><td><span class="pill ${j.status === 'done' ? 'ok' : 'bad'}">${j.status === 'done' ? 'pronto' : 'falhou · estornado'}</span></td></tr>`).join('')}</table></div>` : ''}`; },
      bind: () => {
        const f = $('#f');
        f.querySelectorAll('[data-kind]').forEach(b => b.onclick = () => { f.querySelectorAll('[data-kind]').forEach(x => x.classList.toggle('on', x === b)); f.kind.value = b.dataset.kind; f.querySelectorAll('[data-k]').forEach(d => d.hidden = d.dataset.k !== b.dataset.kind); });
        f.onsubmit = e => { e.preventDefault(); const k = f.kind.value;
          act(() => S.createPersona({ kind: k, name: f.name.value, presetId: f.presetId.value, photos: [...f.photos.files].map(x => x.name), sheet: f.sheet.files[0] && f.sheet.files[0].name, description: f.description.value }), 'Persona criada'); };
        document.querySelectorAll('[data-regen]').forEach(b => b.onclick = () => act(() => S.regeneratePersona(b.dataset.regen), 'Nova versão gerada'));
        document.querySelectorAll('[data-ver]').forEach(s => s.onchange = () => act(() => S.restorePersonaVersion(s.dataset.ver, +s.value), 'Versão restaurada'));
        document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => act(() => S.deletePersona(b.dataset.del)));
        if (!$('#swap')) return;
        const sel = () => [...document.querySelectorAll('.sp:checked')].map(x => x.value);
        const quote = () => { try { const c = S.getClip($('#sclip').value); const q = S.quoteSwap(c.end - c.start, sel()); $('#sq').className = 'pill ok'; $('#sq').textContent = `Preço: ${q.credits} créditos (${q.personas} persona${q.personas > 1 ? 's' : ''})`; } catch (e) { $('#sq').className = 'pill bad'; $('#sq').textContent = e.message; } };
        document.querySelectorAll('.sp').forEach(x => x.onchange = quote); $('#sclip').onchange = quote;
        $('#swap').onclick = () => { const j = act(() => S.swapPersona($('#sclip').value, sel(), { target: $('#target').value, simulateFailure: $('#fail').checked })); if (j) toast(j.status === 'done' ? 'Vídeo com persona pronto' : 'Falhou: créditos devolvidos', j.status !== 'done'); };
      },
    },

    automations: {
      html: () => { const w = S.workspace(); const L = { comment_to_dm: 'Comentário → DM', follow_gate: 'Pedir para seguir', collect_email: 'Coletar e-mail', cross_post: 'Replicar post', autopost_live: 'Auto-post de lives' };
        return topbar('Automações') + `<div class="grid cols-2"><form class="card grid" id="f"><h3 style="margin:0">Nova automação</h3>
          <div><label>Tipo</label><select name="type">${Object.entries(L).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
          <div class="grid cols-2"><div><label>Palavra-chave</label><input type="text" name="keyword" placeholder="LINK"></div><div><label>Link</label><input type="url" name="link" placeholder="https://..."></div></div>
          <div><label>Mensagem de abertura</label><input type="text" name="message" value="Oi! Toque no botão para receber o link."></div><button class="btn primary">Criar</button></form>
        <form class="card grid" id="sim"><h3 style="margin:0">Simular comentário</h3><div class="grid cols-2"><div><label>Usuário</label><input type="text" name="user" value="@fulano"></div><div><label>E-mail (opcional)</label><input type="email" name="email"></div></div>
          <div><label>Comentário</label><input type="text" name="text" value="quero o link!"></div><label class="row" style="margin:0;color:var(--text)"><input type="checkbox" name="follows"> Já segue o perfil</label><button class="btn">Enviar comentário</button><div id="simOut" class="faint"></div></form></div>
        <div class="card" style="margin-top:16px">${w.automations.length ? `<table><tr><th>Tipo</th><th>Gatilho</th><th>Execuções</th><th>Status</th><th></th></tr>${w.automations.map(a => `<tr><td>${L[a.type]}</td><td>${esc(a.keyword || '—')} ${a.link ? '→ ' + esc(a.link) : ''}</td><td>${a.runs}</td><td><span class="pill ${a.enabled ? 'ok' : ''}">${a.enabled ? 'ativa' : 'pausada'}</span></td>
          <td class="row"><button class="btn sm" data-tog="${a.id}">${a.enabled ? 'Pausar' : 'Ativar'}</button><button class="btn sm danger" data-del="${a.id}">Excluir</button></td></tr>`).join('')}</table>` : '<span class="faint">Nenhuma automação.</span>'}</div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Contatos coletados (${w.contacts.length})</h3>${w.contacts.map(c => `<div>${esc(c.user)} · ${esc(c.email)}</div>`).join('') || '<span class="faint">Nenhum.</span>'}</div>`; },
      bind: () => {
        $('#f').onsubmit = e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); act(() => S.createAutomation(d), 'Automação criada'); };
        $('#sim').onsubmit = e => { e.preventDefault(); const f = e.target; const out = act(() => S.simulateComment({ user: f.user.value, text: f.text.value, follows: f.follows.checked, email: f.email.value || undefined }));
          if (out) setTimeout(() => { $('#simOut').innerHTML = out.length ? out.map(o => `<div>→ DM para ${esc(o.to)}: “${esc(o.message)}” ${o.link ? `[${esc(o.button)}: ${esc(o.link)}]` : ''}</div>`).join('') : 'Nenhuma automação disparou.'; }); };
        document.querySelectorAll('[data-tog]').forEach(b => b.onclick = () => act(() => S.toggleAutomation(b.dataset.tog)));
        document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => act(() => S.deleteAutomation(b.dataset.del)));
      },
    },

    billing: {
      html: r => { const w = S.workspace(); const hl = r.q.get('plan');
        return topbar('Plano e créditos') + `<div class="grid cols-4">${Object.values(Core.PLANS).map(p => `<div class="card grid" style="${p.id === hl ? 'border:2px solid var(--primary)' : ''}"><b>${p.name}</b><div class="stat">US$ ${p.price.toFixed(2)}</div>
          <div class="faint" style="font-size:13px">${p.credits} créditos · ${p.accountsPerNetwork} conta/rede${p.liveClips ? ' · lives' : ''}${p.export4k ? ' · 4K' : ''}</div>
          ${w.plan === p.id ? '<span class="pill ok">plano atual</span>' : `<button class="btn ${p.id === hl ? 'primary' : ''}" data-plan="${p.id}">${p.price ? 'Assinar' : 'Mudar'}</button>`}</div>`).join('')}</div>
          <div class="row" style="margin:16px 0"><button class="btn danger" id="cancel">Cancelar assinatura</button>${w.cancelAt ? `<span class="faint">Acesso até ${new Date(w.cancelAt).toLocaleDateString('pt-BR')}</span>` : ''}</div>
          <div class="card"><h3 style="margin-top:0">Extrato de créditos</h3><table><tr><th>Quando</th><th>Movimento</th><th>Motivo</th><th>Saldo</th></tr>${S.balanceHistory().map(l => `<tr><td>${fmtDate(l.at)}</td><td class="${l.delta > 0 ? 'test-ok' : 'test-bad'}">${l.delta > 0 ? '+' : ''}${l.delta}</td><td>${esc(l.reason)}</td><td>${l.balance}</td></tr>`).join('')}</table></div>
          <p class="faint">Pagamento simulado: nenhuma cobrança real.</p>`; },
      bind: () => {
        document.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => act(() => S.subscribePlan(b.dataset.plan), 'Plano ativado'));
        $('#cancel').onclick = () => sure('Cancelar a assinatura? O acesso continua até o fim do período.').then(ok => ok && act(() => S.cancelSubscription(), 'Assinatura cancelada no fim do período'));
      },
    },

    settings: {
      html: () => { const w = S.workspace(); return topbar('Workspace e API') + `<div class="grid cols-2">
        <div class="card grid"><h3 style="margin:0">Equipe de “${esc(w.name)}”</h3><form class="row" id="inv"><input type="email" name="email" placeholder="email@cliente.com" style="flex:1" required><select name="role" style="width:auto"><option>editor</option><option>admin</option><option>viewer</option></select><button class="btn">Convidar</button></form>
          ${w.team.map(m => `<div>${esc(m.email)} · ${m.role} · <span class="pill warn">${m.status === 'pending' ? 'pendente' : m.status}</span></div>`).join('') || '<span class="faint">Só você.</span>'}</div>
        <div class="card grid"><h3 style="margin:0">Chaves de API</h3><form class="row" id="key"><input type="text" name="label" placeholder="ex.: n8n" style="flex:1"><button class="btn">Gerar chave</button></form>
          ${w.apiKeys.map(k => `<div class="row" style="justify-content:space-between"><code style="font-size:12px">${esc(k.label)}: ${esc(k.token)}</code><button class="btn sm danger" data-rev="${k.id}">Revogar</button></div>`).join('') || '<span class="faint">Nenhuma chave.</span>'}
          <p class="faint" style="font-size:13px">As chaves são fictícias. A API real não existe nesta réplica: o equivalente programático é o objeto <code>Core</code> (veja tests/).</p></div></div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Dados locais</h3><div class="row"><button class="btn" id="export">Exportar estado (JSON)</button><button class="btn danger" id="reset">Apagar tudo</button></div></div>`; },
      bind: () => {
        $('#inv').onsubmit = e => { e.preventDefault(); act(() => S.inviteMember(e.target.email.value, e.target.role.value), 'Convite enviado'); };
        $('#key').onsubmit = e => { e.preventDefault(); act(() => S.createApiKey(e.target.label.value), 'Chave criada'); };
        document.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => act(() => S.revokeApiKey(b.dataset.rev), 'Chave revogada'));
        $('#export').onclick = () => download('clipforge-estado.json', JSON.stringify(S.snapshot(), null, 2));
        $('#reset').onclick = () => sure('Apagar todos os dados deste navegador?').then(ok => { if (!ok) return; try { localStorage.removeItem(KEY); } catch (_) {} S = Core.createStore(null); S.subscribe(persist); location.hash = '#/register'; render(); });
      },
    },

    selftest: {
      html: () => topbar('Autoteste de funções', '<button class="btn primary" id="run">Rodar todos os testes</button>') + `<p class="muted">Executa cada fluxo num estado isolado em memória (não mexe nos seus dados) e mostra o resultado de cada verificação.</p><div class="card" id="out"><span class="faint">Clique em “Rodar”.</span></div>`,
      bind: () => { $('#run').onclick = () => { const res = selfTest(); $('#out').innerHTML = `<b>${res.filter(x => x.ok).length}/${res.length} passaram</b><table>${res.map(x => `<tr><td class="${x.ok ? 'test-ok' : 'test-bad'}">${x.ok ? '✔' : '✘'}</td><td>${esc(x.name)}</td><td class="faint">${esc(x.err || '')}</td></tr>`).join('')}</table>`; }; },
    },
  };

  function bindPublishButtons() { document.querySelectorAll('[data-pub]').forEach(b => b.onclick = () => location.hash = '#/publish?clip=' + b.dataset.pub); }

  // Verificações rápidas no navegador (espelham tests/core.test.js).
  function selfTest() {
    const out = [];
    const t = (name, fn) => { try { fn(); out.push({ name, ok: true }); } catch (e) { out.push({ name, ok: false, err: e.message }); } };
    const ok = (c, m) => { if (!c) throw new Error(m || 'falhou'); };
    const throwsCode = (fn, code) => { try { fn(); } catch (e) { if (e.code === code) return; throw new Error(`esperava ${code}, veio ${e.code}`); } throw new Error(`esperava erro ${code}`); };
    const mk = plan => { const s = Core.createStore(null); s.register({ email: 'a@b.co', password: '12345678' }); if (plan) s.subscribePlan(plan); return s; };
    t('Cadastro dá 15 créditos', () => ok(mk().balance().credits === 15));
    t('Login com senha errada falha', () => { const s = mk(); s.logout(); throwsCode(() => s.login({ email: 'a@b.co', password: 'x' }), 'bad_credentials'); });
    t('Detecta YouTube, Twitch live, Kick, arquivo', () => { ok(Core.detectSource('https://youtu.be/x').kind === 'youtube'); ok(Core.detectSource('https://twitch.tv/c').live); ok(Core.detectSource({ file: 'a.mp4' }).kind === 'file'); });
    t('Link não suportado é recusado', () => throwsCode(() => Core.detectSource('https://exemplo.org/a'), 'unsupported_source'));
    t('1 crédito = 1 minuto', () => { const s = mk('starter'); const b = s.balance().credits; s.createProject({ file: 'a.mp4', durationMin: 40 }); ok(b - s.balance().credits === 40); });
    t('Créditos insuficientes bloqueiam', () => throwsCode(() => mk().createProject({ file: 'a', durationMin: 50 }), 'insufficient_credits'));
    t('Clipes 9:16 com nota 0–100 ordenados', () => { const cs = mk('starter').createProject({ file: 'a', durationMin: 30 }).clips; ok(cs.every(c => c.aspect === '9:16' && c.score <= 100)); ok(cs[0].score >= cs[cs.length - 1].score); });
    t('Editor valida corte/proporção/velocidade', () => { const s = mk('starter'); const c = s.createProject({ file: 'a', durationMin: 6 }).clips[0]; throwsCode(() => s.updateClip(c.id, { start: 9, end: 1 }), 'invalid_range'); throwsCode(() => s.updateClip(c.id, { aspect: '2:1' }), 'invalid_aspect'); throwsCode(() => s.updateClip(c.id, { speed: 9 }), 'invalid_speed'); });
    t('SRT/VTT válidos e tradução mantém timing', () => { const s = mk('starter'); const c = s.createProject({ file: 'a', durationMin: 6 }).clips[0]; ok(/-->/.test(s.toSRT(c.captions))); ok(s.toVTT(c.captions).startsWith('WEBVTT')); const st = c.captions.map(q => q.start).join(); s.translateCaptions(c.id, 'en'); ok(s.getClip(c.id).captions.map(q => q.start).join() === st); });
    t('4K só no Pro; marca d’água no grátis', () => { const s = mk(); const c = s.createProject({ file: 'a', durationMin: 3 }).clips[0]; ok(s.render(c.id).watermark); throwsCode(() => s.render(c.id, { resolution: '4k' }), 'plan_required'); s.subscribePlan('pro'); ok(s.render(c.id, { resolution: '4k' }).resolution === '4k'); });
    t('Ferramentas avulsas executam', () => { const s = mk('starter'); ['transcribe', 'translate', 'remove-silence', 'highlights', 'compress', 'to-mp4', 'to-mp3', 'titles', 'resize', 'reframe'].forEach(x => ok(s.runTool(x, { durationMin: 1, aspect: '9:16' }).status === 'done', x)); ok(s.runTool('download', { url: 'https://kick.com/v/1' }).output.source === 'kick'); });
    t('Lives exigem Plus e cobram 10/lote', () => { const s = mk('starter'); throwsCode(() => s.createMonitor('https://kick.com/c'), 'plan_required'); s.subscribePlan('plus'); const m = s.createMonitor('https://kick.com/c'); s.startMonitor(m.id); const b = s.balance().credits; s.tickMonitor(m.id); ok(b - s.balance().credits === 10); });
    t('13 redes; limite de contas por plano', () => { ok(Core.NETWORKS.length === 13); const s = mk('starter'); s.connect('x'); throwsCode(() => s.connect('x'), 'plan_limit'); throwsCode(() => s.connect('twitch'), 'invalid_network'); });
    t('Agendar, publicar, cancelar e medir', () => { const s = mk('plus'); const cs = s.createProject({ file: 'a', durationMin: 12 }).clips; const k = s.connect('tiktok'); const p = s.schedulePost(cs[0].id, [k.id]); s.publishNow(p.id); throwsCode(() => s.cancelPost(p.id), 'already_published'); ok(s.metrics(30).views > 0); });
    t('Auto-post agenda clipes novos', () => { const s = mk('plus'); s.connect('tiktok'); s.setAutoPost(true); s.createProject({ file: 'a', durationMin: 12 }); ok(s.workspace().posts.length > 0); });
    t('Personas: 4 tipos, limite de fotos e de personas', () => { const s = mk('plus'); s.createPersona({ kind: 'preset', presetId: 'p-orange' }); s.createPersona({ kind: 'photos', photos: ['a'] }); s.createPersona({ kind: 'sheet', sheet: 'f' }); s.createPersona({ kind: 'scratch', description: 'd' }); throwsCode(() => s.createPersona({ kind: 'photos', photos: Array(7).fill('a') }), 'invalid_photos'); throwsCode(() => s.quoteSwap(10, [1, 2, 3, 4, 5]), 'too_many'); });
    t('Persona: falha estorna créditos', () => { const s = mk('plus'); const p = s.createPersona({ kind: 'preset', presetId: 'p-orange' }); const c = s.createProject({ file: 'a', durationMin: 3 }).clips[0]; const b = s.balance().credits; s.swapPersona(c.id, [p.id], { simulateFailure: true }); ok(s.balance().credits === b); });
    t('Automação: comentário vira DM com link', () => { const s = mk(); s.createAutomation({ type: 'comment_to_dm', keyword: 'link', link: 'https://e.com' }); ok(s.simulateComment({ user: '@a', text: 'LINK pf', follows: true })[0].link === 'https://e.com'); });
    t('Automação: pedido de follow e coleta de e-mail', () => { const s = mk(); s.createAutomation({ type: 'comment_to_dm', keyword: 'link', link: 'https://e.com' }); s.createAutomation({ type: 'follow_gate' }); ok(s.simulateComment({ user: '@a', text: 'link' })[0].action === 'follow_request'); s.createAutomation({ type: 'collect_email' }); s.simulateComment({ user: '@b', text: 'link', follows: true, email: 'b@x.com' }); ok(s.workspace().contacts.length === 1); });
    t('Workspaces separados, equipe e API keys', () => { const s = mk(); s.createWorkspace('B'); ok(s.balance().credits === 15); s.inviteMember('e@x.com'); throwsCode(() => s.inviteMember('e@x.com'), 'duplicate'); const k = s.createApiKey(); s.revokeApiKey(k.id); ok(!s.workspace().apiKeys.length); });
    t('Persistência via snapshot', () => { const s = mk('starter'); s.createProject({ file: 'a', durationMin: 6 }); ok(Core.createStore(s.snapshot()).workspace().clips.length === s.workspace().clips.length); });
    return out;
  }

  window.addEventListener('hashchange', render);
  render();
})();
