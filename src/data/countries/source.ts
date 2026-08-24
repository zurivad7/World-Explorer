import type { Continent } from '@/types';

/**
 * Curated author-side source for the 50-country MVP slice (PRD §24).
 *
 * Only *authored* content lives here: which countries are in the slice, their
 * child-friendly facts, and a few teaching hints. Factual metadata (name,
 * capital, iso3, region/subregion, borders) is pulled from `world-countries`
 * by scripts/build-content.ts — we do not re-type it here (PRD §15: use ISO
 * codes as stable identifiers, keep content maintainable).
 *
 * `continentOverride` documents a deliberate teaching choice for
 * transcontinental cases; see docs/geography-conventions.md.
 *
 * `mapSize` and `similarFlag` are difficulty hints consumed by the question
 * generator (larger/well-known = easier; small or look-alike flags = harder).
 */
export interface CountrySource {
  iso2: string;
  facts: [string, string];
  mapSize: 'large' | 'medium' | 'small';
  /** True for flags that are easily confused with another country's (raises flag difficulty). */
  similarFlag?: boolean;
  continentOverride?: Continent;
}

export const COUNTRY_SOURCES: CountrySource[] = [
  // ---- Africa (10) ----
  {
    iso2: 'eg',
    mapSize: 'large',
    facts: [
      'Egypt is home to the ancient pyramids of Giza.',
      'The River Nile, one of the longest rivers on Earth, flows through Egypt.',
    ],
  },
  {
    iso2: 'za',
    mapSize: 'large',
    facts: [
      'South Africa has three capital cities, not just one.',
      'You can see lions, elephants and rhinos in its national parks.',
    ],
  },
  {
    iso2: 'ng',
    mapSize: 'large',
    facts: [
      'Nigeria has more people than any other country in Africa.',
      'Its film industry is nicknamed "Nollywood".',
    ],
  },
  {
    iso2: 'ke',
    mapSize: 'medium',
    facts: [
      'Kenya is famous for the great migration of wildebeest and zebras.',
      'Long-distance runners from Kenya win races all over the world.',
    ],
  },
  {
    iso2: 'ma',
    mapSize: 'medium',
    facts: [
      'Morocco sits in the northwest corner of Africa, close to Europe.',
      'The Sahara, the largest hot desert, reaches into Morocco.',
    ],
  },
  {
    iso2: 'et',
    mapSize: 'large',
    facts: [
      'Ethiopia is one of the oldest countries in the world.',
      'It has its own alphabet and its own calendar.',
    ],
  },
  {
    iso2: 'gh',
    mapSize: 'medium',
    facts: [
      'Ghana was the first country in Africa south of the Sahara to become independent.',
      'Cocoa beans for chocolate are an important crop in Ghana.',
    ],
  },
  {
    iso2: 'sn',
    mapSize: 'medium',
    similarFlag: true,
    facts: [
      'Senegal is the westernmost country on the African mainland.',
      'Its flag has a green star in the middle, a little like Mali next door.',
    ],
  },
  {
    iso2: 'ml',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Mali is a large country in West Africa, mostly covered by desert.',
      'The city of Timbuktu in Mali was once a famous centre of learning.',
    ],
  },
  {
    iso2: 'tz',
    mapSize: 'large',
    facts: [
      'Tanzania has Mount Kilimanjaro, the highest mountain in Africa.',
      'The island of Zanzibar is part of Tanzania.',
    ],
  },

  // ---- Asia (11) ----
  {
    iso2: 'jp',
    mapSize: 'medium',
    facts: [
      'Japan is made up of thousands of islands.',
      'Mount Fuji is the highest mountain in Japan.',
    ],
  },
  {
    iso2: 'cn',
    mapSize: 'large',
    facts: [
      'China has the longest wall ever built, the Great Wall.',
      'Giant pandas live in the bamboo forests of China.',
    ],
  },
  {
    iso2: 'in',
    mapSize: 'large',
    facts: [
      'India is the most populated country in the world.',
      'The Taj Mahal in India is a famous white marble building.',
    ],
  },
  {
    iso2: 'id',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Indonesia is a country of more than seventeen thousand islands.',
      'Its red-and-white flag looks almost the same as Monaco and Poland.',
    ],
  },
  {
    iso2: 'tr',
    mapSize: 'large',
    facts: [
      'Türkiye sits partly in Europe and partly in Asia.',
      'The city of Istanbul spreads across two continents.',
    ],
  },
  {
    iso2: 'sa',
    mapSize: 'large',
    facts: [
      'Saudi Arabia is mostly covered by hot, sandy desert.',
      'It has some of the largest oil supplies in the world.',
    ],
  },
  {
    iso2: 'th',
    mapSize: 'medium',
    facts: [
      'Thailand is famous for its temples and elephants.',
      'It is the only country in Southeast Asia never ruled by Europeans.',
    ],
  },
  {
    iso2: 'vn',
    mapSize: 'medium',
    facts: [
      'Vietnam is a long, thin country shaped a bit like the letter S.',
      'Rice grows in flooded fields called paddies all over Vietnam.',
    ],
  },
  {
    iso2: 'kr',
    mapSize: 'small',
    facts: [
      'South Korea is known around the world for K-pop music.',
      'Its capital, Seoul, is a huge, busy city full of technology.',
    ],
  },
  {
    iso2: 'kz',
    mapSize: 'large',
    facts: [
      'Kazakhstan is the largest country that has no coastline on the ocean.',
      'It has wide, grassy plains called steppes.',
    ],
  },
  {
    iso2: 'il',
    mapSize: 'small',
    facts: [
      'Israel is a small country at the eastern end of the Mediterranean Sea.',
      'The Dead Sea there is so salty you can float on top of it.',
    ],
  },

  // ---- Europe (12) ----
  {
    iso2: 'fr',
    mapSize: 'medium',
    facts: [
      'The Eiffel Tower in Paris is over 300 metres tall.',
      'France has coastlines on both the Atlantic Ocean and the Mediterranean Sea.',
    ],
  },
  {
    iso2: 'de',
    mapSize: 'medium',
    facts: [
      'Germany is in the middle of Europe and borders nine countries.',
      'It is famous for fairy-tale castles and car making.',
    ],
  },
  {
    iso2: 'it',
    mapSize: 'medium',
    similarFlag: true,
    facts: [
      'Italy is shaped like a boot kicking a ball.',
      'Its green-white-red flag is easy to mix up with Mexico and Ireland.',
    ],
  },
  {
    iso2: 'es',
    mapSize: 'medium',
    facts: [
      'Spain shares a peninsula with Portugal in southwest Europe.',
      'The tomato-throwing festival "La Tomatina" happens in Spain.',
    ],
  },
  {
    iso2: 'gb',
    mapSize: 'medium',
    facts: [
      'The United Kingdom is made up of four parts, including England and Scotland.',
      'London, its capital, has a famous clock tower nicknamed Big Ben.',
    ],
  },
  {
    iso2: 'nl',
    mapSize: 'small',
    similarFlag: true,
    facts: [
      'Much of the Netherlands is below sea level, protected by walls and dikes.',
      'Its red-white-blue flag looks a lot like Russia and Luxembourg.',
    ],
  },
  {
    iso2: 'se',
    mapSize: 'large',
    facts: [
      'Sweden is a long country in northern Europe with many lakes and forests.',
      'In the far north the sun barely sets in summer.',
    ],
  },
  {
    iso2: 'no',
    mapSize: 'large',
    facts: [
      'Norway has deep sea inlets called fjords carved by ancient ice.',
      'You can sometimes see the colourful northern lights in its sky.',
    ],
  },
  {
    iso2: 'pl',
    mapSize: 'medium',
    facts: [
      'Poland is in central Europe and has a long history.',
      'The scientist who studied the stars, Copernicus, came from Poland.',
    ],
  },
  {
    iso2: 'gr',
    mapSize: 'medium',
    facts: [
      'Greece has thousands of islands in its warm blue seas.',
      'The very first Olympic Games were held in ancient Greece.',
    ],
  },
  {
    iso2: 'ie',
    mapSize: 'small',
    similarFlag: true,
    facts: [
      'Ireland is a green island famous for its rolling hills.',
      'Its green-white-orange flag can be confused with Italy and Côte d’Ivoire.',
    ],
  },
  {
    iso2: 'ru',
    mapSize: 'large',
    continentOverride: 'Europe',
    facts: [
      'Russia is the largest country in the world by land.',
      'It stretches across two continents and many time zones.',
    ],
  },

  // ---- North America (7) ----
  {
    iso2: 'us',
    mapSize: 'large',
    facts: [
      'The United States has 50 states and a striped-and-starred flag.',
      'The Grand Canyon is a giant valley carved by a river.',
    ],
  },
  {
    iso2: 'ca',
    mapSize: 'large',
    facts: [
      'Canada is the second-largest country in the world.',
      'A red maple leaf sits in the middle of its flag.',
    ],
  },
  {
    iso2: 'mx',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Mexico has ancient pyramids built by the Maya and Aztec peoples.',
      'Its green-white-red flag has an eagle in the centre.',
    ],
  },
  {
    iso2: 'cu',
    mapSize: 'small',
    facts: [
      'Cuba is the largest island in the Caribbean Sea.',
      'Colourful vintage cars are a common sight on its streets.',
    ],
  },
  {
    iso2: 'jm',
    mapSize: 'small',
    facts: [
      'Jamaica is a Caribbean island famous for reggae music.',
      'Its flag is the only national flag with no red, white or blue.',
    ],
  },
  {
    iso2: 'cr',
    mapSize: 'small',
    facts: [
      'Costa Rica is a small country full of rainforests and volcanoes.',
      'It protects huge numbers of plants and animals in its parks.',
    ],
  },
  {
    iso2: 'gt',
    mapSize: 'small',
    facts: [
      'Guatemala is in Central America and has many active volcanoes.',
      'The colourful quetzal bird gives its name to the country’s money.',
    ],
  },

  // ---- South America (6) ----
  {
    iso2: 'br',
    mapSize: 'large',
    facts: [
      'Brazil is the largest country in South America.',
      'The Amazon rainforest covers much of northern Brazil.',
    ],
  },
  {
    iso2: 'ar',
    mapSize: 'large',
    facts: [
      'Argentina is famous for football and a dance called the tango.',
      'The southern tip of Argentina is one of the closest places to Antarctica.',
    ],
  },
  {
    iso2: 'cl',
    mapSize: 'large',
    facts: [
      'Chile is a very long, thin country along the Pacific coast.',
      'The Atacama Desert in Chile is one of the driest places on Earth.',
    ],
  },
  {
    iso2: 'pe',
    mapSize: 'large',
    facts: [
      'Peru is home to the ancient mountain city of Machu Picchu.',
      'Fluffy llamas and alpacas live high in the Andes mountains.',
    ],
  },
  {
    iso2: 'co',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Colombia grows some of the world’s best-known coffee.',
      'Its yellow-blue-red flag is similar to Venezuela and Ecuador.',
    ],
  },
  {
    iso2: 've',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Venezuela has Angel Falls, the highest waterfall in the world.',
      'Its yellow-blue-red flag is easy to confuse with Colombia and Ecuador.',
    ],
  },

  // ---- Oceania (4) ----
  {
    iso2: 'au',
    mapSize: 'large',
    similarFlag: true,
    facts: [
      'Australia is both a country and a continent.',
      'Kangaroos and koalas live only in the wild in Australia.',
    ],
  },
  {
    iso2: 'nz',
    mapSize: 'medium',
    similarFlag: true,
    facts: [
      'New Zealand is made of two main islands and lots of smaller ones.',
      'Its blue flag with stars looks a lot like Australia’s.',
    ],
  },
  {
    iso2: 'fj',
    mapSize: 'small',
    facts: [
      'Fiji is a group of more than 300 islands in the Pacific Ocean.',
      'Warm seas and coral reefs surround its islands.',
    ],
  },
  {
    iso2: 'pg',
    mapSize: 'medium',
    facts: [
      'Papua New Guinea has hundreds of different languages.',
      'Thick rainforests cover much of the country.',
    ],
  },
];

/**
 * Authored, reviewed "major river" per country (iso2 → river name). There is no
 * reliable open dataset for this, so it is hand-written and shown only where
 * present — never fabricated for every country (PRD §4, §15). Labelled "Major
 * river" in the UI rather than claiming a strict superlative.
 */
export const NOTABLE_RIVERS: Record<string, string> = {
  eg: 'Nile',
  za: 'Orange',
  ng: 'Niger',
  ke: 'Tana',
  ma: 'Draa',
  et: 'Blue Nile',
  gh: 'Volta',
  sn: 'Senegal',
  ml: 'Niger',
  tz: 'Rufiji',
  jp: 'Shinano',
  cn: 'Yangtze',
  in: 'Ganges',
  id: 'Kapuas',
  tr: 'Kızılırmak',
  th: 'Chao Phraya',
  vn: 'Mekong',
  kr: 'Han',
  kz: 'Irtysh',
  il: 'Jordan',
  fr: 'Loire',
  de: 'Rhine',
  it: 'Po',
  es: 'Ebro',
  gb: 'Severn',
  nl: 'Rhine',
  se: 'Klarälven',
  no: 'Glomma',
  pl: 'Vistula',
  gr: 'Aliakmon',
  ie: 'Shannon',
  ru: 'Volga',
  us: 'Mississippi',
  ca: 'Mackenzie',
  mx: 'Rio Grande',
  cu: 'Cauto',
  jm: 'Rio Minho',
  gt: 'Motagua',
  br: 'Amazon',
  ar: 'Paraná',
  cl: 'Loa',
  pe: 'Amazon',
  co: 'Magdalena',
  ve: 'Orinoco',
  au: 'Murray',
  nz: 'Waikato',
  fj: 'Rewa',
  pg: 'Sepik',
};

/**
 * Authored, reviewed famous cities that are **often mistaken for the capital** but
 * are not (iso2 → city names). Used only by the capital quiz as tempting, teachable
 * distractors (e.g. Lagos for Nigeria, Abidjan for Ivory Coast). Every entry is a
 * real, well-known city that is NOT that country's taught capital; the generator
 * additionally drops any that happen to equal the capital, so this is always safe.
 */
export const CAPITAL_TRAP_CITIES: Record<string, string[]> = {
  ng: ['Lagos'], // capital Abuja
  ci: ['Abidjan'], // capital Yamoussoukro
  za: ['Johannesburg'], // taught capital Pretoria
  us: ['New York'], // capital Washington D.C.
  br: ['Rio de Janeiro'], // capital Brasília
  au: ['Sydney'], // capital Canberra
  ca: ['Toronto'], // capital Ottawa
  tr: ['Istanbul'], // capital Ankara
  in: ['Mumbai'], // capital New Delhi
  ch: ['Zurich', 'Geneva'], // capital Bern
  nz: ['Auckland'], // capital Wellington
  kz: ['Almaty'], // capital Astana
  mm: ['Yangon'], // capital Naypyidaw
  pk: ['Karachi', 'Lahore'], // capital Islamabad
  ma: ['Casablanca'], // capital Rabat
  tz: ['Dar es Salaam'], // capital Dodoma
  vn: ['Ho Chi Minh City'], // capital Hanoi
  cn: ['Shanghai'], // capital Beijing
  bo: ['La Paz'], // constitutional capital Sucre
  bz: ['Belize City'], // capital Belmopan
  ru: ['Saint Petersburg'], // capital Moscow
  sy: ['Aleppo'], // capital Damascus
  ph: ['Cebu City'], // capital Manila
};

/**
 * Authored, reviewed notes for countries whose capital carries nuance (multiple
 * capitals, or an official capital that differs from the best-known city). Shown on
 * Country Detail and used to enrich the capital quiz explanation (PRD §7.3, §15).
 */
export const CAPITAL_NOTES: Record<string, string> = {
  za: 'South Africa has three capitals: Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial). We use Pretoria.',
  ci: 'Yamoussoukro is the official capital of Ivory Coast, while Abidjan is the largest city and former capital.',
  bo: 'Bolivia has two capitals: Sucre is the constitutional capital and La Paz is the seat of government.',
  ng: 'Abuja became Nigeria’s capital in 1991, replacing the much larger city of Lagos.',
};
