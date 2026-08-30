"""Build a padded square splash_tree_icon.png from tree_blue.png."""
import struct
import zlib
from pathlib import Path


def decode_rgba(path: Path):
    data = path.read_bytes()
    pos = 8
    width = height = color = None
    idats = b""
    while pos < len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bit, color, comp, filt, inter = struct.unpack(
                ">IIBBBBB", chunk
            )
        elif ctype == b"IDAT":
            idats += chunk
        elif ctype == b"IEND":
            break

    raw = zlib.decompress(idats)
    bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color]
    stride = width * bpp
    rows = []
    i = 0
    prev = bytearray(stride)

    def paeth(a, b, c):
        p = a + b - c
        pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
        if pa <= pb and pa <= pc:
            return a
        if pb <= pc:
            return b
        return c

    for _y in range(height):
        f = raw[i]
        i += 1
        row = bytearray(raw[i : i + stride])
        i += stride
        out = bytearray(stride)
        for x in range(stride):
            left = out[x - bpp] if x >= bpp else 0
            up = prev[x]
            ul = prev[x - bpp] if x >= bpp else 0
            if f == 0:
                out[x] = row[x]
            elif f == 1:
                out[x] = (row[x] + left) & 255
            elif f == 2:
                out[x] = (row[x] + up) & 255
            elif f == 3:
                out[x] = (row[x] + ((left + up) // 2)) & 255
            elif f == 4:
                out[x] = (row[x] + paeth(left, up, ul)) & 255
        prev = out
        if color == 6:
            rows.append(bytes(out))
        elif color == 2:
            rgba = bytearray(width * 4)
            for x in range(width):
                rgba[x * 4 : x * 4 + 3] = out[x * 3 : x * 3 + 3]
                rgba[x * 4 + 3] = 255
            rows.append(bytes(rgba))
        else:
            raise SystemExit(f"unsupported color type {color}")
    return width, height, rows


def encode_png(w, h, rows):
    def chunk(tag, payload):
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    raw = b"".join(bytes([0]) + row for row in rows)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def make_padded(src: Path, canvas: int = 1024, fill: float = 0.55):
    sw, sh, srows = decode_rgba(src)
    scale = (canvas * fill) / max(sw, sh)
    tw, th = max(1, int(sw * scale)), max(1, int(sh * scale))
    scaled = []
    for y in range(th):
        sy = min(sh - 1, int(y / scale))
        src_row = srows[sy]
        row = bytearray(tw * 4)
        for x in range(tw):
            sx = min(sw - 1, int(x / scale))
            row[x * 4 : x * 4 + 4] = src_row[sx * 4 : sx * 4 + 4]
        scaled.append(bytes(row))

    ox = (canvas - tw) // 2
    oy = (canvas - th) // 2
    blank = bytes(canvas * 4)
    rows = []
    for y in range(canvas):
        if y < oy or y >= oy + th:
            rows.append(blank)
        else:
            row = bytearray(blank)
            row[ox * 4 : (ox + tw) * 4] = scaled[y - oy]
            rows.append(bytes(row))
    return encode_png(canvas, canvas, rows)


def main():
    base = Path(__file__).resolve().parents[1]
    src = base / "android/app/src/main/res/drawable-nodpi/tree_blue.png"
    png = make_padded(src, canvas=1024, fill=0.55)
    outs = [
        base / "android/app/src/main/res/drawable-nodpi/splash_tree_icon.png",
        base / "src/Assets/images/splash_tree_icon.png",
    ]
    for out in outs:
        out.write_bytes(png)
        w, h = struct.unpack(">II", png[16:24])
        print(f"wrote {out} {w}x{h} bytes={len(png)}")


if __name__ == "__main__":
    main()
