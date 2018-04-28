import { Vector, Body } from 'matter-js';

import { D2R, R2D } from './consts';

import {
  distSquared,
  rayDist,
  randomInt,
  dist,
  normalize,
  vecToAngle,
  normalizeAngle
} from './utils';
import { WP, nearestWaypoint, chooseDirection } from './waypoints';

let wps: Array<WP> = [];
let walls: Array<Body> = [];

const N_STEPS = 40;

const D_ANGLE = D2R * 25;
const D_MIN = 40;

export function bootstrapBots(_wps: Array<WP>, _walls: Array<Body>) {
  wps = _wps;
  walls = _walls;
}

type FoeData = {
  // lastStop: number;
  // lastPos: Vector;
  // lastChoice: string;
  // n: number;
  electedWP: WP;
  lastVisitedWPs: Array<WP>;
};

const foeDatas: Array<FoeData> = [];
const foeBodies: Array<Body> = [];

export function getFoeBodies(): Array<Body> {
  return foeBodies;
}

export function addBot(foeBody: Body) {
  foeBodies.push(foeBody);
  foeDatas.push({
    /*     lastStop: 0,
    lastPos: { x: 0, y: 0 },*/
    // lastChoice: 'U',
    // n: 1 + randomInt(N_STEPS),
    electedWP: nearestWaypoint(wps, foeBody.position),
    lastVisitedWPs: []
  });
}

function dirToKeys(dir: string) {
  switch (dir) {
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

export function chooseCarDir2(carBody: Body, i: number, playerBody: Body) {
  //console.log('a', carBody, 'b', i, 'c', playerBody);
  const fd = foeDatas[i];

  const d = dist(carBody.position, fd.electedWP.position);
  if (d < 2) {
    fd.lastVisitedWPs.push(fd.electedWP);
    if (fd.lastVisitedWPs.length > 3) {
      fd.lastVisitedWPs.shift();
    }
    fd.electedWP = chooseDirection(
      fd.electedWP,
      playerBody.position,
      fd.lastVisitedWPs
    );
  }

  const v = {
    x: playerBody.position.x - carBody.position.x,
    y: playerBody.position.y - carBody.position.y
  };

  // const a = normalizeAngle(vecToAngle(v));
  // const b = normalizeAngle(carBody.angle);

  // let d1 = normalizeAngle(a - b);
  // let d2 = normalizeAngle(a + b);
  // if (d1 > Math.PI) {
  //   d1 -= 2 * Math.PI;
  // }
  // if (d2 > 2 * Math.PI) {
  //   d2 -= 2 * Math.PI;
  // }
  // const dir = Math.abs(d1) < 180 ? 'L' : 'R';

  // console.log(
  //   'a %s | b %s | %s',
  //   (R2D * d1).toFixed(0),
  //   (R2D * d2).toFixed(0),
  //   dir
  // );
  // // TODO NOT YET OK

  // return { up: true, left: dir === 'L', right: dir === 'R' };

  return normalize(v, 0.0003);
}

/* export function chooseCarDir(carBody: Body, i: number, playerBody: Body) {
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

  return dirToKeys(fd.lastChoice);
} */
