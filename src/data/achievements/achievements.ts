import type { Achievement } from '@/types';

/** Badge definitions (PRD §9). Criteria are evaluated locally against Progress. */
export const achievements: Achievement[] = [
  {
    id: 'flag-finder',
    name: 'Flag Finder',
    description: 'Master the flags topic.',
    icon: '🚩',
    criteria: { kind: 'topic-mastered', threshold: 1, topic: 'flags' },
    active: true,
  },
  {
    id: 'capital-collector',
    name: 'Capital Collector',
    description: 'Master the capitals topic.',
    icon: '🏙️',
    criteria: { kind: 'topic-mastered', threshold: 1, topic: 'capitals' },
    active: true,
  },
  {
    id: 'continent-explorer',
    name: 'Continent Explorer',
    description: 'Master the continents topic.',
    icon: '🗺️',
    criteria: { kind: 'topic-mastered', threshold: 1, topic: 'continents' },
    active: true,
  },
  {
    id: 'map-master',
    name: 'Map Master',
    description: 'Master finding countries on the map.',
    icon: '📍',
    criteria: { kind: 'topic-mastered', threshold: 1, topic: 'location' },
    active: true,
  },
  {
    id: 'globe-trotter',
    name: 'Globe Trotter',
    description: 'Discover countries on every continent.',
    icon: '🌍',
    criteria: { kind: 'countries-discovered', threshold: 25 },
    active: true,
  },
];
