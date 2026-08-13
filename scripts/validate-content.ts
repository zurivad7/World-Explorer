/**
 * Content validation CLI (PRD §15, §35 release checklist).
 *
 * Run with `npm run validate:content`. Exits non-zero on any error so it can
 * gate CI and the production build. Warnings are printed but do not fail in
 * Phase 0 (the seed slice is deliberately small); later phases tighten this.
 */
import { achievements, countries, questions, validateContent } from '../src/data/index.ts';

const { errors, warnings } = validateContent({ countries, questions, achievements });

console.log(
  `Validating content: ${countries.length} countries, ${questions.length} questions, ${achievements.length} achievements`
);

for (const w of warnings) console.warn(`  warning: ${w}`);

if (errors.length > 0) {
  for (const e of errors) console.error(`  error: ${e}`);
  console.error(`\nContent validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(`\nContent validation passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`);
