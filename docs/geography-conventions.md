# Geography Conventions

Documented rules for how World Explorer assigns geography, so content stays
consistent and defensible (PRD §7.3, §15). When a country could reasonably be
placed in more than one continent, or a fact is contested, the choice is made
here — not ad hoc in the data or the UI.

## Sources

- **Country metadata** (name, capital, ISO codes, region, subregion, borders):
  [`world-countries`](https://www.npmjs.com/package/world-countries), licensed
  under the **Open Database License (ODbL)**.
- **Flags**: [`flag-icons`](https://github.com/lipis/flag-icons) by Panayiotis
  Lipiridis, **MIT** licensed. Flag images themselves are public-domain national
  flags.
- Both are pulled at build time by `scripts/build-content.ts`; generated output is
  committed under `src/data/` and `public/assets/flags/`.

Attribution for these sources is retained in `NOTICE.md`.

## Continent assignment

Each country is placed on exactly **one** continent for gameplay, using its
`world-countries` `region` (and `subregion` for the Americas):

| Source `region` | Continent used | Notes |
| --- | --- | --- |
| Europe | Europe | |
| Asia | Asia | |
| Africa | Africa | |
| Oceania | Oceania | |
| Americas + subregion "South America" | South America | |
| Americas + subregion "North America" / "Central America" / "Caribbean" | North America | Central America and the Caribbean are taught here as part of North America. |
| Antarctic | Antarctica | No countries in the MVP slice. |

### Transcontinental countries

Some countries span two continents. For a children's game we teach a single,
commonly-taught primary continent and record the choice explicitly via
`continentOverride` in `src/data/countries/source.ts`:

| Country | Assigned | Rationale |
| --- | --- | --- |
| Russia | **Europe** | Capital (Moscow), most people and history are on the European side; matches how it is usually first taught. |
| Türkiye | **Asia** | `world-countries` region is Asia; the large majority of its land is in Asia. |
| Kazakhstan | **Asia** | Mostly in Central Asia; small European portion west of the Ural River. |
| Egypt | **Africa** | On the African mainland; the Sinai Peninsula is a small Asian portion. |

The game acknowledges the nuance in child-friendly facts (e.g. "Türkiye sits
partly in Europe and partly in Asia") without making it the quiz answer.

## Capitals

- The first entry in `world-countries` `capital` is used.
- South Africa has three capitals; we teach **Pretoria** (the executive capital)
  as the single answer, and note the others via `CAPITAL_NOTES` (see below).
- **`CAPITAL_NOTES`** (`source.ts`, iso2 → note) is authored, reviewed text for
  countries whose capital carries nuance — multiple capitals (South Africa,
  Bolivia) or an official capital that differs from the best-known city (Ivory
  Coast). Shown on Country Detail and appended to that country's capital-quiz
  explanation. Never fabricated; present only where written.
- **`CAPITAL_TRAP_CITIES`** (`source.ts`, iso2 → city names) is authored, reviewed
  list of famous cities **commonly mistaken for the capital** but which are not
  (e.g. Lagos for Nigeria, Abidjan for Ivory Coast, Johannesburg for South Africa).
  Used only as teachable distractors in the capital quiz. The generator drops any
  entry that equals the real capital, so a correct answer is never offered twice.

## Reasoning games (THINK pillar)

- **Odd One Out** shows four countries where three share one clear trait
  (continent, landlocked/coast, or hemisphere) and one does not; the explanation
  always states the intended grouping, since alternative groupings can exist.
- **Find the Lie** (two truths and a lie) shows two verifiable true statements and
  one false one about a country. The lie is always about a **different** attribute
  than the two truths (so a true "capital is X" never sits beside a false capital
  claim), and each lie is generated from real data with its correction shown.
- Both use the **reasoning** topic and are generated deterministically at build
  time from country data — never fabricated. They are `medium` difficulty (ages 8+).
- Odd One Out rotates through **continent / currency / language / hemisphere**
  traits (landlocked/coast is only a rare fallback), so the questions stay varied.
- **In Common** shows three countries (their flags via `subjectIds`) and asks what
  they share. Exactly one option is true of all three (they share a continent,
  currency, or language); the three distractors are statements **guaranteed false**
  for every country in the group — a continent none is in, a currency none uses, or
  a language none speaks — so there is always a single correct answer. The trait is
  rotated by index for variety. Uses the **reasoning** topic, `medium` difficulty.

## Distance (LOCATE pillar)

- **Closest Country** asks which of four options is nearest to an anchor country,
  using a great-circle (haversine) distance between country `latlng` points.
  Direct neighbours are excluded (so it tests distance intuition, not borders) and
  the three distractors are spread across clearly-further countries so the nearest
  is unambiguous. Uses the **location** topic.

## Country shapes (Shape Detective)

- The **Shape Detective** game shows a country's outline only — no basemap, labels
  or neighbours — and asks the player to name it from four options.
- Silhouettes are generated at build time (`scripts/build-content.ts`) into
  `src/data/geometry/shapes.generated.json` as normalized SVG paths. Each is the
  country's **largest landmass** (so the USA is its contiguous mainland and France
  is metropolitan France — outlying territories are dropped for recognizability),
  projected with a cos(latitude) longitude correction and lightly simplified.
  Countries split across multiple source features (e.g. Australia) are de-duplicated
  by keeping the largest piece.
- Only countries with a land area ≥ 50,000 km² get a silhouette (mirrors the Find It
  threshold), so shapes stay recognizable. Questions use the **shapes** topic.

## Pronunciation audio

- Country names and capitals carry a "hear it" button that uses the browser's
  built-in **Web Speech API** (`src/lib/speech.ts`) — client-side, no external
  service (PRD §17), using the device's own voices so it works offline where the
  platform provides them. Feature-detected: the button renders only where speech
  is supported and never blocks the UI if a voice is missing.

## Neighbours

- `neighbours[]` holds country **ids** (lowercased ISO 3166-1 alpha-2).
- Only neighbours **within the dataset** are stored, so every reference resolves
  (referential integrity, enforced by `validate:content`). With the full
  independent-country set, neighbour graphs are now essentially complete.

## Dataset scope

- The dataset now covers **all independent countries** in `world-countries`
  (those with `independent: true`, a capital and a flag) — ~194 countries.
- Country **metadata** (name, capital, continent, region, neighbours) comes from
  the reviewed `world-countries` open dataset. Child-facing **facts** are authored
  and reviewed per country and are **optional** — only the originally-curated set
  has them so far; the rest show metadata only until facts are written. No facts
  are AI-generated (PRD §4).
- Each country also carries verifiable **"good to know"** fields from
  `world-countries`: land **area**, **currency**, **language(s)**, **landlocked**
  status, international **calling code**, internet **top-level domain** (e.g. `.fr`),
  and **demonym**. A **major river** is an **authored, reviewed** field
  (`NOTABLE_RIVERS` in `source.ts`) shown only where written — there is no reliable
  open dataset for it, so it is never fabricated.
- These fields also feed a **`good-to-know`** question category (language, currency,
  dialing code, domain) generated per country. It has no Game Hub card of its own —
  it adds variety to the **per-country quiz** and the **daily challenge** so those
  are less repetitive. Distractors are drawn from other countries' real values.
- Map geometry uses Natural Earth **50m** resolution, which draws a polygon for
  every country in the dataset except Tuvalu. Any country without a polygon (only
  Tuvalu at present) still appears everywhere else — in Explore, the games and
  Country Detail — and on the map it is shown by a **location pin** at its
  representative `latlng` point rather than a drawn shape.

## Disputed territories & naming

- Country names follow `world-countries` common names (e.g. "Türkiye").
- Expanding to the full independent-country set brings in geopolitically sensitive
  cases. The MVP presents neutral metadata only (name, capital, continent), makes
  no sovereignty claims, and includes no facts for these unless authored/reviewed.
- **Before public launch**, content undergoes a review pass (PRD §22, §35) — now
  covering the full set — checking that no name, inclusion or fact is politically
  contentious for the target markets, and confirming the children's-privacy review.

## Changing a convention

Update this document **and** the relevant `continentOverride` / data in the same
change, then run `npm run build:content && npm run validate:content`. Never encode
a one-off exception directly in a UI component.
