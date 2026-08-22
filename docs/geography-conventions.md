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
- Only neighbours **within the 50-country slice** are stored, so every reference
  resolves (referential integrity, enforced by `validate:content`). As the dataset
  grows toward full coverage, neighbour graphs fill in automatically.

## Disputed territories & naming

- The MVP slice deliberately uses widely-recognised sovereign states to avoid
  disputed cases in child-facing content.
- Country names follow `world-countries` common names (e.g. "Türkiye").
- Before public launch, content undergoes a review pass (PRD §22, §35), including
  a check that no fact or naming choice is politically contentious for the target
  markets.

## Changing a convention

Update this document **and** the relevant `continentOverride` / data in the same
change, then run `npm run build:content && npm run validate:content`. Never encode
a one-off exception directly in a UI component.
