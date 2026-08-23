import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { OfflineBanner } from '@/features/pwa/OfflineBanner';

function setOnline(value: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(value);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OfflineBanner', () => {
  it('renders nothing while online', () => {
    setOnline(true);
    const { container } = render(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('appears when the browser goes offline and clears when back online', () => {
    setOnline(true);
    render(<OfflineBanner />);
    expect(screen.queryByRole('status')).toBeNull();

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent(/offline/i);

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
