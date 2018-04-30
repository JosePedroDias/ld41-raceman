import { Vector, Body } from 'matter-js';

import { D2R, R2D } from './consts';

import {
  distSquared,
  rayDist,
  randomInt,
  dist,
  normalize,
  vecToAngle,
  normalizeAngle,
  now,
  polarMove,
  avg
} from './utils';
import { WP, nearestWaypoint, chooseDirection } from './waypoints';
import { BodyExt } from './main';

let wps: Array<WP> = [];
let walls: Array<Body> = [];

const N_STEPS = 40;

const D_ANGLE = D2R * 25;
const D_MIN = 40;

export function bootstrapBots(_wps: Array<WP>, _walls: Array<Body>) {
  wps = _wps;
  walls = _walls;
}

let fleeing = false;

export function setFleeing(val: boolean) {
  fleeing = val;
  foeBodies.forEach((b: Body) => {
    // @ts-ignore
    (b as BodyExt).sprite.alpha = val ? 0.5 : 1;
  });
}

type FoeData = {
  lastDist: number;
  electedWP: WP;
  lastVisitedWPs: Array<WP>;
  angles: Array<number>;
};

const foeDatas: Array<FoeData> = [];
const foeBodies: Array<Body> = [];

export function getFoeBodies(): Array<Body> {
  return foeBodies;
}

export function getFoeDatas(): Array<FoeData> {
  return foeDatas;
}

export function addBot(foeBody: Body) {
  foeBodies.push(foeBody);
  foeDatas.push({
    electedWP: nearestWaypoint(wps, foeBody.position),
    lastVisitedWPs: [],
    angles: [],
    lastDist: 1000000
  });
}

export function chooseCarDir(carBody: Body, i: number, playerBody: Body) {
  const fd = foeDatas[i];

  const d = dist(carBody.position, fd.electedWP.position);
  if (d < 4) {
    fd.lastVisitedWPs.push(fd.electedWP);

    if (fd.lastVisitedWPs.length > 3) {
      fd.lastVisitedWPs.shift();
    }

    fd.electedWP = chooseDirection(
      fd.electedWP,
      playerBody.position,
      fd.lastVisitedWPs,
      fleeing
    );
  }
  fd.lastDist = d;

  const v = {
    x: fd.electedWP.position.x - carBody.position.x,
    y: fd.electedWP.position.y - carBody.position.y
  };

  const lastAngle = Math.atan2(v.y, v.x) + Math.PI / 2;
  // fd.angles.unshift(lastAngle);
  // if (fd.angles.length > 8) {
  //   fd.angles.pop();
  // }
  // carBody.angle = avg(fd.angles);
  carBody.angle = lastAngle;

  return normalize(v, 0.0006);
}
