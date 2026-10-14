"""One-off: turn client originals into web-size images under assets/img/.

Run from the project root:  python tools/prepare_images.py
Requires PyMuPDF (pip install pymupdf). See docs/agdr/AgDR-0004.
"""
import glob
import os
import pymupdf

SRC = "graphics/client-2026-10"
OUT_PRODUCTS = "assets/img/products"
OUT_CATALOGUE = "assets/img/catalogue"
MAX_SIDE = 1400
JPG_QUALITY = 82

# client folder name -> product slug (js/data/products.js)
FOLDERS = {
    "White Towel 30 x 30 cm": "face-towel",
    "White Towel 50 x 100 cm": "hand-towel",
    "White Towel 70 x 140 cm": "bath-towel",
    "White Bath Towel 90 x 160 cm": "bath-sheet",
    "Premium White Bathrobe 1200 GSM": "white-bathrobe",
    "Premium Black Bathrobe 1200 GSM": "black-bathrobe",
    "Blue & White Striped Beach Towel 100 x 200 cm": "blue-stripe-beach-towel",
    "Yellow & White Striped Beach Towel 100 x 200 cm": "yellow-stripe-beach-towel",
    "Luxury 5-Piece Towel Gift Set": "complete-czera-set",
    "Luxury 3-Piece Towel Gift Set": "three-bath-towels-set",
    "Luxury 3-Piece Bath Towel Gift Set 90 × 160 cm": "three-bath-sheets-set",
    "Luxury 4-Piece Towel Gift Set": "hand-and-bath-sheet-set",
    "Luxury His & Hers Bathrobe Gift Set": "his-and-hers-robes",
    "Luxury Bathrobe & Beach Towel Gift Set (Black + Blue)": "robe-beach-black-blue",
    "Luxury Bathrobe & Beach Towel Gift Set (White + Yellow)": "robe-beach-white-yellow",
    "Luxury Beach Towel Gift Set": "beach-towel-set",
}

# catalogue page -> crop box as fractions (x0, y0, x1, y1) of the page.
# Each box keeps the photo and excludes printed headlines, icon rows and the
# CamScanner stamp along the bottom edge.
CROPS = {
    1: (0.36, 0.42, 1.00, 0.86),
    2: (0.38, 0.35, 1.00, 0.88),
    4: (0.35, 0.45, 1.00, 0.88),
    5: (0.35, 0.45, 1.00, 0.88),
    6: (0.40, 0.40, 1.00, 0.88),
    7: (0.37, 0.30, 1.00, 0.88),
    8: (0.35, 0.40, 1.00, 0.88),
    9: (0.42, 0.15, 1.00, 0.88),
    10: (0.42, 0.15, 1.00, 0.88),
    11: (0.38, 0.30, 0.89, 0.88),
    13: (0.40, 0.33, 0.82, 0.655),
    17: (0.43, 0.12, 0.725, 0.62),
    19: (0.40, 0.20, 0.87, 0.88),
    20: (0.33, 0.30, 1.00, 0.76),
    21: (0.26, 0.40, 1.00, 0.745),
}


def save_scaled(pix, path):
    scale = min(1.0, MAX_SIDE / max(pix.width, pix.height))
    if scale < 1.0:
        pix = pymupdf.Pixmap(pix, int(pix.width * scale), int(pix.height * scale))
    pix.save(path, jpg_quality=JPG_QUALITY)


def products():
    os.makedirs(OUT_PRODUCTS, exist_ok=True)
    for folder, slug in FOLDERS.items():
        files = sorted(glob.glob(os.path.join(SRC, "czera products", folder, "*.jpeg")))
        if not files:
            raise SystemExit(f"no photos found for {folder!r}")
        for n, f in enumerate(files, start=1):
            save_scaled(pymupdf.Pixmap(f), os.path.join(OUT_PRODUCTS, f"{slug}-{n}.jpg"))


def catalogue():
    os.makedirs(OUT_CATALOGUE, exist_ok=True)
    doc = pymupdf.open(os.path.join(SRC, "catalogue-2026-09-15.pdf"))
    for page_no, (x0, y0, x1, y1) in CROPS.items():
        page = doc[page_no - 1]
        r = page.rect
        clip = pymupdf.Rect(r.width * x0, r.height * y0, r.width * x1, r.height * y1)
        pix = page.get_pixmap(dpi=200, clip=clip)
        save_scaled(pix, os.path.join(OUT_CATALOGUE, f"p{page_no:02d}.jpg"))


if __name__ == "__main__":
    products()
    catalogue()
    print("done")
