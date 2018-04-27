import { Vector, Body, Query } from 'matter-js';
import { D2R } from './consts';

export function distSquared(p0: Vector, p1: Vector) {
  const dx = p0.x - p1.x;
  const dy = p0.y - p1.y;
  return dx * dx + dy * dy;
}

export function dist(p0: Vector, p1: Vector) {
  const dx = p0.x - p1.x;
  const dy = p0.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function len(v: Vector) {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function normalize(v: Vector, scale: number = 1) {
  const dst: number = len(v);
  return {
    x: scale * v.x / dst,
    y: scale * v.y / dst
  };
}

export function polarMove(pos: Vector, r: number, angle: number): Vector {
  const a = D2R * angle;
  return {
    x: pos.x + Math.cos(a) * r,
    y: pos.y + Math.sin(a) * r
  };
}

export function lerp(a: number, b: number, i: number) {
  return i * a + (1 - i) * b;
}

export function lerp2(arrA: number[], arrB: number[], i: number) {
  return [lerp(arrA[0], arrB[0], i), lerp(arrA[1], arrB[1], i)];
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

export function rayDist(
  body: Body,
  walls: Array<Body>,
  dAngle: number,
  dMin: number,
  dMax: number
) {
  const p0 = body.position;
  const v0 = {
    x: p0.x + dMin * Math.cos(body.angle + dAngle),
    y: p0.y + dMin * Math.sin(body.angle + dAngle)
  };
  const v1 = {
    x: p0.x + dMax * Math.cos(body.angle + dAngle),
    y: p0.y + dMax * Math.sin(body.angle + dAngle)
  };
  const o = Query.ray(walls, v0, v1, dMax); // engine.world.bodies
  let d = 10000;
  if (o.length > 0) {
    let b1 = o[0].body as Body;
    if (b1 === body) {
      b1 = o[1].body as Body;
    }
    const p1 = b1.position;
    return distSquared(p0, p1);
  }
  return d;
}

export function now() {
  return new Date().valueOf();
}

export function randomInt(n: number) {
  return ~~(Math.random() * n);
}
