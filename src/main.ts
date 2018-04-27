import {
  Engine,
  World,
  Render,
  Bodies,
  Events,
  Body,
  Vector,
  IEventCollision,
  Query,
  IPair
} from 'matter-js';
import {
  setup,
  renderFactory,
  setZoom,
  setPosition,
  getZoom,
  getPosition,
  removeSprite,
  stopEngine
} from './pixiRender';
import { loadTxt, loadMap, MapResult } from './mapLoader';
import { polyBody } from './polyBody';
import { Point } from 'pixi.js';
import {
  KC_UP,
  KC_DOWN,
  KC_LEFT,
  KC_RIGHT,
  isDown,
  hookKeys
} from './keyboard';
import { clamp, sign, lerp, dist, distSquared, rayDist } from './utils';
import { D2R } from './consts';
import { VERTS } from './VERTS';
import { toWaypoints } from './waypoints';
import { addBot, bootstrapBots, chooseCarDir2, getFoeBodies } from './bot';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
  sprite: string;
  kind: string;
  scale: number;
}

let SCORE = 0;
let LEVEL_COMPLETE_SCORE = 0;
// @ts-ignore
const scoreSpanEl: HTMLElement = document.querySelector('#score');
//@ts-ignore
const allSpanEl: HTMLElement = document.querySelector('#all');

const engine = Engine.create();

engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

let playerBody: Body;
const walls: Array<Body> = [];

loadMap('original2').then((res0: MapResult) => {
  const { items: res, totalDots: LEVEL_COMPLETE_SCORE, limits: lims } = res0;
  // @ts-ignore
  allSpanEl.firstChild.nodeValue = LEVEL_COMPLETE_SCORE;

  const wps = toWaypoints(res);
  bootstrapBots(wps, walls);

  res.forEach(item => {
    const isCar = ['B', 'G'].indexOf(item.tex) !== -1;
    const isCircle = ['DOT', 'DOOT'].indexOf(item.tex) !== -1;

    const isStatic = !isCar && !isCircle;

    const poly = VERTS[item.tex];
    let b2: BodyExt;
    if (poly) {
      // @ts-ignore
      b2 = polyBody(item, poly, { isStatic });
    } else if (isCircle) {
      const r = item.tex === 'DOT' ? 5 : 10;
      // @ts-ignore
      b2 = Bodies.circle(item.x, item.y, r, { isStatic });
    } else {
      const w = isCar ? 14 : 32;
      const h = isCar ? 22 : 32;
      b2 = Bodies.rectangle(item.x, item.y, w, h, {
        isStatic,
        angle: item.tex === 'G' ? Math.PI / 2 : 0
      }) as BodyExt;
      b2.dims = [w, h];
    }

    if (item.tex === 'B') {
      item.tex += ~~(Math.random() * 3);
    }
    b2.kind = item.tex;
    b2.sprite = `assets/sprites/placeholder/${item.tex}.png`;
    b2.scale = item.scale || 1;

    if (isCar) {
      b2.frictionAir = 0.3;
      b2.friction = 0.1;
      if (item.tex === 'G') {
        playerBody = b2;
      } else {
        addBot(b2);
      }
    }

    World.add(engine.world, b2);
    if (!isCar && !isCircle) {
      walls.push(b2);
    } //else if(item.tex === 'G') {
    //walls.push(b2); // TODO check difference
    //}
  });

  // add boundary elements to wrap around
  let b3 = Bodies.rectangle(lims.x0 - 34, lims.y0, 64, lims.y1 - lims.y0, {
    isStatic: true
  }) as BodyExt;
  b3.kind = 'X';
  World.add(engine.world, b3);
  b3 = Bodies.rectangle(lims.x1 + 30, lims.y0, 64, lims.y1 - lims.y0, {
    isStatic: true
  }) as BodyExt;
  b3.kind = 'X';
  World.add(engine.world, b3);

  setup();
  renderFactory(engine);

  setZoom(2.5);
  setPosition(new Point(-140, 0));

  let toKill: Array<Body> = [];
  let toWrap: Array<Body> = [];

  Events.on(engine, 'afterUpdate', (ev: any) => {
    toKill.forEach((body: BodyExt) => {
      removeSprite(body);
      World.remove(engine.world, body);
    });
    toKill = [];

    toWrap.forEach((body: Body) => {
      Body.setPosition(body, {
        x: -body.position.x + 60 * sign(body.position.x),
        y: body.position.y
      });
    });
    toWrap = [];
  });

  Events.on(engine, 'collisionStart', (ev: any) => {
    // collisionStart collisionEnd beforeUpdate beforeTick
    (ev.pairs as Array<IPair>).forEach((pair: IPair) => {
      // @ts-ignore
      const bA: BodyExt = pair.bodyA;
      // @ts-ignore
      const bB: BodyExt = pair.bodyB;
      let otherBody: BodyExt;

      // detect wrap
      if (bA.kind === 'X') {
        return toWrap.push(bB);
      } else if (bB.kind === 'X') {
        return toWrap.push(bA);
      }

      // collision against player
      if (bA === playerBody) {
        otherBody = bB as BodyExt;
      } else if (bB === playerBody) {
        otherBody = bA as BodyExt;
      } else {
        return;
      }

      const k: string = otherBody.kind;
      if (k === 'DOT' || k === 'DOOT') {
        ++SCORE;
        // @ts-ignore
        scoreSpanEl.firstChild.nodeValue = SCORE;
        toKill.push(otherBody);

        if (SCORE === LEVEL_COMPLETE_SCORE) {
          stopEngine();
          window.alert('GAME OVER - YOU WON!');
        }
      } else if (getFoeBodies().indexOf(otherBody) !== -1) {
        stopEngine();
        window.alert('GAME OVER - CRASHED');
      }
    });
  });

  function driveCar(
    carBody: Body,
    pressingUp: boolean,
    pressingDown: boolean,
    pressingLeft: boolean,
    pressingRight: boolean
  ) {
    const fwd = pressingUp ? 1 : pressingDown ? -0.5 : 0;
    const side = pressingLeft ? -1 : pressingRight ? 1 : 0;

    if (fwd) {
      const p = fwd * 0.0013;
      const ang = carBody.angle - Math.PI / 2;
      const v = {
        x: p * Math.cos(ang),
        y: p * Math.sin(ang)
      };
      Body.applyForce(carBody, carBody.position, v);
    }

    if (side) {
      const spd = clamp(carBody.speed, 0.01, 0.1);
      Body.setAngularVelocity(carBody, spd * side * sign(fwd));
    }
  }

  function moveCar(carBody: Body, dir: Vector) {
    Body.applyForce(carBody, carBody.position, dir);
  }

  Events.on(engine, 'beforeUpdate', (ev: any) => {
    // collisionStart collisionEnd beforeUpdate beforeTick

    const oldPos = getPosition();
    // @ts-ignore
    setPosition(playerBody.position);
    setZoom(lerp(clamp(0.5 / playerBody.speed, 1, 2.5), getZoom(), 0.03));

    // manipulate car according to keys being pressed
    driveCar(
      playerBody,
      isDown[KC_UP],
      isDown[KC_DOWN],
      isDown[KC_LEFT],
      isDown[KC_RIGHT]
    );

    getFoeBodies().forEach((foeBody, i) => {
      const v = chooseCarDir2(foeBody, i, playerBody);
      //const dirs = chooseCarDir(foeBody, i, playerBody);
      // @ts-ignore
      //driveCar(foeBody, dirs.up, dirs.down, dirs.left, dirs.right);
      moveCar(foeBody, v);
    });
  });

  hookKeys();
});
