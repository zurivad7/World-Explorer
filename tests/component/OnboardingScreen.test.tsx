import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { getProfile } from '@/lib/storage';

describe('OnboardingScreen', () => {
  it('lets a child pick an age band and start without an account', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProfileProvider>
          <OnboardingScreen />
        </ProfileProvider>
      </MemoryRouter>
    );

    const startButton = screen.getByRole('button', { name: /start exploring/i });
    expect(startButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /ages 8–10/i }));
    expect(startButton).toBeEnabled();

    await user.click(startButton);

    await waitFor(async () => {
      const profile = await getProfile();
      expect(profile?.ageBand).toBe('8-10');
    });
  });
});
