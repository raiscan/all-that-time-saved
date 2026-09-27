// render.mjs: renders a studio page in headless Chrome (--page; default video/studio.html, the film). Length and fps come from the page (PROJECT in its config.js).
//
//   Look at it (open the images with your image viewer / Read tool):
//     node render.mjs --sheet=0.5,1,1.5,2 [--cols=4] [--w=480] --out=out/check/a.jpg        contact sheet of chosen times
//     node render.mjs --strip=2.0:2.5 [--cols=6] [--w=320] --out=out/check/strip.jpg        EVERY frame in a stretch (motion)
//     node render.mjs --sheet=2.1,2.2 --crop=760,300,400,400 --w=600 --out=out/check/face.jpg full-res crops (details)
//     node render.mjs --strip=2.0:2.5 --crop-at=960,780,500,400 --out=out/check/feet.jpg       crops that follow a WORLD point
//         (x,y in world px, may be page expressions like PLK.MX(1.38); w,h in screen px) through each frame's camera
//     node render.mjs --stills=1.2,3.4 --out=out/stills                                     full-res PNGs
//   Make the video:
//     node render.mjs --clip [--range=0:4] --out=out/video.mp4                               straight to MP4 (one worker)
//     node render.mjs --frames [--range=0:8] [--workers=1]                                   JPEG frames → out/frames (resumable)
//         (one GPU is the limit. Supersampled 4K used to overflow video memory (p5.brush's fill canvas; fixed in core.js
//         brushWaitAfterFills), and parallel runs thrashed. Now, at --os=2 --ss=4, two separate processes on disjoint
//         --range halves give ~1.5x throughput (peak ~11.7 GB of 16); three overflow. Pages in one browser don't help.)
//     node render.mjs --encode --out=out/video.mp4                                           out/frames → MP4
//   Standalone loops (LOOPS in the page): add --loop=<name> to any of the above (times are then loop times), or
//     node render.mjs --loop=emotions --png --out=out/loop_emotions                          one cycle as PNGs (for GIFs)
//   Sound (muxed into --clip and --encode): the song (PROJECT.audio) to its end (PROJECT.duration, the page's DUR), then
//   the end credits' own music (PROJECT.credits.audio) from there to the film's end (FILM_END); silence where either
//   runs short. --audio=<file> instead puts one file under the whole film from 0. A span's end may be 'end' (--clip=292:end).
//   Other flags: --fps=24,
//   --chrome=<path to Chrome/Chromium>, --page=<another studio page, e.g. video/dev-verse1.html>,
//   --encode --youtube: the upload master (YouTube's recommended settings for 4K SDR: see the encode). --jq=Q: the frames'
//   JPEG quality (default .94; the final masters .97).
//   --os=2 (output 3840x2160: 4K), --query=k=v&k2=v2 (extra page parameters, e.g. z3=b: docs/SWITCHES.md), --ss=N (supersample: draw at Nx and average each N×N block down to one pixel, for anti-aliased edges and fine lines; --clip and --frames default to 2).
//   Sheets and strips draw at 1x unless given --ss: there a line under a pixel wide prints as dashes (the banknote's fine
//   engraving does); judge fine line work with --ss=3 (or --os=2 --ss=4, as the master).
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const s = a.replace(/^--/, ''), i = s.indexOf('='); return i < 0 ? [s, true] : [s.slice(0, i), s.slice(i + 1)]; }));   // split on the first '=' only
const CHROMES = [args.chrome, process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ...playwrightChromes()];
// Chromium builds Playwright downloaded (~/.cache/ms-playwright/chromium-NNNN), newest first
function playwrightChromes() {
  const dir = `${homedir()}/.cache/ms-playwright`;
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(n => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1])
    .map(n => `${dir}/${n}/chrome-linux64/chrome`);
}
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: pass --chrome=<path> or set CHROME_PATH'); process.exit(1); }
const fps = +(args.fps || 24), FRAMES_DIR = 'out/frames';
// Final renders (--clip, --frames) supersample 2x by default for anti-aliased edges; checks (sheets, strips) draw at 1x.
if (args.ss == null && (args.clip || args.frames)) args.ss = 2 * (+args.os || 1) > 2 ? +args.os : 2;   // (4K output draws at 4K; --ss=4 to supersample it)
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });
const times = s => String(s).split(',').map(Number);
const span = (s, len) => String(s).split(':').map(v => v === 'end' ? len : Number(v));   // ('end': the length of what's rendered)
// comma-separated fields, keeping commas inside parentheses ('PLK.MX(1.38),PLK.WL,500,300'); numbers stay numbers
const fields = s => { const out = []; let d = 0, cur = ''; for (const ch of String(s)) { if (ch === ',' && !d) { out.push(cur); cur = ''; continue; } d += ch === '(' ? 1 : ch === ')' ? -1 : 0; cur += ch; } out.push(cur); return out.map(v => isNaN(+v) ? v : +v); };

// The film's sound from film time a, n frames long (n / fps s, to match the video exactly), as ffmpeg arguments that add
// its inputs after the video's (input 0) and map the video and the sound. P: the page's PROJECT. The song plays to
// P.duration (padded with silence or cut there), the credits' music from there for P.credits.len; --audio=<file>
// replaces both with one file from 0. Nothing to play: [].
function soundArgs(P, a, n) {
  const b = a + n / fps, song = args.audio || P.audio, cr = !args.audio && P.credits && P.credits.audio && existsSync(P.credits.audio) ? P.credits : null;
  if (!song) return [];
  const norm = 'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo';
  const whole = args.audio ? `[1:a]${norm},apad[f]`
    : cr ? `[1:a]${norm},apad,atrim=end=${P.duration}[s];[2:a]${norm},apad,atrim=end=${+cr.len}[c];[s][c]concat=n=2:v=0:a=1,apad[f]`
    : `[1:a]${norm},apad,atrim=end=${P.duration}[s];[s]apad[f]`;   // (no credits' music: silence after the song)
  return ['-i', song, ...(cr ? ['-i', cr.audio] : []), '-filter_complex', `${whole};[f]atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS[snd]`,
    '-map', '0:v', '-map', '[snd]', '-c:a', 'aac', '-b:a', '192k'];
}
const describeSound = P => args.audio ? args.audio : [P.audio, P.credits && P.credits.audio].filter(Boolean).join(' + ');

if (args.encode) {
  // the sound: PROJECT from the page's config.js (read without starting a browser; it only declares PROJECT)
  const cfg = resolve(dirname(resolve(args.page || 'video/studio.html')), 'config.js');
  // (with --query's parameters as the page would see them: ?polka picks the polka credits' music)
  const P = existsSync(cfg) ? new Function('location', readFileSync(cfg, 'utf8') + '\nreturn PROJECT;')({ search: '?' + (args.query || '') }) : {};
  const out = args.out || 'out/video.mp4', n = readdirSync(FRAMES_DIR).filter(f => /^f\d{5}\.jpg$/.test(f)).length, snd = soundArgs(P, 0, n);
  console.log(`encoding ${n} frames → ${out}${snd.length ? ' with ' + describeSound(P) : ''}${args.youtube ? ' (YouTube upload)' : ''}`);
  // --youtube: the upload master, to YouTube's recommended upload settings for 4K SDR (H.264 High, progressive, closed GOP
  // of half the frame rate, 2 B-frames, CABAC; well over its 35-45 Mbps for 4K at 24 fps: CRF 14; AAC-LC 48 kHz stereo at
  // 384 kbps; the moov atom first), and in the colour YouTube assumes for HD: BT.709, limited range, tagged. The frames are
  // JPEGs (BT.601, full range): converted with accurate rounding and full chroma interpolation (measured on a 4K frame:
  // flat colours within a level of the frame, and closer overall than the plain encode, which keeps the JPEGs' full-range
  // BT.601, which YouTube handles unreliably).
  const yt = args.youtube ? ['-vf', 'scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv:flags=accurate_rnd+full_chroma_int+bitexact,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-profile:v', 'high', '-level:v', '5.1', '-bf', '2', '-g', String(fps / 2), '-keyint_min', String(fps / 2), '-sc_threshold', '0',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv'] : null;
  const sndYT = args.youtube ? snd.map((v, i) => snd[i - 1] === '-b:a' ? '384k' : v).concat(['-ar', '48000']) : snd;
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`,
    ...sndYT, ...(yt || ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p']), '-movflags', '+faststart', out]);
  console.log('wrote ' + out);
  process.exit(0);
}

// --soft-gl: no GPU on this machine; render WebGL in software (SwiftShader), which Chrome only allows when asked.
// --gpu-angle=vulkan|gl-egl: headless Linux on an NVIDIA GPU (e.g. a cloud or cluster node); plain --use-gl=angle gets
// no WebGL context there. Check which GPU Chrome actually lands on with gpu_probe.mjs.
const ANGLE = { vulkan: ['--use-angle=vulkan', '--enable-features=Vulkan'], 'gl-egl': ['--use-angle=gl-egl'] };
if (args['gpu-angle'] && !ANGLE[args['gpu-angle']]) { console.error(`--gpu-angle must be one of ${Object.keys(ANGLE)}`); process.exit(1); }
const gpu = args['soft-gl'] ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : args['gpu-angle'] ? ANGLE[args['gpu-angle']]
  : process.platform === 'win32' ? ['--use-angle=d3d11'] : process.platform === 'darwin' ? ['--use-angle=metal'] : ['--use-gl=angle'];
// Ubuntu 23.10+ blocks Chrome's user-namespace sandbox; headless rendering of local files doesn't need it.
const sandbox = process.platform === 'linux' ? ['--no-sandbox'] : [];
// Chrome's msaa_is_slow workaround (the default; --exact-aa turns it off): the canvases anti-alias fill edges analytically
// instead of multisampling. Supersampled 4K then costs about what native 4K does (~0.42 s against ~0.95 s a frame), and
// the edges differ imperceptibly (PSNR 52-62 dB; the user can't tell, 2026-09-25). The page is told (&msaaslow), so
// core.js skips the GPU waits that only help a multisampling canvas.
const AA_FAST = args['exact-aa'] ? [] : ['--msaa_is_slow'];
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: [...sandbox, '--allow-file-access-from-files', '--ignore-gpu-blocklist', ...gpu, '--enable-gpu-rasterization', '--window-size=1920,1080', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', ...AA_FAST]
});
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve(args.page || 'video/studio.html')).href + '?render' + (AA_FAST.length ? '&msaaslow' : '') + (args.ss ? '&ss=' + args.ss : '') + (args.os ? '&os=' + args.os : '') + (args.query ? '&' + args.query : ''), { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  if (args.loop) {
    const ok = await page.evaluate(name => { if (!LOOPS[name]) return false; window.LOOP = LOOPS[name]; return true; }, args.loop);
    if (!ok) { console.error(`no loop named "${args.loop}"`); process.exit(1); }
  }
  return page;
}
const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
// the length of whatever is being rendered: a loop's .len, or the video's duration
const lengthOf = page => page.evaluate(() => window.LOOP ? window.LOOP.len : typeof FILM_END !== 'undefined' ? FILM_END : DUR);   // (the film: the song, then the credits)

if (args.sheet || args.strip) {
  const page = await openPage(), out = args.out || 'out/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  let ts;
  if (args.strip) { const [a, b] = span(args.strip, await lengthOf(page)); ts = []; for (let i = Math.round(a * fps); i <= Math.round(b * fps); i++) ts.push(i / fps); }
  else ts = times(args.sheet);
  const crop = args.crop ? times(args.crop) : null, at = args['crop-at'] ? fields(args['crop-at']) : null;
  const { url, ms } = await page.evaluate((ts, c, w, crop, at) => window.renderSheet(ts, c, w, crop, at), ts, +(args.cols || (args.strip ? 6 : 3)), +(args.w || (args.strip ? 320 : 640)), crop, at);
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${out}  (${ts.length} frames)  ms/frame: ${ms.join(' ')}`);
} else if (args.profile) {
  // where a frame's time goes: drawing (JS, and the GPU work it queues), finishing the GPU work, the composite (the
  // downsample to the output size, grain, lettering), JPEG encoding, and the transfer out of the page. Warm (3rd) runs.
  const page = await openPage();
  await page.evaluate(noFx => { const comp = composite; composite = function (t) { const b = performance.now(), gl = drawingContext; gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); const c = performance.now();   /* (a real sync: Chrome's finish() doesn't wait) */ window.__fx = POSTFX; if (noFx) POSTFX = null; comp(t); window.__ph = { b, c, d: performance.now(), fx: window.__fx }; }; }, !!args['no-postfx']);
  console.log(`ss=${args.ss || 1} os=${args.os || 1}: drawing ${1920 * Math.max(+(args.ss || 1), +(args.os || 1))}px wide, output ${1920 * (+args.os || 1)}px`);
  for (const s of times(args.profile)) {
    let m;
    for (let rep = 0; rep < 3; rep++) {
      const t0 = Date.now();
      const r = await page.evaluate(async t => { const a = performance.now(), url = await window.renderAt(t, 'image/jpeg', .93), e = performance.now(), p = window.__ph;
        return { draw: p.b - a, gpu: p.c - p.b, comp: p.d - p.c, jpeg: e - p.d, fx: p.fx, url }; }, s);
      Buffer.from(r.url.slice(r.url.indexOf(',') + 1), 'base64'); const tot = Date.now() - t0;
      m = { ...r, xfer: tot - (r.draw + r.gpu + r.comp + r.jpeg), tot };
    }
    const f = v => v.toFixed(0).padStart(5);
    console.log(`t=${String(s).padEnd(7)} draw${f(m.draw)}  gpu${f(m.gpu)}  composite${f(m.comp)}  jpeg${f(m.jpeg)}  transfer${f(m.xfer)}  = ${m.tot} ms${m.fx ? '   (grade: ' + m.fx + ')' : ''}`);
  }
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills'; mkdirSync(out, { recursive: true });
  console.log('GPU:', await page.evaluate(() => window.gpuInfo()));
  for (const s of times(args.stills)) {
    const t0 = Date.now(), buf = await frameOf(page, s, 'image/png');
    const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, buf);
    console.log(`${f}  ${Date.now() - t0} ms`);
  }
} else if (args.png) {
  // PNG sequence (for GIFs): a loop's full cycle (frame n equals frame 0, so it isn't rendered), or --range=a:b.
  const probe = await openPage(), len = await lengthOf(probe); await probe.close();
  const [a, b] = args.range ? span(args.range, len) : [0, len], n = Math.round((b - a) * fps);
  const out = args.out || `out/${args.loop ? 'loop_' + args.loop : 'png'}`, workers = +(args.workers || 3); mkdirSync(out, { recursive: true });
  let next = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < n) { const i = next++; writeFileSync(`${out}/f${String(i).padStart(4, '0')}.png`, await frameOf(page, a + i / fps, 'image/png')); }
  }));
  console.log(`${n} frames → ${out}  (${((Date.now() - start) / n).toFixed(0)} ms/frame)`);
} else if (args.frames) {
  // Parallel and resumable: each worker pulls the next missing frame; files are written atomically.
  const probe = await openPage(), len = await lengthOf(probe); await probe.close();
  const [a, b] = args.range ? span(args.range, len) : [0, len], workers = +(args.workers || 1);
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(len * fps) - 1, Math.round(b * fps) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', +args.jq || .94);   // (--jq: the frames' JPEG quality; the final masters use .97)
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 24 === 0 || done === todo.length) {
        const el = (Date.now() - start) / 1000;
        console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
    }
  }));
} else if (args.clip) {
  const page = await openPage(), len = await lengthOf(page);
  const [a, b] = args.range ? span(args.range, len) : typeof args.clip === 'string' ? span(args.clip, len) : [0, len];
  const P = await page.evaluate(() => typeof PROJECT === 'undefined' ? {} : JSON.parse(JSON.stringify(PROJECT)));
  const out = args.out || 'out/clip.mp4'; mkdirSync(dirname(out), { recursive: true });
  const n = Math.round((b - a) * fps), start = Date.now();
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    ...soundArgs(P, a, n), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', .93);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 24 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log(`wrote ${out}`);
} else {
  console.log('nothing to do: see the usage notes at the top of render.mjs');
}
await browser.close();
