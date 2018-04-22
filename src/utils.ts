import { Vector } from 'matter-js';
import { D2R } from './consts';

export function polarMove(pos: Vector, r: number, angle: number): Vector {
  const a = D2R * angle;
  return {
    x: pos.x + Math.cos(a) * r,
    y: pos.y + Math.sin(a) * r
  };
}

export function clamp(n: number, min: number, max: number): number {
  return n < min ? min : n > max ? max : n;
}

export function linearize(n: number, a: number, b: number): number {
  const l = Math.abs(b - a);

  let r;
  if (a > b) {
    r = (n - a) / -l;
  } else {
    r = (n - a) / l;
  }

  return clamp(r, 0, 1);
}

export function sign(n: number) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}
