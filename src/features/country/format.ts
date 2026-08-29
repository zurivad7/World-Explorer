/** Human-friendly coordinates, e.g. [48.86, 2.35] -> "48.9°N, 2.4°E". */
export function formatLatLng([lat, lng]: [number, number]): string {
  const ns = `${Math.abs(lat).toFixed(1)}°${lat >= 0 ? 'N' : 'S'}`;
  const ew = `${Math.abs(lng).toFixed(1)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${ns}, ${ew}`;
}
