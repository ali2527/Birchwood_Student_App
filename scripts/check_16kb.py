import os
import struct
import zipfile

APK = r"D:\Projects\birchwood-student\android\app\build\outputs\apk\debug\app-debug.apk"
PT_LOAD = 1
PAGE = 16384


def read_aligns(data):
    if data[:4] != b"\x7fELF":
        return None, "not-elf"
    ei_class = data[4]
    ei_data = data[5]
    if ei_data != 1:
        return None, "be"
    if ei_class == 1:
        e_phoff = struct.unpack_from("<I", data, 28)[0]
        e_phentsize, e_phnum = struct.unpack_from("<HH", data, 42)

        def unpack(off):
            return struct.unpack_from("<IIIIIIII", data, off)

    elif ei_class == 2:
        e_phoff = struct.unpack_from("<Q", data, 32)[0]
        e_phentsize, e_phnum = struct.unpack_from("<HH", data, 54)

        def unpack(off):
            return struct.unpack_from("<IIQQQQQQ", data, off)

    else:
        return None, "bad-class"
    aligns = []
    for i in range(e_phnum):
        ph = unpack(e_phoff + i * e_phentsize)
        if ph[0] == PT_LOAD:
            aligns.append(ph[7])
    return aligns, None


rows = []
with zipfile.ZipFile(APK) as z:
    for info in z.infolist():
        if not info.filename.endswith(".so"):
            continue
        data = z.read(info)
        aligns, err = read_aligns(data)
        name = info.filename
        parts = name.split("/")
        abi = parts[1] if len(parts) > 2 and parts[0] == "lib" else "?"
        lib = os.path.basename(name)
        min_align = min(aligns) if aligns else 0
        zip_payload = info.header_offset + 30 + len(info.filename.encode()) + len(info.extra)
        rows.append((abi, lib, min_align, info.compress_type, zip_payload % PAGE, err, name))

print(f"{'ABI':<12} {'LIB':<36} {'minAlign':>10} {'zip%16k':>8} {'comp':>6} STATUS")
bad = []
for abi, lib, mina, comp, zmod, err, name in sorted(rows):
    if err:
        status = f"ERR {err}"
        bad.append((name, status))
    elif mina < PAGE:
        status = f"UNALIGNED {mina}"
        bad.append((name, status))
    else:
        status = "OK"
    print(f"{abi:<12} {lib:<36} {mina:>10} {zmod:>8} {comp:>6} {status}")

print("\nUNALIGNED:")
for name, status in bad:
    print(f"  {name} -> {status}")
print(f"\nchecked={len(rows)} unaligned={len(bad)}")
