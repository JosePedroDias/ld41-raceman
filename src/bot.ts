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
  polarMove
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
  lastDist: number;
  electedWP: WP;
  lastVisitedWPs: Array<WP>;
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
    lastDist: 1000000
  });
}

export function chooseCarDir(carBody: Body, i: number, playerBody: Body) {
  const fd = foeDatas[i];

  const d = dist(carBody.position, fd.electedWP.position);
  if (d > fd.lastDist) {
    fd.lastVisitedWPs.push(fd.electedWP);

    if (fd.lastVisitedWPs.length > 3) {
      fd.lastVisitedWPs.shift();
    }

    fd.electedWP = chooseDirection(
      fd.electedWP,
      playerBody.position,
      fd.lastVisitedWPs,
      true
    );
  }
  fd.lastDist = d;

  const v = {
    x: playerBody.position.x - carBody.position.x,
    y: playerBody.position.y - carBody.position.y
  };

  return normalize(v, 0.0003);
}
