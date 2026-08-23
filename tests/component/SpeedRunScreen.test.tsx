import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { ProgressProvider } from '@/app/providers/ProgressProvider';
import { SpeedRunScreen } from '@/features/games/speedrun/SpeedRunScreen';
import { createDefaultProfile, resetAll, saveProfile } from '@/lib/storage';
import { countries } from '@/data';
import type { AgeBand } from '@/types';

async function seedProfile(ageBand: AgeBand) {
  await resetAll();
  await saveProfile(createDefaultProfile(ageBand));
}

function renderSpeedRun(kind: string) {
  return render(
    <MemoryRouter
      initialEntries={[`/play/speed/${kind}`]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ProfileProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/play/speed/:kind" element={<SpeedRunScreen />} />
          </Routes>
        </ProgressProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

beforeEach(async () => {
  await resetAll();
});

describe('SpeedRunScreen', () => {
  it('blocks the under-8 age band', async () => {
    await seedProfile('5-7');
    renderSpeedRun('capital');
    expect(await screen.findByText(/aged 8 and up/i)).toBeInTheDocument();
  });

  it('runs a Capital Blitz and scores a correct typed answer', async () => {
    await seedProfile('8-10');
    const user = userEvent.setup();
    renderSpeedRun('capital');

    // Start the 30-second clock.
    await user.click(await screen.findByRole('button', { name: /start the clock/i }));

    // Read which country is being asked, then look up its capital.
    const prompt = document.querySelector('.quiz-prompt')?.textContent ?? '';
    const name = /capital of (.+)\?/i.exec(prompt)?.[1]?.trim();
    expect(name).toBeTruthy();
    const target = countries.find((c) => c.name === name);
    expect(target).toBeDefined();

    await user.type(screen.getByRole('textbox'), target!.capital);
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // Score reflects the correct answer.
    expect(await screen.findByText('✅ 1')).toBeInTheDocument();
  });
});
