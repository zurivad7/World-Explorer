import { describe, expect, it } from 'vitest';
import { installPlatform, isStandalone } from '@/lib/pwa/platform';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const IPADOS =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36';
const DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

describe('installPlatform', () => {
  it('detects iPhone/iPad as ios', () => {
    expect(installPlatform({ userAgent: IPHONE, maxTouchPoints: 5 })).toBe('ios');
  });

  it('detects iPadOS masquerading as Mac (touch-capable) as ios', () => {
    expect(installPlatform({ userAgent: IPADOS, maxTouchPoints: 5, platform: 'MacIntel' })).toBe('ios');
  });

  it('treats a real touchless Mac as other, not ios', () => {
    expect(installPlatform({ userAgent: IPADOS, maxTouchPoints: 0, platform: 'MacIntel' })).toBe('other');
  });

  it('detects Android', () => {
    expect(installPlatform({ userAgent: ANDROID, maxTouchPoints: 5 })).toBe('android');
  });

  it('falls back to other for desktop', () => {
    expect(installPlatform({ userAgent: DESKTOP, maxTouchPoints: 0 })).toBe('other');
  });
});

describe('isStandalone', () => {
  it('is true when the display-mode is standalone', () => {
    expect(isStandalone({ displayModeStandalone: true })).toBe(true);
  });

  it('is true for iOS navigator.standalone', () => {
    expect(isStandalone({ displayModeStandalone: false, navigatorStandalone: true })).toBe(true);
  });

  it('is false in a normal browser tab', () => {
    expect(isStandalone({ displayModeStandalone: false, navigatorStandalone: false })).toBe(false);
  });
});
