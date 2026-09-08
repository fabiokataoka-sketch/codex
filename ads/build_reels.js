const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = require('ffmpeg-static');
const A = JSON.parse(fs.readFileSync('angles.json', 'utf8'));
fs.mkdirSync('video', { recursive: true });
const COVER_S = 3.0, SLIDE_S = 2.9;

for (const [key, ang] of Object.entries(A.angles)) {
  for (const v of [1, 2]) {
    const frames = [`out/${key}-cover${v}-916.png`, ...ang.slides.map((_, i) => `out/${key}-s${i+1}-916.png`)];
    frames.forEach(f => { if (!fs.existsSync(f)) throw new Error('faltando ' + f); });
    const durs = frames.map((_, i) => i === 0 ? COVER_S : SLIDE_S);
    const total = durs.reduce((a, b) => a + b, 0);
    const list = frames.map((f, i) => `file '${require('path').resolve(f)}'\nduration ${durs[i]}`).join('\n') + `\nfile '${require('path').resolve(frames[frames.length-1])}'\n`;
    const listPath = `video/${key}${v}.txt`;
    fs.writeFileSync(listPath, list);
    const out = `video/reel_${key}${v}.mp4`;
    execFileSync(FF, ['-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'concat', '-safe', '0', '-i', listPath,
      '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
      '-vf', 'fps=30,scale=1080:1920:flags=lanczos,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high', '-level', '4.0',
      '-c:a', 'aac', '-b:a', '96k', '-shortest', '-t', String(total),
      '-movflags', '+faststart', out], { stdio: 'inherit' });
    let probe = '';
    try { execFileSync(FF, ['-hide_banner', '-i', out], { stdio: ['ignore','pipe','pipe'], encoding: 'utf8' }); }
    catch (e) { probe = (e.stderr || '') + (e.stdout || ''); }
    const dur = (probe.match(/Duration: (\d+:\d+:[\d.]+)/) || [])[1];
    const dim = /1080x1920/.test(probe), aac = /Audio: aac/.test(probe);
    console.log(out, frames.length + 'f', total.toFixed(1) + 's', 'probe=' + dur, dim ? '1080x1920 OK' : 'DIM FAIL', aac ? 'aac OK' : 'AUDIO FAIL', (fs.statSync(out).size/1e6).toFixed(2) + 'MB');
    if (!dim || !aac || !dur) throw new Error('verificação falhou: ' + out);
  }
}
