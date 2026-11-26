// Audio: all sound is synthesised with WebAudio, no audio files.
export function createAudio() {
  const audio = {
    ctx: null,
    enabled: true,
    engineOsc: null,
    engineGain: null,
    windGain: null,
    started: false,
  };

  audio.ensure = function ensure() {
    if (audio.ctx || !audio.enabled) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
      audio.engineOsc = audio.ctx.createOscillator();
      audio.engineOsc.type = 'sawtooth';
      audio.engineOsc.frequency.value = 70;
      const filter = audio.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 420;
      audio.engineGain = audio.ctx.createGain();
      audio.engineGain.gain.value = 0.0;
      audio.engineOsc.connect(filter);
      filter.connect(audio.engineGain);
      audio.engineGain.connect(audio.ctx.destination);
      audio.engineOsc.start();
      audio.windGain = audio.ctx.createGain();
      audio.windGain.gain.value = 0.0;
      audio.windGain.connect(audio.ctx.destination);
      audio.started = true;
    } catch (err) {
      audio.ctx = null;
    }
  };

  audio.setEngine = function setEngine(throttle, speed) {
    if (!audio.ctx || !audio.engineOsc) return;
    const t = audio.ctx.currentTime;
    audio.engineOsc.frequency.setTargetAtTime(55 + throttle * 75 + speed * 0.12, t, 0.1);
    audio.engineGain.gain.setTargetAtTime(audio.enabled ? 0.035 + throttle * 0.05 : 0, t, 0.1);
  };

  audio.beep = function beep(freq, dur, type, vol) {
    if (!audio.ctx || !audio.enabled) return;
    try {
      const o = audio.ctx.createOscillator();
      const g = audio.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq || 880;
      g.gain.setValueAtTime(vol || 0.12, audio.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.ctx.currentTime + (dur || 0.15));
      o.connect(g);
      g.connect(audio.ctx.destination);
      o.start();
      o.stop(audio.ctx.currentTime + (dur || 0.15));
    } catch (err) { /* sound is optional */ }
  };

  audio.ringChime = function ringChime() {
    audio.beep(880, 0.18, 'sine', 0.16);
    setTimeout(() => audio.beep(1320, 0.25, 'sine', 0.14), 90);
  };

  audio.crashThud = function crashThud() {
    audio.beep(90, 0.5, 'square', 0.2);
    setTimeout(() => audio.beep(55, 0.6, 'sawtooth', 0.16), 80);
  };

  audio.landChime = function landChime() {
    [523, 659, 784].forEach((f, i) => setTimeout(() => audio.beep(f, 0.3, 'triangle', 0.15), i * 130));
  };

  audio.toggle = function toggle() {
    audio.enabled = !audio.enabled;
    if (audio.engineGain && audio.ctx) {
      audio.engineGain.gain.setTargetAtTime(audio.enabled ? 0.05 : 0, audio.ctx.currentTime, 0.05);
    }
    return audio.enabled;
  };

  return audio;
}
