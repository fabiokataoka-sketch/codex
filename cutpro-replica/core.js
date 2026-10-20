/*
 * ClipForge core: estado e regras de negócio da réplica funcional.
 * Roda no navegador (window.Core) e no Node (require) para os testes.
 * Todo processamento de vídeo/IA é simulado de forma determinística.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Core = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- Constantes de produto (extraídas da análise do site) ----------
  const PLANS = {
    free:    { id: 'free',    name: 'Grátis',  price: 0,     credits: 15,   watermark: true,  maxVideoMin: 60,  accountsPerNetwork: 1,  liveClips: false, export4k: false, priority: false, creditValidityDays: 30 },
    starter: { id: 'starter', name: 'Starter', price: 9.90,  credits: 100,  watermark: false, maxVideoMin: 180, accountsPerNetwork: 1,  liveClips: false, export4k: false, priority: false, creditValidityDays: 90 },
    plus:    { id: 'plus',    name: 'Plus',    price: 19.90, credits: 1000, watermark: false, maxVideoMin: 540, accountsPerNetwork: 5,  liveClips: true,  export4k: false, priority: true,  creditValidityDays: 90 },
    pro:     { id: 'pro',     name: 'Pro',     price: 29.90, credits: 2500, watermark: false, maxVideoMin: 540, accountsPerNetwork: 15, liveClips: true,  export4k: true,  priority: true,  creditValidityDays: 90 },
  };

  const NETWORKS = ['tiktok', 'instagram', 'facebook', 'x', 'linkedin', 'bluesky', 'pinterest',
    'telegram', 'mastodon', 'discord', 'dailymotion', 'tumblr', 'slack'];
  const SOURCES = ['youtube', 'twitch', 'kick', 'instagram', 'tiktok', 'vimeo', 'file'];
  const LIVE_SOURCES = ['twitch', 'kick'];
  const LIVE_BATCH_MIN = 10;
  const MAX_PERSONA_PHOTOS = 6;
  const MAX_PERSONAS_PER_VIDEO = 4;
  const ASPECTS = ['9:16', '1:1', '4:5', '16:9'];
  const LANGUAGES = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'hi'];

  const CAPTION_TEMPLATES = [
    { id: 'karaoke', name: 'Karaoke', font: 'Inter Tight 700', highlight: '#c6f432', position: 'lower-center', community: true },
    { id: 'bold-pop', name: 'Bold Pop', font: 'Poppins 800', highlight: '#ffd400', position: 'center', community: true },
    { id: 'minimal', name: 'Minimal', font: 'Inter 500', highlight: '#ffffff', position: 'bottom', community: true },
    { id: 'neon', name: 'Neon', font: 'Space Grotesk 700', highlight: '#00e5ff', position: 'lower-center', community: true },
  ];

  const PERSONA_KINDS = ['preset', 'photos', 'sheet', 'scratch'];
  const PERSONA_PRESETS = [
    { id: 'p-orange', name: 'Ruiva de óculos', free: true },
    { id: 'p-skater', name: 'Skatista', free: true },
    { id: 'p-anchor', name: 'Âncora de jornal', free: true },
    { id: 'p-gamer', name: 'Gamer cyber', free: true },
  ];

  // ---------- Utilidades determinísticas ----------
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    let s = seed || 1;
    return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
  }
  let idCounter = 0;
  function uid(prefix) { idCounter++; return prefix + '_' + Date.now().toString(36) + idCounter.toString(36); }
  function err(code, message) { const e = new Error(message); e.code = code; return e; }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
  }
  function srtTime(sec) {
    const ms = Math.round((sec % 1) * 1000);
    return fmtTime(Math.floor(sec)) + ',' + String(ms).padStart(3, '0');
  }

  // ---------- Detecção de fonte por link ----------
  function detectSource(input) {
    if (!input) throw err('invalid_source', 'Informe um link ou arquivo.');
    if (typeof input === 'object' && input.file) return { kind: 'file', live: false, name: input.file };
    let url;
    try { url = new URL(String(input).trim()); } catch (_) { throw err('invalid_source', 'Link inválido.'); }
    const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');
    const map = { 'youtube.com': 'youtube', 'youtu.be': 'youtube', 'twitch.tv': 'twitch', 'kick.com': 'kick',
      'instagram.com': 'instagram', 'tiktok.com': 'tiktok', 'vimeo.com': 'vimeo' };
    const kind = map[host];
    if (!kind) throw err('unsupported_source', 'Plataforma não suportada: ' + host);
    const parts = url.pathname.split('/').filter(Boolean);
    // twitch.tv/<canal> ou kick.com/<canal> sem /videos/ => live
    const live = LIVE_SOURCES.includes(kind) && parts.length === 1;
    return { kind, live, channel: live ? parts[0] : null, name: url.href };
  }

  // Duração simulada (min) a partir do link, para cobrar créditos de forma estável.
  function estimateDurationMin(source) {
    if (source.durationMin) return source.durationMin;
    const h = hash(source.name || 'x');
    return 1 + (h % 180); // 1..180 min
  }

  // ---------- Store ----------
  function createStore(saved, opts) {
    opts = opts || {};
    const now = opts.now || (() => Date.now());
    const s = saved ? JSON.parse(JSON.stringify(saved)) : null;
    const state = s || {
      user: null,
      workspaces: [],
      activeWorkspace: null,
      ledger: [],
    };
    const listeners = new Set();

    function ws() {
      const w = state.workspaces.find(x => x.id === state.activeWorkspace);
      if (!w) throw err('no_workspace', 'Nenhum workspace ativo.');
      return w;
    }
    function plan() { return PLANS[ws().plan]; }
    function emit() { listeners.forEach(fn => fn(state)); }
    function requireUser() { if (!state.user) throw err('unauthenticated', 'Faça login.'); }

    function newWorkspace(name) {
      return {
        id: uid('ws'), name, plan: 'free', credits: PLANS.free.credits, creditsExpireAt: now() + PLANS.free.creditValidityDays * 864e5,
        projects: [], clips: [], templates: CAPTION_TEMPLATES.map(t => Object.assign({}, t)),
        connections: [], posts: [], monitors: [], personas: [], personaVideos: [], automations: [], contacts: [],
        jobs: [], apiKeys: [], team: [], ledger: [], autoPost: false,
      };
    }

    function charge(w, amount, reason) {
      if (amount <= 0) return;
      if (w.credits < amount) throw err('insufficient_credits', `Créditos insuficientes: precisa de ${amount}, tem ${w.credits}.`);
      w.credits -= amount;
      w.ledger.push({ at: now(), delta: -amount, reason, balance: w.credits });
    }
    function refund(w, amount, reason) {
      w.credits += amount;
      w.ledger.push({ at: now(), delta: amount, reason, balance: w.credits });
    }

    // ---- Clip generation ----
    function buildClips(w, project, r) {
      const n = Math.max(1, Math.min(30, Math.round(project.durationMin / 3)));
      const moments = ['pico de energia', 'virada', 'resposta afiada', 'reação da mesa', 'setup e payoff', 'momento engraçado', 'revelação', 'frase de efeito'];
      const clips = [];
      for (let i = 0; i < n; i++) {
        const start = Math.floor(r() * Math.max(1, project.durationMin * 60 - 60));
        const len = 15 + Math.floor(r() * 46); // 15–60s
        const moment = moments[Math.floor(r() * moments.length)];
        clips.push({
          id: uid('clip'), projectId: project.id, title: `${moment[0].toUpperCase() + moment.slice(1)} #${i + 1}`,
          start, end: start + len, aspect: '9:16', faceTracking: true, speed: 1,
          score: 40 + Math.floor(r() * 61), moment, templateId: 'karaoke',
          captions: buildCaptions(len, r, project.language), hashtags: [], language: project.language,
          rendered: null, watermark: plan().watermark, createdAt: now(),
        });
      }
      clips.sort((a, b) => b.score - a.score);
      return clips;
    }
    function buildCaptions(len, r, lang) {
      const words = {
        pt: ['olha', 'isso', 'aqui', 'cara', 'não', 'acredito', 'que', 'ele', 'falou', 'mesmo', 'sério', 'demais'],
        en: ['look', 'at', 'this', 'man', 'I', 'cannot', 'believe', 'he', 'said', 'that', 'seriously', 'wow'],
      }[lang] || ['lorem', 'ipsum', 'dolor', 'sit', 'amet'];
      const cues = []; let t = 0;
      while (t < len - 1) {
        const d = 1.2 + r() * 1.8; const cnt = 2 + Math.floor(r() * 4);
        const text = Array.from({ length: cnt }, () => words[Math.floor(r() * words.length)]).join(' ');
        cues.push({ start: +t.toFixed(2), end: +Math.min(len, t + d).toFixed(2), text });
        t += d;
      }
      return cues;
    }

    const api = {
      PLANS, NETWORKS, SOURCES, ASPECTS, LANGUAGES, PERSONA_PRESETS,
      get state() { return state; },
      subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      snapshot() { return JSON.parse(JSON.stringify(state)); },

      // ---- Auth ----
      register({ email, password, name }) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) throw err('invalid_email', 'E-mail inválido.');
        if (!password || password.length < 8) throw err('weak_password', 'A senha precisa de 8+ caracteres.');
        state.user = { id: uid('usr'), email, name: name || email.split('@')[0], passwordHash: hash(password), createdAt: now() };
        const w = newWorkspace('Meu canal');
        state.workspaces = [w]; state.activeWorkspace = w.id;
        w.ledger.push({ at: now(), delta: w.credits, reason: 'Créditos mensais do plano Grátis', balance: w.credits });
        emit(); return state.user;
      },
      login({ email, password }) {
        if (!state.user || state.user.email !== email || state.user.passwordHash !== hash(password || '')) throw err('bad_credentials', 'E-mail ou senha incorretos.');
        state.loggedIn = true; emit(); return state.user;
      },
      logout() { state.loggedIn = false; emit(); },
      isAuthed() { return !!state.user && state.loggedIn !== false; },

      // ---- Workspaces ----
      workspace: () => ws(),
      plan: () => plan(),
      createWorkspace(name) {
        requireUser();
        if (!name || !name.trim()) throw err('invalid_name', 'Nome obrigatório.');
        const w = newWorkspace(name.trim()); state.workspaces.push(w); state.activeWorkspace = w.id; emit(); return w;
      },
      switchWorkspace(id) {
        if (!state.workspaces.some(w => w.id === id)) throw err('not_found', 'Workspace não encontrado.');
        state.activeWorkspace = id; emit();
      },
      inviteMember(email, role) {
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email || '')) throw err('invalid_email', 'E-mail inválido.');
        const w = ws(); if (w.team.some(m => m.email === email)) throw err('duplicate', 'Já convidado.');
        const m = { email, role: role || 'editor', status: 'pending' }; w.team.push(m); emit(); return m;
      },

      // ---- Billing ----
      subscribePlan(planId) {
        const p = PLANS[planId]; if (!p) throw err('invalid_plan', 'Plano inválido.');
        const w = ws(); w.plan = planId;
        refund(w, p.credits, `Créditos mensais do plano ${p.name}`);
        w.creditsExpireAt = now() + p.creditValidityDays * 864e5;
        emit(); return w;
      },
      cancelSubscription() { const w = ws(); w.cancelAt = now() + 30 * 864e5; emit(); return w.cancelAt; },
      balance: () => ({ credits: ws().credits, expiresAt: ws().creditsExpireAt, plan: ws().plan }),
      balanceHistory: () => ws().ledger.slice().reverse(),

      // ---- Projetos / clipping ----
      quoteClipping(input, range) {
        const src = detectSource(input);
        if (src.live) return { source: src, credits: LIVE_BATCH_MIN, perBatch: true };
        const dur = estimateDurationMin(Object.assign({}, src, typeof input === 'object' ? input : {}));
        const from = range ? range.fromMin : 0, to = range ? Math.min(range.toMin, dur) : dur;
        return { source: src, durationMin: dur, analyzedMin: Math.max(1, Math.ceil(to - from)), credits: Math.max(1, Math.ceil(to - from)) };
      },
      createProject(input, options) {
        requireUser(); options = options || {};
        const w = ws(); const q = api.quoteClipping(input, options.range);
        if (q.source.live) throw err('use_monitor', 'Para lives use createMonitor().');
        if (q.durationMin > plan().maxVideoMin) throw err('too_long', `Seu plano aceita vídeos até ${plan().maxVideoMin} min.`);
        charge(w, q.credits, `Análise de ${q.analyzedMin} min`);
        const project = {
          id: uid('prj'), source: q.source, durationMin: q.durationMin, analyzedMin: q.analyzedMin,
          strategy: options.strategy || 'viral', language: options.language || 'pt', status: 'done', createdAt: now(), credits: q.credits,
        };
        const r = rng(hash(q.source.name + project.strategy));
        const clips = buildClips(w, project, r);
        project.clipIds = clips.map(c => c.id);
        w.projects.unshift(project); w.clips.unshift(...clips);
        if (w.autoPost) clips.slice(0, 3).forEach(c => w.connections.length && api.schedulePost(c.id, w.connections.map(x => x.id)));
        emit(); return { project, clips };
      },
      deleteProject(id) {
        const w = ws(); w.projects = w.projects.filter(p => p.id !== id); w.clips = w.clips.filter(c => c.projectId !== id); emit();
      },
      listClips(filter) {
        filter = filter || {}; let cs = ws().clips.slice();
        if (filter.projectId) cs = cs.filter(c => c.projectId === filter.projectId);
        if (filter.minScore) cs = cs.filter(c => c.score >= filter.minScore);
        if (filter.sort === 'recent') cs.sort((a, b) => b.createdAt - a.createdAt); else cs.sort((a, b) => b.score - a.score);
        return cs;
      },
      getClip(id) { const c = ws().clips.find(x => x.id === id); if (!c) throw err('not_found', 'Clipe não encontrado.'); return c; },
      deleteClip(id) { const w = ws(); w.clips = w.clips.filter(c => c.id !== id); emit(); },

      // ---- Editor ----
      updateClip(id, patch) {
        const c = api.getClip(id);
        if (patch.start != null || patch.end != null) {
          const st = patch.start != null ? +patch.start : c.start, en = patch.end != null ? +patch.end : c.end;
          if (!(en > st)) throw err('invalid_range', 'Fim precisa ser maior que o início.');
          if (en - st > 180) throw err('invalid_range', 'Clipe máximo de 3 min.');
        }
        if (patch.aspect && !ASPECTS.includes(patch.aspect)) throw err('invalid_aspect', 'Proporção inválida.');
        if (patch.speed != null && (patch.speed < 0.5 || patch.speed > 2)) throw err('invalid_speed', 'Velocidade entre 0.5x e 2x.');
        Object.assign(c, patch); c.rendered = null; emit(); return c;
      },
      editCaption(clipId, index, text) {
        const c = api.getClip(clipId); if (!c.captions[index]) throw err('not_found', 'Legenda não encontrada.');
        c.captions[index].text = text; c.rendered = null; emit(); return c.captions[index];
      },
      shiftCaptions(clipId, offsetSec) {
        const c = api.getClip(clipId);
        c.captions.forEach(q => { q.start = Math.max(0, +(q.start + offsetSec).toFixed(2)); q.end = Math.max(q.start + 0.1, +(q.end + offsetSec).toFixed(2)); });
        emit(); return c.captions;
      },
      removeSilences(clipId) {
        const c = api.getClip(clipId); let removed = 0; let t = 0;
        c.captions = c.captions.map(q => { const gap = q.start - t; const ng = Math.min(gap, 0.25); removed += gap - ng; const d = q.end - q.start; const nq = { start: +(t + ng).toFixed(2), end: +(t + ng + d).toFixed(2), text: q.text }; t = nq.end; return nq; });
        c.end = +(c.start + t).toFixed(2); emit(); return { removedSec: +removed.toFixed(2) };
      },
      applyTemplate(clipId, templateId) {
        if (!ws().templates.some(t => t.id === templateId)) throw err('not_found', 'Template não encontrado.');
        return api.updateClip(clipId, { templateId });
      },
      saveTemplate(t) {
        if (!t || !t.name) throw err('invalid_name', 'Nome obrigatório.');
        const tpl = Object.assign({ id: uid('tpl'), font: 'Inter 600', highlight: '#ffffff', position: 'lower-center', community: false }, t);
        ws().templates.push(tpl); emit(); return tpl;
      },
      render(clipId, opts) {
        opts = opts || {}; const c = api.getClip(clipId);
        const res = opts.resolution || '1080p';
        if (res === '4k' && !plan().export4k) throw err('plan_required', 'Exportação 4K exige o plano Pro.');
        c.rendered = { id: uid('rnd'), resolution: res, watermark: plan().watermark, at: now(), file: `${c.id}_${res}.mp4` };
        emit(); return c.rendered;
      },
      suggestTitles(clipId) {
        const c = api.getClip(clipId); const r = rng(hash(c.id));
        const tags = ['#cortes', '#viral', '#podcast', '#live', '#fyp', '#humor', '#reels', '#shorts'];
        c.hashtags = tags.filter(() => r() > 0.45).slice(0, 5); if (!c.hashtags.length) c.hashtags = ['#cortes'];
        const titles = [`Ninguém esperava: ${c.moment}`, `${c.title} (assista até o fim)`, `O ${c.moment} que parou a live`];
        emit(); return { titles, hashtags: c.hashtags };
      },

      // ---- Legendas / ferramentas ----
      toSRT(captions) {
        return captions.map((q, i) => `${i + 1}\n${srtTime(q.start)} --> ${srtTime(q.end)}\n${q.text}\n`).join('\n');
      },
      toVTT(captions) {
        return 'WEBVTT\n\n' + captions.map(q => `${srtTime(q.start).replace(',', '.')} --> ${srtTime(q.end).replace(',', '.')}\n${q.text}\n`).join('\n');
      },
      translateCaptions(clipId, lang) {
        if (!LANGUAGES.includes(lang)) throw err('invalid_language', 'Idioma não suportado.');
        const c = api.getClip(clipId);
        // simulação: mantém o timing e marca o idioma
        c.captions = c.captions.map(q => ({ start: q.start, end: q.end, text: `[${lang}] ${q.text.replace(/^\[\w+\] /, '')}` }));
        c.language = lang; emit(); return c.captions;
      },
      runTool(tool, input) {
        requireUser(); const w = ws();
        const tools = {
          transcribe: 1, translate: 1, 'remove-silence': 1, reframe: 1, resize: 0, compress: 0, 'to-mp4': 0, 'to-mp3': 0,
          'download': 0, 'titles': 0, highlights: 1,
        };
        if (!(tool in tools)) throw err('unknown_tool', 'Ferramenta desconhecida: ' + tool);
        if ((tool === 'resize' || tool === 'reframe') && input && input.aspect && !ASPECTS.includes(input.aspect)) throw err('invalid_aspect', 'Proporção inválida.');
        if (tool === 'download') detectSource(input && input.url);
        const minutes = (input && input.durationMin) || 1;
        const cost = tools[tool] * Math.ceil(minutes);
        charge(w, cost, `Ferramenta: ${tool}`);
        const job = { id: uid('job'), tool, input, cost, status: 'done', at: now(), output: toolOutput(tool, input) };
        w.jobs.unshift(job); emit(); return job;
      },

      // ---- Lives (monitores) ----
      createMonitor(url) {
        const src = detectSource(url);
        if (!src.live) throw err('not_live', 'Informe o link do canal (twitch.tv/canal ou kick.com/canal).');
        if (!plan().liveClips) throw err('plan_required', 'Clipes ao vivo exigem o plano Plus ou Pro.');
        const m = { id: uid('mon'), source: src, status: 'stopped', batches: 0, clips: 0, createdAt: now() };
        ws().monitors.push(m); emit(); return m;
      },
      startMonitor(id) { const m = findIn('monitors', id); m.status = 'live'; emit(); return m; },
      stopMonitor(id) { const m = findIn('monitors', id); m.status = 'stopped'; emit(); return m; },
      deleteMonitor(id) { const w = ws(); w.monitors = w.monitors.filter(m => m.id !== id); emit(); },
      tickMonitor(id) {
        // simula 1 lote de 10 min de live
        const m = findIn('monitors', id); if (m.status !== 'live') throw err('not_running', 'Monitor parado.');
        const w = ws(); charge(w, LIVE_BATCH_MIN, `Live ${m.source.channel}: lote ${m.batches + 1}`);
        const project = { id: uid('prj'), source: Object.assign({}, m.source, { name: m.source.name + '#b' + (m.batches + 1) }), durationMin: LIVE_BATCH_MIN, analyzedMin: LIVE_BATCH_MIN, strategy: 'live', language: 'pt', status: 'done', createdAt: now(), credits: LIVE_BATCH_MIN, monitorId: m.id };
        const clips = buildClips(w, project, rng(hash(project.source.name)));
        project.clipIds = clips.map(c => c.id); w.projects.unshift(project); w.clips.unshift(...clips);
        m.batches++; m.clips += clips.length;
        if (w.autoPost && w.connections.length) clips.forEach(c => api.schedulePost(c.id, w.connections.map(x => x.id)));
        emit(); return clips;
      },

      // ---- Conexões / publicação ----
      connect(network, handle) {
        if (!NETWORKS.includes(network)) throw err('invalid_network', 'Rede não suportada: ' + network);
        const w = ws(); const count = w.connections.filter(c => c.network === network).length;
        if (count >= plan().accountsPerNetwork) throw err('plan_limit', `Seu plano permite ${plan().accountsPerNetwork} conta(s) por rede.`);
        const c = { id: uid('con'), network, handle: handle || '@conta' + (count + 1), connectedAt: now() };
        w.connections.push(c); emit(); return c;
      },
      disconnect(id) { const w = ws(); w.connections = w.connections.filter(c => c.id !== id); emit(); },
      recommendedHour() {
        const posts = ws().posts.filter(p => p.status === 'published' && p.metrics);
        if (posts.length < 3) return 19;
        const byHour = {}; posts.forEach(p => { const h = new Date(p.scheduledAt).getHours(); (byHour[h] = byHour[h] || []).push(p.metrics.views); });
        return +Object.entries(byHour).map(([h, v]) => [h, v.reduce((a, b) => a + b, 0) / v.length]).sort((a, b) => b[1] - a[1])[0][0];
      },
      schedulePost(clipId, connectionIds, when, caption) {
        const w = ws(); const clip = api.getClip(clipId);
        if (!connectionIds || !connectionIds.length) throw err('no_target', 'Escolha pelo menos uma conta.');
        connectionIds.forEach(id => { if (!w.connections.some(c => c.id === id)) throw err('not_found', 'Conta não conectada.'); });
        let at = when;
        if (!at) { const d = new Date(now()); d.setHours(api.recommendedHour(), 0, 0, 0); if (d.getTime() <= now()) d.setDate(d.getDate() + 1); at = d.getTime(); }
        if (at < now() - 60000) throw err('past_date', 'A data já passou.');
        if (!clip.rendered) api.render(clipId);
        const post = { id: uid('post'), clipId, connectionIds: connectionIds.slice(), scheduledAt: at, caption: caption || clip.title, status: 'scheduled', items: connectionIds.map(id => ({ connectionId: id, status: 'scheduled' })) };
        w.posts.push(post); emit(); return post;
      },
      publishNow(postId) {
        const p = findIn('posts', postId); if (p.status === 'cancelled') throw err('cancelled', 'Post cancelado.');
        const r = rng(hash(p.id));
        p.items.forEach(it => { it.status = 'published'; it.url = `https://example.com/${it.connectionId}/${p.id}`; });
        p.status = 'published'; p.publishedAt = now();
        p.metrics = { views: Math.floor(1000 + r() * 900000), likes: Math.floor(r() * 80000), comments: Math.floor(r() * 900), shares: Math.floor(r() * 3000) };
        emit(); return p;
      },
      cancelPost(postId) { const p = findIn('posts', postId); if (p.status === 'published') throw err('already_published', 'Já publicado.'); p.status = 'cancelled'; emit(); return p; },
      setAutoPost(on) { ws().autoPost = !!on; emit(); return ws().autoPost; },

      // ---- Métricas ----
      metrics(days) {
        days = days || 30; const since = now() - days * 864e5;
        const posts = ws().posts.filter(p => p.status === 'published' && p.publishedAt >= since);
        const tot = posts.reduce((a, p) => { a.views += p.metrics.views; a.likes += p.metrics.likes; a.comments += p.metrics.comments; a.shares += p.metrics.shares; return a; }, { views: 0, likes: 0, comments: 0, shares: 0 });
        const engagement = tot.views ? +(((tot.likes + tot.comments + tot.shares) / tot.views) * 100).toFixed(2) : 0;
        const heat = Array.from({ length: 7 }, () => Array(24).fill(0));
        posts.forEach(p => { const d = new Date(p.scheduledAt); heat[d.getDay()][d.getHours()] += p.metrics.views; });
        const byNetwork = {};
        posts.forEach(p => p.items.forEach(it => { const c = ws().connections.find(x => x.id === it.connectionId); const n = c ? c.network : 'removida'; byNetwork[n] = (byNetwork[n] || 0) + Math.round(p.metrics.views / p.items.length); }));
        const ranking = posts.slice().sort((a, b) => b.metrics.views - a.metrics.views).slice(0, 10).map(p => ({ postId: p.id, clipId: p.clipId, title: p.caption, views: p.metrics.views }));
        return Object.assign(tot, { posts: posts.length, engagement, heat, byNetwork, ranking, bestHour: api.recommendedHour() });
      },

      // ---- Personas ----
      createPersona({ kind, name, photos, presetId, sheet, description }) {
        if (!PERSONA_KINDS.includes(kind)) throw err('invalid_kind', 'Tipo inválido.');
        if (kind === 'photos' && (!photos || !photos.length || photos.length > MAX_PERSONA_PHOTOS)) throw err('invalid_photos', `Envie de 1 a ${MAX_PERSONA_PHOTOS} fotos.`);
        if (kind === 'preset' && !PERSONA_PRESETS.some(p => p.id === presetId)) throw err('not_found', 'Personagem pronto não encontrado.');
        if (kind === 'sheet' && !sheet) throw err('invalid_sheet', 'Envie a ficha do personagem.');
        if (kind === 'scratch' && !description) throw err('invalid_description', 'Descreva a persona.');
        const w = ws(); const cost = kind === 'preset' ? 0 : 5;
        charge(w, cost, `Persona (${kind})`);
        const p = { id: uid('per'), kind, name: name || (kind === 'preset' ? PERSONA_PRESETS.find(x => x.id === presetId).name : 'Persona'), versions: [{ v: 1, at: now(), rating: null }], current: 1, presetId, photos: photos ? photos.length : 0, cost, createdAt: now() };
        w.personas.push(p); emit(); return p;
      },
      regeneratePersona(id) { const p = findIn('personas', id); charge(ws(), 2, 'Regenerar persona'); p.versions.push({ v: p.versions.length + 1, at: now(), rating: null }); p.current = p.versions.length; emit(); return p; },
      restorePersonaVersion(id, v) { const p = findIn('personas', id); if (!p.versions.some(x => x.v === v)) throw err('not_found', 'Versão não encontrada.'); p.current = v; emit(); return p; },
      deletePersona(id) { const w = ws(); w.personas = w.personas.filter(p => p.id !== id); emit(); },
      quoteSwap(durationSec, personaIds) {
        if (!personaIds || !personaIds.length) throw err('no_persona', 'Escolha uma persona.');
        if (personaIds.length > MAX_PERSONAS_PER_VIDEO) throw err('too_many', `Máximo de ${MAX_PERSONAS_PER_VIDEO} personas por vídeo.`);
        // mesmo preço com 1 ou 4 personas (collab sem custo extra)
        return { credits: Math.max(3, Math.ceil(durationSec / 10) * 3), personas: personaIds.length };
      },
      swapPersona(clipId, personaIds, opts) {
        opts = opts || {}; const clip = api.getClip(clipId);
        personaIds.forEach(id => findIn('personas', id));
        const q = api.quoteSwap(clip.end - clip.start, personaIds); const w = ws();
        charge(w, q.credits, 'Troca de persona');
        const job = { id: uid('pvid'), clipId, personaIds, credits: q.credits, target: opts.target || 'pessoa 1', at: now() };
        if (opts.simulateFailure) { job.status = 'failed'; refund(w, q.credits, 'Estorno: falha na geração'); }
        else job.status = 'done';
        w.personaVideos.push(job); emit(); return job;
      },

      // ---- Automações ----
      createAutomation(a) {
        const types = ['comment_to_dm', 'follow_gate', 'collect_email', 'cross_post', 'autopost_live'];
        if (!a || !types.includes(a.type)) throw err('invalid_type', 'Tipo de automação inválido.');
        if (a.type === 'comment_to_dm' && (!a.keyword || !a.link)) throw err('invalid_automation', 'Informe palavra-chave e link.');
        const au = Object.assign({ id: uid('aut'), enabled: true, runs: 0 }, a); ws().automations.push(au); emit(); return au;
      },
      toggleAutomation(id) { const a = findIn('automations', id); a.enabled = !a.enabled; emit(); return a; },
      deleteAutomation(id) { const w = ws(); w.automations = w.automations.filter(a => a.id !== id); emit(); },
      simulateComment({ user, text, follows, email }) {
        const w = ws(); const out = [];
        w.automations.filter(a => a.enabled && a.type === 'comment_to_dm' && text.toLowerCase().includes(a.keyword.toLowerCase())).forEach(a => {
          const gate = w.automations.find(g => g.enabled && g.type === 'follow_gate');
          if (gate && !follows) { out.push({ to: user, message: 'Siga o perfil para receber o link 🙂', action: 'follow_request' }); a.runs++; return; }
          const collect = w.automations.find(g => g.enabled && g.type === 'collect_email');
          if (collect && email) { if (!w.contacts.some(c => c.email === email)) w.contacts.push({ user, email, at: now() }); }
          out.push({ to: user, message: a.message || 'Aqui está o link:', button: 'Abrir', link: a.link, action: 'dm' }); a.runs++;
        });
        emit(); return out;
      },

      // ---- API ----
      createApiKey(label) { const k = { id: uid('key'), label: label || 'Chave', token: 'cf_live_' + hash(uid('t') + now()).toString(36) + hash(String(Math.random())).toString(36), createdAt: now() }; ws().apiKeys.push(k); emit(); return k; },
      revokeApiKey(id) { const w = ws(); w.apiKeys = w.apiKeys.filter(k => k.id !== id); emit(); },

      // ---- Download em massa ----
      bulkDownload(clipIds) { const ids = clipIds && clipIds.length ? clipIds : ws().clips.map(c => c.id); return { id: uid('bulk'), files: ids.map(id => api.getClip(id).id + '.mp4'), count: ids.length }; },
    };

    function findIn(coll, id) { const x = ws()[coll].find(i => i.id === id); if (!x) throw err('not_found', 'Item não encontrado.'); return x; }
    function toolOutput(tool, input) {
      input = input || {};
      switch (tool) {
        case 'transcribe': return { text: 'Transcrição simulada do arquivo ' + (input.name || 'vídeo') + '.', language: input.language || 'pt', accuracy: 0.99 };
        case 'resize': case 'reframe': return { aspect: input.aspect || '9:16', file: 'saida_' + (input.aspect || '9-16').replace(':', '-') + '.mp4' };
        case 'compress': return { ratio: 0.38, file: 'comprimido.mp4' };
        case 'to-mp4': return { file: 'video.mp4' };
        case 'to-mp3': return { file: 'audio.mp3', bitrate: '320kbps' };
        case 'download': return { file: 'download.mp4', source: detectSource(input.url).kind };
        case 'titles': return { titles: ['Você não vai acreditar nisso', 'O momento mais comentado', 'Assista até o final'], hashtags: ['#viral', '#cortes', '#fyp'] };
        case 'highlights': return { peaks: [42, 318, 611].map(fmtTime) };
        default: return { file: 'saida.mp4' };
      }
    }

    return api;
  }

  return { PLANS, NETWORKS, SOURCES, ASPECTS, LANGUAGES, CAPTION_TEMPLATES, PERSONA_PRESETS, LIVE_BATCH_MIN,
    MAX_PERSONA_PHOTOS, MAX_PERSONAS_PER_VIDEO, detectSource, estimateDurationMin, createStore, fmtTime, srtTime, hash };
});
