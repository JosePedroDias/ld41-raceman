import {
  Application,
  Sprite,
  utils,
  Graphics,
  Texture,
  DisplayObject,
  Container,
  Point
} from 'pixi.js';
import { Composite, Engine, Body } from 'matter-js';
import { BodyExt } from './main';

// http://pixijs.io/examples/

utils.skipHello();

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

let app: Application;
let scene = new Container();

let CAM_X0;
let CAM_Y0;

export function setZoom(z: number) {
  app.stage.scale.set(z);
}
export function getZoom(): number {
  return app.stage.scale.x;
}

export function setRotation(deg: number) {
  app.stage.rotation = D2R * deg;
}
export function getRotation(): number {
  return app.stage.rotation * R2D;
}

export function setPosition(point: Point) {
  scene.position = point.clone();
}
export function getPosition(): Point {
  // @ts-ignore
  return scene.position.clone();
}

// @ts-ignore
// window.setZoom = setZoom;

// @ts-ignore
// window.setRotation = setRotation;

// @ts-ignore
// window.setPosition = setPosition;

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

function sprite(body: BodyExt, app: Application) {
  const sp = Sprite.fromImage(body.sprite);
  sp.anchor.set(0.5);
  return sp;
}

function rect(body: BodyExt, app: Application) {
  const g: Graphics = new Graphics();
  g.beginFill(body.color || 0xff22aa);
  g.drawRect(0, 0, body.dims[0], body.dims[1]); // tslint:disable-line
  g.endFill();
  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  return sp;
}

export function setup() {
  app = new Application(800, 600, { backgroundColor: 0x000000 });
  document.body.appendChild(app.view);

  CAM_X0 = app.screen.width / 2;
  CAM_Y0 = app.screen.height / 2;
  app.stage.position.x = CAM_X0;
  app.stage.position.y = CAM_Y0;

  app.stage.scale.set(0.5);

  app.stage.rotation = D2R * 0;

  app.stage.addChild(scene);
}

export function renderFactory(engine: Engine) {
  let t0 = 0;
  function render(t_: number) {
    const t = t_ / 1000;
    const dt = t - t0;
    t0 = t;

    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      bodies.forEach(body => {
        // console.log(body);
        const g = 'sprite' in body ? sprite(body, app) : rect(body, app);
        items.push(g);
        scene.addChild(g);
      });
    } else {
      bodies.forEach((body, i) => {
        const g = items[i];
        g.position.x = body.position.x;
        g.position.y = body.position.y;
        g.rotation = body.angle;
      });
    }

    setRotation(getRotation() + 15 * dt);
    setZoom((1 + Math.sin(t * 2) * 0.5) * 0.75);
  }

  render(0);
}

export function render() {}
