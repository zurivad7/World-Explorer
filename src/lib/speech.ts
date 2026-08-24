/**
 * Pronunciation via the browser's built-in Web Speech API (PRD §17 — no external
 * services). It is entirely client-side and uses the device's own voices, so it
 * works offline where the platform provides them. Feature-detected everywhere and
 * always best-effort: if speech is unavailable it simply does nothing.
 */

export function speechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/** Speak `text` aloud, cancelling anything already being spoken. */
export function speak(text: string, lang = 'en-US'): void {
  if (!speechSupported() || !text.trim()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // a touch slower — easier for children to follow
    synth.speak(utterance);
  } catch {
    // A nice-to-have; never let a speech failure break the UI.
  }
}
