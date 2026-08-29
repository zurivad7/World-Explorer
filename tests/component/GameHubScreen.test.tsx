import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { ProgressProvider } from '@/app/providers/ProgressProvider';
import { GameHubScreen } from '@/features/games/GameHubScreen';
import { GAME_MODE_META } from '@/features/games/gameModes';

function renderScreen() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProfileProvider>
        <ProgressProvider>
          <GameHubScreen />
        </ProgressProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('GameHubScreen', () => {
  it('renders a card for every standalone game mode', () => {
    renderScreen();
    expect(GAME_MODE_META).toHaveLength(11);
    for (const meta of GAME_MODE_META) {
      expect(screen.getByText(meta.title)).toBeInTheDocument();
    }
  });

  it('links each card to its game route', () => {
    renderScreen();
    const link = screen.getByText('Flag Detective').closest('a');
    expect(link).toHaveAttribute('href', '/play/flag-detective');
  });
});
