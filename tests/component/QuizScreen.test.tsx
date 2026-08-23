import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProfileProvider } from '@/app/providers/ProfileProvider';
import { QuizScreen } from '@/features/games/QuizScreen';

function renderQuiz(mode: string) {
  return render(
    <MemoryRouter
      initialEntries={[`/play/${mode}`]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ProfileProvider>
        <Routes>
          <Route path="/play/:mode" element={<QuizScreen />} />
        </Routes>
      </ProfileProvider>
    </MemoryRouter>
  );
}

describe('QuizScreen (continent-challenge)', () => {
  it('shows a question with options and a progress indicator', async () => {
    renderQuiz('continent-challenge');
    expect(await screen.findByText(/question 1 of/i)).toBeInTheDocument();
    // At least a couple of answer options are offered.
    const options = screen.getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  it('gives immediate feedback with an explanation, then advances', async () => {
    const user = userEvent.setup();
    renderQuiz('continent-challenge');
    await screen.findByText(/question 1 of/i);

    // Answer the first option.
    const optionsRegion = document.querySelector('.quiz-options') as HTMLElement;
    const firstOption = within(optionsRegion).getAllByRole('button')[0]!;
    await user.click(firstOption);

    // Feedback (correct or good try) with an explanation and a Next control.
    const status = await screen.findByRole('status');
    expect(status).toBeInTheDocument();
    const next = screen.getByRole('button', { name: /next|see results/i });

    await user.click(next);
    await waitFor(() => {
      expect(screen.getByText(/question 2 of/i)).toBeInTheDocument();
    });
  });

  it('shows a not-found message for an unknown mode', async () => {
    renderQuiz('not-a-real-mode');
    expect(await screen.findByText(/game not found/i)).toBeInTheDocument();
  });
});
