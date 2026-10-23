// Web Audio API chime generator (no external files needed, 100% reliable)
let audioCtx: AudioContext | null = null;
let soundMuted = false;

export function setSoundMuted(muted: boolean) {
  soundMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fgn_sound_muted', muted ? 'true' : 'false');
  }
}

export function isSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fgn_sound_muted') === 'true' || soundMuted;
  }
  return soundMuted;
}

export function playLivePostulationSound() {
  if (isSoundMuted()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Pleasant two-tone chime (F5 -> A5)
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now); // F5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.28); // C6

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.65);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  } catch (e) {
    // Audio may be blocked by browser autoplay policy before user interaction
    console.warn('Audio chime notice:', e);
  }
}
