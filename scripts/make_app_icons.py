"""Generate Android and iOS launcher icons from the Birchwood tree."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "Assets" / "images" / "tree_blue.png"
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"
IOS_ICONSET = (
    ROOT
    / "ios"
    / "BirchwoodStudent"
    / "Images.xcassets"
    / "AppIcon.appiconset"
)
WHITE = (255, 255, 255, 255)

ANDROID_LEGACY = {
    "mipmap-ldpi": 36,
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
ANDROID_FOREGROUND = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}
IOS_ICONS = {
    "Icon-App-20x20@1x.png": 20,
    "Icon-App-20x20@2x.png": 40,
    "Icon-App-20x20@3x.png": 60,
    "Icon-App-29x29@1x.png": 29,
    "Icon-App-29x29@2x.png": 58,
    "Icon-App-29x29@3x.png": 87,
    "Icon-App-40x40@1x.png": 40,
    "Icon-App-40x40@2x.png": 80,
    "Icon-App-40x40@3x.png": 120,
    "Icon-App-60x60@2x.png": 120,
    "Icon-App-60x60@3x.png": 180,
    "Icon-App-76x76@1x.png": 76,
    "Icon-App-76x76@2x.png": 152,
    "Icon-App-83.5x83.5@2x.png": 167,
    "ItunesArtwork@2x.png": 1024,
}


def trimmed_tree():
    tree = Image.open(SRC).convert("RGBA")
    bbox = tree.getbbox()
    return tree.crop(bbox) if bbox else tree


def fit_tree(canvas_size, fill, background=None):
    tree = trimmed_tree()
    target = max(1, int(canvas_size * fill))
    scale = min(target / tree.width, target / tree.height)
    size = (
        max(1, int(tree.width * scale)),
        max(1, int(tree.height * scale)),
    )
    tree = tree.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), background)
    x = (canvas_size - tree.width) // 2
    y = (canvas_size - tree.height) // 2
    canvas.alpha_composite(tree, (x, y))
    return canvas


def save_png(image, path, opaque=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    out = image.convert("RGB") if opaque else image
    out.save(path, "PNG")
    print(f"wrote {path.relative_to(ROOT)} {out.size[0]}x{out.size[1]}")


def circle(image):
    size = image.size[0]
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = image.copy()
    out.putalpha(mask)
    return out


def main():
    tree = trimmed_tree()
    print(f"source tree {tree.size[0]}x{tree.size[1]}")

    for folder, size in ANDROID_LEGACY.items():
        dest = ANDROID_RES / folder
        square = fit_tree(size, fill=0.78, background=WHITE)
        save_png(square, dest / "ic_launcher.png")
        if folder != "mipmap-ldpi":
            save_png(circle(square), dest / "ic_launcher_round.png")

    for folder, size in ANDROID_FOREGROUND.items():
        dest = ANDROID_RES / folder
        # Adaptive safe zone is the inner ~66% of the 108dp canvas.
        foreground = fit_tree(size, fill=0.56, background=(0, 0, 0, 0))
        save_png(foreground, dest / "ic_launcher_foreground.png")

    store = fit_tree(512, fill=0.78, background=WHITE)
    save_png(store, ANDROID_RES / "playstore-icon.png", opaque=True)
    save_png(store, ANDROID_RES / "ic_launcher-web.png", opaque=True)

    for name, size in IOS_ICONS.items():
        icon = fit_tree(size, fill=0.78, background=WHITE)
        save_png(icon, IOS_ICONSET / name, opaque=True)


if __name__ == "__main__":
    main()
