// Aplica as trilhas nos 14 reels. Espera trilhas/t1.mp3, t2.mp3, t3.mp3
const { execFileSync } = require('child_process');
const fs = require('fs');
const FF = require('ffmpeg-static');

const MAP = {           // faixa -> reels que ela veste
  t1: { offset: 12, reels: ['A1','A2','C1','C2','D1','D2'] },  // minimal tensa
  t2: { offset:  8, reels: ['B1','B2','G1','G2'] },            // pad ambiente
  t3: { offset: 10, reels: ['E1','E2','F1','F2'] },            // pulso marcado
};

const dur = f => {
  let out = '';
  try { execFileSync(FF, ['-hide_banner','-i',f], { stdio:['ignore','pipe','pipe'], encoding:'utf8' }); }
  catch (e) { out = (e.stderr||''); }
  const m = out.match(/Duration: (\d+):(\d+):([\d.]+)/);
  return m ? (+m[1])*3600 + (+m[2])*60 + parseFloat(m[3]) : null;
};

fs.mkdirSync('video_music', { recursive: true });
let n = 0;
for (const [track, { offset, reels }] of Object.entries(MAP)) {
  const mp3 = `trilhas/${track}.mp3`;
  if (!fs.existsSync(mp3)) throw new Error('faltando ' + mp3);
  for (const r of reels) {
    const src = `video/reel_${r}.mp4`, out = `video_music/reel_${r}.mp4`;
    const d = dur(src);
    if (!d) throw new Error('sem duração: ' + src);
    const fadeStart = (d - 1.1).toFixed(2);
    execFileSync(FF, ['-y','-hide_banner','-loglevel','error',
      '-i', src, '-ss', String(offset), '-i', mp3,
      '-filter_complex', `[1:a]atrim=0:${d.toFixed(2)},asetpts=PTS-STARTPTS,`
        + `afade=t=in:st=0:d=0.5,afade=t=out:st=${fadeStart}:d=1.1,`
        + `loudnorm=I=-16:TP=-1.5:LRA=11,aresample=44100[a]`,
      '-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','128k',
      '-shortest','-movflags','+faststart', out]);
    const od = dur(out);
    if (!od || Math.abs(od - d) > 0.3) throw new Error('duração divergente em ' + out);
    console.log(`${out}  ${track}  ${od.toFixed(2)}s  ${(fs.statSync(out).size/1e6).toFixed(2)}MB`);
    n++;
  }
}
console.log('reels com trilha:', n);
