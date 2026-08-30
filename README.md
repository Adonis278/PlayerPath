# PlayerPath

A mobile coaching reference and player-assessment tool for volunteer grassroots
soccer coaches working with players aged 9–12.

Built against `PlayerPath_BRD_Revised_v1.1.docx`.

---

## What it does

Five development pillars → 21 sub-skills. Each sub-skill carries coaching content
(a cue, what good looks like, 2–3 activities, three problem→fix pairs) and a
four-level rubric (Emerging / Developing / Consistent / Advanced).

A coach watches a player, opens the sub-skill, reads four descriptions of
observable behaviour, and taps the one that matches. **The coach is the
measurement instrument** — there is no video, no computer vision, and no automated
scoring anywhere in this product.

Scores are saved on the coach's own phone and are never uploaded.

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
- **Import a spreadsheet** — a workbook with `Skills` and `Rubric` sheets, joined
  on pillar + sub-skill. Column names are matched loosely (`sub_skill`,
  `Sub Skill`, `SubSkill` all work).
- **Publish** — blocked while any validation issue is outstanding.

Every save writes a version snapshot, keeping the last 10 for rollback.

### Validation

`lib/validate.ts` enforces the BRD's §3.3.3 data-quality rules on both import and
save: stable unique ids, all required fields present, 2–3 activities, exactly 3
problem→fix pairs, all four rubric levels present and mutually distinct, and no
orphaned rubric rows. This is acceptance criterion **AC-10**, automated.

## Deploying

```bash
npm run build          # static export to ./out
firebase deploy --only hosting
```

## Design notes

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

- **Content is placeholder.** `lib/seed-content.ts` is a working draft written to
  the correct structure and rubric calibration, pending
  `coach_skills_technical.xlsx` from the product owner.
- **Onboarding is undecided.** Calibration guidance (the ages 9–12 framing and the
  between-two-levels tie-breaker) is inline on the Assess tab. A fuller first-run
  intro and the home-screen install prompt are still open decisions.
- **Not built, per BRD §1.5:** accounts, cross-session player history,
  parent/player views, session-plan generation.

## Photography

Stock photography from [Pexels](https://www.pexels.com), free to use under the
Pexels licence.
