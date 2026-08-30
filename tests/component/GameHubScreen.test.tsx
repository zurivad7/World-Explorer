import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { ProgressProvider } from '@/app/providers/ProgressProvider';
import { GameHubScreen } from '@/features/games/GameHubScreen';
import {
  GAME_MODE_META,
  PILLAR_META,
  gameModesForPillar,
} from '@/features/games/gameModes';

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
    expect(GAME_MODE_META).toHaveLength(13);
    for (const meta of GAME_MODE_META) {
      expect(screen.getByText(meta.title)).toBeInTheDocument();
    }
  });

  it('links each card to its game route', () => {
    renderScreen();
    const link = screen.getByText('Flag Detective').closest('a');
    expect(link).toHaveAttribute('href', '/play/flag-detective');
  });

  it('groups every game under exactly one of the five pillars', () => {
    // The pillar sections partition the cards: no card is lost or duplicated.
    const grouped = PILLAR_META.flatMap((p) => gameModesForPillar(p.pillar));
    expect(grouped).toHaveLength(GAME_MODE_META.length);
    expect(new Set(grouped.map((m) => m.mode)).size).toBe(GAME_MODE_META.length);
    for (const meta of GAME_MODE_META) {
      expect(grouped).toContain(meta);
    }
  });

  it('renders the pillar section headings', () => {
    renderScreen();
    for (const pillar of PILLAR_META) {
      if (gameModesForPillar(pillar.pillar).length > 0) {
        expect(screen.getByRole('heading', { name: new RegExp(pillar.title, 'i') })).toBeInTheDocument();
      }
    }
  });
});
