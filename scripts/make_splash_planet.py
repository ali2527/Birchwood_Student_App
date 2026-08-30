"""Generate a crisp ringed planet asset for the splash screen."""
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import math
import random

SIZE = 384
cx = cy = SIZE // 2
r = 118

out = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

# Soft outer glow (kept mild)
glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
gdraw.ellipse([cx - r - 10, cy - r - 10, cx + r + 10, cy + r + 10], fill=(150, 80, 210, 70))
glow = glow.filter(ImageFilter.GaussianBlur(6))
out = Image.alpha_composite(out, glow)

# Ring back half
ring_back = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring_back)
rx, ry = 162, 46
for w, col in [(16, (230, 175, 40, 255)), (10, (255, 215, 80, 255)), (4, (255, 240, 160, 255))]:
    rd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=col, width=w)
ring_back = ring_back.rotate(-24, resample=Image.BICUBIC, center=(cx, cy))
# keep only upper part as "behind"
mask_back = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask_back).rectangle([0, 0, SIZE, cy - 1], fill=255)
ring_back.putalpha(Image.composite(ring_back.split()[-1], Image.new("L", (SIZE, SIZE), 0), mask_back))
out = Image.alpha_composite(out, ring_back)

# Planet body — sharp
body = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
bdraw = ImageDraw.Draw(body)
bdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(78, 34, 138, 255))

# Crisp surface bands / continents
rnd = random.Random(11)
for _ in range(18):
    ang = rnd.random() * math.tau
    dist = rnd.uniform(0, r * 0.72)
    px = cx + math.cos(ang) * dist
    py = cy + math.sin(ang) * dist * 0.85
    sx = rnd.uniform(14, 34)
    sy = rnd.uniform(8, 18)
    col = rnd.choice(
        [
            (168, 78, 188, 200),
            (58, 24, 108, 210),
            (210, 110, 175, 170),
            (110, 55, 170, 190),
        ]
    )
    bdraw.ellipse([px - sx, py - sy, px + sx, py + sy], fill=col)

# Light rim
bdraw.ellipse(
    [cx - r + 6, cy - r + 6, cx + r - 6, cy + r - 6],
    outline=(190, 130, 230, 90),
    width=3,
)

mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
# hard clip (no blur)
body_rgb = body.convert("RGBA")
body_a = mask
body_rgb.putalpha(body_a)
out = Image.alpha_composite(out, body_rgb)

# Specular (small, sharper)
hi = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
ImageDraw.Draw(hi).ellipse(
    [cx - r * 0.5, cy - r * 0.72, cx - r * 0.05, cy - r * 0.28],
    fill=(255, 230, 255, 70),
)
hi = hi.filter(ImageFilter.GaussianBlur(4))
ha = hi.split()[-1]
hi.putalpha(Image.composite(ha, Image.new("L", (SIZE, SIZE), 0), mask))
out = Image.alpha_composite(out, hi)

# Ring front half
ring_front = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
rd = ImageDraw.Draw(ring_front)
for w, col in [(16, (230, 175, 40, 255)), (10, (255, 215, 80, 255)), (4, (255, 240, 160, 255))]:
    rd.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], outline=col, width=w)
ring_front = ring_front.rotate(-24, resample=Image.BICUBIC, center=(cx, cy))
mask_front = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask_front).rectangle([0, cy, SIZE, SIZE], fill=255)
ring_front.putalpha(
    Image.composite(ring_front.split()[-1], Image.new("L", (SIZE, SIZE), 0), mask_front)
)
out = Image.alpha_composite(out, ring_front)

# Slight contrast boost
enh = ImageEnhance.Contrast(out)
out = enh.enhance(1.12)
enh = ImageEnhance.Sharpness(out)
out = enh.enhance(1.35)

paths = [
    r"d:\Projects\birchwood-student\src\Assets\images\planet.png",
    r"d:\Projects\birchwood-student\android\app\src\main\res\drawable-nodpi\planet.png",
]
for p in paths:
    out.save(p, "PNG", optimize=True)
    print("saved", p, out.size)
