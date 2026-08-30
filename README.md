# PlayerPath

A mobile coaching reference and player-assessment tool for volunteer grassroots
soccer coaches working with players aged 9–12.

Built against `PlayerPath_BRD_Revised_v1.1.docx`.

---

## What it does

Five development pillars → 21 sub-skills. Each carries coaching content (a cue,
what good looks like, activities, three ways to improve) and four skill-specific
rubric anchors (Emerging / Developing / Consistent / Advanced).

**The coach is the measurement instrument.** They watch a player, read four
descriptions of observable behaviour, and tap the one that matches. There is no
video, no computer vision, and no automated scoring anywhere in this product.

### The assessment workflow

From the workbook's Scoring Framework, implemented end to end:

1. Observe the skill in a game or representative activity
2. Rate 1–4 against the skill-specific anchors — **or leave it blank**
3. Record one brief piece of evidence
4. Set a priority: High / Medium / Maintain
5. Reassess after the development block

Two rules from that sheet shape the code, not just the copy:

- **No forced score.** Not-observed is a real state, reachable in one tap, and
  clearing a rating deletes the record rather than storing a zero — otherwise
  unobserved skills would drag every average down.
- **Development, not ranking.** Averages band conservatively: an exact tie such
  as 2.5 rounds *down*, because the framework says a 3 or 4 should be seen
  repeatedly. The profile is never presented as a talent grade.

Everything a coach records stays on their own phone and is never uploaded.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js 16 (App Router), static export | No server to run; the whole app precaches for offline sideline use |
| Styling | Tailwind v4 | — |
| Content store | Firestore (single document) | Owner edits in-app; coaches read without signing in |
| Admin auth | Firebase Auth (email/password) | Owner only |
| Hosting | Firebase Hosting | Static files + the same project as Firestore |

There is deliberately **no backend service**. Firestore security rules are the
authorization boundary.

## Running locally

```bash
npm install
npm run dev
```

The app works immediately on built-in seed content — Firebase is optional until
you want editable content.

## Firebase

Project: **`civic-lens-ai`** (shared with Civic Lens AI — PlayerPath uses only the
`content` and `content_versions` collections). A dedicated project was preferred
but the account is at its Cloud project quota; migrating later means re-importing
one document.

**Done:**
- Web config in `.env.local`
- Firestore database created (`nam5`)
- `firestore.rules` deployed — content is world-readable, writes denied

**Still required:**
1. Firebase Console → Authentication → **enable Email/Password**
2. Authentication → Users → **add your owner user**
3. Copy that user's UID into `firestore.rules`, replacing `REPLACE_WITH_OWNER_UID`
4. Authentication → Settings → User actions → **disable self-signup**
5. Redeploy the rules, then sign in at `/admin` and press **Publish** to seed
   Firestore from the built-in content

```bash
firebase deploy --only firestore:rules
```

Until step 3, the rules deliberately fail closed: coaches can read, nobody can write.

### About the key

The six `NEXT_PUBLIC_FIREBASE_*` values are **public by design**. Every Firebase
web app ships them in its JavaScript bundle; they identify the project, they do
not authorize anything. Security comes from `firestore.rules`.

A **service-account JSON is different** — it bypasses all rules. It is not needed
by this project and must never be committed or placed in `.env.local`.

## Editing content

Sign in at `/admin`:

- **Edit any sub-skill** in a form — cue, description, activities, improvements
  and all four rubric levels.
- **Import a spreadsheet** — a workbook with `Skills` and `Scoring Framework`
  sheets, joined on pillar + sub-skill. Column names are matched loosely
  (`sub_skill`, `Sub-skill`, `SubSkill` all work), and the anchor table is found
  wherever it starts on the Scoring Framework sheet.
- **Publish** — blocked while any validation issue is outstanding.

Every save writes a version snapshot, keeping the last 10 for rollback.

### Regenerating the baked content

```bash
node scripts/import-workbook.mjs path/to/coach_skills_with_player_scoring_framework.xlsx
```

Rewrites `lib/seed-content.ts`, the offline fallback compiled into the bundle.
Day-to-day edits should go through the admin editor instead.

### Validation

`lib/validate.ts` enforces the BRD's §3.3.3 data-quality rules on both import and
save: stable unique ids, all required fields present, 2–3 activities, exactly 3
ways to improve, all four rubric anchors present and mutually distinct, and no
orphaned rubric rows. This is acceptance criterion **AC-10**, automated.

## Deploying

```bash
npm run build          # static export to ./out
firebase deploy --only hosting
```

## Design notes

**Responsive by layout, not by scaling.** A phone gets a single column and a
bottom tab bar, because on a phone held one-handed the bottom third is the only
reachable area. From `md` that becomes a left rail — a bottom bar on an iPad is
both unreachable and a waste of the horizontal space that makes a tablet useful.
From `lg` the skill screen drops its tabs entirely and shows coaching content and
the rubric side by side, which is how a coach actually uses them: reading the
anchor while looking at what good looks like.

**Light theme only, on purpose.** The sports-app convention is dark surfaces, but
NFR-2 requires legibility in direct daylight, where dark UIs lose — the screen
emits less light and ambient reflection washes the surface out. Dark text on a
bright background is the readable choice outdoors.

**Search-first home.** The BRD filed search as a *Should*. It ships as a *Must*
because a coach on the sideline knows the skill name, not which pillar it was
filed under, and over 21 records it costs nothing.

**Offline is a Must, not a Could.** The BRD deprioritised it assuming a no-code
build. With a content payload this small, precaching everything is one service
worker, and it removes risk R-4 outright.

**Rubric colours are not red-to-green.** Red on a 10-year-old's skill reads as a
judgement on the child. Neutral slate rising to green reads as a journey while
still being an obvious progression.

**Firebase loads lazily.** The SDK is ~650KB and would otherwise dominate a
coach's first load. The app paints from baked content, then pulls Firebase in
afterwards, off the critical path (NFR-1).

## Known gaps

- **Onboarding is undecided.** The scoring rules are inline on the Assess tab
  under "How to score this". A fuller first-run intro and the home-screen install
  prompt are still open decisions.
- **Player metadata is minimal by choice.** The workbook's assessment sheet has
  fields for name, age group, position and dominant foot. The app stores only a
  free-text label and suggests a jersey number, since less identifying data about
  a child on a phone is better. Easy to extend if the pilot needs it.
- **One assessment per player.** Re-rating replaces the previous value. The
  workbook's "reassess after the development block" step implies history, which
  is Phase 3 (BRD §1.5 excludes longitudinal tracking from v1).
- **Not built, per BRD §1.5:** accounts, cross-session player history,
  parent/player views, session-plan generation.

## A note on the xlsx dependency

`xlsx` (SheetJS) is installed from **`cdn.sheetjs.com`, not npm**. SheetJS stopped
publishing to npm at 0.18.5, and that stale version carries two high-severity
advisories (prototype pollution, ReDoS) that npm reports as "no fix available" —
because the fix lives on the vendor's own registry. Installing from there gives
0.20.3 and a clean `npm audit`.

The practical exposure was low either way: the parser is lazily loaded on the
admin route only, never reaches a coach's device, and only ever parses a file the
signed-in owner picked themselves. But an unpatched advisory on the default branch
is not worth carrying when the vendor ships a fix.

If a CI environment cannot reach `cdn.sheetjs.com`, that install will fail — this
is the one dependency not resolvable from the npm registry alone.

## Photography

Stock photography from [Pexels](https://www.pexels.com), free to use under the
Pexels licence.
