import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProgressProvider } from '@/app/providers/ProgressProvider';
import { GameHubScreen } from '@/features/games/GameHubScreen';
import { GAME_MODE_META } from '@/features/games/gameModes';

function renderScreen() {
  return render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProgressProvider>
        <GameHubScreen />
      </ProgressProvider>
    </MemoryRouter>
  );
}

describe('GameHubScreen', () => {
  it('renders a card for every one of the six game modes', () => {
    renderScreen();
    expect(GAME_MODE_META).toHaveLength(6);
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
