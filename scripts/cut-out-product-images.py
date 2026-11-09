#!/usr/bin/env python3
"""
Cut product photos out of a baked-in checkerboard and place them on the 200:310
portrait canvas that the product rail (src/components/ui/product-rail-gallery.jsx) expects.

Why: AI "transparent background" exports often paint the grey/white checkerboard into the
pixels instead of making them transparent. This script removes that checkerboard.

Usage (needs pillow, numpy, scipy; use a throwaway venv, not the system Python):
    python3 -m venv /tmp/hestola-img && /tmp/hestola-img/bin/pip install pillow numpy scipy
    /tmp/hestola-img/bin/python scripts/cut-out-product-images.py [--preview preview.png]

Input:  imgages/*.png  (folder name as supplied)
Output: public/products/<slug>/{front,back,side}.webp  (800 x 1240, transparent)

Front, back and side of one piece share one scale and top edge, as the rail requires.
To add a piece, add an entry to PIECES: source file plus a crop box [x0, y0, x1, y1] per view.
"""
import argparse
import pathlib
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "imgages"
OUT = ROOT / "public" / "products"

CANVAS_W, CANVAS_H = 800, 1240  # 200:310
FIT_W, FIT_H = 0.94, 0.9  # garment size as a share of the canvas
TOP = 0.085  # top margin: leaves room above the collar for the rail's drawn hook and wooden neck

# slug -> source file and crop box per view (None = whole image)
PIECES = {
    "demo-heather-tee": {
        "file": "image copy 2.png",
        "textured": True,
        "clean_specks": ("side",),
        "views": {
            "front": (0, 0, 466, 683),
            "back": (466, 0, 866, 683),
            "side": (866, 0, 1024, 683),
        },
    },
    # Plain white backgrounds (not a checkerboard): "white_bg" keeps light fabric.
    "demo-oxford-shirt": {
        "file": "image.png",
        "white_bg": True,
        "views": {"front": (0, 0, 428, 559), "back": (428, 0, 812, 559), "side": (812, 0, 1024, 559)},
    },
    "demo-cream-tee": {
        "file": "image copy.png",
        "white_bg": True,
        "views": {"front": (0, 0, 430, 559), "back": (430, 0, 815, 559), "side": (815, 0, 1024, 559)},
    },
}


def cut_out(rgb: np.ndarray, textured: bool = False, clean_specks: bool = False, white_bg: bool = False) -> np.ndarray:
    """RGB uint8 array with a baked checkerboard -> RGBA uint8 array, tightly cropped.

    textured=True is for light, grainy fabric (heather grey) whose highlights are as light
    as the grey squares: only flat areas count as background.
    clean_specks=True paints out a light blob in the hem (a sparkle watermark).
    white_bg=True is for photos on plain white: only near-white counts as background, so
    cream and other light fabric is kept.
    """
    a = rgb.astype(np.int16)
    h, w = a.shape[:2]
    mx, mn = a.max(2), a.min(2)
    neutral = (mx - mn) <= 8

    # The checkerboard is white plus one light grey; find that grey from the image border.
    frame = np.zeros((h, w), bool)
    frame[:20] = frame[-20:] = True
    frame[:, :20] = frame[:, -20:] = True
    pick = neutral & frame & (mn >= 150) & (mn <= 238)
    grey = int(np.bincount(mn[pick], minlength=256).argmax()) if pick.any() else 200

    # Background = neutral pixels at least as light as the grey squares. Square edges
    # blend between the two, so this also catches the anti-aliased grid lines.
    bg_like = neutral & (mn >= grey - 9)
    if white_bg:
        # The studio shadow under the piece is colourless grey; the fabric has some colour
        # (cream, blue), so light, colourless pixels are background.
        bg_like = ((mx - mn) <= 6) & (mn >= 200)
    mean = ndimage.uniform_filter(mn.astype(float), 5)
    var = ndimage.uniform_filter(mn.astype(float) ** 2, 5) - mean**2  # local grain
    if textured:
        # Only flat areas (the squares) are background; the 3px growth re-joins the squares
        # across their grid lines without reaching far into the fabric.
        flat = bg_like & (var < 8)
        bg_like &= ndimage.binary_dilation(flat, iterations=3)
    lab, n = ndimage.label(bg_like)
    sizes = ndimage.sum(bg_like, lab, range(1, n + 1))
    edge = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1])
    drop = np.zeros(n + 1, bool)
    for i in range(1, n + 1):
        drop[i] = i in edge or sizes[i - 1] > 3000  # outside, or a big gap inside the garment
    fg = ~drop[lab]

    # Keep the garment itself (largest blob); drops smudges, captions and stray specks.
    lab, n = ndimage.label(fg)
    if n == 0:
        raise SystemExit("nothing left after removing the background")
    sizes = ndimage.sum(fg, lab, range(1, n + 1))
    fg = lab == (1 + int(np.argmax(sizes)))

    # Fill tiny pin-holes (light fabric highlights) but keep real gaps such as under the arms.
    holes, nh = ndimage.label(ndimage.binary_fill_holes(fg) & ~fg)
    for i in range(1, nh + 1):
        if (holes == i).sum() < 150:
            fg |= holes == i

    # Smooth the outline, pull it in to lose the light checkerboard fringe, then soften it.
    if textured:
        fg = ndimage.binary_opening(fg, iterations=2)
    fg = ndimage.gaussian_filter(fg.astype(float), 2.0) > 0.5
    fg = ndimage.binary_erosion(fg, iterations=4 if textured else 2)
    alpha = np.clip(ndimage.gaussian_filter(fg.astype(float), 0.9), 0, 1)
    if clean_specks:
        # Fill over a light blob in the hem (a sparkle watermark). The hem rib is the
        # darkest fabric, so a smooth patch brighter than the rib is the watermark.
        rows = np.arange(h)[:, None] >= 0.82 * h
        patch = (ndimage.gaussian_filter(mn.astype(float), 3) > 169) & (alpha > 0.5) & rows
        patch = ndimage.binary_dilation(patch, iterations=6) & (alpha > 0.5)
        if patch.any():
            # Fill from the surrounding fabric (blur of the known pixels), then add grain.
            known = (~patch & (alpha > 0.5)).astype(float)
            den = np.maximum(ndimage.gaussian_filter(known, 12), 1e-3)
            fill = np.dstack(
                [ndimage.gaussian_filter(rgb[..., c] * known, 12) / den for c in range(3)]
            )
            grain = np.random.default_rng(0).normal(0, 6, size=(h, w, 1))
            rgb = np.where(patch[..., None], np.clip(fill + grain, 0, 255), rgb).astype(np.uint8)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])

    ys, xs = np.where(alpha > 0.5)
    return rgba[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", help="write a contact sheet PNG to this path")
    args = parser.parse_args()

    sheet = []
    for slug, spec in PIECES.items():
        source = np.array(Image.open(SRC / spec["file"]).convert("RGB"))
        cuts = {}
        for view, box in spec["views"].items():
            crop = source if box is None else source[box[1] : box[3], box[0] : box[2]]
            cuts[view] = cut_out(
                crop,
                textured=spec.get("textured", False),
                clean_specks=view in spec.get("clean_specks", ()),
                white_bg=spec.get("white_bg", False),
            )

        # One scale for every view of the piece, so it does not resize as it turns.
        max_w = max(c.shape[1] for c in cuts.values())
        max_h = max(c.shape[0] for c in cuts.values())
        scale = min(CANVAS_W * FIT_W / max_w, CANVAS_H * FIT_H / max_h)

        folder = OUT / slug
        folder.mkdir(parents=True, exist_ok=True)
        row = []
        for view, cut in cuts.items():
            img = Image.fromarray(cut)
            img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
            canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
            canvas.paste(img, ((CANVAS_W - img.width) // 2, round(CANVAS_H * TOP)), img)
            target = folder / f"{view}.webp"
            canvas.save(target, "WEBP", quality=88, alpha_quality=100, method=6)
            row.append(canvas)
            print(f"{slug}/{view}.webp  {img.width}x{img.height}  {target.stat().st_size // 1024} KB")
        sheet.append(row)

    if args.preview:
        cell_w, cell_h = 200, 310
        cols = max(len(r) for r in sheet)
        board = Image.new("RGB", (cols * cell_w, len(sheet) * cell_h), (243, 238, 227))
        for r, row in enumerate(sheet):
            for c, canvas in enumerate(row):
                small = canvas.resize((cell_w, cell_h), Image.LANCZOS)
                board.paste(small, (c * cell_w, r * cell_h), small)
        board.save(args.preview)
        print("preview:", args.preview)


if __name__ == "__main__":
    sys.exit(main())
