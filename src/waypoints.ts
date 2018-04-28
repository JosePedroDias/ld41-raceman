import { MapItem, WALL_TEXS } from './mapLoader';
import { distSquared, sign } from './utils';
import { Vector } from 'matter-js';

const CONNECTED_DIST = 32 * 1.3;
const CONNECTED_DIST_SQ = CONNECTED_DIST * CONNECTED_DIST;

export type WP = {
  position: Vector;
  connectedTo: Array<WP>;
};

export function toWaypoints(navs: Array<Vector>) {
  const wps: Array<WP> = navs.map(nav => ({
    position: nav,
    connectedTo: []
  }));

  // fill connectedTos
  wps.forEach((wp: WP) => {
    wps.forEach((wp2: WP) => {
      if (
        wp === wp2 ||
        distSquared(wp.position, wp2.position) > CONNECTED_DIST_SQ
      ) {
        return;
      }
      wp.connectedTo.push(wp2);
    });
  });

  return wps;
}

type IndexDistPair = {
  index: number;
  distance: number;
};

export function nearestWaypoint(waypoints: Array<WP>, position: Vector): WP {
  const aux: Array<IndexDistPair> = waypoints.map((wp: WP, i: number) => {
    return {
      distance: distSquared(wp.position, position),
      index: i
    };
  });
  aux.sort((a: IndexDistPair, b: IndexDistPair) => {
    return sign(a.distance - b.distance);
  });
  return waypoints[aux[0].index];
}

export function chooseDirection(
  currentWP: WP,
  targetPosition: Vector,
  blacklistedWPs: Array<WP>
): WP {
  let wps: Array<WP> = currentWP.connectedTo.filter((wp: WP) => {
    return blacklistedWPs.indexOf(wp) === -1;
  });
  return nearestWaypoint(wps, targetPosition);
}
