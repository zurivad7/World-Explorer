import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CountrySilhouette } from '@/components/CountrySilhouette';

describe('CountrySilhouette', () => {
  it('renders an SVG outline for a country that has a silhouette', () => {
    // France is a large mainland country, so it has a generated silhouette.
    const { container } = render(<CountrySilhouette id="fr" />);
    const svg = container.querySelector('svg.country-silhouette');
    expect(svg).not.toBeNull();
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('d')).toBeTruthy();
    // Does not leak the country name.
    expect(svg?.getAttribute('aria-label')).not.toMatch(/france/i);
  });

  it('renders nothing for a country without a silhouette', () => {
    // Tuvalu has no polygon/silhouette.
    const { container } = render(<CountrySilhouette id="tv" />);
    expect(container).toBeEmptyDOMElement();
  });
});
