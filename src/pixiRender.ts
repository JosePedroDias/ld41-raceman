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
import { D2R, R2D } from './consts';
import { WP } from './waypoints';

// http://pixijs.io/examples/

utils.skipHello();

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
  scene.position = new Point(-point.x, -point.y);
}
export function getPosition(): Point {
  // @ts-ignore
  return scene.position; //.clone();
}

// @ts-ignore
// window.setZoom = setZoom;

// @ts-ignore
// window.setRotation = setRotation;

// @ts-ignore
// window.setPosition = setPosition;

function polygon(body: BodyExt) {
  const verts = body.vertices;
  const g = new PIXI.Graphics();

  // g.blendMode = PIXI.BLEND_MODES.LIGHTEN;
  g.beginFill(body.color || 0xff3300, 0.5);
  g.lineStyle(1, 0xffffff, 1);
  const p = body.position;
  verts.forEach((v, i) => {
    const v2 = { x: v.x + p.x, y: v.y + p.y };
    if (i === 0) {
      g.moveTo(v2.x, v2.y);
    } else {
      g.lineTo(v2.x, v2.y);
    }
  });
  g.lineTo(verts[0].x + p.x, verts[0].y + p.y);
  g.endFill();

  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  return sp;
}

function sprite(body: BodyExt, app: Application) {
  const sp = Sprite.fromImage(body.sprite);
  if ('scale' in body) {
    sp.scale.set(body.scale);
  }
  sp.anchor.set(0.5);
  // @ts-ignore
  body.sprite = sp;
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

function renderWps(wps: Array<WP>) {
  const g = new PIXI.Graphics();
  //g.blendMode = PIXI.BLEND_MODES.LIGHTEN;
  //g.beginFill(0x000000, 0);
  g.lineStyle(1, 0x00ffff, 0.33);

  wps.forEach((wp: WP) => {
    g.drawCircle(wp.position.x, wp.position.y, 4);
    g.moveTo(wp.position.x, wp.position.y);
    wp.connectedTo.forEach((wp2: WP) => {
      g.lineTo(wp2.position.x, wp2.position.y);
    });
  });
  //g.endFill();
  const tex: Texture = app.renderer.generateTexture(g);
  const sp = new Sprite(tex);
  sp.anchor.set(0.5);
  sp.position.x -= 32;
  sp.position.y -= 16;
  return sp;
}

export function setup() {
  app = new Application(800, 600, { backgroundColor: 0x000000 });
  document.body.appendChild(app.view);

  CAM_X0 = app.screen.width / 2;
  CAM_Y0 = app.screen.height / 2;
  app.stage.position.x = CAM_X0;
  app.stage.position.y = CAM_Y0;

  // app.stage.scale.set(2.5); // TEMP

  // app.stage.rotation = D2R * 0;

  app.stage.addChild(scene);
}

export function removeSprite(body: BodyExt) {
  // @ts-ignore
  const sp: Sprite = body.sprite;
  //sp.alpha = 0.25;
  scene.removeChild(sp);
}

let running = true;

export function stopEngine() {
  running = false;
}

export function renderFactory(engine: Engine, wps: Array<WP>) {
  let t0 = 0;

  function render(t_: number) {
    const t = t_ / 1000;
    const dt = t - t0;
    t0 = t;

    if (!running) {
      return;
    }

    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const bodies = Composite.allBodies(engine.world) as Array<BodyExt>;

    if (t === 0) {
      const g0: DisplayObject = renderWps(wps);
      scene.addChild(g0);

      bodies.forEach(body => {
        let g: DisplayObject;
        if (!('sprite' in body)) {
          //g = polygon(body);
          return;
        } else {
          g = sprite(body, app);
        }

        scene.addChild(g);
      });
    } else {
      bodies.forEach((body, i) => {
        // @ts-ignore
        const g: DisplayObject = body.sprite;
        if (!g) {
          return;
        }
        g.position.x = body.position.x;
        g.position.y = body.position.y;
        g.rotation = body.angle;
      });
    }

    //setRotation(getRotation() + 15 * dt);
    //setZoom((1 + Math.sin(t * 2) * 0.5) * 0.75);
  }

  render(0);
}

export function render() {}
