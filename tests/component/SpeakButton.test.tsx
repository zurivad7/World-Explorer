import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpeakButton } from '@/components/SpeakButton';

const realSpeech = (globalThis as { speechSynthesis?: unknown }).speechSynthesis;
const realUtterance = (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance;

function stubSpeech() {
  const speak = vi.fn();
  const cancel = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      lang = '';
      rate = 1;
      constructor(public text: string) {}
    }
  );
  return { speak, cancel };
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (realSpeech !== undefined) vi.stubGlobal('speechSynthesis', realSpeech);
  if (realUtterance !== undefined) vi.stubGlobal('SpeechSynthesisUtterance', realUtterance);
  vi.restoreAllMocks();
});

describe('SpeakButton', () => {
  it('renders nothing when speech is unsupported', () => {
    vi.stubGlobal('speechSynthesis', undefined);
    vi.stubGlobal('SpeechSynthesisUtterance', undefined);
    const { container } = render(<SpeakButton text="Paris" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('speaks the text when supported and clicked', async () => {
    const { speak } = stubSpeech();
    const user = userEvent.setup();
    render(<SpeakButton text="Paris" label="Paris" />);
    const button = screen.getByRole('button', { name: /hear how to say paris/i });
    await user.click(button);
    expect(speak).toHaveBeenCalledOnce();
  });
});
