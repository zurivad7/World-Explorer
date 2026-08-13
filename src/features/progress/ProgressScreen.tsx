import { Screen } from '@/components/Screen';

/** S10 Progress — topic strengths, practice suggestions, recent activity (PRD §13). Wired in Phase 5. */
export function ProgressScreen() {
  return (
    <Screen title="My Progress" subtitle="See what you're great at and what to practise next.">
      <p className="empty-state">
        Play some games and your topic strengths and recent activity will show up here.
      </p>
    </Screen>
  );
}
