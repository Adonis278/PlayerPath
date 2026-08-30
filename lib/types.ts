export const PILLARS = ['Technical', 'Tactical', 'Physical', 'Mental', 'Social'] as const;
export type Pillar = (typeof PILLARS)[number];

export const LEVELS = ['emerging', 'developing', 'consistent', 'advanced'] as const;
export type LevelKey = (typeof LEVELS)[number];

/** 1 = Emerging … 4 = Advanced */
export type LevelValue = 1 | 2 | 3 | 4;

export type WayToImprove = { problem: string; fix: string };

export type Rubric = Record<LevelKey, string>;

export type SubSkill = {
  /** Stable slug, e.g. "technical.first-touch". Never regenerated — scores reference it. */
  id: string;
  pillar: Pillar;
  name: string;
  /** What good looks like at ages 9-12. */
  description: string;
  /** 2-3 practice activities. */
  activities: string[];
  /** Short phrase a coach can shout during practice. */
  coachingCue: string;
  /** Exactly 3 problem -> fix pairs. */
  waysToImprove: WayToImprove[];
  rubric: Rubric;
};

export type ContentDoc = {
  version: number;
  updatedAt: string;
  subSkills: SubSkill[];
};

export type Score = {
  id: string;
  subSkillId: string;
  level: LevelValue;
  /** Optional. Jersey number encouraged over a name — see NFR-6. */
  playerLabel?: string;
  at: string;
};

export const LEVEL_META: Record<
  LevelValue,
  { key: LevelKey; label: string; blurb: string }
> = {
  1: { key: 'emerging', label: 'Emerging', blurb: 'Not yet — still learning the basics' },
  2: { key: 'developing', label: 'Developing', blurb: 'Can do it unpressured or standing still' },
  3: { key: 'consistent', label: 'Consistent', blurb: 'Reliable while moving, low pressure' },
  4: { key: 'advanced', label: 'Advanced', blurb: 'Holds up under real match pressure' },
};

export const PILLAR_META: Record<
  Pillar,
  { blurb: string; accent: string; tint: string; img: string }
> = {
  Technical: {
    blurb: 'What the player can do with the ball',
    accent: '#1D4ED8',
    tint: '#EFF4FF',
    img: '/img/technical.jpg',
  },
  Tactical: {
    blurb: 'Reading the game and choosing well',
    accent: '#7C3AED',
    tint: '#F5F0FF',
    img: '/img/tactical.jpg',
  },
  Physical: {
    blurb: 'How the body moves and lasts',
    accent: '#C2410C',
    tint: '#FFF3EC',
    img: '/img/physical.jpg',
  },
  Mental: {
    blurb: 'Mindset, focus and bouncing back',
    accent: '#047857',
    tint: '#ECFDF5',
    img: '/img/mental.jpg',
  },
  Social: {
    blurb: 'Being a teammate worth having',
    accent: '#B45309',
    tint: '#FFFAEB',
    img: '/img/social.jpg',
  },
};
