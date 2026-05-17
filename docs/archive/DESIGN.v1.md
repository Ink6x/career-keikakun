# DESIGN.md - キャリアけいかくん

Last updated: 2026-05-15

This document defines the visual direction and component rules for キャリアけいかくん.
It replaces the earlier reference-style notes copied from another site. The app
should keep the calm, trustworthy, blue-tinted impression from that reference,
but all product language, components, and layout rules below are specific to
キャリアけいかくん.

## 1. Visual Direction

キャリアけいかくん is a career preparation app, not a playful quiz and not an enterprise
admin console. The UI should feel calm, practical, and credible while still being
easy enough for a first-time user to try without reading instructions.

The product should communicate:

- career clarity
- evidence-based preparation
- structured AI analysis
- steady progress over 90 days
- professional trust without feeling cold

Avoid:

- heavy marketing hero sections
- decorative gradients or floating blobs
- playful chatbot styling
- dense enterprise dashboard styling on the first screen
- ecommerce/product-card language
- medical, wellness, sleepwear, or retail terminology from the old reference

## 2. Color System

The palette uses blue-tinted neutrals with restrained accent colors. This keeps
the product credible for career and AI workflow use while avoiding a one-note
blue interface.

### Core Tokens

| Token | Hex | Role |
| --- | --- | --- |
| Brand Navy | `#284b7d` | Primary actions, active nav, score highlights |
| Ink | `#18181b` | Primary text |
| Muted Text | `#5f6673` | Secondary text and helper copy |
| Soft Blue Surface | `#eef2f7` | Page bands, quiet background panels |
| Blue Gray Surface | `#dde1f0` | Secondary panels and dividers |
| White | `#ffffff` | Main surfaces |
| Positive Green | `#15803d` | Matched status, progress improvements |
| Warning Amber | `#b7791f` | Partial match, attention states |
| Risk Red | `#b42318` | Missing status, validation errors |
| Evidence Gold | `#c6a24a` | Evidence material and portfolio proof highlights |
| Process Violet | `#6d5bd0` | Process Trace and technical pipeline accents |

### Usage Rules

- Use `#284b7d` for the most important CTA and active workspace navigation.
- Use `#eef2f7` and `#dde1f0` for calm background contrast.
- Use semantic colors sparingly and only for status: matched, partial, missing,
  validation, and progress.
- Use `#c6a24a` only for evidence-related highlights, not as a general accent.
- Use `#6d5bd0` mainly inside Process Trace so technical details have a distinct
  but quiet identity.
- Do not use large purple/blue gradients as page backgrounds.

## 3. Typography

The app should use reliable, license-safe fonts.

```css
--font-sans: Inter, "Noto Sans JP", YuGothic, "Yu Gothic",
  "Hiragino Kaku Gothic ProN", sans-serif;
--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
```

Typography rules:

- Body text: `16px`, weight `400` or `500`, line-height `1.65`.
- Compact helper text: `13px` or `14px`, line-height `1.5`.
- Workspace section headings: `22px` to `28px`, weight `650` or `700`.
- Start screen H1: `40px` desktop, `30px` mobile, weight `700`.
- Numeric score: `48px` to `64px`, weight `750`, tabular numbers.
- Letter spacing should remain `0` or `normal`.
- Do not scale font size directly with viewport width.

## 4. Layout Principles

### App Flow

The visual structure follows the product flow:

```text
Start
  -> Input / Analyze
  -> Workspace
       - Analyze
       - Plan
       - Review
       - Interview Studio
       - Evidence Builder
       - Process Trace
```

The workspace navigation appears only after analysis is complete.

### Container

- Main content max width: `1180px`.
- Start/Input width: `960px` max.
- Workspace content width: fluid within shell, with readable section widths.
- Desktop page padding: `32px`.
- Mobile page padding: `16px`.

### Spacing Scale

Use an 8px-based scale:

| Token | Value | Use |
| --- | --- | --- |
| XS | `4px` | Tiny gaps, icon/text spacing |
| S | `8px` | Tight component spacing |
| M | `16px` | Form fields, card internals |
| L | `24px` | Section internals |
| XL | `40px` | Major section gaps |
| XXL | `64px` | Start screen vertical rhythm |

## 5. Components

### Buttons

Primary button:

- Background: `#284b7d`
- Text: `#ffffff`
- Border radius: `10px`
- Height: `44px` or `48px`
- Font weight: `650`
- Use for: start, analyze, apply review, open plan

Secondary button:

- Background: `#ffffff`
- Text: `#284b7d`
- Border: `1px solid #c8d2e0`
- Border radius: `10px`
- Use for: sample load, new analysis, secondary navigation

Ghost/icon button:

- Background: transparent
- Text/Icon: `#5f6673`
- Hover background: `#eef2f7`
- Use for compact toolbar actions.

Avoid fully pill-shaped buttons except for small status filters or badges. This
app should feel product-focused and precise, not promotional.

### Cards And Panels

Use cards for:

- start choices
- score summary blocks
- finding groups
- week plan cards
- review summary panels
- interview question rows
- evidence material rows
- trace event rows

Card style:

- Background: `#ffffff`
- Border: `1px solid #d8e0eb`
- Border radius: `8px`
- Shadow: none by default
- Hover shadow only when the card is clickable:
  `0 8px 24px rgba(24, 36, 56, 0.08)`

Do not nest cards inside cards. Use dividers or section headers within a larger
panel when grouping related information.

### Inputs

- Background: `#ffffff`
- Border: `1px solid #c8d2e0`
- Focus ring: `0 0 0 3px rgba(40, 75, 125, 0.18)`
- Border radius: `8px`
- Text size: `15px` or `16px`
- Textarea min height:
  - career history: `220px`
  - job posting: `220px`

Validation messages should be direct and specific.

Raw-storage consent should use a checkbox or toggle near the input action. It is
off by default and should be worded plainly as optional encrypted storage for
later editing or reanalysis, not as a required setup step.

### Status Badges

Matched:

- Background: `#e7f6ec`
- Text: `#15803d`

Partial:

- Background: `#fff4dc`
- Text: `#b7791f`

Missing:

- Background: `#fde8e5`
- Text: `#b42318`

Process:

- Background: `#efedff`
- Text: `#6d5bd0`

Use badges for analysis states, requirement status, provider mode, and pipeline
events. Do not use retail badges such as NEW, limited, campaign, or medical.

## 6. Screen-Level Design

### Start

The first screen should present two large, clear choices:

- Try with sample data
- Analyze my own content

The page is one entry section. It should include only short explanatory copy and
the two start actions. Do not show the guided step bar on this screen, and do
not add a long feature section.

### Input / Analyze

Use a centered form area with two large textareas. Keep supporting copy short.
Show lightweight checks before analysis and a pipeline loading state after the
user starts analysis.

Pipeline loading labels:

- Structuring career history
- Extracting job requirements
- Normalizing skills
- Calculating match score
- Creating 90-day plan

### Workspace

Workspace shell:

- Left sidebar on desktop.
- Horizontally scrollable top tab bar on mobile. Do not hide core workspace
  sections behind a hamburger menu.
- Show extracted role, analysis timestamp, compact provider mode, and new
  analysis action.
- Provider mode labels should be short: `Real`, `Fallback`, or `Mock`.
- Do not show provider failure reasons in the workspace shell; detailed fallback
  evidence belongs in Process Trace.

Navigation labels:

- Analyze
- Plan
- Review
- Interview Studio
- Evidence Builder
- Process Trace

### Analyze

Analyze is the main result screen. Use a score-first layout followed by evidence.

Sections:

1. Score Summary
2. Key Findings
3. Requirement Coverage
4. Skill Map
5. Evidence Gaps
6. Next Action

The score summary should be visually prominent, but the requirement coverage
should be close enough that reviewers immediately see the reasoning.

### Plan

Use 12 week cards. Each card includes:

- week number
- objective
- tasks
- evidence to create
- review prompt
- review button

Highlight the active week. Avoid turning this into a calendar app.

### Review

Review is a chat-guided structured weekly check-in.

Layout:

- Left: guided chat with the career coach bot.
- Right: selected week plan and collected review summary.
- Bottom: message input.

The bot should be practical, calm, supportive, and direct. It should feel like a
cram-school teacher for career preparation: on the user's side, but objective
about weak evidence, generic answers, and missing proof. It should ask focused
questions, not act like a playful character.

### Interview Studio

Interview Studio is a structured practice surface for role-specific interview
answers.

Show:

- generated questions
- selected question details
- answer input
- evaluation results
- revised answer outline
- linked requirements or evidence gaps

Use the same calm, supportive, and direct product tone as Review. Avoid playful
chatbot styling and avoid claims that the app can create guaranteed hiring
answers. Feedback can be critical when evidence is weak, but it should always
lead to a concrete next action.

### Evidence Builder

Evidence Builder turns analysis, plan, review, and interview history into a
board of evidence materials the user should create, collect, or improve.

Show:

- evidence material filters
- evidence material list
- selected evidence material detail
- source requirement or gap
- why the material matters
- evidence to create
- next action
- target week
- status

Use Evidence Gold only for proof-related highlights, source links, and artifact
metadata. Do not let this screen become a generic resume-template gallery, and
do not include prose-generation controls.

### Process Trace

Process Trace is the technical proof screen.

Show:

- pipeline steps
- schema validation result
- provider mode
- provider fallback reason codes
- embedding mode and adjacency-use status
- scoring breakdown
- audit events
- fallback events

Do not expose full raw user input. Use summaries, structured outputs, hashes, and
status rows. Do not expose raw prompts, raw completions, or stack traces.

## 7. Responsive Behavior

Breakpoints:

- Mobile: `<= 767px`
- Tablet: `768px - 1023px`
- Desktop: `>= 1024px`

Mobile rules:

- Start actions stack vertically.
- Input textareas stack vertically.
- Workspace sidebar becomes a horizontally scrollable top tab bar. Do not hide
  core workspace sections behind a hamburger menu.
- Review split view becomes stacked: chat first, then collapsible week summary
  and collected review summary.
- Interview Studio becomes stacked: question list first, selected answer
  workspace second.
- Evidence Builder uses compact horizontal filter chips, then evidence material
  list, then selected material detail or drill-in view.
- Process Trace becomes a vertical event list, not a dense table.
- Requirement Coverage may become a list of expandable rows.
- Touch targets should be at least `44px`.

## 8. Do / Don't

Do:

- Keep the interface calm and focused.
- Show analysis reasoning near the score.
- Use structured status badges.
- Make the first action obvious.
- Make Process Trace visible but visually secondary.
- Use evidence language consistently.

Don't:

- Use ecommerce/product-list patterns from the old reference.
- Use copied brand names, retail badges, or medical/wellness wording.
- Build a marketing landing page before the app.
- Hide all technical reasoning behind one score.
- Turn Review into an unlimited generic chatbot.
- Use large decorative gradients, floating blobs, or overly playful visuals.

## 9. Quick Reference

```text
Primary: #284b7d
Text: #18181b
Muted Text: #5f6673
Surface: #eef2f7
Surface Mid: #dde1f0
Border: #d8e0eb
Evidence: #c6a24a
Process: #6d5bd0
Success: #15803d
Warning: #b7791f
Danger: #b42318

Font: Inter, Noto Sans JP, system sans-serif
Body: 16px / 1.65
Cards: radius 8px, border #d8e0eb, no default shadow
Buttons: radius 10px, height 44-48px
Workspace nav: Analyze / Plan / Review / Interview Studio / Evidence Builder /
Process Trace
```
