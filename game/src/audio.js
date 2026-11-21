// WebAudio chimes for Spot the Difference: every sound is synthesized with
// oscillators — no audio files, no network. The context is created lazily on
// the first user gesture, so autoplay rules never block the game.
let audioCtx = null;
let muted = false;

/** Create (or reuse) the shared AudioContext after a user gesture. */
export function ensureAudio() {
  if (audioCtx === null) {
    try {
      const Ctor = window.AudioContext ?? window.webkitAudioContext;
      audioCtx = Ctor ? new Ctor() : null;
    } catch {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

/** Toggle sound on/off; returns the new muted state. */
export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One short note: oscillator + gain envelope, no files. */
function note(freq, startAt, duration, type, volume) {
  if (muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + startAt);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startAt + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + duration + 0.05);
}

/** A bright two-note chime when a difference is found. */
export function playFoundChime() {
  note(880, 0, 0.18, 'sine', 0.25);
  note(1318.5, 0.09, 0.28, 'sine', 0.22);
}

/** A low buzz when the player clicks somewhere with no difference. */
export function playWrongBuzz() {
  note(160, 0, 0.22, 'sawtooth', 0.12);
  note(110, 0.05, 0.25, 'sawtooth', 0.1);
}

/** A soft blip when a hint lights up. */
export function playHintBlip() {
  note(1046.5, 0, 0.15, 'triangle', 0.18);
}

/** A rising arpeggio when a level is cleared. */
export function playLevelFanfare() {
  note(523.25, 0, 0.2, 'triangle', 0.22);
  note(659.25, 0.12, 0.2, 'triangle', 0.22);
  note(783.99, 0.24, 0.2, 'triangle', 0.22);
  note(1046.5, 0.36, 0.4, 'triangle', 0.24);
}
