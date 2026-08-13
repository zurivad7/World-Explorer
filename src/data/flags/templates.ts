/**
 * Authored simplified-flag templates for the Flag Builder game (PRD §7.6).
 *
 * MVP uses controlled templates (ordered colour bands), not a general vector
 * editor. Only flags that reduce cleanly to coloured stripes are included; flags
 * with emblems, stars or complex charges are left out of Flag Builder for now.
 * Colours are authored and reviewed here.
 */
export interface FlagTemplate {
  countryId: string;
  orientation: 'vertical' | 'horizontal';
  /** Ordered colour bands (left→right for vertical, top→bottom for horizontal). */
  stripes: string[];
}

export const FLAG_TEMPLATES: FlagTemplate[] = [
  { countryId: 'fr', orientation: 'vertical', stripes: ['blue', 'white', 'red'] },
  { countryId: 'it', orientation: 'vertical', stripes: ['green', 'white', 'red'] },
  { countryId: 'ie', orientation: 'vertical', stripes: ['green', 'white', 'orange'] },
  { countryId: 'ng', orientation: 'vertical', stripes: ['green', 'white', 'green'] },
  { countryId: 'pe', orientation: 'vertical', stripes: ['red', 'white', 'red'] },
  { countryId: 'de', orientation: 'horizontal', stripes: ['black', 'red', 'gold'] },
  { countryId: 'nl', orientation: 'horizontal', stripes: ['red', 'white', 'blue'] },
  { countryId: 'ru', orientation: 'horizontal', stripes: ['white', 'blue', 'red'] },
  { countryId: 'id', orientation: 'horizontal', stripes: ['red', 'white'] },
  { countryId: 'pl', orientation: 'horizontal', stripes: ['white', 'red'] },
  { countryId: 've', orientation: 'horizontal', stripes: ['yellow', 'blue', 'red'] },
  { countryId: 'co', orientation: 'horizontal', stripes: ['yellow', 'blue', 'red'] },
];
