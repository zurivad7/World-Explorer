import { describe, expect, it } from 'vitest';
import { formatLatLng } from '@/features/country/format';

describe('formatLatLng', () => {
  it('labels north/east as positive and south/west as negative', () => {
    expect(formatLatLng([48.86, 2.35])).toBe('48.9°N, 2.4°E');
    expect(formatLatLng([-33.87, 151.21])).toBe('33.9°S, 151.2°E');
    expect(formatLatLng([40.71, -74.01])).toBe('40.7°N, 74.0°W');
    expect(formatLatLng([-34.6, -58.38])).toBe('34.6°S, 58.4°W');
  });

  it('treats the equator and Prime Meridian as N/E', () => {
    expect(formatLatLng([0, 0])).toBe('0.0°N, 0.0°E');
  });
});
