# Notices & Attributions

World Explorer uses the following third-party data and assets. Their licenses are
retained here as required.

## Country metadata — `world-countries`

Country names, capitals, ISO codes, regions and borders are derived from
[`world-countries`](https://github.com/mledoze/countries).

Licensed under the **Open Database License (ODbL) v1.0**. Any public database, or
works produced from the database, must keep this attribution and remain under the
ODbL. See <https://opendatacommons.org/licenses/odbl/1-0/>.

## Flags — `flag-icons`

Flag images are from [`flag-icons`](https://github.com/lipis/flag-icons) by
Panayiotis Lipiridis, released under the **MIT License**.

```
The MIT License (MIT)
Copyright (c) 2013 Panayiotis Lipiridis

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the above copyright notice and this permission notice being
included in all copies or substantial portions of the Software.
```

## Map geometry — Natural Earth (via `world-atlas`)

Country polygons are derived from [Natural Earth](https://www.naturalearthdata.com/)
via [`world-atlas`](https://github.com/topojson/world-atlas) (110m resolution).
Natural Earth is in the **public domain**; no attribution is legally required, but
we credit it here. Geometry is converted to GeoJSON at build time by
`scripts/build-content.ts` and committed to `src/data/geometry/`.

## Map tiles — OpenStreetMap (optional)

The interactive map renders country polygons on a plain background and needs **no
tiles**, so it works fully offline. An OpenStreetMap raster tile layer can be
enabled per-map (`showTiles`); when it is, the required attribution
"© OpenStreetMap contributors" is shown by Leaflet's attribution control. Tiles
are off by default, keeping the app free of third-party tile requests unless
explicitly enabled.
