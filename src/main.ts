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
  removeSprite
} from './pixiRender';
import { loadTxt, loadMap } from './mapLoader';
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
import { clamp, sign, lerp } from './utils';
import { D2R } from './consts';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
  sprite: string;
  kind: string;
  scale: number;
}

let SCORE = 0;
// @ts-ignore
const scoreSpanEl: HTMLElement = document.querySelector('#score');

const engine = Engine.create();

engine.world.gravity.x = 0;
engine.world.gravity.y = 0;

const A = -16;
const B = -12;
const C = 12;
const D = 16;

const VERTS: { [index: string]: number[][] } = {
  H: [[A, B], [D, B], [D, C], [A, C], [A, B]],
  H1: [[B, B], [D, B], [D, C], [B, C], [B, B]],
  H2: [[A, B], [C, B], [C, C], [A, C], [A, B]],
  V: [[B, A], [C, A], [C, D], [B, D], [B, A]],
  TL: [[B, B], [D, B], [D, C], [C, C], [C, D], [B, D], [B, B]],
  TR: [[A, B], [C, B], [C, D], [B, D], [B, C], [A, C], [A, B]],
  BL: [[B, A], [C, A], [C, B], [D, B], [D, C], [B, C], [B, A]],
  BR: [[B, A], [C, A], [C, C], [A, C], [A, B], [B, B], [B, A]]
};

function now() {
  return new Date().valueOf();
}

type FoeData = {
  lastStop: number;
  lastPos: Vector;
  n: number;
  lastChoice: string;
};

let playerBody: Body;
const foeBodies: Array<Body> = [];
const foeDatas: Array<FoeData> = [];
const walls: Array<Body> = [];

loadMap('small').then(res => {
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
        foeBodies.push(b2);
        foeDatas.push({
          lastStop: 0,
          lastPos: { x: 0, y: 0 },
          lastChoice: 'U',
          n: 1
        });
      }
    }

    World.add(engine.world, b2);
    if (!isCar && !isCircle) {
      walls.push(b2);
    } //else if(item.tex === 'G') {
    //walls.push(b2); // TODO check difference
    //}
  });

  setup();
  renderFactory(engine);

  setZoom(2.5);
  setPosition(new Point(-140, 0));

  let toKill: Array<Body> = [];

  Events.on(engine, 'afterUpdate', (ev: any) => {
    toKill.forEach((body: BodyExt) => {
      removeSprite(body);
      World.remove(engine.world, body);
    });
    toKill = [];
  });

  Events.on(engine, 'collisionStart', (ev: any) => {
    // collisionStart collisionEnd beforeUpdate beforeTick
    (ev.pairs as Array<IPair>).forEach((pair: IPair) => {
      let otherBody: BodyExt;
      if (pair.bodyA === playerBody) {
        otherBody = pair.bodyB as BodyExt;
      } else if (pair.bodyB === playerBody) {
        otherBody = pair.bodyA as BodyExt;
      } else {
        return;
      }

      //console.log(otherBody.kind);
      const k: string = otherBody.kind;
      if (k && (k === 'DOT' || k === 'DOOT')) {
        ++SCORE;
        // @ts-ignore
        scoreSpanEl.firstChild.nodeValue = SCORE;
        toKill.push(otherBody);
      }
      // console.log('%s %s', pair.bodyA.sprite, pair.bodyB.sprite);
    });
  });

  function rayDist(body: Body, dAngle: number, dMin: number, dMax: number) {
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

  function distSquared(p0: Vector, p1: Vector) {
    const dx = p0.x - p1.x;
    const dy = p0.y - p1.y;
    return dx * dx + dy * dy;
  }

  function dist(p0: Vector, p1: Vector) {
    const dx = p0.x - p1.x;
    const dy = p0.y - p1.y;
    return Math.abs(dx * dx + dy * dy);
  }

  const N_STEPS = 40;

  const D_ANGLE = D2R * 25;
  const D_MIN = 40;
  function chooseCarDir(carBody: Body, i: number) {
    const fd = foeDatas[i];
    fd.n--;
    if (fd.n === 0) {
      fd.n = N_STEPS;
      const dSq = distSquared(carBody.position, fd.lastPos);
      // console.log(dSq);
      if (dSq < 100) {
        fd.lastChoice = 'D';
      } else {
        const dFront = rayDist(carBody, 0, D_MIN, 160);
        const dLeft = rayDist(carBody, -D_ANGLE, D_MIN, 160);
        const dRight = rayDist(carBody, D_ANGLE, D_MIN, 160);
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

    foeBodies.forEach((foeBody, i) => {
      const dirs = chooseCarDir(foeBody, i);
      // @ts-ignore
      driveCar(foeBody, dirs.up, dirs.down, dirs.left, dirs.right);
    });
  });

  hookKeys();
});
