export const BAR_H = 58;
export const HILL_H = 22;
export const SLOPE = 26;
export const CREST = 30;

export function footerPath(width, inset) {
  const top = HILL_H;
  const bottom = HILL_H + BAR_H + inset;
  const cx = width / 2;
  const l0 = cx - CREST - SLOPE;
  const l1 = cx - CREST;
  const r1 = cx + CREST;
  const r0 = cx + CREST + SLOPE;

  return [
    `M0 ${top}`,
    `L${l0} ${top}`,
    `C${l0 + SLOPE * 0.6} ${top} ${l1} 0 ${cx} 0`,
    `C${r1} 0 ${r0 - SLOPE * 0.6} ${top} ${r0} ${top}`,
    `L${width} ${top}`,
    `L${width} ${bottom}`,
    `L0 ${bottom}`,
    'Z',
  ].join(' ');
}

export function humpBumpPath(width) {
  const top = HILL_H;
  const cx = width / 2;
  const l0 = cx - CREST - SLOPE;
  const l1 = cx - CREST;
  const r1 = cx + CREST;
  const r0 = cx + CREST + SLOPE;

  return [
    `M${l0} ${top + 1}`,
    `L${l0} ${top}`,
    `C${l0 + SLOPE * 0.6} ${top} ${l1} 0 ${cx} 0`,
    `C${r1} 0 ${r0 - SLOPE * 0.6} ${top} ${r0} ${top}`,
    `L${r0} ${top + 1}`,
    'Z',
  ].join(' ');
}
