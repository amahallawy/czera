# Czera hero video — design

**Date**: 2026-05-09
**Project**: Czera Maison ([projects/czera/](../../../))
**Status**: Spec — not yet implemented
**Brand source of truth**: [design.md](../../../design.md)

---

## 1. Goal

Replace the current Czera landing-page hero background image with a **30-second silent looping video** that opens the brand world. The video is a brand film, not a product reel: it sits as the full-bleed hero on [`index.html`](../../../index.html) and plays muted, autoplay, and `playsinline`.

Per [design.md §6.2](../../../design.md), the existing hero is a media-background composition. The video swap-in pattern is already commented in `index.html`. This spec defines what fills that slot.

## 2. Brand and visual constraints

These are inherited from [design.md](../../../design.md) and are non-negotiable for this work:

- **Tonal palette**: warm ivory (`#F4F2EC`), warm beige (`#E7E1D5`), deep charcoal (`#2B2B2B`), and **gold** (`#D4AF36` / `#BA7C17`) used **at most once per shot**.
- **Voice/posture**: quiet, certain, materially specific. Editorial, not promotional. No marketing energy.
- **Motion**: "imperceptible per frame" — slow, contemplative, single-axis camera moves only. No springs, bounces, parallax, or scroll-jacking.
- **Imagery subjects** (per [design.md §8](../../../design.md)): stacked towels, fabric closeups, hands folding, bath scenes, robe on a hook, single rose petal on white cotton. Warm, side-lit, soft shadow. Never flat product-on-white.
- **Anti-patterns**: stock-grade product-on-white, marketing copy, drone shots, cool/blue tones, harsh studio light, exclamation-mark energy.
- **Accessibility**: `prefers-reduced-motion` MUST fall back to a static poster frame (per [design.md §11](../../../design.md)).

## 3. Glossary

| Term | Meaning |
|---|---|
| **Beat** | A single shot in the 30-second sequence. There are 5 beats. |
| **Take** | One generated video output for a given beat. We render 3 takes per AI beat for selection. |
| **Anchor still** | The single Nano Banana 2 image that defines aesthetic continuity across all beats. |
| **R-mark** | The decorated R letter from the Czera wordmark — the brand sign-off element used in beat 5. |
| **Style-edit** | Nano Banana 2's iterative editing flow: take an existing image and prompt for a new scene that preserves lighting, palette, and grain. |
| **Continuity check** | Side-by-side review of all stills (or all clips) confirming they read as one film. |

## 4. Decisions taken (summary)

| Decision | Choice | Rejected alternatives |
|---|---|---|
| Narrative spine | A+D hybrid: Origin → Object + Heritage Atelier | B (pure material), C (domestic ritual), E (other hybrids) |
| Pace and shot count | Slow / contemplative — 5 shots × 6s | 8 × 3.5s (editorial rhythm), 12 × 2.5s (tight cuts) |
| Brand mark in finale | Final sign-off only (decorated R draws on, holds, fades) | Woven motif throughout, real-time stitching of R |
| Hero overlay text | Clean — video plays full-bleed without overlay | Title + scroll cue overlaid on every shot |
| Over-generation | 3 takes per AI beat (4 beats × 3 = 12 video gens, insurance not optionality) | Alternate beats only, hybrid mix |
| Beat 5 (R sign-off) | Compositing only — not AI generated | AI-generated final frame |
| Image generator | Nano Banana 2 (Gemini 3 Pro Image) via Lovart | Midjourney v7, Flux 1.1 Pro, CapCut's Seedream |
| Video generator | Seedance 2 image-to-video via Lovart *(Lovart's top-tier video model as of 2026-05; Kling not currently in Lovart's inventory)* | Veo 3 (not in Lovart), Runway Gen-4 (not in Lovart), Hailuo MiniMax, CapCut's bolted-on AI |
| Editor / compositor | CapCut Pro | DaVinci Resolve, After Effects, Premiere |

## 5. The 30-second sequence

5 beats, 6 seconds each, straight cuts between beats.

| # | Time | Beat | What's in frame | Camera | Color/light |
|---|------|------|-----------------|--------|-------------|
| 1 | 0–6s | **Origin** | Egyptian cotton field, rows of open bolls. Foreground boll catches the light. | Slow lateral drift, right→left, ~3% travel | Golden hour, low warm sun, long shadows |
| 2 | 6–12s | **Atelier** | Hands at a wooden floor loom, shuttle mid-pass. Cairo workshop interior. | Slow push-in on the hands, ~5% zoom | Warm window light from camera-left, deep shadow on the right |
| 3 | 12–18s | **Material** | Macro on finished ivory weave; a single deep-gold thread drawn through with a needle. | Imperceptible drift + barely-there focus pull onto the gold thread | Soft top-down light, ivory-on-ivory with one gold accent |
| 4 | 18–24s | **Object** | Stack of folded ivory towels on worn wood; a hand sets the top towel down and withdraws. | Slow tilt-down, ~10° travel | Late afternoon, warm side-light, one gold-light edge |
| 5 | 24–30s | **Sign-off** | Soft ivory ground; the decorated **R** draws on in deep gold, holds, fades. | Static | Pure ivory plate — no texture |

### 5.1 Sequence rules

- **Gold appears exactly twice** across the 30 seconds (the thread in beat 3, the R in beat 5). This applies the brand's "one accent per screen" rule across time.
- **Color continuity** is non-negotiable: every shot stays inside the warm ivory + charcoal + gold envelope. The cotton field shot uses dawn/dusk warm green-gold, *not* noon green.
- **Calm zone** in every shot: even with no overlay text, the eye needs a resting point.
- **Loop seam**: beat 5's last frame (ivory hold) must blend acceptably back into beat 1's first frame.

## 6. Per-beat prompts (Lovart-adapted)

Prompts below are written for Lovart's UI: aspect ratio is set in the dropdown (not in prompt text), negatives are inlined at the end of each prompt, and Seedance 2 motion prompts use a structured *Camera: / Subject: / Avoid:* layout that describes only what *moves* — the input image already defines what's in frame.

### 6.1 Lovart UI settings (apply to every generation)

**For Nano Banana 2 stills:**
- Model: explicitly select **Nano Banana 2** (Gemini 3 Pro Image) — verify Lovart hasn't auto-routed to a cheaper image model
- Aspect ratio: **16:9 widescreen**
- Brand-builder: confirm the Czera brand context is loaded (see [lovart-brand-guidance.md](../../lovart-brand-guidance.md))

**For Seedance 2 video:**
- Model: explicitly select **Seedance 2** (Lovart's top-tier video model) — do not accept Seedance 1 / Seedance Lite / MiniMax / older fallbacks
- Clip length: **5 seconds** — see [§6.1.1 below](#611-handling-the-5s-clip-vs-6s-beat-mismatch) for how this lands in a 6s beat
- Motion strength / intensity slider: **low (1–3 out of 10, depending on Lovart's scale)** — Seedance 2's default leans more energetic than Czera's "imperceptible per frame" rule allows; the slider does heavy lifting here
- Resolution: **1080p** if available; upscale Seedance's native output in CapCut if it exports lower

#### 6.1.1 Handling the 5s clip vs 6s beat mismatch

Seedance 2 renders at fixed 5s or 10s. The design calls for 6s per beat. Two options:

- **Time-stretch in CapCut (recommended)**: render at 5s, then in CapCut play each clip back at **0.83× speed** (a ~20% stretch to 6s). At Czera's already-imperceptible motion pace, the stretch is invisible and arguably *helps* — it makes the slow camera move slower, which suits the brand. This is the default move and the cost line in [§8](#8-cost-estimate) assumes it.
- **Render at 10s, trim to 6s**: better stock quality (more frames = more controlled motion), but **doubles the video cost line** (~$50–100 instead of ~$25–50). Only do this if the time-stretched 5s versions visibly soften — most won't.

Either way, the **30-second total is preserved**: 5 beats × 6s = 30s. Beat 5 (the R sign-off) is rendered fresh at 6s in CapCut and isn't subject to this rule.

### 6.2 Iterative-edit workflow (the killer move)

Generate Beat 3 first as a fresh image — it's the strongest aesthetic anchor. For Beats 1, 2, 4: **upload the chosen Beat 3 image** to the prompt and write only what changes. Lovart wires the uploaded image into Nano Banana 2's edit endpoint and preserves lighting, palette, and grain across the new scene.

The edit-prompt template:
> *"Same lighting, palette, and film stock as the reference image — but now: \[scene-specific description]. Avoid: \[anti-pattern list]."*

### 6.3 Beat 3 — Material *(generate first, fresh, no reference image)*

**Image prompt** (Nano Banana 2):
```
Macro still life. Finished ivory cotton terry weave, soft loop pile texture, single deep-gold metallic thread being drawn through with a fine needle. Top-down soft light. Ivory-on-ivory tonal palette with exactly one gold accent. Painterly close-up, 35mm film, soft grain, deep depth of field. Avoid: harsh light, flat lighting, oversaturated gold, multiple gold elements, cluttered composition, watermark, agency look.
```

**Image-to-video prompt** (Seedance 2):
```
Camera: very slow dolly-in, near-still, ~3% zoom over the clip.
Subject: a hand draws a deep-gold metallic thread slowly through the ivory cotton weave; focus shifts gently from the broad weave onto the gold thread.
Otherwise frame is still. Cinematic, painterly, contemplative.
Avoid: shaky motion, rapid zoom, lens flare, surreal effects, sparkle, multiple gold threads.
```

### 6.4 Beat 1 — Origin *(uses Beat 3 as reference image)*

**Image prompt** (Nano Banana 2, with Beat 3 attached as reference):
```
Same lighting, palette, and film stock as the reference image — but now: rows of mature Egyptian cotton plants at golden hour, open white cotton bolls catching low warm Nile Delta sun. Foreground boll in sharp focus, distant rows in soft falloff. Warm ivory and gold tonal palette only. No people. Painterly stillness. Restrained heritage feel — reminiscent of Loro Piana and Hermès brand films. Avoid: stock photography, oversaturated colors, drone shot, blue sky dominant, agricultural marketing, harsh shadows, agency look, watermark.
```

**Image-to-video prompt** (Seedance 2):
```
Camera: very slow horizontal pan, right to left, near-still.
Subject: a few cotton bolls sway minimally in a soft breeze; otherwise still.
Sun and shadows do not move. No zoom, no parallax.
Cinematic, painterly, near-imperceptible motion.
Avoid: drone movement, aerial swoop, shaky cam, fast pan, dramatic light changes, time-of-day shift.
```

### 6.5 Beat 2 — Atelier *(uses Beat 3 as reference image)*

**Image prompt**:
```
Same lighting, palette, and film stock as the reference image — but now: weathered hands at a traditional wooden floor loom, shuttle mid-pass through ivory warp threads, Cairo workshop interior, warm afternoon window light from camera-left, deep shadow on the right side, dust motes in the light beam. No face — only hands and forearms. Weathered wood, raw cotton tones, painterly chiaroscuro. Avoid: modern factory, machinery, fluorescent lighting, plastic, branded clothing, watches, stock photography, oversaturated colors, harsh studio shadow, watermark.
```

**Image-to-video prompt** (Seedance 2):
```
Camera: very slow dolly forward, ~5% zoom over the clip.
Subject: hands at the wooden loom — a single shuttle pass across the warp threads, slight finger articulation; dust motes drift through the warm light beam.
Otherwise still. Cinematic, painterly, contemplative.
Avoid: shaky motion, fast push-in, machinery, modern factory imagery, multiple hands, rapid finger movement, watches.
```

### 6.6 Beat 4 — Object *(uses Beat 3 as reference image)*

**Image prompt**:
```
Same lighting, palette, and film stock as the reference image — but now: stack of three folded ivory Egyptian cotton bath towels on worn dark wood, late afternoon raking warm side-light from camera-right, soft long shadows, one warm gold edge of light along the top fold, neutral background falling into warm shadow. No logos, no labels. Reminiscent of Frette and Abyss Habidecor still life photography. Avoid: white seamless background, product photography studio look, harsh studio light, multiple colors, busy background, branded packaging, watermark.
```

**Image-to-video prompt** (Seedance 2):
```
Camera: very slow tilt down, ~10° travel, near-still.
Subject: a hand enters from the top of the frame, places a folded ivory towel onto a stack, withdraws cleanly; towels settle naturally.
Otherwise still. Cinematic, painterly.
Avoid: shaky motion, rapid tilt, multiple hands, abrupt movement, towels falling or unfolding, modern packaging or labels.
```

### 6.7 Continuity tricks

1. **Style-anchor first.** Beat 3 sets the visual world. Generate it first; reuse as the reference image for Beats 1, 2, 4.
2. **One color preset in CapCut.** After all 4 video clips are picked, apply a single warm-ivory adjustment preset to every clip rather than grading each independently.
3. **Lovart brand-builder.** Confirm the Czera context (see [lovart-brand-guidance.md](../../lovart-brand-guidance.md)) is active before each generation. Lovart can silently lose brand context between sessions.

### 6.8 Beat 5 — R sign-off (compositing only, no AI)

Built directly in CapCut:
- **Plate**: solid ivory `#F4F2EC`
- **0.0–1.5s**: 0% → 100% on a stroke-draw mask reveal of the decorated R, color `#BA7C17`
- **1.5–4.5s**: hold at 100%
- **4.5–6.0s**: gentle fade to 0% (or hold to loop seam)

The R must be **pixel-clean** at 1920px width. Use a 3000px+ source PNG or rebuild as inline-SVG screen-recorded if any anti-alias smearing appears.

## 7. Tool stack

| Stage | Tool | Model |
|---|---|---|
| Stills (~12 with iterative editing) | Lovart | Nano Banana 2 |
| Image-to-video (12 takes) | Lovart | **Seedance 2** *(Lovart's top-tier video model as of 2026-05; must be selected explicitly — not Seedance 1, not Seedance Lite, not MiniMax)* |
| Cut + grade + R-mark animation + export | CapCut Pro | n/a (pure editor) |

**Do not** use CapCut's in-app AI gen for any hero footage — even though CapCut's video gen is also Seedance-family. The Lovart integration of Seedance 2 gives you motion-strength control, separated camera/subject prompting, and the iterative-edit pipeline; CapCut's bolted-on AI does not.

**On Seedance 2 vs. the broader market**: Seedance 2 is competitive with Kling 2.1 Master and Veo 3 for editorial cinematic motion as of early 2026. Its default leans more energetic than Kling — the motion-strength slider and the explicit "near-still" prompt language compensate. If Lovart later adds Kling Master or Veo 3 to its inventory, those would be worth A/B-testing on Beat 3 to confirm the stylistic match; for now, Seedance 2 is the right ceiling.

## 8. Cost estimate

| Item | Quantity | Unit | Cost |
|------|----------|------|------|
| Lovart credits — Nano Banana 2 stills | ~12 stills + retries | per credits | ~$15–25 |
| Lovart credits — Seedance 2 video | 12 takes × 5s | per credits | ~$25–50 |
| CapCut Pro | 1 month | $10/mo | ~$10 |
| **Total** | | | **~$50–85** |

Beat 5 is non-AI, so 12 video takes (not 15). Seedance 2 in Lovart is typically slightly cheaper than equivalent Kling/Veo routes elsewhere — confirm exact credit cost in Lovart's UI before committing the full batch (it's worth burning ~5 credits on a single test generation to anchor the budget). If Lovart credit cost is materially higher than expected, fall back to Lovart's Standard plan rather than Pro for this batch — Seedance 2 is available on both.

## 9. Workflow + acceptance gates

8 stages, 8 gates. Each gate must clear before the next stage starts.

### Stage 1 — Style anchor (beat 3 first)
Generate 3–4 macro-weave candidates in Nano Banana 2.
**Gate 1**: pick the candidate that nails ivory-on-ivory tone, exactly one gold accent, painterly softness, recognizable Egyptian terry. Re-generate if no clear winner.

### Stage 2 — Style-edit anchor into beats 1, 2, 4
2–3 edits per beat using Nano Banana 2's iterative flow.
**Gate 2 (continuity)**: lay all 4 stills side-by-side. Same warmth, same grain, same calm-zone discipline. Re-edit any outlier from the anchor — don't lower the bar to fit.

### Stage 3 — Image-to-video, 3 takes per beat
Verify Seedance 2 is selected in Lovart (it may default to a cheaper/faster model). Set motion strength to low (1–3 out of 10). 12 total takes at 5s.
**Gate 3 (per beat)**: one slow move only, no content drift (extra fingers, sparkles on gold), acceptable last-frame for cut.

### Stage 4 — Color continuity grade + time-stretch in CapCut
For each of the 4 clips:
1. Set playback speed to **0.83×** to stretch the 5s render to 6s (per [§6.1.1](#611-handling-the-5s-clip-vs-6s-beat-mismatch))
2. Apply the warm-ivory preset (one preset, all 4 clips)
3. Tweak per-clip only to bring outliers into the family

**Gate 4**: scrub through all 4 in sequence. Reads as one piece. The 0.83× stretch is invisible at Czera's contemplative pace — if it isn't (any clip looks visibly slo-mo), the source motion was too energetic and that beat needs a re-take with motion-strength dropped further in Lovart.

### Stage 5 — R-mark animation (beat 5)
Build directly in CapCut per [§6.4](#64-beat-5--r-sign-off-compositing-only).
**Gate 5**: R is pixel-clean at 1920px width.

### Stage 6 — Assembly
Sequence 1 → 2 → 3 → 4 → 5. Straight cuts between AI beats; only fade is into beat 5's ivory plate.
**Gate 6 (the muted test)**: play 30s with audio off. Holds attention without sound, no beat begs for music.

### Stage 7 — Web delivery exports
- **Master**: 1920×1080, H.264, ~5–8 Mbps, `.mp4`
- **Mobile cut**: 1080×1350 (4:5 per [design.md §8](../../../design.md)) — re-frame each beat for vertical composition; do *not* letterbox the 16:9 master
- **Web optimized**: VP9, ~2–3 Mbps target, `.webm`
- **Poster frame**: still PNG/JPG of beat 1 frame 1

**Gate 7**: master `.mp4` < 5 MB; `.webm` < 3 MB; mobile cut < 3 MB. Re-encode at lower bitrate before considering quality compromises.

### Stage 8 — Browser integration
In [`index.html`](../../../index.html), swap hero `<img>` for `<video autoplay muted loop playsinline poster="...">` with `.webm` first source and `.mp4` fallback. Wire `prefers-reduced-motion: reduce` to fall back to the poster image only.

**Gate 8 (final)**:
- Plays autoplay-muted in Chrome, Safari, Firefox
- Mobile Safari plays inline
- iOS low-power mode shows poster, not a black box
- `prefers-reduced-motion: reduce` shows poster only
- Lighthouse LCP on the hero stays under 2.5s on 4G

## 10. Open questions and follow-ups

These do not block generation but should be resolved before the hero ships:

1. **Mobile crop strategy**: confirm 4:5 aspect ratio per [design.md §8](../../../design.md) and whether each beat needs a re-framed vertical version (recommended) or a single center-safe frame the same crop can hit (less work, less polish).
2. **Loop seam**: confirm the loop point is acceptable, or design a brief ivory hold at the end of beat 5 that bleeds into beat 1's first frame.
3. **Bilingual context**: the Arabic surface (`<html lang="ar" dir="rtl">`) — does the video play identically, or do we mirror the lateral camera direction in beat 1 to match RTL reading direction?
4. **CDN / hosting**: where do the `.mp4` and `.webm` files live? If on the same origin as the static site, Largest Contentful Paint may suffer; consider a CDN for the hero loop specifically.
5. **Czera repo promotion**: this spec lives on disk in an untracked sub-project (per current ADR-0002 status). When czera is promoted to its own repo, this file should be committed in the bootstrap PR.

## 11. Implementation handoff

The next step is the **writing-plans** skill — turning this spec into a step-by-step execution plan with concrete prompts, ordered actions, and review checkpoints. The plan will be a separate document.
