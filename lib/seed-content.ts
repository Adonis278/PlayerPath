import type { ContentDoc, SubSkill } from "./types";

/**
 * Content from coach_skills_with_player_scoring_framework.xlsx (product owner).
 *
 * Skills sheet -> coaching content; Scoring Framework sheet -> the four rubric
 * anchors per sub-skill, joined on pillar + sub-skill.
 *
 * Regenerate with: node scripts/import-workbook.mjs <file.xlsx>
 * Do not hand-edit - edits belong in the workbook or the in-app admin editor.
 */

const TECHNICAL: SubSkill[] = [
  {
    id: "technical.first-touch",
    pillar: "Technical",
    name: "First touch",
    icon: "arrow-back-up",
    description:
      "Takes the ball out of the air or off the ground into space away from pressure, on both feet.",
    activities: [
      "Rondos with limited touches",
      "gate receiving",
      "receive-turn-play combos",
    ],
    coachingCue: "Check your shoulder before it arrives",
    waysToImprove: [
      "Wall cushion reps - rebound at varying heights/speeds, cushion dead, alternate feet",
      "Scan-and-turn rondo - bonus point for receiving on the half-turn",
      "Forced weak-foot small-sided games - first touch must be on weak foot to score",
    ],
    rubric: {
      emerging:
        "Frequently loses control or stops the ball under the body; often needs extra touches even without pressure.",
      developing:
        "Controls simple service but directional touch is inconsistent; pace, aerial balls or pressure often disrupt the next action.",
      consistent:
        "First touch usually moves the ball into useful space and supports the next action under realistic pressure.",
      advanced:
        "Manipulates the first touch intentionally to escape pressure or create advantage using different surfaces, feet and types of service.",
    },
  },
  {
    id: "technical.passing",
    pillar: "Technical",
    name: "Passing",
    icon: "arrows-right-left",
    description:
      "Accurate weight on both feet, played to the teammate's correct foot, early disguise emerging.",
    activities: [
      "4v2 and 5v2 rondos",
      "passing patterns under light pressure",
      "pass-and-move small-sided games",
    ],
    coachingCue: "Which foot does your teammate need it on?",
    waysToImprove: [
      "Target-gate passing - pass through small gates to a moving partner, rewards accuracy over power",
      "Both-feet rondo - possession game where a pass off the weak foot counts double",
      "One-touch progression - start two-touch, progress to one-touch as control improves, forces early decision-making",
    ],
    rubric: {
      emerging:
        "Short-pass technique and accuracy are inconsistent; weight is often wrong and play is heavily dependent on one foot.",
      developing:
        "Completes simple passes with time, but weight, correct-foot selection and weak-foot use become inconsistent under pressure.",
      consistent:
        "Delivers accurate, appropriately weighted passes to useful areas/feet with both feet in most game situations.",
      advanced:
        "Varies weight, angle, tempo and range intelligently; consistently finds line-breaking or advantage-creating passes under pressure.",
    },
  },
  {
    id: "technical.dribbling",
    pillar: "Technical",
    name: "Dribbling",
    icon: "run",
    description:
      "Used with purpose, to beat a player or escape pressure, on both feet, not for its own sake.",
    activities: [
      "1v1s in small grids",
      "dribble-through-gates",
      "small-sided games with a beat-your-player bonus",
    ],
    coachingCue: "Attack when you have space, pass when you don't",
    waysToImprove: [
      "1v1 grid battles - small grid, both feet, reward beating the defender not just keeping the ball",
      "Change-of-direction gates - dribble through a gate then immediately cut a different direction at a cone",
      "Scan-while-dribbling game - small-sided game where players call out a teammate's shirt color while dribbling, forces head-up control",
    ],
    rubric: {
      emerging:
        "Ball is often too far away or trapped under the body; changes of direction are difficult and the player frequently dribbles into pressure.",
      developing:
        "Can use basic changes of direction or beat passive pressure, but control and choice are inconsistent at game speed.",
      consistent:
        "Dribbles with purpose, close control and changes of speed/direction; recognizes when to carry, beat a player or release the ball.",
      advanced:
        "Manipulates defenders with feints, tempo and both feet; escapes tight spaces or creates a clear advantage consistently.",
    },
  },
  {
    id: "technical.receiving",
    pillar: "Technical",
    name: "Receiving",
    icon: "eye",
    description:
      "Body orientation set before the ball arrives, so the next action is already open.",
    activities: [
      "Rondos that reward scanning",
      "receive-on-the-half-turn games",
    ],
    coachingCue: "See it before you get it",
    waysToImprove: [
      "Shoulder-check reps - partner passes while receiver checks over shoulder every rep before the ball arrives",
      "Angled-approach receiving - receive from different angles/speeds to build adaptable body shape",
      "Receive-under-pressure rondo - add a passive defender closing down to force quicker decisions on the touch",
    ],
    rubric: {
      emerging:
        "Often waits square to the ball or receives with a closed body shape, requiring a reset before the next action.",
      developing:
        "Sometimes opens the body or receives on the back foot, but needs prompts and loses efficiency under pressure.",
      consistent:
        "Regularly prepares body shape early, receives on the back foot/half-turn and keeps the next action available.",
      advanced:
        "Adjusts orientation early to pressure and space, receives across lines and can disguise or change the next action immediately.",
    },
  },
  {
    id: "technical.finishing",
    pillar: "Technical",
    name: "Finishing",
    icon: "target",
    description:
      "Composure and technique over raw power, on both feet, across different finish types.",
    activities: [
      "Small-sided games ending in a goal",
      "1v1-to-goal",
      "finishing off crosses and cutbacks",
    ],
    coachingCue: "First touch sets up the shot",
    waysToImprove: [
      "Both-feet finishing reps - alternate strong/weak foot on every repetition from the same spot",
      "First-time finishing - service from wide or a cutback, finish first-time to build composure under speed",
      "Small-goal 1v1-to-goal - 1v1 starting just outside the box, rewards picking a spot over blasting the ball",
    ],
    rubric: {
      emerging:
        "Contact and accuracy are inconsistent; the player rushes chances and relies heavily on the stronger foot.",
      developing:
        "Finishes simple chances in controlled practice, but first-touch setup, composure and weaker-foot execution are inconsistent.",
      consistent:
        "Selects an appropriate finish, prepares the shot well and finishes accurately with both feet across varied game-realistic chances.",
      advanced:
        "Remains composed under pressure, manipulates goalkeeper/defender cues and executes multiple finish types efficiently from varied angles.",
    },
  },
];

const TACTICAL: SubSkill[] = [
  {
    id: "tactical.positioning",
    pillar: "Tactical",
    name: "Positioning",
    icon: "map-pin",
    description:
      "Maintains team shape appropriate to role, keeps sensible width and depth, doesn't clump around the ball.",
    activities: [
      "Zoned small-sided games with channels",
      "positional rondos with locked zones",
      "shape games rewarding spacing",
    ],
    coachingCue: "Find your space",
    waysToImprove: [
      "Clumps around the ball - zoned games where players must stay in their channel",
      "Poor width - possession games that reward using the full width of the grid",
      "Loses shape after turnovers - transition games where the team must reset shape immediately after losing the ball",
    ],
    rubric: {
      emerging:
        "Frequently follows the ball, loses team shape or role responsibilities, and becomes crowded around teammates.",
      developing:
        "Understands basic starting positions but drifts or bunches and needs regular reminders to restore width, depth or balance.",
      consistent:
        "Maintains useful width, depth and role-specific positioning and adjusts as the ball and teammates move.",
      advanced:
        "Anticipates the next phase, manipulates space and positions early to create attacking advantages or protect the team defensively.",
    },
  },
  {
    id: "tactical.scanning",
    pillar: "Tactical",
    name: "Scanning",
    icon: "eye-search",
    description:
      "Checks surroundings before and while receiving, aware of teammates, opponents, and space - not just the ball.",
    activities: [
      "Color/number call games before receiving",
      "forced-scan rondos",
      "small-sided games requiring a name-call before passing",
    ],
    coachingCue: "Check often, not just once",
    waysToImprove: [
      "Doesn't scan before receiving - random-cue shoulder-check reps (coach claps, player scans)",
      "Only scans once - continuous scanning rondo, must re-scan every few seconds regardless of ball distance",
      "Scans but doesn't use the info - reaction games where the scanned cue decides the next action",
    ],
    rubric: {
      emerging:
        "Rarely checks surroundings before receiving and usually reacts only after the ball arrives.",
      developing:
        "Scans when prompted or before some receptions, but frequency and use of the information are inconsistent.",
      consistent:
        "Checks shoulders before and during receiving and regularly uses the information to select the next action.",
      advanced:
        "Scans continuously and purposefully, tracks pressure/space/teammates/opponents and anticipates the next picture before it forms.",
    },
  },
  {
    id: "tactical.decisions",
    pillar: "Tactical",
    name: "Decisions",
    icon: "route",
    description:
      "Chooses pass, dribble, or shoot based on the actual situation in front of them, not habit.",
    activities: [
      "Overload/underload small-sided games",
      "constrained-touch games to speed up reads",
      "directional bonus-zone games",
    ],
    coachingCue: "What does the game ask for?",
    waysToImprove: [
      "Always dribbles regardless of options - overload games rewarding a quick pass when a teammate is open",
      "Rushes decisions - temporarily allow more touches to build composure, then reduce",
      "Freezes or hesitates - simplified 2-option games (pass or dribble only) to build decision confidence",
    ],
    rubric: {
      emerging:
        "Defaults to the same action, holds the ball too long or misses obvious passing/dribbling/shooting options.",
      developing:
        "Makes correct simple choices when time is available, but decisions become inconsistent as pressure and speed increase.",
      consistent:
        "Chooses pass, dribble or shoot appropriately with good timing in most game situations.",
      advanced:
        "Recognizes cues early, changes the decision as the picture changes and manages risk, tempo and game state effectively.",
    },
  },
  {
    id: "tactical.support",
    pillar: "Tactical",
    name: "Support",
    icon: "users",
    description:
      "Moves to provide angles for the teammate in possession, offers depth and width, doesn't stand still.",
    activities: [
      "Pass-and-move possession games",
      "third-man-running combos",
      "shape games rewarding supporting angles",
    ],
    coachingCue: "Always give an option",
    waysToImprove: [
      "Stands still after passing - enforce pass-and-move, can't return to the same spot",
      "Supports too close to the ball carrier - rondos with a marked minimum support distance",
      "Slow to reposition after turnovers - transition games rewarding quick re-support after losing the ball",
    ],
    rubric: {
      emerging:
        "Often becomes static after passing, hides behind opponents or provides no useful passing angle.",
      developing:
        "Offers support but the angle, distance or timing is inconsistent and often requires coaching prompts.",
      consistent:
        "Regularly creates clear passing angles and adjusts distance/position as the ball moves.",
      advanced:
        "Anticipates combinations, creates third-player/overload options and supports both attacking continuity and defensive balance.",
    },
  },
  {
    id: "tactical.movement",
    pillar: "Tactical",
    name: "Movement",
    icon: "arrows-shuffle",
    description:
      "Makes purposeful runs to create space or receive, timing them and varying type - checking away, coming short, going long.",
    activities: [
      "Small-sided games rewarding runs in behind",
      "timed runs off a server's cue",
      "disguised third-man-running patterns",
    ],
    coachingCue: "Move to be useful, not just busy",
    waysToImprove: [
      "Static off the ball - constrained games where standing still forfeits possession",
      "Poor run timing - server-triggered timed-run drills to build a sense of when to go",
      "Predictable movement - disguise games rewarding checking one way and going another",
    ],
    rubric: {
      emerging:
        "Remains static off the ball or makes runs without a clear purpose or connection to the play.",
      developing:
        "Makes obvious supporting or forward runs, but timing, spacing and variation are inconsistent.",
      consistent:
        "Makes purposeful runs to receive or create space, varying checking movements, support and runs in behind.",
      advanced:
        "Manipulates defenders through well-timed decoy runs, rotations and third-player movement that consistently creates space or advantage.",
    },
  },
];

const PHYSICAL: SubSkill[] = [
  {
    id: "physical.balance",
    pillar: "Physical",
    name: "Balance",
    icon: "yoga",
    description:
      "Maintains control of the body while turning, shielding, or contesting the ball, and recovers from contact without losing footing.",
    activities: [
      "Single-leg balance games",
      "shielding under controlled pressure",
      "small-sided games on slightly uneven ground",
    ],
    coachingCue: "Stay low and strong",
    waysToImprove: [
      "Falls over in duels - shielding practice with controlled pushing, cueing a low center of gravity",
      "Loses footing on turns - single-leg balance combined with turning drills",
      "Weak core stability - balance-based warm-up games like single-leg ball taps",
    ],
    rubric: {
      emerging:
        "Loses body control during turns, contact or shielding and is frequently unstable when controlling the ball on one leg.",
      developing:
        "Remains stable in simple actions, but contact or rapid direction changes often disrupt control.",
      consistent:
        "Maintains body control through turns, shielding and most duels and recovers balance quickly after contact.",
      advanced:
        "Uses center of gravity and contact intelligently, remaining stable through complex, dynamic football actions under pressure.",
    },
  },
  {
    id: "physical.coordination",
    pillar: "Physical",
    name: "Coordination",
    icon: "adjustments",
    description:
      "Syncs footwork, body, and ball control fluidly - can run, receive, and turn without stumbling.",
    activities: [
      "Footwork ladder into first-touch combos",
      "multi-skill relay races",
      "juggling progressions",
    ],
    coachingCue: "Smooth feet, soft touch",
    waysToImprove: [
      "Clumsy combining running and ball control - footwork ladder drills feeding directly into a first touch",
      "Struggles switching between skills quickly - multi-skill circuit relay (dribble, jump, pass in sequence)",
      "Poor foot-eye sync - juggling progressions starting from self-toss and control",
    ],
    rubric: {
      emerging:
        "Footwork, body movement and ball control often appear disconnected when running, receiving or turning.",
      developing:
        "Completes movement sequences at moderate speed, but coordination and technique break down as speed/complexity rise.",
      consistent:
        "Coordinates feet, body and ball fluidly at game-relevant speed across common football actions.",
      advanced:
        "Moves efficiently under high speed and pressure, adapting surfaces, footwork and body position without losing technical quality.",
    },
  },
  {
    id: "physical.agility",
    pillar: "Physical",
    name: "Agility",
    icon: "activity",
    description:
      "Changes direction and speed quickly, especially reacting to an opponent or the ball rather than a fixed pattern.",
    activities: [
      "Reactive shuttle runs with a partner's signal",
      "cone weaving with the ball",
      "1v1 mirror drills",
    ],
    coachingCue: "Quick feet, quick decisions",
    waysToImprove: [
      "Slow to change direction - short shuttle-style cone drills with the ball",
      "Poor reactive agility - mirror drills reacting to a partner's movement",
      "Predictable movement patterns - random-cue agility drills where the coach calls a direction or color",
    ],
    rubric: {
      emerging:
        "Changes direction slowly or with many adjustment steps and struggles to react to an opponent or ball movement.",
      developing:
        "Changes direction effectively in planned tasks, but reactive movement and control are inconsistent.",
      consistent:
        "Reacts and changes direction/speed efficiently with or without the ball while maintaining control.",
      advanced:
        "Decelerates, re-accelerates and changes direction explosively in multiple planes and uses those actions tactically to gain advantage.",
    },
  },
  {
    id: "physical.speed",
    pillar: "Physical",
    name: "Speed",
    icon: "bolt",
    description:
      "Accelerates quickly over short distances with good sprinting mechanics - most useful actions in a game happen in bursts under 20m.",
    activities: [
      "Varied-start sprint reps",
      "short technical sprint drills",
      "race-to-space small-sided games",
    ],
    coachingCue: "Explode, don't ease into it",
    waysToImprove: [
      "Slow off the mark - sprint starts from seated, lying, or jogging positions",
      "Poor sprint mechanics - short technical sprint drills focused on arm drive and knee lift over 10-15m",
      "Loses speed with the ball - race-to-space games combining a sprint with dribbling",
    ],
    rubric: {
      emerging:
        "First steps and sprint mechanics limit acceleration and the player rarely exploits available space at the moment it opens.",
      developing:
        "Can accelerate in clear situations, but first-step intent, mechanics or timing are inconsistent.",
      consistent:
        "Accelerates decisively over game-relevant distances with sound mechanics and uses speed at appropriate moments.",
      advanced:
        "Repeatedly creates or closes separation through explosive first steps, efficient mechanics and excellent timing. Judge relative to current maturation.",
    },
  },
  {
    id: "physical.endurance",
    pillar: "Physical",
    name: "Endurance",
    icon: "battery-charging",
    description:
      "Maintains work rate and technical quality through a full session or game, without fading in the second half.",
    activities: [
      "Continuous small-sided games at match intensity",
      "interval-based possession games",
      "fun conditioning like tag games",
    ],
    coachingCue: "Keep your work rate up",
    waysToImprove: [
      "Fades in the second half - interval small-sided games that build work capacity gradually",
      "Poor recovery between efforts - short high-intensity bursts with active recovery periods",
      "Loses technical quality when tired - possession games with slightly extended duration under fatigue",
    ],
    rubric: {
      emerging:
        "Involvement, movement quality or technical execution drops noticeably and extended recovery is often needed.",
      developing:
        "Maintains effort for periods, but intensity, concentration or technical quality varies as the session/game continues.",
      consistent:
        "Repeats high-intensity actions and maintains technical/tactical engagement through most of the session or game.",
      advanced:
        "Sustains a high work rate and decision quality, recovers quickly between demanding actions and remains influential late in play.",
    },
  },
];

const MENTAL: SubSkill[] = [
  {
    id: "mental.confidence",
    pillar: "Mental",
    name: "Confidence",
    icon: "shield-check",
    description:
      "Willing to try skills in games without fear of failure, takes on 1v1s, and asks for the ball rather than hiding from it.",
    activities: [
      "Games that reward attempting a skill regardless of outcome",
      "personal-best skill challenges (not compared to others)",
      "praise-effort coaching environment",
    ],
    coachingCue: "Play with freedom",
    waysToImprove: [
      "Always plays it safe - bonus points for attempting a 1v1 or skill move even if it doesn't come off",
      "Fears embarrassment after a mistake - next-play drills that immediately re-engage the player after an error",
      "Hesitant to ask for the ball - games that require calling for the ball out loud to receive it",
    ],
    rubric: {
      emerging:
        "Often avoids the ball or avoids attempting learned actions, especially after an error or under pressure.",
      developing:
        "Attempts skills in comfortable situations but becomes cautious when pressure rises or after mistakes.",
      consistent:
        "Regularly asks for the ball and attempts appropriate actions despite the possibility of failure.",
      advanced:
        "Plays with constructive assertiveness, accepts responsibility in difficult moments and helps teammates play with confidence too.",
    },
  },
  {
    id: "mental.reaction-to-mistakes",
    pillar: "Mental",
    name: "Reaction to mistakes",
    icon: "refresh",
    description:
      "Recovers quickly after an error, doesn't sulk or disengage, and gets straight back into the play.",
    activities: [
      "Next-ball mentality games",
      "immediate transition-back drills after a giveaway",
      "coach-modeled positive self-talk",
    ],
    coachingCue: "Next ball",
    waysToImprove: [
      "Dwells on errors, head drops - immediate re-engagement drills right after a mistake",
      "Avoids retrying after failing - repetition drills where the same skill is retried right away",
      "Negative self-talk - coach reframes and praises the attempt, not just the outcome",
    ],
    rubric: {
      emerging:
        "Dwells on errors, disengages or is slow to transition into the next action after a mistake.",
      developing:
        "Recovers with prompts, but body language or focus can remain affected for several actions.",
      consistent:
        "Quickly re-engages, resets and performs the next action without allowing the previous mistake to control behavior.",
      advanced:
        "Responds immediately and constructively, often initiating the recovery action while remaining emotionally steady and solution-focused.",
    },
  },
  {
    id: "mental.concentration",
    pillar: "Mental",
    name: "Concentration",
    icon: "focus-2",
    description:
      "Stays engaged and switched-on through a full session, including the less exciting parts, without drifting off.",
    activities: [
      "Short game-based segments over long explanations",
      "activities rotated every 8-10 minutes",
      "decision-heavy games requiring constant attention",
    ],
    coachingCue: "Stay switched on",
    waysToImprove: [
      "Loses focus during instructions - keep talk short, demonstrate instead of explaining at length",
      "Drifts in low-intensity moments - rotate activities frequently, keep sessions game-based",
      "Struggles with distractions - gradually add game-relevant busyness (crowd, small-sided chaos) to build focus under real conditions",
    ],
    rubric: {
      emerging:
        "Frequently becomes disconnected from play, misses instructions/restarts or reacts late to changes of possession.",
      developing:
        "Maintains focus for short periods, but attention drops when away from the ball or during longer phases.",
      consistent:
        "Stays engaged and recognizes important cues, restarts and phase changes for most of the session/game.",
      advanced:
        "Maintains sustained focus, anticipates transitions/restarts and helps organize teammates before the next action develops.",
    },
  },
];

const SOCIAL: SubSkill[] = [
  {
    id: "social.communication",
    pillar: "Social",
    name: "Communication",
    icon: "message-2",
    description:
      "Talks to teammates during play - calling for the ball, warning of pressure, directing - rather than staying silent.",
    activities: [
      "Games requiring a verbal call to score or receive",
      "communication-required rondos",
      "'no goal without a call' small-sided games",
    ],
    coachingCue: "Talk early, talk often",
    waysToImprove: [
      "Silent on and off the ball - require a verbal call before receiving or scoring",
      "Doesn't warn teammates under pressure - reward players who call 'man on' for a teammate",
      "Communicates but not useful info - teach specific vocabulary (time, man on, turn) tied to real situations",
    ],
    rubric: {
      emerging:
        "Rarely communicates, or information is late/unclear and does not help teammates make decisions.",
      developing:
        "Communicates when prompted, mainly to ask for the ball, with inconsistent timing or detail.",
      consistent:
        "Gives timely, useful football information (e.g., time, turn, pressure, names, organize) and also listens to teammates.",
      advanced:
        "Uses constant, purposeful two-way communication that improves coordination, awareness and decision-making across the team.",
    },
  },
  {
    id: "social.teamwork",
    pillar: "Social",
    name: "Teamwork",
    icon: "users-group",
    description:
      "Plays for the team - shares the ball, includes all teammates, and celebrates others' success rather than just their own.",
    activities: [
      "Small-sided games rewarding assists as much as goals",
      "rotating pairs/groups so everyone plays together",
      "cooperative team-target challenges",
    ],
    coachingCue: "We before me",
    waysToImprove: [
      "Ball hogs, doesn't involve others - games that reward assists as much as goals",
      "Excludes weaker teammates - rotate pairs and groups so every player works with every player",
      "Doesn't celebrate others - coach models and rewards visible team celebration after any teammate's success",
    ],
    rubric: {
      emerging:
        "Frequently prioritizes an individual action and offers limited support, sharing or inclusion of teammates.",
      developing:
        "Cooperates with teammates but decisions and effort can become individualistic or inconsistent.",
      consistent:
        "Shares the ball, supports teammates, accepts roles and recognizes team actions as well as personal actions.",
      advanced:
        "Actively improves group function by covering teammates, connecting units, helping others succeed and placing team needs ahead of personal statistics.",
    },
  },
  {
    id: "social.response-to-coaching",
    pillar: "Social",
    name: "Response to coaching",
    icon: "ear",
    description:
      "Listens to feedback, applies it without getting defensive, and asks questions when unsure rather than staying quiet.",
    activities: [
      "Immediate try-again drills right after a coaching point",
      "short reflection questions after activities",
      "peer feedback exercises",
    ],
    coachingCue: "Hear it, try it",
    waysToImprove: [
      "Ignores or resists feedback - immediate try-again drills straight after a coaching point",
      "Gets defensive or discouraged by correction - reframe as 'next step,' praise the adjustment attempt",
      "Doesn't ask questions when confused - build in a quick check-for-understanding moment before starting",
    ],
    rubric: {
      emerging:
        "Struggles to listen to or attempt feedback and repeats the same behavior without visibly trying the adjustment.",
      developing:
        "Understands feedback and attempts the change, but needs reminders or repeated demonstrations.",
      consistent:
        "Listens, asks for clarification when needed and applies feedback in subsequent repetitions or game situations.",
      advanced:
        "Applies feedback independently, reflects on it and transfers the underlying principle to new situations without repeated prompting.",
    },
  },
];

export const SEED_SUB_SKILLS: SubSkill[] = [
  ...TECHNICAL,
  ...TACTICAL,
  ...PHYSICAL,
  ...MENTAL,
  ...SOCIAL,
];

export const SEED_CONTENT: ContentDoc = {
  version: 1,
  updatedAt: "2026-08-30T14:40:16.971Z",
  subSkills: SEED_SUB_SKILLS,
};
