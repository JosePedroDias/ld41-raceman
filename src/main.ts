// import { Application } from 'pixi.js';
import { Engine, World, Render, Bodies, Body } from 'matter-js';
// import { setup, renderFactory } from './canvasRender';
import { setup, renderFactory } from './pixiRender';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
}

const engine = Engine.create();

const boxA = Bodies.rectangle(400, 200, 80, 80) as BodyExt;
boxA.dims = [80, 80];
boxA.color = 0xffdddd;

const boxB = Bodies.rectangle(450, 50, 80, 80) as BodyExt;
boxB.dims = [80, 80];

const ground = Bodies.rectangle(400, 610, 810, 60, {
  isStatic: true
}) as BodyExt;
ground.dims = [810, 60];

World.add(engine.world, [boxA, boxB, ground]);

// A) DEBUG RENDERED

// const render = Render.create({
//   element: document.body,
//   engine: engine
// });
// Engine.run(engine);
// Render.run(render);

// B) AD HOC CANVAS RENDERER

setup();
renderFactory(engine);
