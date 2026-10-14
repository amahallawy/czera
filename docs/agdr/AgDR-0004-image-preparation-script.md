# AgDR-0004: Image preparation script

## Context

The client supplied full-size product photos and a PDF catalogue. The site needs web-size images and cropped catalogue photos under `assets/img/`.

## Options considered

- (a) Hand-export each image.
- (b) A one-off Python script using the already-installed PyMuPDF.
- (c) An npm image pipeline.

## Decision

Option (b). Repeatable, with no new dependency in the site. Outputs are committed; the script is not part of serving.

## Consequences

- Client originals move to the gitignored `graphics/`.
- Crop boxes live in `tools/prepare_images.py` and are tuned by eye.
- Re-running regenerates all images from `graphics/client-2026-10/`.
