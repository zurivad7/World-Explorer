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
  as the single answer and may note the others in facts later.

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
- Countries missing from the 110m map geometry (micro-states such as Singapore,
  Monaco, Malta, Vatican, and small island nations) remain fully in the dataset —
  in Explore, the games and Country Detail — but are not drawn on the map (they are
  invisible at world zoom). Higher-resolution geometry can add them later.

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
