# Czera hero video — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Note:** This plan is a hybrid AI-production + small engineering swap, *not* a typical TDD code feature. Production tasks use **gate checks** (verification by acceptance criteria) instead of test-first. Only the engineering phase (HTML/CSS swap) follows traditional verify-by-test discipline.

**Goal:** Replace the Czera landing-page hero background image with a 30-second silent looping video built from 5 cinematic beats — generated via Lovart (Nano Banana 2 + Seedance 2), assembled in CapCut Pro, and wired into the static site with a `prefers-reduced-motion` fallback.

**Architecture:** Two-phase pipeline.
1. **Production** (Lovart + CapCut): generate 1 anchor still in Nano Banana 2 → edit-iterate it into 3 more stills → generate 3 takes per AI beat in Seedance 2 (12 takes) → select 1 per beat → time-stretch from 5s to 6s and grade in CapCut → composite the Beat 5 R-mark animation → assemble + export multi-format web assets.
2. **Engineering** (czera codebase): swap hero `<img>` for a `<video>` element with `.webm` + `.mp4` sources, poster fallback, and `prefers-reduced-motion` graceful degradation. Verify cross-browser playback and Lighthouse LCP.

**Tech Stack:** Lovart (Nano Banana 2 image gen, Seedance 2 image-to-video), CapCut Pro (cut + grade + R-mark animation), vanilla HTML/CSS/JS (no build pipeline per [czera CLAUDE.md](../../../CLAUDE.md)), Lighthouse CLI for performance verification.

**Spec reference:** [2026-05-09-czera-hero-video-design.md](../specs/2026-05-09-czera-hero-video-design.md)

---

## File structure

### Production outputs (generated, not pre-existing)

| Path | Source | Purpose |
|------|--------|---------|
| `projects/czera/assets/video/hero-30s.mp4` | CapCut H.264 export | Master web video, 16:9, 1920×1080, ≤ 5 MB |
| `projects/czera/assets/video/hero-30s.webm` | CapCut VP9 export | Web-optimized first-source, ≤ 3 MB |
| `projects/czera/assets/video/hero-mobile-30s.mp4` | CapCut re-framed mobile cut | Vertical 4:5 mobile, 1080×1350, ≤ 3 MB |
| `projects/czera/assets/img/hero-poster.jpg` | Beat 1 first frame | `<video poster>` + `prefers-reduced-motion` fallback |

### Code modifications

- **Modify**: [`projects/czera/index.html`](../../../index.html) — swap hero `<img>` for `<video>` element
- **Modify**: [`projects/czera/css/pages/landing.css`](../../../css/pages/landing.css) — adjust hero CSS for video element + add `prefers-reduced-motion` rule

---

## Production phase

### Task 1: Lovart brand context setup

**Files:**
- Reference (read): [`projects/czera/docs/lovart-brand-guidance.md`](../../lovart-brand-guidance.md)

- [ ] **Step 1: Verify brand image files are uploaded in Lovart's brand-builder**

Log into Lovart. Open the project's brand-builder. Confirm that the brand reference images (cotton, looms, towel stacks, brand book pages, the wordmark with the decorated R) are present. If not, re-upload them now.

- [ ] **Step 2: Open the brand-guidance file and copy the full version**

Open [`projects/czera/docs/lovart-brand-guidance.md`](../../lovart-brand-guidance.md). Copy the **full version** code block (the one starting with `Czera Maison is a premium Egyptian cotton towel brand...`).

- [ ] **Step 3: Paste into Lovart's "Design guidance" / "Brand instructions" field**

Paste the copied text. Save. If Lovart caps the field at < 1900 characters, copy and paste the **short version** instead.

- [ ] **Step 4: Smoke-test the brand block**

Generate one quick test still with the prompt: `a folded ivory towel on dark wood`. Aspect ratio 16:9. Use Nano Banana 2.
**Gate**: the output should read as Czera (warm ivory, soft side-light, painterly), not generic e-commerce or stock photography. If it drifts, your reference images are doing more work than the text — that's fine, but note it. If it looks like a marketplace product photo, the brand block isn't active. Re-paste and re-save before continuing.

- [ ] **Step 5: Save the working state**

In Lovart, name and save the project as `czera-hero-30s`. All subsequent generations should be inside this project so the brand context persists.

---

### Task 2: Generate Beat 3 (Material) — the aesthetic anchor

This is the most important still in the entire production. It defines the visual world that every other beat inherits via Nano Banana 2's iterative-edit flow.

**Files:**
- Output target: `czera-hero-still-beat3-material.png` (downloaded to local `assets/img/working/` or wherever you keep WIP — does **not** ship to production)

- [ ] **Step 1: In Lovart, select the still-generation panel and pick Nano Banana 2**

Verify the model dropdown reads "Nano Banana 2" (or "Gemini 3 Pro Image"). Lovart sometimes auto-routes to a cheaper model — confirm before generating.

- [ ] **Step 2: Set aspect ratio to 16:9 widescreen**

In Lovart's aspect-ratio dropdown, pick **16:9 widescreen**. Do not type `--ar` flags; Lovart handles aspect via UI only.

- [ ] **Step 3: Paste the Beat 3 image prompt verbatim**

```
Macro still life. Finished ivory cotton terry weave, soft loop pile texture, single deep-gold metallic thread being drawn through with a fine needle. Top-down soft light. Ivory-on-ivory tonal palette with exactly one gold accent. Painterly close-up, 35mm film, soft grain, deep depth of field. Avoid: harsh light, flat lighting, oversaturated gold, multiple gold elements, cluttered composition, watermark, agency look.
```

- [ ] **Step 4: Generate 4 candidates**

Click Generate 4 times (or use Lovart's batch-of-4 if available). Wait for all 4 to render.

- [ ] **Step 5: Apply Gate 1 selection criteria**

Pick the candidate that nails **all five**:
- Ivory-on-ivory tonal palette, warm not cool
- Exactly **one** gold accent (the thread) — not two, not subtle gold-glints elsewhere
- Soft top-down light, no harsh studio shadow
- Painterly, not crisp-product-photo
- Reads as Egyptian cotton terry, not satin or linen

If no candidate qualifies, generate 4 more. **Do not lower the bar to fit a candidate** — this still defines the entire film.

- [ ] **Step 6: Save the chosen still**

Download the chosen image. Name it `czera-hero-still-beat3-material.png`. Keep it on disk in a working directory you'll reference in Task 3.

---

### Task 3: Generate Beats 1, 2, 4 by editing the Beat 3 anchor

For each of the three beats below, the workflow is identical: upload the Beat 3 still as a reference image, paste the edit prompt, generate 2–3 edits, pick the strongest. This task has three sub-blocks (3a, 3b, 3c).

**Files:**
- Output targets:
  - `czera-hero-still-beat1-origin.png`
  - `czera-hero-still-beat2-atelier.png`
  - `czera-hero-still-beat4-object.png`

#### 3a — Beat 1 (Origin: cotton field)

- [ ] **Step 1: Open Lovart's edit / image-to-image flow**

In the Nano Banana 2 panel, find the upload-reference-image option (sometimes labeled "Edit", "Image-to-image", or shown as a paperclip icon).

- [ ] **Step 2: Upload the Beat 3 anchor still**

Upload `czera-hero-still-beat3-material.png` from Task 2 Step 6.

- [ ] **Step 3: Set aspect ratio to 16:9 widescreen**

Same UI dropdown as Task 2 Step 2. Confirm it stuck.

- [ ] **Step 4: Paste the Beat 1 edit prompt verbatim**

```
Same lighting, palette, and film stock as the reference image — but now: rows of mature Egyptian cotton plants at golden hour, open white cotton bolls catching low warm Nile Delta sun. Foreground boll in sharp focus, distant rows in soft falloff. Warm ivory and gold tonal palette only. No people. Painterly stillness. Restrained heritage feel — reminiscent of Loro Piana and Hermès brand films. Avoid: stock photography, oversaturated colors, drone shot, blue sky dominant, agricultural marketing, harsh shadows, agency look, watermark.
```

- [ ] **Step 5: Generate 3 edits**

Click Generate 3 times.

- [ ] **Step 6: Apply Gate 2 (continuity-aware) selection**

Pick the candidate that:
- Feels like the same world as the Beat 3 anchor (warmth, grain, softness)
- Has a calm zone — eye can rest somewhere
- Reads as Egyptian cotton at golden hour, not California vineyard
- Has *no* drone-shot or aerial perspective

Re-edit if no candidate qualifies. Save as `czera-hero-still-beat1-origin.png`.

#### 3b — Beat 2 (Atelier: hands at the loom)

- [ ] **Step 1: Reset the edit panel and re-upload the Beat 3 anchor**

Same flow as 3a Step 2.

- [ ] **Step 2: Confirm 16:9 aspect ratio**

- [ ] **Step 3: Paste the Beat 2 edit prompt verbatim**

```
Same lighting, palette, and film stock as the reference image — but now: weathered hands at a traditional wooden floor loom, shuttle mid-pass through ivory warp threads, Cairo workshop interior, warm afternoon window light from camera-left, deep shadow on the right side, dust motes in the light beam. No face — only hands and forearms. Weathered wood, raw cotton tones, painterly chiaroscuro. Avoid: modern factory, machinery, fluorescent lighting, plastic, branded clothing, watches, stock photography, oversaturated colors, harsh studio shadow, watermark.
```

- [ ] **Step 4: Generate 3 edits**

- [ ] **Step 5: Apply Gate 2 selection**

Same continuity criteria as 3a Step 6, plus:
- Hands and forearms only — no face visible
- Weathered wood loom (not modern equipment, not steel)
- Single gold-or-warm light beam, no extra accents

Re-edit if needed. Save as `czera-hero-still-beat2-atelier.png`.

#### 3c — Beat 4 (Object: stack of folded towels)

- [ ] **Step 1: Reset the edit panel and re-upload the Beat 3 anchor**

- [ ] **Step 2: Confirm 16:9 aspect ratio**

- [ ] **Step 3: Paste the Beat 4 edit prompt verbatim**

```
Same lighting, palette, and film stock as the reference image — but now: stack of three folded ivory Egyptian cotton bath towels on worn dark wood, late afternoon raking warm side-light from camera-right, soft long shadows, one warm gold edge of light along the top fold, neutral background falling into warm shadow. No logos, no labels. Reminiscent of Frette and Abyss Habidecor still life photography. Avoid: white seamless background, product photography studio look, harsh studio light, multiple colors, busy background, branded packaging, watermark.
```

- [ ] **Step 4: Generate 3 edits**

- [ ] **Step 5: Apply Gate 2 selection**

Continuity criteria, plus:
- Stack of 3 ivory towels, not 1, not 5
- Worn dark wood or neutral surface — never white seamless
- One warm gold light edge, no second gold accent
- No logos or labels visible

Re-edit if needed. Save as `czera-hero-still-beat4-object.png`.

---

### Task 4: Lock the still set + cross-beat continuity check

**Files:**
- Inputs: all 4 PNGs from Tasks 2 & 3

- [ ] **Step 1: Open all 4 stills side-by-side**

In any image viewer (or just a 2×2 image grid), display:
- `czera-hero-still-beat1-origin.png`
- `czera-hero-still-beat2-atelier.png`
- `czera-hero-still-beat3-material.png`
- `czera-hero-still-beat4-object.png`

- [ ] **Step 2: Run the cross-beat continuity check**

Ask, of all 4 together:
- Do they feel like they're from the same film?
- Same warmth temperature? (No cool drift on cotton field, no warm drift on macro.)
- Same softness/grain? (No sharp digital outlier.)
- Does each have a calm zone the eye can rest on?
- Total gold accents across all 4: should be exactly **one** (in Beat 3). Beats 1, 2, 4 should have zero gold accents in the still.

- [ ] **Step 3: If any beat is an outlier, re-edit it**

Return to Task 3's relevant sub-block (3a / 3b / 3c) and re-run the edit with the Beat 3 anchor as reference. **Do not** lower the bar to fit an outlier — re-generate.

- [ ] **Step 4: Lock the set**

Once all 4 stills clear the continuity check, copy them to a `production-ready/` folder. These are the exact frames feeding Seedance 2. Do not regenerate after this point unless a video take fails Gate 3 in Task 6.

---

### Task 5: Generate Seedance 2 video takes (12 total)

For each of Beats 1, 2, 3, 4: upload the locked still as image-to-video input, generate **3 takes** with the Camera/Subject/Avoid prompt. 12 takes total. Beat 5 is non-AI and skipped here.

**Files:**
- Output targets: 12 mp4 files named `czera-hero-take-beat<N>-take<M>.mp4` (N = 1..4, M = 1..3)

#### Per-take Lovart UI settings (apply to every generation in this task)

| Setting | Value |
|---|---|
| Model | **Seedance 2** (Lovart's top-tier video model) — verify dropdown explicitly |
| Clip length | **5 seconds** |
| Motion strength / intensity | **low** (1–3 out of 10, depending on Lovart's scale) |
| Resolution | **1080p** if available |

- [ ] **Step 1: Open Lovart's video panel and pick Seedance 2**

Verify the dropdown reads "Seedance 2". If it shows "Seedance 1", "Seedance Lite", "MiniMax", or anything else, **stop and switch**. Do not generate with any other model — the spec is locked to Seedance 2.

#### 5a — Beat 1 (3 takes)

- [ ] **Step 1: Upload the Beat 1 still as image-to-video input**

Upload `czera-hero-still-beat1-origin.png`.

- [ ] **Step 2: Apply UI settings**

Clip length: 5s. Motion strength: low (1–3). Resolution: 1080p.

- [ ] **Step 3: Paste the Beat 1 motion prompt verbatim**

```
Camera: very slow horizontal pan, right to left, near-still.
Subject: a few cotton bolls sway minimally in a soft breeze; otherwise still.
Sun and shadows do not move. No zoom, no parallax.
Cinematic, painterly, near-imperceptible motion.
Avoid: drone movement, aerial swoop, shaky cam, fast pan, dramatic light changes, time-of-day shift.
```

- [ ] **Step 4: Generate 3 takes**

Click Generate 3 times. Wait for renders.

- [ ] **Step 5: Save all 3 takes locally**

Download each as `czera-hero-take-beat1-take1.mp4`, `...take2.mp4`, `...take3.mp4`.

#### 5b — Beat 2 (3 takes)

- [ ] **Step 1: Upload the Beat 2 still as image-to-video input**

Upload `czera-hero-still-beat2-atelier.png`.

- [ ] **Step 2: Apply UI settings**

Same as 5a Step 2.

- [ ] **Step 3: Paste the Beat 2 motion prompt verbatim**

```
Camera: very slow dolly forward, ~5% zoom over the clip.
Subject: hands at the wooden loom — a single shuttle pass across the warp threads, slight finger articulation; dust motes drift through the warm light beam.
Otherwise still. Cinematic, painterly, contemplative.
Avoid: shaky motion, fast push-in, machinery, modern factory imagery, multiple hands, rapid finger movement, watches.
```

- [ ] **Step 4: Generate 3 takes**

- [ ] **Step 5: Save all 3 takes**

`czera-hero-take-beat2-take1.mp4`, etc.

#### 5c — Beat 3 (3 takes)

- [ ] **Step 1: Upload the Beat 3 still as image-to-video input**

Upload `czera-hero-still-beat3-material.png`.

- [ ] **Step 2: Apply UI settings**

- [ ] **Step 3: Paste the Beat 3 motion prompt verbatim**

```
Camera: very slow dolly-in, near-still, ~3% zoom over the clip.
Subject: a hand draws a deep-gold metallic thread slowly through the ivory cotton weave; focus shifts gently from the broad weave onto the gold thread.
Otherwise frame is still. Cinematic, painterly, contemplative.
Avoid: shaky motion, rapid zoom, lens flare, surreal effects, sparkle, multiple gold threads.
```

- [ ] **Step 4: Generate 3 takes**

- [ ] **Step 5: Save all 3 takes**

`czera-hero-take-beat3-take1.mp4`, etc.

#### 5d — Beat 4 (3 takes)

- [ ] **Step 1: Upload the Beat 4 still as image-to-video input**

Upload `czera-hero-still-beat4-object.png`.

- [ ] **Step 2: Apply UI settings**

- [ ] **Step 3: Paste the Beat 4 motion prompt verbatim**

```
Camera: very slow tilt down, ~10° travel, near-still.
Subject: a hand enters from the top of the frame, places a folded ivory towel onto a stack, withdraws cleanly; towels settle naturally.
Otherwise still. Cinematic, painterly.
Avoid: shaky motion, rapid tilt, multiple hands, abrupt movement, towels falling or unfolding, modern packaging or labels.
```

- [ ] **Step 4: Generate 3 takes**

- [ ] **Step 5: Save all 3 takes**

`czera-hero-take-beat4-take1.mp4`, etc.

---

### Task 6: Select best take per beat

**Files:**
- Inputs: 12 take mp4s from Task 5
- Outputs: 4 `czera-hero-best-beat<N>.mp4`

- [ ] **Step 1: Watch all 3 takes for Beat 1**

Loop each take. Watch for:
- One slow move only — no jittery wandering
- No content drift (cotton bolls turning into something else, sun changing position, fingers sprouting extra digits)
- Acceptable last frame (no abrupt cut-off mid-motion)
- Readable as the Beat 1 description, not a different scene

- [ ] **Step 2: Pick the best Beat 1 take and copy it forward**

Pick the strongest. Copy/rename to `czera-hero-best-beat1.mp4`. If **none** of the 3 takes pass, return to Task 5a and generate 3 more — likely the motion-strength slider needs to drop further or the prompt needs to over-specify "near-still" more aggressively.

- [ ] **Step 3: Repeat for Beats 2, 3, 4**

Each: watch all 3 takes, apply same Gate 3 criteria, pick winner, save as `czera-hero-best-beat<N>.mp4`. Beat 3 has additional check: only **one** gold thread in the moving footage (Seedance 2 sometimes adds sparkle/halo around the gold accent — reject if so).

- [ ] **Step 4: End-state verification**

You should now have 4 files: `czera-hero-best-beat1.mp4`, `...beat2.mp4`, `...beat3.mp4`, `...beat4.mp4`. All 5 seconds, all 1080p, all stylistically aligned.

---

### Task 7: CapCut project setup + import

**Files:**
- CapCut project file (CapCut handles its own format internally)

- [ ] **Step 1: Open CapCut Pro and create a new project**

New project. Set:
- Resolution: **1920 × 1080**
- Frame rate: **30 fps** (Seedance 2 typically renders 24/30 fps; match what your takes export at — check file properties first)
- Total timeline length: **30 seconds**

- [ ] **Step 2: Import the 4 best takes**

Drag/drop or use Import:
- `czera-hero-best-beat1.mp4`
- `czera-hero-best-beat2.mp4`
- `czera-hero-best-beat3.mp4`
- `czera-hero-best-beat4.mp4`

- [ ] **Step 3: Place each on the timeline in narrative order**

Position on the main video track:
- Beat 1 → starts at 0:00
- Beat 2 → starts at 0:06
- Beat 3 → starts at 0:12
- Beat 4 → starts at 0:18
- (Beat 5 placeholder space → 0:24 to 0:30, will fill in Task 9)

Each clip is 5s of source — the timeline shows gaps. That's expected. The next task closes them via time-stretch.

- [ ] **Step 4: Save the project**

Save the CapCut project file. Name `czera-hero-30s.capcut` (or whatever CapCut's default extension is).

---

### Task 8: Time-stretch + color grade in CapCut

This task closes the 5s-source vs. 6s-beat gap and locks color continuity.

**Files:**
- CapCut project (modified)

- [ ] **Step 1: Set each AI clip's playback speed to 0.83×**

For each of the 4 imported clips, right-click → Speed → set to **0.83×** (this stretches 5s → ~6.02s, close enough; you can fine-trim if needed). Each clip now occupies 6 seconds on the timeline.

- [ ] **Step 2: Verify the timeline is gap-free 0:00–0:24**

After stretching, Beat 1 should end at 0:06, Beat 2 at 0:12, Beat 3 at 0:18, Beat 4 at 0:24. If there are gaps, drag clips to close them — straight cuts, no overlap, no transitions.

- [ ] **Step 3: Build a single warm-ivory color preset**

In CapCut's color/adjustment panel, on Beat 1's clip:
- **Temperature**: push warm, ~+4
- **Tint**: neutral or very slight magenta, never green
- **Lift**: raise blacks slightly toward `#1a1815` (warm dark, not pure black)
- **Saturation**: drop ~10% on anything not gold or skin
- **Contrast**: slight increase, ~+5

Save these settings as a **preset** named "Czera Warm Ivory."

- [ ] **Step 4: Apply the preset to all 4 AI clips**

Apply "Czera Warm Ivory" to Beats 2, 3, 4 (Beat 1 already has it from preset creation).

- [ ] **Step 5: Tweak per-clip outliers minimally**

If any one beat looks visually different from the other three after the preset, nudge **only that beat's** temperature or saturation by no more than ±2 to bring it into the family. Resist the urge to grade each clip independently — the preset is the discipline.

- [ ] **Step 6: Apply Gate 4 — the muted continuity scrub**

Play 0:00 → 0:24 with audio off. Watch:
- Does it read as one piece of footage? (Same warmth, same grain.)
- Does the 0.83× stretch look natural? (At Czera's contemplative pace, it should be invisible. If any clip looks visibly slo-mo or laggy, the source motion was too energetic — return to Task 5 for that beat's regeneration with motion-strength dropped further.)
- Are the cuts between beats clean? (No frame stutter at boundaries.)

- [ ] **Step 7: Save the project**

---

### Task 9: Build the Beat 5 R-mark animation in CapCut

**Files:**
- Inputs: a high-resolution image of the decorated R from the Czera wordmark — extract from `projects/czera/assets/logo/` if present, or from `projects/czera/graphics/` brand book (re-export at ≥ 3000 px wide if needed)
- CapCut project (modified)

- [ ] **Step 1: Source the decorated R image**

Find or extract the decorated R as a transparent PNG at **3000+ px width**. If only a smaller asset exists, rebuild from the wordmark SVG at high res. Save as `czera-r-mark-3000.png`.

- [ ] **Step 2: Add the ivory plate (Beat 5 background) to the timeline at 0:24–0:30**

Create a new color layer / solid clip:
- Color: **`#F4F2EC`** (Czera Soft Ivory)
- Position: timeline 0:24 → 0:30 (6 seconds)
- Aspect: full 1920 × 1080

- [ ] **Step 3: Import the R-mark and place at 0:24**

Drag `czera-r-mark-3000.png` onto an upper video track, positioned at 0:24, scaled to a comfortable hero size (typically ~25–35% of frame width — use Czera's existing wordmark hero proportions as a guide if available).

- [ ] **Step 4: Color the R-mark deep gold (`#BA7C17`)**

If the source PNG is white or transparent-with-color, recolor to `#BA7C17` via CapCut's color overlay or replace with a pre-colored asset.

- [ ] **Step 5: Animate the stroke-draw reveal (0:24 → 0:25.5)**

Use CapCut's mask/wipe keyframe animation:
- Keyframe 1 at 0:24: mask reveal at **0%** (R is invisible)
- Keyframe 2 at 0:25.5: mask reveal at **100%** (R is fully drawn)

Easing: linear or slight ease-out. CapCut's mask-wipe animation approximates SVG `stroke-dasharray` reasonably well.

- [ ] **Step 6: Hold from 0:25.5 → 0:28.5**

No animation. R sits at 100% opacity, deep gold.

- [ ] **Step 7: Animate the fade-out 0:28.5 → 0:30**

- Keyframe at 0:28.5: opacity **100%**
- Keyframe at 0:30: opacity **0%**

Easing: ease-in or linear.

- [ ] **Step 8: Apply Gate 5 — pixel-clean check**

Zoom CapCut's preview to 100% (or export a 2-second test clip and view at full size). Inspect the R closely:
- No anti-alias smearing on edges
- No ghost outlines
- Edges sharp and crisp at 1920 px target

If smearing appears, the source PNG resolution is too low. Replace with a higher-res asset (4000+ px) and redo Step 3. As a last resort, rebuild as inline-SVG, screen-record at 1920×1080, and import that recording instead of the PNG.

- [ ] **Step 9: Save the project**

---

### Task 10: Final assembly + the muted test

**Files:**
- CapCut project (modified)

- [ ] **Step 1: Verify cut style between AI beats**

Between Beat 1→2, 2→3, 3→4: **straight cuts only**. No fades, no dissolves, no "film school" transitions. Czera's restraint doesn't tolerate them. Remove any if they crept in.

- [ ] **Step 2: Verify the cut into Beat 5**

The transition at 0:24 (Beat 4 → Beat 5 ivory plate) is the **only** soft transition in the piece — and only because the visual already contains the cut (Beat 4 ends warm, Beat 5 starts on ivory plate). A **0.5s dissolve** here is acceptable. Add it if not present, or leave as a straight cut if you prefer harder rhythm — both work. Test both, pick what feels right.

- [ ] **Step 3: Apply Gate 6 — the muted attention test**

Play the entire 30-second timeline with audio muted. Ask:
- Does it hold attention without sound?
- Does any beat feel like it's begging for music? (If yes, that beat is too active or too narrative — calm it down: extend a quiet moment, trim a busier one within the same clip.)
- Do the cuts land naturally? (No beat feels like it cuts mid-thought.)
- Does the loop seam work? (Watch end of Beat 5 → start of Beat 1 mentally; an ivory hold bleeding into a warm cotton field should be acceptable.)

If any answer is "no", iterate inside CapCut (trim, extend, re-stretch). Do **not** consider regenerating from Lovart unless it's a content-level problem (e.g., wrong scene).

- [ ] **Step 4: Save the project**

---

### Task 11: Web exports — master, webm, mobile, poster

**Files:**
- Outputs:
  - `hero-30s.mp4` (master, 16:9, H.264)
  - `hero-30s.webm` (web-optimized, 16:9, VP9)
  - `hero-mobile-30s.mp4` (4:5, mobile cut, H.264)
  - `hero-poster.jpg` (Beat 1 first frame, JPG)

#### 11a — Master mp4

- [ ] **Step 1: Configure CapCut export for H.264 master**

Export settings:
- Format: **MP4** (H.264)
- Resolution: **1920 × 1080**
- Frame rate: **30 fps** (match the timeline)
- Bitrate: **target 5–8 Mbps** (CBR or 2-pass VBR)

- [ ] **Step 2: Export and save**

Save as `hero-30s.mp4` to your working video folder (not yet the czera repo — that's Task 12).

- [ ] **Step 3: Verify file size**

Check file size. **Must be ≤ 5 MB.** If it's over:
- First try lowering bitrate to 4 Mbps and re-exporting
- If still over and visually still good, drop to 3 Mbps
- Do **not** drop resolution below 1920 × 1080 — better to compromise on bitrate than pixel count for a hero loop

#### 11b — WebM

- [ ] **Step 1: Configure CapCut export for VP9 webm**

If CapCut Pro doesn't expose VP9 webm directly, export an additional MP4 at the same settings as 11a, then convert via ffmpeg in a terminal:

```bash
ffmpeg -i hero-30s.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pass 1 -an -f null /dev/null && \
ffmpeg -i hero-30s.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -pass 2 -an hero-30s.webm
```

(On Windows PowerShell, replace `/dev/null` with `NUL` and split into two commands.)

- [ ] **Step 2: Verify file size**

`hero-30s.webm` should be **≤ 3 MB**. If over, raise CRF to 36 and re-export — visual quality is still excellent for hero loops at that level.

#### 11c — Mobile cut (re-frame, do *not* letterbox)

- [ ] **Step 1: Duplicate the timeline at 1080 × 1350**

In CapCut: duplicate the project, change canvas to **1080 × 1350 (4:5)**. The original 16:9 clips will not fit — that's the point.

- [ ] **Step 2: Re-frame each beat for vertical composition**

For each beat, manually re-position and re-scale the clip so the subject is centered or appropriately framed for vertical:
- Beat 1: cotton field — pan into the foreground boll
- Beat 2: hands at loom — frame the hands tighter
- Beat 3: macro weave — already works well in any aspect, just re-scale to fill
- Beat 4: towel stack — frame from above, may need a slight crop top/bottom

Do **not** letterbox — black bars look wrong on a hero. Re-frame each beat individually. ~30 minutes of work.

- [ ] **Step 3: Re-export at 1080 × 1350 H.264**

Same bitrate target as 11a (5–8 Mbps but at 1080×1350 the file will naturally be smaller). Save as `hero-mobile-30s.mp4`.

- [ ] **Step 4: Verify file size**

Must be **≤ 3 MB.** Same fallback strategy as 11b if over.

#### 11d — Poster frame

- [ ] **Step 1: Pause CapCut on Beat 1's first frame (0:00)**

- [ ] **Step 2: Export still as JPG**

Use CapCut's "Export current frame" or screenshot at full preview resolution. Save as `hero-poster.jpg`.

- [ ] **Step 3: Optimize the JPG**

Use `ffmpeg`, an image optimizer, or a quick command:

```bash
ffmpeg -i hero-poster.jpg -q:v 4 hero-poster-opt.jpg
mv hero-poster-opt.jpg hero-poster.jpg
```

- [ ] **Step 4: Verify file size**

`hero-poster.jpg` should be **≤ 200 KB** (it's a single frame, not a video — small targets matter).

---

### Task 12: Place assets in the czera repo

**Files:**
- Move into `projects/czera/assets/video/` and `projects/czera/assets/img/`

- [ ] **Step 1: Verify the destination directories exist**

```bash
ls projects/czera/assets/video/ projects/czera/assets/img/
```

Both should exist per [czera CLAUDE.md](../../../CLAUDE.md). If `assets/video/` doesn't exist yet, create it:

```bash
mkdir -p projects/czera/assets/video
```

- [ ] **Step 2: Copy the four production files into place**

```bash
cp /path/to/working/hero-30s.mp4         projects/czera/assets/video/hero-30s.mp4
cp /path/to/working/hero-30s.webm        projects/czera/assets/video/hero-30s.webm
cp /path/to/working/hero-mobile-30s.mp4  projects/czera/assets/video/hero-mobile-30s.mp4
cp /path/to/working/hero-poster.jpg      projects/czera/assets/img/hero-poster.jpg
```

- [ ] **Step 3: Verify file presence and sizes**

```bash
ls -lh projects/czera/assets/video/hero-30s.mp4 \
       projects/czera/assets/video/hero-30s.webm \
       projects/czera/assets/video/hero-mobile-30s.mp4 \
       projects/czera/assets/img/hero-poster.jpg
```

Expected sizes (per Task 11): mp4 ≤ 5 MB, webm ≤ 3 MB, mobile.mp4 ≤ 3 MB, poster ≤ 200 KB.

---

## Engineering phase

### Task 13: Hero markup swap in `index.html`

**Files:**
- Modify: [`projects/czera/index.html`](../../../index.html)

- [ ] **Step 1: Locate the existing hero `<img>` element**

Open [`projects/czera/index.html`](../../../index.html) and find the hero section. Per [design.md §6.2](../../../design.md), there's already a comment indicating the video swap-in pattern. Look for `<img>` inside `.hero` or `.hero__media` (or whatever class hosts the background image).

- [ ] **Step 2: Replace `<img>` with `<video>` markup**

Replace the entire hero `<img>` element with:

```html
<video
  class="hero__media"
  autoplay
  muted
  loop
  playsinline
  preload="metadata"
  poster="assets/img/hero-poster.jpg"
  aria-hidden="true"
>
  <source src="assets/video/hero-30s.webm" type="video/webm">
  <source src="assets/video/hero-30s.mp4" type="video/mp4">
</video>
```

Notes:
- `<source>` order matters: WebM first (smaller, modern browsers prefer it), MP4 fallback for Safari/older
- `playsinline` is critical for iOS Safari — without it, iOS opens the video full-screen
- `aria-hidden="true"` because the hero is decorative (the page heading carries the meaning)
- `preload="metadata"` is a balance: full preload waits on the entire video before LCP, none means a flash of empty before playback

- [ ] **Step 3: Open the file in a browser locally**

Open `projects/czera/index.html` directly (file://...) or via a local static server. Verify:
- Hero plays muted automatically
- Hero loops at 30s
- No console errors

- [ ] **Step 4: Commit the markup swap**

Per [workspace git rules](../../../../.claude/rules/git-conventions.md): never `git add -A`, branch off main, no direct main commits.

```bash
cd projects/czera
git checkout -b feature/hero-video-swap
git add index.html
git commit -m "feat: swap hero img for autoplay-muted video element"
```

(Or if czera is not yet a tracked repo per [ADR-0002](../../../../.specify/memory/adr/0002-each-project-its-own-repo.md), commit in whichever repo currently tracks `projects/czera/`. As of this plan's writing, czera is on-disk-only and the swap will need versioning when czera is promoted.)

---

### Task 14: Hero CSS + `prefers-reduced-motion` fallback

**Files:**
- Modify: [`projects/czera/css/pages/landing.css`](../../../css/pages/landing.css)

- [ ] **Step 1: Locate the existing `.hero__media` CSS rule (or equivalent for the bg image)**

Open [`projects/czera/css/pages/landing.css`](../../../css/pages/landing.css). Find the rule that sets the hero image's `object-fit`, `width`, `height`, and positioning.

- [ ] **Step 2: Update the rule to apply to the `<video>` element**

Most `<img>`-targeted rules already work for `<video>`, but verify the rule selector now matches `.hero__media` (the class is on the `<video>` per Task 13). Typical hero media rule:

```css
.hero__media {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
```

- [ ] **Step 3: Add the `prefers-reduced-motion` fallback rule**

Add after the `.hero__media` rule:

```css
@media (prefers-reduced-motion: reduce) {
  .hero__media {
    /* Hide the video and let the poster render via the fallback in markup */
    display: none;
  }

  .hero {
    /* Render the poster image as a static background */
    background-image: url("../../assets/img/hero-poster.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
}
```

(Path adjusts based on the CSS file location relative to `assets/img/`. From `css/pages/landing.css` → `../../assets/img/hero-poster.jpg`.)

- [ ] **Step 4: Verify the reduced-motion fallback in Chrome DevTools**

Open the page in Chrome. Open DevTools → Rendering panel → "Emulate CSS media feature `prefers-reduced-motion`" → set to **reduce**. The video should disappear and the static poster image should render in its place. Toggle back to **no-preference** — video should reappear.

- [ ] **Step 5: Commit the CSS update**

```bash
cd projects/czera
git add css/pages/landing.css
git commit -m "feat: hide hero video and render poster on prefers-reduced-motion"
```

---

### Task 15: Cross-browser playback verification

**Files:**
- Read-only verification, no file changes

- [ ] **Step 1: Test in desktop Chrome**

Load the page. Confirm:
- Video plays muted on load
- Loops at 30s without flicker
- No console errors

- [ ] **Step 2: Test in desktop Safari**

Load the page. Confirm:
- Video plays muted on load (Safari historically blocks autoplay-with-sound, muted should pass)
- Loops at 30s
- No console errors

- [ ] **Step 3: Test in desktop Firefox**

Same checks as Chrome.

- [ ] **Step 4: Test in mobile Safari (real iOS device or simulator)**

Critical because `playsinline` matters here. Load the page on iPhone:
- Video plays inline (NOT full-screen)
- Plays muted automatically
- Loops at 30s
- Toggle iOS Low Power Mode in Settings: video should stop autoplaying and the poster should display instead

- [ ] **Step 5: Test on Android Chrome**

Same checks as desktop Chrome, on a phone.

- [ ] **Step 6: If any test fails**

Common fixes:
- Video doesn't autoplay → confirm `muted` attribute is present (without it, browsers block autoplay)
- iOS plays full-screen → add `webkit-playsinline` alongside `playsinline` for older iOS
- Black box on iOS Low Power → poster image isn't loading; check the `poster` URL resolves
- Long load delay → the video file is too large; revisit Task 11 export bitrates

---

### Task 16: Lighthouse LCP verification

**Files:**
- Read-only verification

- [ ] **Step 1: Install Lighthouse CLI if not present**

```bash
npm install -g lighthouse
```

(Or use the Chrome DevTools Lighthouse panel directly — same engine.)

- [ ] **Step 2: Run Lighthouse against a locally-served version of the page**

Serve the site locally (any static-file server works):

```bash
cd projects/czera
python3 -m http.server 8080
# Or: npx serve .
```

In another terminal:

```bash
lighthouse http://localhost:8080/index.html \
  --preset=mobile \
  --throttling-method=simulate \
  --only-categories=performance \
  --output=json \
  --output-path=./lighthouse-hero.json
```

- [ ] **Step 3: Inspect the LCP score**

Open `lighthouse-hero.json`. Find the "largest-contentful-paint" audit.

**Gate**: `numericValue` must be **< 2500** (milliseconds).

- [ ] **Step 4: If LCP fails**

Most likely causes:
- The video file is too large → re-encode at lower bitrate (Task 11 fallbacks)
- The poster JPG is too large → re-optimize to ≤ 200 KB
- The video is being preloaded entirely → `preload="metadata"` should be set (verify Task 13 markup)
- Hosting is slow → if the site is served from same-origin and origin is slow, host the videos on a CDN (Cloudflare, BunnyCDN); update `<source src>` URLs accordingly. This is a deployment-level fix.

- [ ] **Step 5: Document the final LCP score in PR description**

Note the achieved LCP value when you open the PR in Task 17.

---

### Task 17: Open the PR

**Files:**
- Workspace git operations only

- [ ] **Step 1: Verify all engineering changes are committed on the feature branch**

```bash
cd projects/czera
git status
```

Expected: clean working tree, branch `feature/hero-video-swap`.

- [ ] **Step 2: Push the branch to the czera remote**

If czera is now a tracked repo:

```bash
git push -u origin feature/hero-video-swap
```

If czera is **not yet** a tracked repo (per [ADR-0002](../../../../.specify/memory/adr/0002-each-project-its-own-repo.md) status at plan-writing time): **stop here**. Czera needs to be promoted to its own repo first via the workspace's [publishing-external-repos memory](../../../../CLAUDE.md). The hero-video swap will be part of the bootstrap PR for the czera repo.

- [ ] **Step 3: Open the PR with `gh pr create`**

Per [workspace PR rules](../../../../.claude/rules/pr-workflow.md):

```bash
gh pr create \
  --base main \
  --head feature/hero-video-swap \
  --title "feat(#NN): swap hero img for 30s video with poster fallback" \
  --body "$(cat <<'EOF'
## Summary
- Replace landing-page hero `<img>` with a `<video autoplay muted loop playsinline>` element backed by `.webm` + `.mp4` sources
- Add `prefers-reduced-motion: reduce` rule that hides the video and renders the poster as a static background
- Ship 4 new assets: `hero-30s.{mp4,webm}`, `hero-mobile-30s.mp4`, `hero-poster.jpg`

## Glossary

| Term | Definition |
|------|------------|
| Hero | The full-bleed media background at the top of `index.html` |
| Beat | One of the 5 cinematic shots that compose the 30-second video |
| Anchor still | The Beat 3 macro frame used as the iterative-edit reference for Beats 1, 2, 4 |
| R-mark | The decorated R from the Czera wordmark, animated as the Beat 5 sign-off |
| Poster | First-frame still served via `<video poster>` and as the `prefers-reduced-motion` fallback |

## Test plan

- [ ] Plays autoplay-muted in desktop Chrome, Safari, Firefox
- [ ] Plays inline (not full-screen) on mobile Safari
- [ ] iOS Low Power Mode shows the poster (not a black box)
- [ ] `prefers-reduced-motion: reduce` shows the poster (no video)
- [ ] Lighthouse LCP < 2.5s on mobile preset (achieved: <FILL IN>)
- [ ] Loops cleanly at 30s with no visible flicker
- [ ] No console errors on any tested browser

Spec: \`projects/czera/docs/superpowers/specs/2026-05-09-czera-hero-video-design.md\`
Plan: \`projects/czera/docs/superpowers/plans/2026-05-09-czera-hero-video-plan.md\`
EOF
)"
```

Replace `#NN` with the actual GitHub issue number for this work in the czera repo.

- [ ] **Step 4: Hand the PR to the two-marker review process**

Per [pr-workflow.md](../../../../.claude/rules/pr-workflow.md):
- Run `code-reviewer` agent → review the diff → produce Marker 1
- Issue explicit `/approve-merge <PR#>` → produce Marker 2
- Both markers must bind to the same HEAD SHA before merging

Do **not** self-merge this PR without the markers, even though czera's policy is currently aspirational. Establish the discipline.

---

## Self-review

I checked the plan against the spec:

**Spec coverage**:
- §1 (goal) → covered by Tasks 13–14 (markup + CSS)
- §2 (constraints) → embedded in Tasks 1–11 prompts and gates
- §3 (glossary) → reproduced in PR template (Task 17 Step 3)
- §4 (decisions) → reflected in tool-stack, prompts, R-mark approach
- §5 (sequence) → Tasks 7–10 sequence the 5 beats correctly
- §6 (Lovart-adapted prompts, including 6.1.1 5s-vs-6s) → Tasks 1, 2, 3, 5, 8 reproduce verbatim prompts and the 0.83× stretch rule
- §7 (tool stack) → Tasks 1–11 use Lovart + CapCut as specified
- §8 (cost) → not a task itself; assumed external budget
- §9 (workflow + gates) → Stage 1 → Task 2 Gate 1; Stage 2 → Task 3+4 Gate 2; Stage 3 → Task 6 Gate 3; Stage 4 → Task 8 Gate 4; Stage 5 → Task 9 Gate 5; Stage 6 → Task 10 Gate 6; Stage 7 → Task 11 Gate 7 (size budgets); Stage 8 → Tasks 13–16 Gate 8
- §10 (open questions) → Task 11c addresses mobile re-frame; the loop-seam open question is touched in Task 10 Step 3; CDN/hosting flagged in Task 16 Step 4

**Placeholder scan**: The PR template in Task 17 Step 3 contains `<FILL IN>` for the Lighthouse LCP value — this is intentional, the value comes from running Task 16 and is filled in at PR time. No other placeholders.

**Type/path consistency**: All file paths align — `assets/video/hero-30s.{mp4,webm}`, `assets/video/hero-mobile-30s.mp4`, `assets/img/hero-poster.jpg` are consistent across Tasks 11, 12, 13, 14, 17.

**Gap**: One thing the spec mentions but the plan doesn't *enforce*: §10's "bilingual context — does the video play identically in Arabic-RTL or do we mirror lateral camera direction?" That's a deliberate skip — the user can choose to address this in a follow-up PR if needed. Adding a note here so it's visible:

> **Follow-up (not in this plan)**: bilingual RTL camera-direction mirroring per spec §10. If desired, generate a separate Beat 1 with **left-to-right** pan (mirror of the current right-to-left) for the Arabic surface, and conditionally swap based on `<html dir="rtl">`. This is a small follow-up PR, not blocking the current work.

---

## Execution handoff

Plan complete and saved to [`projects/czera/docs/superpowers/plans/2026-05-09-czera-hero-video-plan.md`](../plans/2026-05-09-czera-hero-video-plan.md).

Two execution options:

**1. Subagent-Driven (recommended for the engineering phase, Tasks 13–17)** — I dispatch a fresh subagent per task, review between tasks. Best fit for the deterministic code work.

**2. Inline (recommended for the production phase, Tasks 1–12)** — You run Lovart and CapCut yourself; I act as a co-pilot through the gates rather than running tasks autonomously. Production tasks involve UI clicks I can't make for you.

**Hybrid is the realistic path**: you drive Tasks 1–12 in Lovart/CapCut with the plan as your runbook (asking me when a gate is ambiguous); I dispatch subagents for Tasks 13–17 against the czera codebase once the assets are in place.

Which approach for Tasks 13–17 specifically? (Tasks 1–12 are inherently inline because they require human-in-the-loop creative judgment at every gate.)
