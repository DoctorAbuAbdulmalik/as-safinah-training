// Sea sounds, made in the browser with the Web Audio API — no audio files to download.
// A button press plays a short sea scene: a wave swelling and breaking on the hull, wind in the
// rigging, and one or two gulls calling. Nothing plays until a person presses something, and a
// button in the header turns it off (the choice is remembered).

const KEY = "safinah.sound";
let ctx = null;
let master = null;
let noiseBuf = null;
let last = 0;

export const soundEnabled = () => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "true") !== false; } catch { return true; }
};
export const setSoundEnabled = (on) => {
  try { localStorage.setItem(KEY, JSON.stringify(!!on)); } catch { /* private mode */ }
};

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    // two seconds of pink-ish noise, looped
    const len = ctx.sampleRate * 2;
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + white * 0.099046;
      b1 = 0.963 * b1 + white * 0.2965164;
      b2 = 0.57 * b2 + white * 1.0526913;
      data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2;
    }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Filtered noise with a swell-and-fall envelope: a wave rolling in and breaking. */
function wave(t0, { dur = 3.2, peak = 0.5, freq = 700, q = 0.7, delay = 0 } = {}) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = q;
  const gain = ctx.createGain();
  const s = t0 + delay;
  // the filter opens as the wave rises (the "sh" of foam), and closes as it drains away
  filter.frequency.setValueAtTime(220, s);
  filter.frequency.exponentialRampToValueAtTime(freq, s + dur * 0.42);
  filter.frequency.exponentialRampToValueAtTime(260, s + dur);
  gain.gain.setValueAtTime(0.0001, s);
  gain.gain.exponentialRampToValueAtTime(peak, s + dur * 0.42);
  gain.gain.exponentialRampToValueAtTime(0.0001, s + dur);
  src.connect(filter).connect(gain).connect(master);
  src.start(s);
  src.stop(s + dur + 0.1);
}

/** Wind in the rigging: a thin band of noise that wanders in pitch. */
function wind(t0, dur) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 6;
  band.frequency.setValueAtTime(900, t0);
  band.frequency.linearRampToValueAtTime(1300, t0 + dur * 0.5);
  band.frequency.linearRampToValueAtTime(800, t0 + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.linearRampToValueAtTime(0.05, t0 + dur * 0.4);
  gain.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  src.connect(band).connect(gain).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.1);
}

/** A gull: a harsh, buzzing tone that glides up and then falls, with a fast flutter. */
function gull(t0, { pitch = 1, calls = 3 } = {}) {
  for (let k = 0; k < calls; k++) {
    const s = t0 + k * 0.34;
    const len = k === calls - 1 ? 0.5 : 0.26;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const base = 1500 * pitch;
    osc.frequency.setValueAtTime(base * 0.78, s);
    osc.frequency.exponentialRampToValueAtTime(base * 1.45, s + len * 0.3);
    osc.frequency.exponentialRampToValueAtTime(base * 0.8, s + len);
    // flutter
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 38;
    lfoGain.gain.value = 55;
    lfo.connect(lfoGain).connect(osc.frequency);
    const body = ctx.createBiquadFilter();
    body.type = "bandpass";
    body.frequency.value = 2300 * pitch;
    body.Q.value = 1.4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, s);
    gain.gain.exponentialRampToValueAtTime(0.11, s + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, s + len);
    osc.connect(body).connect(gain).connect(master);
    osc.start(s);
    lfo.start(s);
    osc.stop(s + len + 0.05);
    lfo.stop(s + len + 0.05);
  }
}

/** The sea scene played when a button is pressed. */
export function playSea() {
  if (!soundEnabled()) return;
  const now = performance.now();
  if (now - last < 2500) return; // not on every click
  const c = audio();
  if (!c) return;
  last = now;
  const t0 = c.currentTime + 0.02;
  wave(t0, { dur: 3.4, peak: 0.55, freq: 900 });
  wave(t0, { dur: 4.2, peak: 0.25, freq: 380, delay: 0.5, q: 0.5 });
  wind(t0, 3.6);
  gull(t0 + 0.7, { pitch: 1, calls: 3 });
  if (Math.random() < 0.7) gull(t0 + 2.1, { pitch: 1.18, calls: 2 });
}
