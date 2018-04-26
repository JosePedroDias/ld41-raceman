const A = -16;
const B = -12;
const C = 12;
const D = 16;

export const VERTS: { [index: string]: number[][] } = {
  H: [[A, B], [D, B], [D, C], [A, C], [A, B]],
  H1: [[B, B], [D, B], [D, C], [B, C], [B, B]],
  H2: [[A, B], [C, B], [C, C], [A, C], [A, B]],
  V: [[B, A], [C, A], [C, D], [B, D], [B, A]],
  TL: [[B, B], [D, B], [D, C], [C, C], [C, D], [B, D], [B, B]],
  TR: [[A, B], [C, B], [C, D], [B, D], [B, C], [A, C], [A, B]],
  BL: [[B, A], [C, A], [C, B], [D, B], [D, C], [B, C], [B, A]],
  BR: [[B, A], [C, A], [C, C], [A, C], [A, B], [B, B], [B, A]]
};
