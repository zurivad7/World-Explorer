/**
 * Forgiving free-text answer matching for the typed Speed Run modes (no options —
 * the player spells the answer). Kept pure and unit-tested. We accept a match that
 * is right apart from case, accents, punctuation or surrounding whitespace, so a
 * child is not marked wrong for "Brasilia" vs "Brasília" or "Washington" vs
 * "Washington, D.C.".
 */

/** Lowercase, strip accents/diacritics and punctuation, and collapse whitespace. */
export function normalizeAnswer(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // combining marks (accents)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // punctuation → space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * True when `typed` is an acceptable spelling of `answer`. Besides an exact
 * normalized match, the part of the answer before a comma is accepted (so
 * "Washington" matches "Washington, D.C.").
 */
export function answerMatches(typed: string, answer: string): boolean {
  const t = normalizeAnswer(typed);
  if (t.length === 0) return false;
  const candidates = new Set<string>();
  candidates.add(normalizeAnswer(answer));
  const beforeComma = answer.split(',')[0];
  if (beforeComma) candidates.add(normalizeAnswer(beforeComma));
  return candidates.has(t);
}
