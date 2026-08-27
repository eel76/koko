import Phaser from 'phaser';

// Forest music, synthesised at runtime with the Web Audio API — like every
// graphic in this game, the soundtrack ships as code rather than as an asset
// file, so there is nothing to download and no third-party licence involved.
//
// The mood is the deep, mysterious wood: a low drone that never leaves, a
// slow modal pad above it, single bell notes that ring out into a long
// reverb, leaves rustling in gusts, and now and then an owl somewhere out of
// sight.

const KEY = 'koko-run.music';

// Overall level: present in the background without ever competing with the game
const MASTER_GAIN = 1.8;
// Slow: one chord every six seconds, so nothing ever feels in a hurry
const BAR_SECONDS = 6;

// D Aeolian with a Phrygian ♭II at the end — minor, modal and deliberately
// without a dominant, so the loop keeps floating instead of resolving.
// [bass, ...pad voices] as MIDI notes.
const PROGRESSION: number[][] = [
  [38, 62, 65, 69, 76], // Dm(add9)
  [34, 62, 65, 69, 74], // B♭maj7
  [31, 58, 62, 69, 74], // Gm9
  [39, 55, 58, 62, 74], // E♭maj7 — the ♭II that darkens the turn back to Dm
];
// The drone under all of it: D fits every chord above (root, third, fifth, seventh)
const DRONE_NOTES = [26, 38];
// D minor pentatonic — mysterious over every chord, and never a wrong note
const MELODY_NOTES = [74, 77, 79, 81, 84];

const midiToFreq = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12);
const rand = (min: number, max: number): number => min + Math.random() * (max - min);

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let reverbSend: GainNode | undefined;
let noise: AudioBuffer | undefined;
// Everything that runs for as long as the music does and has to be stopped again
let sustained: (AudioScheduledSourceNode | undefined)[] = [];
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

  buildReverb();
  noise = makeNoise(4);
  startDrone();
  startAirBed();
  bar = 0;
  nextBarTime = ctx.currentTime + 0.15;
  if (enabled) {
    void ctx.resume();
    scheduleBars();
  }
}

// A long, dark tail that everything melodic is sent into. The impulse
// response is generated noise with an exponential decay, smoothed so the
// reverb sounds like a hollow in the woods rather than like a bright hall.
function buildReverb(): void {
  if (!ctx || !master) return;
  const seconds = 3.6;
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    let last = 0;
    for (let i = 0; i < length; i++) {
      // The running average takes the top off: a darker, softer tail
      last = last * 0.55 + (Math.random() * 2 - 1) * 0.45;
      data[i] = last * Math.pow(1 - i / length, 2.8);
    }
  }

  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  const wet = ctx.createGain();
  wet.gain.value = 0.9;

  reverbSend = ctx.createGain();
  reverbSend.gain.value = 1;
  reverbSend.connect(convolver).connect(wet).connect(master);
}

// One reusable buffer of white noise for every rustle in the forest
function makeNoise(seconds: number): AudioBuffer | undefined {
  if (!ctx) return undefined;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Stereo where the browser has it, plain routing where it does not
function panned(at: number, position: number): AudioNode | undefined {
  if (!ctx || !master) return undefined;
  if (typeof ctx.createStereoPanner !== 'function') return undefined;
  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(position, at);
  return panner;
}

// The ground of the whole piece: a D far down that never stops. It carries
// the dark and holds the modal chords together.
function startDrone(): void {
  if (!ctx || !master) return;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220;

  const gain = ctx.createGain();
  gain.gain.value = 0.075;
  filter.connect(gain).connect(master);

  // A very slow breath, so the drone never sits completely still
  const breath = ctx.createOscillator();
  breath.frequency.value = 0.035;
  const breathDepth = ctx.createGain();
  breathDepth.gain.value = 0.03;
  breath.connect(breathDepth).connect(gain.gain);
  breath.start();
  sustained.push(breath);

  for (const note of DRONE_NOTES) {
    const osc = ctx.createOscillator();
    osc.type = note < 30 ? 'sine' : 'triangle';
    osc.frequency.value = midiToFreq(note);

    // A slow drift of a few cents: the drone beats gently against itself
    const drift = ctx.createOscillator();
    drift.frequency.value = 0.04 + Math.random() * 0.03;
    const driftDepth = ctx.createGain();
    driftDepth.gain.value = 5;
    drift.connect(driftDepth).connect(osc.detune);
    drift.start();

    const level = ctx.createGain();
    level.gain.value = note < 30 ? 1 : 0.45;
    osc.connect(level).connect(filter);
    osc.start();
    sustained.push(osc, drift);
  }
}

// A thin, high layer of air between the gusts — quiet enough to be felt
// rather than heard, and irregular so it never turns into a hiss.
function startAirBed(): void {
  if (!ctx || !master || !noise) return;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 1800;

  const gain = ctx.createGain();
  gain.gain.value = 0.01;

  // Two LFOs at unrelated speeds: the sum never repeats audibly, so the
  // layer breathes instead of swelling like surf.
  for (const [rate, depth] of [[0.13, 0.006], [0.31, 0.004]]) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = depth;
    lfo.connect(lfoDepth).connect(gain.gain);
    lfo.start();
    sustained.push(lfo);
  }

  source.connect(highpass).connect(gain).connect(master);
  source.start();
  sustained.push(source);
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
  pad(bass, voices, at);

  // Melody: at most a couple of bell notes per bar, and every fourth bar is
  // left almost empty so the reverb has room to die away.
  const beats = index % 4 === 3 ? [1.5] : [0, 1.5, 3, 4.5];
  for (const beat of beats) {
    if (Math.random() > 0.34) continue;
    const note = MELODY_NOTES[Math.floor(Math.random() * MELODY_NOTES.length)];
    bell(midiToFreq(note), at + beat, 0.05);
  }

  // Leaves: two to four gusts per bar, at their own irregular times
  const gusts = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < gusts; i++) leafGust(at + Math.random() * BAR_SECONDS);

  // And now and then, from somewhere in the dark, an owl
  if (Math.random() < 0.22) owlCall(at + rand(0.5, BAR_SECONDS - 1.5));
}

// The chord: two detuned triangles per voice through a filter that opens and
// closes again over the bar, so the pad seems to breathe.
function pad(bass: number, voices: number[], at: number): void {
  if (!ctx || !master) return;
  const duration = BAR_SECONDS + 2.4;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 1.4;
  filter.frequency.setValueAtTime(420, at);
  filter.frequency.linearRampToValueAtTime(1150, at + BAR_SECONDS * 0.55);
  filter.frequency.linearRampToValueAtTime(420, at + duration);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(0.05, at + 2.2);
  gain.gain.setValueAtTime(0.05, at + BAR_SECONDS - 0.6);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  filter.connect(gain).connect(master);
  if (reverbSend) {
    const send = ctx.createGain();
    send.gain.value = 0.25;
    gain.connect(send).connect(reverbSend);
  }

  // One slow drift for the whole chord: the pad is never quite in tune with
  // itself, which is most of where the mystery comes from.
  const drift = ctx.createOscillator();
  drift.frequency.value = 0.05;
  const driftDepth = ctx.createGain();
  driftDepth.gain.value = 6;
  drift.connect(driftDepth);
  drift.start(at);
  drift.stop(at + duration + 0.2);

  const bassOsc = ctx.createOscillator();
  bassOsc.type = 'sine';
  bassOsc.frequency.value = midiToFreq(bass);
  const bassGain = ctx.createGain();
  bassGain.gain.value = 1.5;
  bassOsc.connect(bassGain).connect(filter);
  bassOsc.start(at);
  bassOsc.stop(at + duration + 0.2);

  for (const note of voices) {
    for (const cents of [-4, 5]) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = midiToFreq(note);
      osc.detune.value = cents;
      driftDepth.connect(osc.detune);
      const level = ctx.createGain();
      // The higher the voice, the quieter — the pad stays a bed, not a chord
      level.gain.value = 0.5 / (1 + (note - 55) * 0.05);
      osc.connect(level).connect(filter);
      osc.start(at);
      osc.stop(at + duration + 0.2);
    }
  }
}

// A single struck note with inharmonic partials and a long tail, sent deep
// into the reverb: glass and metal rather than a whistle.
function bell(freq: number, at: number, peak: number): void {
  if (!ctx || !master) return;
  const out = ctx.createGain();
  out.gain.value = peak;
  const place = panned(at, rand(-0.5, 0.5));
  if (place) out.connect(place).connect(master);
  else out.connect(master);
  if (reverbSend) {
    const send = ctx.createGain();
    send.gain.value = 1.6;
    out.connect(send).connect(reverbSend);
  }

  const partials: [number, number, number][] = [
    [1, 1, 3.2],
    [2.01, 0.3, 2.0],
    [2.98, 0.14, 1.2],
    [4.97, 0.06, 0.7],
  ];
  for (const [ratio, level, decay] of partials) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq * ratio;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(level, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);

    osc.connect(gain).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.1);
  }
}

// Leaves, not water: a short burst of high, band-passed noise that rises and
// dies away again. Several of them at unrelated times read as a gust running
// through the canopy — the slow, broad swell of the old wind layer was what
// made it sound like surf.
function leafGust(at: number): void {
  if (!ctx || !master || !noise) return;
  const duration = rand(0.9, 2.4);
  const attack = duration * rand(0.25, 0.45);

  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  source.playbackRate.value = rand(0.8, 1.4);

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 1300;

  // The band sweeps upwards and back: the gust comes closer and passes on
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 0.9;
  const centre = rand(2400, 4200);
  band.frequency.setValueAtTime(centre * 0.65, at);
  band.frequency.linearRampToValueAtTime(centre, at + attack);
  band.frequency.linearRampToValueAtTime(centre * 0.7, at + duration);

  const gain = ctx.createGain();
  const peak = rand(0.03, 0.075);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

  const place = panned(at, rand(-0.8, 0.8));
  source.connect(highpass).connect(band).connect(gain);
  if (place) gain.connect(place).connect(master);
  else gain.connect(master);

  source.start(at, Math.random() * 3);
  source.stop(at + duration + 0.1);
}

// Two soft, low hoots with a little vibrato, far back in the reverb
function owlCall(at: number): void {
  if (!ctx || !master) return;
  const base = rand(360, 440);
  for (let i = 0; i < 2; i++) {
    const start = at + i * 0.62;
    const duration = i === 0 ? 0.5 : 0.7;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * (i === 0 ? 1 : 0.94), start);
    osc.frequency.linearRampToValueAtTime(base * (i === 0 ? 0.96 : 0.89), start + duration);

    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 11;
    const vibratoDepth = ctx.createGain();
    vibratoDepth.gain.value = 6;
    vibrato.connect(vibratoDepth).connect(osc.detune);
    vibrato.start(start);
    vibrato.stop(start + duration + 0.1);

    // A breath of noise on top takes the pure sine off the hoot
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.055, start + 0.09);
    gain.gain.setValueAtTime(0.055, start + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    const place = panned(start, rand(-0.6, 0.6));
    osc.connect(gain);
    if (place) gain.connect(place).connect(master);
    else gain.connect(master);
    if (reverbSend) {
      const send = ctx.createGain();
      send.gain.value = 1.2;
      gain.connect(send).connect(reverbSend);
    }

    osc.start(start);
    osc.stop(start + duration + 0.1);
  }
}

// Tears the audio graph down again. Phaser's own context is only detached,
// never closed — the game still needs it.
export function stopMusic(): void {
  if (timer !== undefined) {
    clearTimeout(timer);
    timer = undefined;
  }
  for (const node of sustained) {
    try {
      node?.stop();
    } catch {
      // already stopped — nothing left to do
    }
  }
  sustained = [];
  reverbSend?.disconnect();
  reverbSend = undefined;
  noise = undefined;
  master?.disconnect();
  if (ownsContext) void ctx?.close();
  ctx = undefined;
  master = undefined;
}
