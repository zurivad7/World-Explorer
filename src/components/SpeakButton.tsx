import { speak, speechSupported } from '@/lib/speech';

interface SpeakButtonProps {
  /** The exact text to pronounce. */
  text: string;
  /** Friendly name for the accessible label; defaults to `text`. */
  label?: string;
  /** BCP-47 language tag for voice selection (defaults to en-US). */
  lang?: string;
}

/**
 * A small "hear it" button that speaks `text` aloud. Renders nothing when the
 * browser has no speech support, so callers can place it unconditionally.
 */
export function SpeakButton({ text, label, lang }: SpeakButtonProps) {
  if (!speechSupported()) return null;
  const name = label ?? text;
  return (
    <button
      type="button"
      className="speak-button"
      aria-label={`Hear how to say ${name}`}
      title={`Hear “${name}”`}
      onClick={() => speak(text, lang)}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  );
}
