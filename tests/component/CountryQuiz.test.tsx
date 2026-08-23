import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { ProgressProvider } from '@/app/providers/ProgressProvider';
import { QuizScreen } from '@/features/games/QuizScreen';

function renderCountryQuiz(countryId: string) {
  return render(
    <MemoryRouter
      initialEntries={[`/play/country/${countryId}`]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ProfileProvider>
        <ProgressProvider>
          <Routes>
            <Route path="/play/country/:countryId" element={<QuizScreen />} />
          </Routes>
        </ProgressProvider>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('QuizScreen (per-country)', () => {
  it('builds a quiz for a real country and titles it after that country', async () => {
    renderCountryQuiz('fr');
    expect(await screen.findByRole('heading', { name: /france quiz/i })).toBeInTheDocument();
    expect(await screen.findByText(/question 1 of/i)).toBeInTheDocument();
  });

  it('shows a not-found message for an unknown country', async () => {
    renderCountryQuiz('zz');
    expect(await screen.findByText(/game not found/i)).toBeInTheDocument();
  });
});
