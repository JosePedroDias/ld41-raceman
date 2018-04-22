import {
  Engine,
  World,
  Render,
  Bodies,
  Events,
  Body,
  Vector,
  IEventCollision
} from 'matter-js';
import { setup, renderFactory, setZoom, setPosition } from './pixiRender';
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
import { clamp, sign } from './utils';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
  sprite: string;
  scale: number;
}

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

let playerBody: Body;

loadMap('small').then(res => {
  // console.log(res);

  res.forEach(item => {
    // const b = Bodies.rectangle(item.x, item.y, 32, 32, {
    //   isStatic: true
    // }) as BodyExt;
    // b.dims = [32, 32];
    // b.sprite = `assets/sprites/placeholder/${item.tex}.png`;
    // World.add(engine.world, b);

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
    b2.sprite = `assets/sprites/placeholder/${item.tex}.png`;
    b2.scale = item.scale || 1;

    if (item.tex === 'G') {
      playerBody = b2;
      playerBody.frictionAir = 0.3;
      playerBody.friction = 0.1;
      //playerBody.frictionStatic = 0.3;
    }

    World.add(engine.world, b2);
  });

  setup();
  renderFactory(engine);

  setZoom(2.5);
  setPosition(new Point(-140, 0));

  Events.on(engine, 'collisionStart', (ev: any) => {
    // collisionStart collisionEnd beforeUpdate beforeTick
    ev.pairs.forEach((pair: any) => {
      // console.log('%s %s', pair.bodyA.sprite, pair.bodyB.sprite);
    });
  });

  Events.on(engine, 'beforeUpdate', (ev: any) => {
    // collisionStart collisionEnd beforeUpdate beforeTick
    const fwd = isDown[KC_UP] ? 1 : isDown[KC_DOWN] ? -0.5 : 0;
    const side = isDown[KC_LEFT] ? -1 : isDown[KC_RIGHT] ? 1 : 0;

    if (fwd) {
      const p = fwd * 0.0013;
      const ang = playerBody.angle - Math.PI / 2;
      const v = {
        x: p * Math.cos(ang),
        y: p * Math.sin(ang)
      };
      Body.applyForce(playerBody, playerBody.position, v);
    }

    if (side) {
      const spd = clamp(playerBody.speed, 0.01, 0.1);
      Body.setAngularVelocity(playerBody, spd * side * sign(fwd));
    }
  });

  hookKeys();
});
