import {
  Application,
  Sprite,
  utils,
  Graphics,
  Texture,
  DisplayObject
} from 'pixi.js';
import { Composite, Engine, Body } from 'matter-js';
import { BodyExt } from './main';

// http://pixijs.io/examples/

utils.skipHello();

let app: Application;
// let bunny: Sprite;

const items: Array<DisplayObject> = [];

function polygon(body: BodyExt) {
  const verts = body.vertices;
  var g = new PIXI.Graphics();

  g.beginFill(body.color || 0xff3300);
  g.lineStyle(2, 0xffd900, 1);
  verts.forEach((v, i) => {
    if (i === 0) {
      g.moveTo(v.x, v.y);
    } else {
      g.lineTo(v.x, v.y);
    }
  });
  g.lineTo(verts[0].x, verts[0].y);
  g.endFill();

  return g;
}

function rect(body: BodyExt, app: Application) {
  const g: Graphics = new Graphics();
  g.beginFill(body.color || 0xff22aa);
  g.drawRect(0, 0, body.dims[0], body.dims[1]); // tslint:disable-line
  g.endFill();
  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5, 0.5);
  return sp;
}

export function setup() {
  app = new Application(800, 600, { backgroundColor: 0x1099bb });
  document.body.appendChild(app.view);

  // bunny = Sprite.fromImage(
  //   'http://pixijs.io/examples/required/assets/basics/bunny.png'
  // );
  // bunny.anchor.set(0.5);
  // bunny.x = app.screen.width / 2;
  // bunny.y = app.screen.height / 2;
  // app.stage.addChild(bunny);
}

export function renderFactory(engine: Engine) {
  let t0 = 0;
  function render(t: number) {
    const dt = (t - t0) / 1000;
    t0 = t;

    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      bodies.forEach(body => {
        console.log(body);
        const g = rect(body, app);
        items.push(g);
        app.stage.addChild(g);
      });
    } else {
      bodies.forEach((body, i) => {
        const g = items[i];
        //g.position.x += 10 * dt;
        g.position.x = body.position.x;
        g.position.y = body.position.y;
        g.rotation = body.angle;
      });
    }

    // bunny.rotation += 10 * dt;
  }

  render(0);
}

export function render() {}
