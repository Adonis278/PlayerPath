import type { ContentDoc, SubSkill } from "./types";

/**
 * PLACEHOLDER CONTENT - pending coach_skills_technical.xlsx from the product owner.
 * The structure and rubric calibration are final; the wording is a working draft so
 * the app is demonstrable. Replace wholesale via Admin -> Import.
 *
 * Rubric through-line, held constant across all 21 sub-skills so coaches calibrate:
 *   Emerging   - not yet
 *   Developing - can do it unpressured / standing still
 *   Consistent - reliable while moving, low pressure
 *   Advanced   - holds up under real match pressure
 * Every level is written for ages 9-12. Advanced means advanced for a 10-year-old.
 */

const TECHNICAL: SubSkill[] = [
  {
    id: "technical.first-touch",
    pillar: "Technical",
    name: "First touch",
    description:
      "The first contact sets up everything that follows. At this age, good means the ball ends up out of the feet, in front of the player, and moving where they want to go next.",
    activities: [
      "Wall passes, two touches only: control then return, 2 minutes each foot",
      "Toss-and-control in pairs, receiving out of the air from a gentle underarm throw",
      "Four-cone diamond: receive facing one cone, take the first touch toward another",
    ],
    coachingCue: "First touch out of your feet",
    waysToImprove: [
      {
        problem: "Ball bounces off the shin or gets stuck under the body",
        fix: "Ask for a relaxed ankle and a cushioned contact. Meet the ball, do not fight it",
      },
      {
        problem: "Controls it but stops dead and gets closed down",
        fix: "Set a rule that the first touch must travel at least a metre into space",
      },
      {
        problem: "Only ever controls with the same foot",
        fix: "Call out the receiving foot before the ball arrives",
      },
    ],
    rubric: {
      emerging:
        "The ball regularly bounces away on contact. The player has to chase their own first touch, or possession is lost.",
      developing:
        "Controls a gently rolled ball while standing still, but the touch is heavy when moving or when the pass has pace on it.",
      consistent:
        "Controls the ball while jogging and sets it into space in the direction they intend, in unopposed or low-pressure practice.",
      advanced:
        "Controls the ball cleanly in a game with a defender nearby, and the first touch takes them away from the pressure.",
    },
  },
  {
    id: "technical.passing",
    pillar: "Technical",
    name: "Passing",
    description:
      "Getting the ball to a teammate with the right weight and the right foot. At 9-12, accuracy over ten metres matters far more than distance.",
    activities: [
      "Gates: pairs pass through a 1m cone gate, one point per clean pass, 90 seconds",
      "Triangle passing, calling the receiver's name before striking the ball",
      "Two-touch rondo, four attackers and one defender in a 6m square",
    ],
    coachingCue: "Head up, then pass",
    waysToImprove: [
      {
        problem: "Passes are underhit and get intercepted",
        fix: "Contact with the inside of the foot and follow through toward the target",
      },
      {
        problem: "Passes without looking and loses possession",
        fix: "Require a look before every reception. Call it the check-your-shoulder rule",
      },
      {
        problem: "Only ever passes to the nearest teammate",
        fix: "Award two points for a pass that breaks a line of defenders",
      },
    ],
    rubric: {
      emerging:
        "Struggles to make firm contact. Passes go wide of a stationary target from short distance.",
      developing:
        "Passes accurately to a stationary teammate from a standing start, but weight and direction fall apart on the move.",
      consistent:
        "Finds a moving teammate over ten metres with sensible weight during drills and small-sided play.",
      advanced:
        "Picks the right pass under pressure in a game, varies the weight to suit, and uses both feet when the situation calls for it.",
    },
  },
  {
    id: "technical.dribbling",
    pillar: "Technical",
    name: "Dribbling",
    description:
      "Carrying the ball under control with the head up. The measure at this age is whether they can keep the ball close while changing pace and direction.",
    activities: [
      "Cone slalom with the ball, both feet, timed but accuracy first",
      "Sharks and minnows in a 20m box, last player with a ball wins",
      "1v1 to a line: attacker scores by dribbling over it, 60-second rounds",
    ],
    coachingCue: "Small touches, head up",
    waysToImprove: [
      {
        problem: "Ball runs too far ahead and is easily taken",
        fix: "Set a rule of one touch every second step inside a tight grid",
      },
      {
        problem: "Stares at the ball and misses everything around them",
        fix: "Hold up fingers across the grid and ask them to call the number while dribbling",
      },
      {
        problem: "Only dribbles in straight lines",
        fix: "Add a change of direction on a whistle, then let them choose the moment",
      },
    ],
    rubric: {
      emerging:
        "Loses the ball within a few touches. Cannot travel with it at walking pace under control.",
      developing:
        "Dribbles under control in open space with no defender, but the head is down and the ball escapes when they speed up.",
      consistent:
        "Travels with the ball at pace, keeps it close, and changes direction with the head up in practice.",
      advanced:
        "Beats a defender one-on-one in a game, protects the ball under contact, and knows when to dribble rather than pass.",
    },
  },
  {
    id: "technical.shooting",
    pillar: "Technical",
    name: "Shooting",
    description:
      "Striking the ball at goal with a clean contact. At 9-12, technique and composure beat raw power every time.",
    activities: [
      "Strike a stationary ball at a 2m target, ten each foot",
      "Pass, receive, turn and shoot from the edge of the area",
      "Two-goal finishing game with a two-touch limit inside the box",
    ],
    coachingCue: "Laces through the middle",
    waysToImprove: [
      {
        problem: "Shots balloon over the crossbar",
        fix: "Plant foot alongside the ball, body leaning slightly over it, strike through the middle",
      },
      {
        problem: "Toe-pokes the ball",
        fix: "Slow it right down and check the contact point on the laces before adding pace",
      },
      {
        problem: "Hesitates and the chance disappears",
        fix: "Introduce a three-second shot clock inside the box",
      },
    ],
    rubric: {
      emerging:
        "Struggles to make clean contact. Shots from close range miss the target or barely reach it.",
      developing:
        "Hits the target from a stationary ball, but contact breaks down when the ball is moving or they are on the run.",
      consistent:
        "Strikes a moving ball cleanly and hits the target regularly in unopposed and low-pressure finishing practice.",
      advanced:
        "Finishes under pressure in a game, picks a spot rather than just hitting it, and can shoot off either foot.",
    },
  },
  {
    id: "technical.defending-1v1",
    pillar: "Technical",
    name: "1v1 defending",
    description:
      "Slowing an attacker down and winning the ball back safely. Good at this age is patient and side-on, not a dive-in.",
    activities: [
      "Shadow defending: mirror the attacker for 20 seconds without tackling",
      "1v1 to a line, defender wins by forcing the attacker wide",
      "Half-pitch transition game rewarding clean regains",
    ],
    coachingCue: "Side on, be patient",
    waysToImprove: [
      {
        problem: "Dives in and gets beaten immediately",
        fix: "Ban tackling for two rounds. The only aim is to stay in front and delay",
      },
      {
        problem: "Stands square and gets knocked past easily",
        fix: "Turn the body side-on with the front foot forward",
      },
      {
        problem: "Backs off so far the attacker just shoots",
        fix: "Mark a line they must not retreat beyond, then close the gap on a heavy touch",
      },
    ],
    rubric: {
      emerging:
        "Rushes at the ball or avoids the contest. The attacker goes past without being slowed.",
      developing:
        "Stays in front of a slow-moving attacker in a walk-through, but loses the position as soon as pace is added.",
      consistent:
        "Holds a side-on position, delays the attacker and times the tackle in low-pressure practice.",
      advanced:
        "Defends a committed attacker in a real game, forces them onto the weaker foot, and regains the ball cleanly.",
    },
  },
];

const TACTICAL: SubSkill[] = [
  {
    id: "tactical.positioning",
    pillar: "Tactical",
    name: "Positioning",
    description:
      "Being in a useful place both with and without the ball. At this age the win is simply not clustering around the ball.",
    activities: [
      "Freeze-frame: stop play and ask each player to point to the space they should be in",
      "Zonal small-sided game where players must stay in their third",
      "Four-goal game that rewards switching play into a wide space",
    ],
    coachingCue: "Find the space, not the ball",
    waysToImprove: [
      {
        problem: "Everyone swarms toward the ball",
        fix: "Use coloured zones and give a point for each zone occupied when a goal is scored",
      },
      {
        problem: "Stands too close to a teammate",
        fix: "Set a minimum five-metre spacing rule and pause play when it is broken",
      },
      {
        problem: "Does not track back after attacking",
        fix: "Require the whole team to be past halfway before a goal counts",
      },
    ],
    rubric: {
      emerging:
        "Follows the ball everywhere regardless of position. Bunches with teammates.",
      developing:
        "Can point to the right position when play is paused, but drifts out of it once the game restarts.",
      consistent:
        "Holds a sensible position through most of a small-sided game and spreads out without being told.",
      advanced:
        "Adjusts position as the game changes, recognises when to push up or drop in, and does it in a competitive match.",
    },
  },
  {
    id: "tactical.decision-making",
    pillar: "Tactical",
    name: "Decision making",
    description:
      "Choosing pass, dribble or shoot, and choosing early. At 9-12 the aim is a reasonable choice made early rather than a perfect one made late.",
    activities: [
      "Three-option drill: coach calls pass, carry or shoot as the ball arrives",
      "Overload games at 3v2 and 4v3 to force quicker choices",
      "Conditioned game with a two-touch limit in the middle third",
    ],
    coachingCue: "Decide before it arrives",
    waysToImprove: [
      {
        problem: "Holds the ball too long and gets crowded out",
        fix: "Reduce the touch limit and praise early releases even when they do not come off",
      },
      {
        problem: "Always makes the same choice regardless of the situation",
        fix: "Pause and ask what else was available. Let them find the second option",
      },
      {
        problem: "Panics and gives the ball away under pressure",
        fix: "Rehearse one safe out-ball so there is always a default",
      },
    ],
    rubric: {
      emerging:
        "Reacts only after the ball arrives. Choices look random, or the ball is simply kicked away.",
      developing:
        "Makes reasonable choices with time and space, but freezes or reverts to one habit under pressure.",
      consistent:
        "Chooses sensibly and early in small-sided games, and can explain the choice afterwards.",
      advanced:
        "Consistently picks the better option in a competitive match, including choices that go against their preference.",
    },
  },
  {
    id: "tactical.scanning",
    pillar: "Tactical",
    name: "Scanning and awareness",
    description:
      "Looking around before receiving so the next action is already decided. This is the habit that separates calm players from rushed ones.",
    activities: [
      "Coloured bib call-out: shout a colour they must find before controlling",
      "Number game: hold up fingers behind the player as the pass travels",
      "Rondo with a rule that a look over the shoulder must happen before receiving",
    ],
    coachingCue: "Check your shoulder",
    waysToImprove: [
      {
        problem: "Only sees the ball and nothing else",
        fix: "Reward the look itself, not the outcome, for a full session",
      },
      {
        problem: "Looks but does not use what they saw",
        fix: "Ask what they saw straight after the touch to close the loop",
      },
      {
        problem: "Scans once then stops",
        fix: "Ask for two looks: as the pass starts, and just before it lands",
      },
    ],
    rubric: {
      emerging: "Head stays fixed on the ball. Is surprised by pressure arriving.",
      developing:
        "Looks around when reminded or when play is paused, but not on their own during the game.",
      consistent:
        "Checks over the shoulder before receiving in practice and uses the information some of the time.",
      advanced:
        "Scans habitually in a match without prompting, and acts on what they saw before the ball arrives.",
    },
  },
  {
    id: "tactical.support-play",
    pillar: "Tactical",
    name: "Support play",
    description:
      "Giving the player on the ball a good option: the right distance, the right angle. Not too close, and not hidden behind a defender.",
    activities: [
      "Triangle support drill where the receiver moves to a new angle after each pass",
      "3v1 rondo focused purely on the supporting players' positions",
      "Conditioned game requiring two passes before a shot",
    ],
    coachingCue: "Show for it, on an angle",
    waysToImprove: [
      {
        problem: "Supports directly behind a defender",
        fix: "Ask them to move a couple of steps until they can see the passer's eyes",
      },
      {
        problem: "Stands still and waits for the ball",
        fix: "Require movement toward or away before every reception",
      },
      {
        problem: "Comes far too close to the ball carrier",
        fix: "Mark a minimum support distance with cones and play inside it",
      },
    ],
    rubric: {
      emerging: "Does not offer an option. Stands still, or hides behind an opponent.",
      developing:
        "Offers support when told where to go, but the angle and distance are wrong without instruction.",
      consistent:
        "Finds a sensible angle and distance on their own during drills and small-sided games.",
      advanced:
        "Continually adjusts the supporting position in a match as play shifts, creating passing lanes for teammates.",
    },
  },
];

const PHYSICAL: SubSkill[] = [
  {
    id: "physical.agility",
    pillar: "Physical",
    name: "Agility and change of direction",
    description:
      "Starting, stopping and turning under control. At this age it is about coordination and body control rather than raw power.",
    activities: [
      "Ladder drills, two feet in each rung, building speed over 4 rounds",
      "Five-cone star: sprint out and back to the centre, changing direction each time",
      "Reaction tag in a 10m square",
    ],
    coachingCue: "Low and quick to turn",
    waysToImprove: [
      {
        problem: "Turns wide and loses ground",
        fix: "Ask them to drop the hips and plant the outside foot to cut sharply",
      },
      {
        problem: "Stumbles when stopping",
        fix: "Practise decelerating over three short steps rather than one big one",
      },
      {
        problem: "Always turns off the same side",
        fix: "Call the turning direction at random so both sides get used",
      },
    ],
    rubric: {
      emerging:
        "Loses balance when changing direction. Turns are slow and wide.",
      developing:
        "Changes direction under control at walking or jogging pace, but breaks down at speed.",
      consistent:
        "Starts, stops and turns sharply at pace during drills, off either side.",
      advanced:
        "Changes direction sharply in a game while keeping the ball or tracking an opponent, and recovers immediately.",
    },
  },
  {
    id: "physical.speed",
    pillar: "Physical",
    name: "Speed",
    description:
      "Getting from A to B quickly, and knowing when to. Short repeated sprints matter far more than long-distance pace at this age.",
    activities: [
      "10m sprints from varied starts: standing, seated, on a call",
      "Partner chase over 15m with a one-second head start",
      "Sprint-and-recover shuttles, 6 reps with a walk back",
    ],
    coachingCue: "Drive the arms",
    waysToImprove: [
      {
        problem: "Slow off the mark",
        fix: "Practise the first three steps only, leaning forward out of the start",
      },
      {
        problem: "Runs at one pace throughout",
        fix: "Play games that reward a burst, such as beating a defender to a loose ball",
      },
      {
        problem: "Tires quickly after a sprint",
        fix: "Build repeat efforts with short recoveries rather than single long runs",
      },
    ],
    rubric: {
      emerging:
        "Runs at a single pace. Cannot produce a noticeable burst when needed.",
      developing:
        "Sprints hard in a straight line when told to, but does not choose to sprint during play.",
      consistent:
        "Produces a genuine burst in practice games and repeats it several times in a session.",
      advanced:
        "Sprints at the right moments in a match, repeats efforts across the game, and recovers quickly between them.",
    },
  },
  {
    id: "physical.balance",
    pillar: "Physical",
    name: "Balance and coordination",
    description:
      "Staying upright and in control through contact, turns and awkward bounces. This underpins nearly every technical skill.",
    activities: [
      "One-leg stands progressing to one-leg passes",
      "Hop-and-hold: jump, land on one foot, hold for three seconds",
      "Shoulder-to-shoulder contests over a rolling ball",
    ],
    coachingCue: "Strong through the middle",
    waysToImprove: [
      {
        problem: "Falls over easily under light contact",
        fix: "Practise shoulder-to-shoulder holds at walking pace before adding speed",
      },
      {
        problem: "Cannot strike or control on the weaker side",
        fix: "Build single-leg balance on the standing foot first",
      },
      {
        problem: "Lands heavily and slowly after jumping",
        fix: "Coach a soft, bent-knee landing and hold the position",
      },
    ],
    rubric: {
      emerging:
        "Unsteady on one foot. Goes to ground easily and struggles to recover balance.",
      developing:
        "Balanced when still or moving slowly, but loses control at speed or in contact.",
      consistent:
        "Stays balanced through turns, contact and awkward bounces during practice.",
      advanced:
        "Holds off opponents and stays on their feet through contested situations in a match.",
    },
  },
  {
    id: "physical.stamina",
    pillar: "Physical",
    name: "Stamina",
    description:
      "Staying effective for the whole session or match. Watch for whether the quality of their play drops, not just whether they look tired.",
    activities: [
      "Continuous small-sided games with short rotations",
      "Four-minute possession blocks with 60 seconds of recovery",
      "Progressive shuttle runs, stopping well before exhaustion",
    ],
    coachingCue: "Same quality, last minute",
    waysToImprove: [
      {
        problem: "Drops out of the game in the final third of a session",
        fix: "Shorten the shifts and rotate more often, then extend gradually",
      },
      {
        problem: "Walks back after every attack",
        fix: "Set a jogging recovery expectation and praise it visibly",
      },
      {
        problem: "Technique falls apart when tired",
        fix: "Place short technical work at the end of the session on purpose",
      },
    ],
    rubric: {
      emerging:
        "Tires within minutes. Stops running and takes themselves out of the game early.",
      developing:
        "Keeps up through the early part of a session, but fades noticeably before the end.",
      consistent:
        "Maintains work rate through a full practice, with only a small drop-off late on.",
      advanced:
        "Holds both work rate and technical quality to the end of a competitive match, and recovers quickly between efforts.",
    },
  },
];

const MENTAL: SubSkill[] = [
  {
    id: "mental.confidence",
    pillar: "Mental",
    name: "Confidence",
    description:
      "Willingness to get on the ball and try things, especially after a mistake. At this age the signal is whether they ask for the ball again.",
    activities: [
      "Guaranteed-touch games where every player must receive before a goal counts",
      "1v1 challenges against similar-ability opponents to build wins",
      "Praise-the-attempt rounds where trying a skill scores regardless of outcome",
    ],
    coachingCue: "Next one, get on it",
    waysToImprove: [
      {
        problem: "Hides after making a mistake",
        fix: "Get them an easy touch immediately so the next action is a success",
      },
      {
        problem: "Never attempts anything creative",
        fix: "Run a session where losing the ball while trying a skill carries no penalty",
      },
      {
        problem: "Only confident in training, not in matches",
        fix: "Give one specific, achievable job for the match so success is defined and reachable",
      },
    ],
    rubric: {
      emerging:
        "Avoids the ball. Body language drops after an error, and they withdraw from play.",
      developing:
        "Gets involved in familiar drills and with familiar teammates, but goes quiet in games or with new groups.",
      consistent:
        "Asks for the ball regularly in practice and tries things without needing reassurance first.",
      advanced:
        "Wants the ball at difficult moments in a match, and recovers quickly from a mistake to demand it again.",
    },
  },
  {
    id: "mental.focus",
    pillar: "Mental",
    name: "Focus",
    description:
      "Staying switched on through instructions, waiting time and the quiet parts of a game. Distraction at this age is normal, so look for the trend.",
    activities: [
      "Short, sharp instruction blocks with an immediate action to follow",
      "Trigger games where play only starts on a specific call",
      "Ask a player to repeat back the task before the drill begins",
    ],
    coachingCue: "Eyes here, then go",
    waysToImprove: [
      {
        problem: "Drifts off while waiting in line",
        fix: "Cut queue sizes so nobody waits more than about 20 seconds",
      },
      {
        problem: "Misses the instruction and does the wrong thing",
        fix: "Keep instructions to one point and have a player repeat it back",
      },
      {
        problem: "Switches off when not directly involved in play",
        fix: "Give an off-ball job to watch for, then ask about it afterwards",
      },
    ],
    rubric: {
      emerging:
        "Rarely takes in instructions. Frequently off-task and needs repeated redirection.",
      developing:
        "Focuses for short bursts and in activities they enjoy, but loses attention during quieter phases.",
      consistent:
        "Follows instructions and stays engaged through most of a session without reminders.",
      advanced:
        "Stays switched on through a full match including off-ball phases, and refocuses quickly after a setback.",
    },
  },
  {
    id: "mental.resilience",
    pillar: "Mental",
    name: "Resilience",
    description:
      "How they respond to going behind, being beaten, or making an error. The measure is the response, not the absence of frustration.",
    activities: [
      "Deliberate deficit games starting a team two goals down",
      "Repeat-the-skill challenges where success only comes after several failures",
      "Reset routine practice: a fixed action to perform after any mistake",
    ],
    coachingCue: "Mistake done, next action",
    waysToImprove: [
      {
        problem: "Gives up when the team goes behind",
        fix: "Set process goals that are still winnable regardless of the score",
      },
      {
        problem: "Visibly frustrated and it affects the next few minutes",
        fix: "Teach a short reset routine such as a deep breath and a jog back to position",
      },
      {
        problem: "Blames teammates or the referee",
        fix: "Redirect to the one thing they control, then acknowledge it when they do it",
      },
    ],
    rubric: {
      emerging:
        "Shuts down, becomes upset, or stops trying after a setback. Needs adult intervention to re-engage.",
      developing:
        "Recovers from small setbacks with encouragement, but a significant one ends their session.",
      consistent:
        "Bounces back from mistakes on their own within a minute or two during practice.",
      advanced:
        "Keeps competing through adversity in a real match, and lifts teammates rather than dropping their heads.",
    },
  },
  {
    id: "mental.competitiveness",
    pillar: "Mental",
    name: "Competitiveness",
    description:
      "Wanting to win the moment in front of them, within the spirit of the game. Look for effort in contests, not aggression.",
    activities: [
      "50/50 ball contests from equal distance",
      "Short knockout tournaments with quick rounds",
      "Race-to-the-ball starts before a 1v1",
    ],
    coachingCue: "Win this one",
    waysToImprove: [
      {
        problem: "Backs out of 50/50 challenges",
        fix: "Start contests at walking pace so the contact is predictable, then build up",
      },
      {
        problem: "Only competes when already winning",
        fix: "Use handicapped games so they practise chasing a result",
      },
      {
        problem: "Competitiveness tips into arguing or fouling",
        fix: "Name the line clearly, and reward hard-but-fair contests out loud",
      },
    ],
    rubric: {
      emerging: "Avoids contests. Concedes the ball rather than competing for it.",
      developing:
        "Competes in drills and when comfortable, but pulls out of physical or high-stakes contests.",
      consistent:
        "Consistently competes for loose balls and 50/50s during practice games.",
      advanced:
        "Competes hard and fairly throughout a match, including when losing, without losing discipline.",
    },
  },
];

const SOCIAL: SubSkill[] = [
  {
    id: "social.communication",
    pillar: "Social",
    name: "Communication",
    description:
      "Talking usefully on the pitch: calling for the ball, warning a teammate, organising. Useful information beats volume.",
    activities: [
      "Silent-then-loud games: one round with no talking, one with required calls",
      "Mandatory call before receiving, such as name plus turn or man on",
      "Nominate a captain each round to organise restarts",
    ],
    coachingCue: "Tell them what you see",
    waysToImprove: [
      {
        problem: "Says nothing for the whole session",
        fix: "Give one specific phrase to use and ask for it five times",
      },
      {
        problem: "Shouts but gives no useful information",
        fix: "Teach the difference between noise and information, such as man on versus time",
      },
      {
        problem: "Only talks to close friends",
        fix: "Rotate pairings deliberately every few minutes",
      },
    ],
    rubric: {
      emerging: "Silent on the pitch. Does not call for the ball or respond to teammates.",
      developing:
        "Speaks when prompted or when playing with friends, but goes quiet otherwise.",
      consistent:
        "Calls for the ball and passes on simple useful information during practice games.",
      advanced:
        "Communicates usefully throughout a match, organises teammates around them, and is heard under pressure.",
    },
  },
  {
    id: "social.teamwork",
    pillar: "Social",
    name: "Teamwork",
    description:
      "Playing for the team rather than for themselves. At this age, sharing the ball and covering for a teammate are the clearest signs.",
    activities: [
      "Minimum-passes-before-a-goal conditioned games",
      "Assist-counts-double scoring",
      "Team challenges where every player must touch the ball in a move",
    ],
    coachingCue: "Play for the shirt",
    waysToImprove: [
      {
        problem: "Never passes and always shoots",
        fix: "Make an assist worth two goals for a session",
      },
      {
        problem: "Does not cover when a teammate is beaten",
        fix: "Pair players up and make them responsible for each other's zone",
      },
      {
        problem: "Criticises teammates after mistakes",
        fix: "Introduce a rule that the only words after an error are encouraging ones",
      },
    ],
    rubric: {
      emerging:
        "Plays entirely as an individual. Does not pass or support, and may criticise teammates.",
      developing:
        "Shares the ball with certain teammates or when instructed, but reverts to individual play under pressure.",
      consistent:
        "Passes, supports and covers for teammates through most of a practice game.",
      advanced:
        "Puts the team first in a competitive match, including making the unselfish choice when a personal one was available.",
    },
  },
  {
    id: "social.coachability",
    pillar: "Social",
    name: "Coachability",
    description:
      "Taking on feedback and actually changing something. Look for the adjustment in the next few minutes, not just the nod.",
    activities: [
      "One-instruction rounds where a single change is coached and then checked",
      "Peer coaching in pairs, giving one another a single cue",
      "Self-review: ask them what they would change before you say anything",
    ],
    coachingCue: "Try it my way once",
    waysToImprove: [
      {
        problem: "Nods but does not change anything",
        fix: "Make the feedback a single concrete action and check for it immediately",
      },
      {
        problem: "Becomes defensive when corrected",
        fix: "Lead with something they did well, then give one specific adjustment",
      },
      {
        problem: "Applies the change once then reverts",
        fix: "Use the same cue word repeatedly across several sessions",
      },
    ],
    rubric: {
      emerging:
        "Ignores or resists feedback. No visible change after coaching, and may react defensively.",
      developing:
        "Attempts a change when asked directly, but it does not last beyond the drill.",
      consistent:
        "Takes on feedback and holds the change through the rest of the session.",
      advanced:
        "Applies coaching in a match without reminders, and seeks feedback out on their own.",
    },
  },
  {
    id: "social.respect",
    pillar: "Social",
    name: "Respect and fair play",
    description:
      "How they treat opponents, referees and teammates, especially when things go against them. Non-negotiable at every level.",
    activities: [
      "Player-refereed games where the players make their own calls",
      "Handshake and one genuine compliment to an opponent after every game",
      "Discussion of a foul situation with no blame attached",
    ],
    coachingCue: "Respect the game",
    waysToImprove: [
      {
        problem: "Argues with the referee",
        fix: "Have them referee a game themselves and talk about it afterwards",
      },
      {
        problem: "Mocks opponents after scoring",
        fix: "Set a clear celebration standard and apply it consistently to everyone",
      },
      {
        problem: "Fouls out of frustration",
        fix: "Link it back to the reset routine and substitute briefly to cool down",
      },
    ],
    rubric: {
      emerging:
        "Argues with officials, disrespects opponents, or reacts badly to decisions.",
      developing:
        "Behaves well when things go their way, but respect slips when frustrated or losing.",
      consistent:
        "Treats teammates, opponents and officials well through most of a practice or game.",
      advanced:
        "Holds the standard under real provocation in a match, and sets the tone for teammates.",
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
  updatedAt: "2026-08-29T00:00:00.000Z",
  subSkills: SEED_SUB_SKILLS,
};
