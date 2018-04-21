// import { Application } from 'pixi.js';
import { Engine, World, Render, Bodies, Body } from 'matter-js';
// import { setup, renderFactory } from './canvasRender';
import { setup, renderFactory } from './pixiRender';
import { loadTxt, loadMap } from './mapLoader';

export interface BodyExt extends Body {
  dims: Array<number>;
  color: number;
  sprite: string;
}

const engine = Engine.create();

// const boxA = Bodies.rectangle(400, 200, 80, 80) as BodyExt;
// boxA.dims = [80, 80];
// boxA.color = 0xffdddd;

// const boxB = Bodies.rectangle(450, 50, 80, 80) as BodyExt;
// boxB.dims = [80, 80];
// boxB.sprite = 'http://pixijs.io/examples/required/assets/basics/bunny.png';

// const ground = Bodies.rectangle(400, 610, 810, 60, {
//   isStatic: true
// }) as BodyExt;
// ground.dims = [810, 60];

// World.add(engine.world, [boxA, boxB, ground]);

// A) DEBUG RENDERED

// const render = Render.create({
//   element: document.body,
//   engine: engine
// });
// Engine.run(engine);
// Render.run(render);

// B) AD HOC CANVAS RENDERER

loadMap('original').then(res => {
  // console.log(res);

  res.forEach(item => {
    const b = Bodies.rectangle(item.x, item.y, 32, 32, {
      isStatic: true
    }) as BodyExt;
    b.dims = [32, 32];
    b.sprite = `assets/sprites/placeholder/${item.tex}.png`;
    World.add(engine.world, b);
  });

  setup();
  renderFactory(engine);
});
