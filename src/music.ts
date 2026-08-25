import Phaser from 'phaser';

// Forest music, synthesised at runtime with the Web Audio API — like every
// graphic in this game, the soundtrack ships as code rather than as an asset
// file, so there is nothing to download and no third-party licence involved.
//
// Three layers make up the mood: a slow chord pad under a sparse pentatonic
// melody, a soft filtered noise bed for wind in the leaves, and the odd bird
// call on top.

const KEY = 'koko-run.music';

// Overall level: present in the background without ever competing with the game
const MASTER_GAIN = 1.8;
const BAR_SECONDS = 4;
// I – V – vi – IV in D major: warm, pastoral, and it loops without a seam.
const PROGRESSION: number[][] = [
  [38, 62, 66, 69], // D
  [33, 61, 64, 69], // A
  [35, 62, 66, 71], // Bm
  [31, 62, 67, 71], // G
];
// D major pentatonic — every note fits over every chord above
const MELODY_NOTES = [74, 76, 78, 81, 83, 86];

const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let wind: AudioBufferSourceNode | undefined;
let timer: number | undefined;
let ownsContext = false;
let bar = 0;
let nextBarTime = 0;
let enabled = readEnabled();

function readEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function isMusicEnabled(): boolean {
  return enabled;
}

export function setMusicEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // not persisted — the setting still applies for this session
  }
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(on ? MASTER_GAIN : 0, ctx.currentTime + 0.4);
  if (on) {
    void ctx.resume();
    if (timer === undefined) scheduleBars();
  } else if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
}

// Starts the soundtrack on first call and does nothing on every call after
// that, so restarting a level never restarts the music.
export function startMusic(scene: Phaser.Scene): void {
  if (ctx) {
    if (enabled) void ctx.resume();
    return;
  }

  // Phaser's own audio context is already unlocked by the first tap or key
  // press, so reusing it avoids the browser's autoplay block.
  const manager = scene.sound as Phaser.Sound.WebAudioSoundManager;
  const shared = manager && 'context' in manager ? manager.context : undefined;
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!shared && !AudioCtor) return;
  ownsContext = !shared;
  ctx = shared ?? new AudioCtor!();

  master = ctx.createGain();
  master.gain.value = enabled ? MASTER_GAIN : 0;
  master.connect(ctx.destination);

  startWind();
  bar = 0;
  nextBarTime = ctx.currentTime + 0.15;
  if (enabled) {
    void ctx.resume();
    scheduleBars();
  }
}

// Wind in the leaves: looping noise through a gentle band-pass, slowly
// swelling and fading so it never sits still.
function startWind(): void {
  if (!ctx || !master) return;
  const length = Math.floor(ctx.sampleRate * 4);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    // Low-passed white noise sounds like leaves rather than static
    last = last * 0.94 + (Math.random() * 2 - 1) * 0.06;
    data[i] = last * 3;
  }
  // Cross-fade the buffer into itself so the loop point stays inaudible
  const fade = Math.floor(ctx.sampleRate * 0.3);
  for (let i = 0; i < fade; i++) {
    const t = i / fade;
    data[i] = data[i] * t + data[length - fade + i] * (1 - t);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.7;

  const gain = ctx.createGain();
  gain.gain.value = 0.05;

  const swell = ctx.createOscillator();
  swell.frequency.value = 0.06;
  const swellDepth = ctx.createGain();
  swellDepth.gain.value = 0.03;
  swell.connect(swellDepth).connect(gain.gain);
  swell.start();

  source.connect(filter).connect(gain).connect(master);
  source.start();
  wind = source;
}

// Keeps roughly two bars scheduled ahead of the playhead
function scheduleBars(): void {
  if (!ctx || !master || !enabled) return;
  // A backgrounded tab throttles the timer; catch up instead of firing a pile
  // of overdue bars at once.
  if (nextBarTime < ctx.currentTime) nextBarTime = ctx.currentTime + 0.1;
  while (nextBarTime < ctx.currentTime + 2 * BAR_SECONDS) {
    playBar(PROGRESSION[bar % PROGRESSION.length], nextBarTime, bar);
    bar++;
    nextBarTime += BAR_SECONDS;
  }
  timer = window.setTimeout(scheduleBars, BAR_SECONDS * 500);
}

function playBar(chord: number[], at: number, index: number): void {
  const [bass, ...voices] = chord;
  tone(midiToFreq(bass), at, BAR_SECONDS + 0.6, 0.1, 'sine', 1.4);
  for (const note of voices) {
    tone(midiToFreq(note), at, BAR_SECONDS + 0.6, 0.045, 'triangle', 1.6);
    // A second, slightly detuned voice widens the pad
    tone(midiToFreq(note) * 1.004, at, BAR_SECONDS + 0.6, 0.03, 'triangle', 1.6);
  }

  // Melody: a handful of notes per bar, and a bar of rest now and then
  if (index % 4 !== 3) {
    const beats = [0, 1, 1.5, 2, 3, 3.5];
    for (const beat of beats) {
      if (Math.random() > 0.42) continue;
      const note = MELODY_NOTES[Math.floor(Math.random() * MELODY_NOTES.length)];
      tone(midiToFreq(note), at + beat, 0.9, 0.07, 'sine', 0.04);
    }
  }

  // One or two bird calls per bar, somewhere in the canopy
  const calls = Math.random() < 0.55 ? 1 : 0;
  for (let i = 0; i < calls; i++) {
    birdCall(at + Math.random() * BAR_SECONDS);
  }
}

// One soft note with a slow attack and a long tail
function tone(
  freq: number,
  at: number,
  duration: number,
  peak: number,
  type: OscillatorType,
  attack: number,
): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.1);
}

// A short whistled chirp of two or three notes
function birdCall(at: number): void {
  if (!ctx || !master) return;
  const notes = 2 + Math.floor(Math.random() * 2);
  const base = 2100 + Math.random() * 1200;
  for (let i = 0; i < notes; i++) {
    const start = at + i * 0.11;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * (1 + i * 0.12), start);
    osc.frequency.exponentialRampToValueAtTime(base * (1.35 + i * 0.12), start + 0.07);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.045, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + 0.14);
  }
}

// Tears the audio graph down again. Phaser's own context is only detached,
// never closed — the game still needs it.
export function stopMusic(): void {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
  wind?.stop();
  wind = undefined;
  master?.disconnect();
  if (ownsContext) void ctx?.close();
  ctx = undefined;
  master = undefined;
}
