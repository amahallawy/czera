# Czera Maison — Lovart brand-builder design guidance

Paste the block below into Lovart's brand-builder "Design guidance" / "Brand instructions" field. The brand image files you already uploaded supply the *look*; this text supplies the *rules*.

Two versions: a **full** version (~1900 chars) for fields with no tight character limit, and a **short** version (~900 chars) if Lovart caps the field.

---

## Full version

```
Czera Maison is a premium Egyptian cotton towel brand. Heritage-modern. Quiet, certain, materially specific. Editorial, not promotional. Premium without flexing.

Palette (use these only):
- Soft Ivory background #F4F2EC
- Warm Beige surface #E7E1D5
- Deep Charcoal #2B2B2B
- Royal Gold #D4AF36, Deep Gold #BA7C17, Sand Gold #D8C28A

Gold rule: maximum one gold accent per image. A gold thread plus a gold border plus a gold light glint is wrong. Gold must be rare and intentional.

Lighting: warm color temperature only. Side-lit or top-down. Soft shadow. Painterly. Golden hour, late afternoon, or warm window light. 35mm film stock feel — soft grain, deep depth of field. Long soft shadows are welcome. Never flat product-on-white, never cool light, never harsh fluorescent, never drone aerials.

Subjects: Egyptian cotton fields, Nile Delta heritage. Hands at traditional wooden floor looms. Cairo workshop interiors with warm window light. Macro on cotton terry weave. Single deep-gold thread on ivory cotton. Stacks of folded ivory towels on worn dark wood or marble. Robes hung on hooks. Bath scenes with morning light. Single rose petal on white cotton (signature). Hands folding, hands placing, hands at the loom.

No faces — keep people anonymous: hands, forearms, silhouettes only.

Composition: tight crops on texture; loose breathing crops on lifestyle. Never center-locked symmetric product shots. Always leave a calm zone for the eye to rest. Painterly stillness, not commercial energy.

Style references: Loro Piana brand films, Hermès maison films, Frette product editorial, Abyss Habidecor lookbooks, Egyptian and Levantine craft documentary photography.

Always avoid:
- Marketing aesthetic: "discover", "elevate", "indulge", "experience luxury", "best in class"
- Stock photography look, agency aesthetic, watermarks
- Logos, labels, or brand text in frame (the Czera mark is added in post-production, never inside the AI generation)
- Cool tones, blue skies dominant, surreal HDR, neon
- Drone shots, helicopter aerials, wide overhead landscape
- Multiple gold accents in one image
- Modern industrial settings — factories, machinery, fluorescent lighting
- Product-on-white seamless backgrounds, e-commerce flat-lay
- Faces, modern clothing brands, watches, jewelry on the hands
- Cormorant Garamond, Playfair Display, EB Garamond, or any "AI-luxury" serif if any text appears
- Exclamation-mark energy in any visible text

Voice (for any text inside images, though we generally avoid text-in-image): quiet, factual, materially specific. Periods, never exclamation marks. State the spec, not adjectives. "Egyptian cotton, woven in Egypt" — not "Discover luxury today".
```

---

## Short version (if the field is character-limited)

```
Czera Maison: premium Egyptian cotton towel brand. Heritage-modern, quiet, materially specific. Editorial, never promotional.

Palette: Soft Ivory #F4F2EC, Warm Beige #E7E1D5, Deep Charcoal #2B2B2B, Royal Gold #D4AF36, Deep Gold #BA7C17. Maximum one gold accent per image — gold is rare.

Lighting: warm temperature only. Side-lit or top-down. Soft shadow. Golden hour, late afternoon, or warm window light. 35mm film stock feel, soft grain, deep depth of field. Never flat product-on-white, never cool light, never drone shots.

Subjects: Egyptian cotton fields. Hands at wooden floor looms (no faces). Cairo workshop interiors. Macro on cotton terry weave. Single deep-gold thread on ivory. Stacks of folded ivory towels on worn dark wood. Robes on hooks, bath scenes with morning light. Single rose petal on white cotton.

Composition: tight on texture, loose on lifestyle. Never center-locked. Always a calm zone. Painterly stillness.

References: Loro Piana, Hermès, Frette, Abyss Habidecor.

Avoid: marketing aesthetic, stock photography, drone shots, blue/cool tones, faces, logos or text in frame, multiple golds, factories, fluorescent light, white seamless backgrounds, product-on-white, watermarks.
```

---

## Notes on using this in Lovart

- **Re-paste each new session.** Lovart sometimes loses brand context between long-idle sessions. Confirm the brand block is active before generating.
- **The image files you uploaded are the visual ground truth.** This text is a constraint layer, not a replacement. If Lovart's outputs drift, *first* re-upload the strongest 2–3 reference images, *then* re-paste this guidance.
- **Per-prompt overrides win.** If a specific generation needs to break a rule (e.g. a video beat that intentionally uses a gold accent and a gold thread), state the override explicitly in that prompt — Lovart respects per-prompt instructions over the brand block.
- **Don't mention specific brand competitors by name in image prompts.** "Reminiscent of Frette" works as a style cue here in the brand block but can occasionally trigger Lovart's anti-impersonation filters in a specific prompt. If a generation is rejected, drop the brand reference from the prompt and rely on the brand block to carry it.
