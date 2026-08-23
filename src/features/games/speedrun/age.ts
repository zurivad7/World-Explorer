import type { AgeBand } from '@/types';

/** Speed Run is an extra challenge for ages 8 and up (the 5–7 band is excluded). */
export function isSpeedRunAllowed(ageBand: AgeBand | undefined): boolean {
  return ageBand === '8-10' || ageBand === '11-13';
}
