import { countries } from './countries/countries.fixture';
import { questions } from './questions/questions.fixture';
import { achievements } from './achievements/achievements';

export { countries, questions, achievements };
export * from './schema';
export * from './validate';

export function getCountryById(id: string) {
  return countries.find((c) => c.id === id);
}

export function getQuestionsForMode(mode: (typeof questions)[number]['type']) {
  return questions.filter((q) => q.type === mode && q.active);
}
