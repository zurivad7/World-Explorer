/**
 * Content validation CLI (PRD §15, §24, §35 release checklist).
 *
 * Runs both structural/referential checks and MVP completeness gates. Exits
 * non-zero on any error so it can gate CI and the production build.
 */
import { achievements, countries } from '../src/data/index.ts';
import { questions } from '../src/data/questions.ts';
import { validateCompleteness, validateContent } from '../src/data/validate.ts';

const input = { countries, questions, achievements };
const structural = validateContent(input);
const completeness = validateCompleteness(input);

const errors = [...structural.errors, ...completeness.errors];
const warnings = [...structural.warnings, ...completeness.warnings];

console.log(
  `Validating content: ${countries.length} countries, ${questions.length} questions, ${achievements.length} achievements`
);

for (const w of warnings) console.warn(`  warning: ${w}`);

if (errors.length > 0) {
  for (const e of errors) console.error(`  error: ${e}`);
  console.error(`\nContent validation FAILED with ${errors.length} error(s).`);
  process.exit(1);
}

console.log(
  `\nContent validation passed${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`
);
