import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallHelp } from '@/features/pwa/InstallHelp';

/** Build a fake beforeinstallprompt event whose choice resolves to `outcome`. */
function fakeInstallEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome });
  return event;
}

describe('InstallHelp', () => {
  it('shows manual steps and no Install button until a prompt is available', () => {
    render(<InstallHelp />);
    // jsdom's UA is not iOS/Android → generic guidance.
    expect(screen.getByText(/On this device:/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /install app/i })).toBeNull();
  });

  it('offers a one-tap install once the browser fires beforeinstallprompt', async () => {
    const user = userEvent.setup();
    render(<InstallHelp />);

    const event = fakeInstallEvent('accepted');
    act(() => {
      window.dispatchEvent(event);
    });

    const button = await screen.findByRole('button', { name: /install app/i });
    await user.click(button);
    expect(event.prompt).toHaveBeenCalledOnce();
  });
});
