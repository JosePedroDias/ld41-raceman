import { Vector, Body } from 'matter-js';

import { D2R } from './consts';

import { distSquared, rayDist } from './utils';

const N_STEPS = 40;

const D_ANGLE = D2R * 25;
const D_MIN = 40;

type FoeData = {
  lastStop: number;
  lastPos: Vector;
  n: number;
  lastChoice: string;
};

export const foeDatas: Array<FoeData> = [];
export const foeBodies: Array<Body> = [];

export function addBot(foeBody: Body) {
  foeBodies.push(foeBody);
  foeDatas.push({
    lastStop: 0,
    lastPos: { x: 0, y: 0 },
    lastChoice: 'U',
    n: 1
  });
}

export function chooseCarDir(carBody: Body, i: number, walls: Array<Body>) {
  const fd = foeDatas[i];
  fd.n--;
  if (fd.n === 0) {
    fd.n = N_STEPS;
    const dSq = distSquared(carBody.position, fd.lastPos);
    // console.log(dSq);
    if (dSq < 100) {
      fd.lastChoice = 'D';
    } else {
      const dFront = rayDist(carBody, walls, 0, D_MIN, 160);
      const dLeft = rayDist(carBody, walls, -D_ANGLE, D_MIN, 160);
      const dRight = rayDist(carBody, walls, D_ANGLE, D_MIN, 160);
      if (dFront < dLeft) {
        if (dFront < dRight) {
          fd.lastChoice = 'U';
        } else {
          fd.lastChoice = 'UL';
        }
      } else {
        if (dLeft < dRight) {
          fd.lastChoice = 'UL';
        } else {
          fd.lastChoice = 'UR';
        }
      }
    }
  }

  switch (fd.lastChoice) {
    case 'U':
      return { up: true };
    case 'UL':
      return { up: true, left: true };
    case 'UR':
      return { up: true, right: true };
    default:
      return { down: true };
  }
}
