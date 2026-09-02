export const PILLARS = ['Technical', 'Tactical', 'Physical', 'Mental', 'Social'] as const;
export type Pillar = (typeof PILLARS)[number];

export const LEVELS = ['emerging', 'developing', 'consistent', 'advanced'] as const;
export type LevelKey = (typeof LEVELS)[number];

/** 1 = Emerging … 4 = Advanced. Absence of a rating means "not observed". */
export type Rating = 1 | 2 | 3 | 4;

/** Coach workflow step 4: what to do about this skill next. */
export const PRIORITIES = ['high', 'medium', 'maintain'] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Rubric = Record<LevelKey, string>;

export type SubSkill = {
  /** Stable slug, e.g. "technical.first-touch". Never regenerated - scores reference it. */
  id: string;
  pillar: Pillar;
  name: string;
  /** Tabler icon name, from the workbook's Icon column. */
  icon: string;
  /** What good looks like. */
  description: string;
  activities: string[];
  /** Short phrase a coach can say live at practice. */
  coachingCue: string;
  /** Three development actions, verbatim from the workbook. */
  waysToImprove: string[];
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
  rating: Rating;
  /** Workflow step 3: one brief observation supporting the rating. */
  evidence?: string;
  priority?: Priority;
  /** References a Player in the roster (lib/roster.ts). Device-local only. */
  playerId?: string;
  at: string;
};

export const LEVEL_META: Record<
  Rating,
  { key: LevelKey; label: string; anchor: string }
> = {
  1: {
    key: 'emerging',
    label: 'Emerging',
    anchor:
      'Appears rarely or only with substantial support; execution or decision often breaks down even in simple situations.',
  },
  2: {
    key: 'developing',
    label: 'Developing',
    anchor:
      'Appears in controlled or familiar situations but is inconsistent at game speed, under pressure, or without prompts.',
  },
  3: {
    key: 'consistent',
    label: 'Consistent',
    anchor:
      'Demonstrated regularly in game-realistic situations with appropriate execution and limited prompting.',
  },
  4: {
    key: 'advanced',
    label: 'Advanced',
    anchor:
      'Repeated under high pressure, adapted to changing situations, and creates a clear advantage for the player or team.',
  },
};

export const PRIORITY_META: Record<Priority, { label: string; colour: string }> = {
  high: { label: 'High', colour: 'var(--color-priority-high)' },
  medium: { label: 'Medium', colour: 'var(--color-priority-medium)' },
  maintain: { label: 'Maintain', colour: 'var(--color-priority-maintain)' },
};

/**
 * The assessment rules, verbatim from the workbook's Scoring Framework sheet.
 * Surfaced in the app rather than left in the spreadsheet, because they are what
 * stop two coaches scoring the same player differently (BRD risk R-2).
 */
export const SCORING_RULES: { title: string; body: string }[] = [
  {
    title: 'Evidence first',
    body: 'Use game play or representative practice. Record a brief example supporting the score.',
  },
  {
    title: 'No forced score',
    body: 'If you have not seen enough, leave the rating blank rather than guessing.',
  },
  {
    title: 'Context matters',
    body: "Judge the action relative to the player's role, age group, task and pressure - not against another child.",
  },
  {
    title: 'High scores require repetition',
    body: 'A 3 or 4 should be seen repeatedly, not from one isolated successful action.',
  },
  {
    title: 'Interpret 3 correctly',
    body: 'Consistent is already a strong outcome: the behaviour transfers into game-realistic play. A 4 is reserved for repeated, adaptable, advantage-creating execution.',
  },
  {
    title: 'Physical maturity',
    body: 'For speed and endurance, assess mechanics, repeated effort and game application; avoid grading biological maturity.',
  },
  {
    title: 'Development, not ranking',
    body: 'Averages summarise the current profile. They are not a talent grade or a selection ranking.',
  },
];

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
