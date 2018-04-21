import { Composite, Engine } from 'matter-js';

export function setup() {
  const el: HTMLCanvasElement = document.createElement('canvas');
  el.width = 800;
  el.height = 600;
  document.body.appendChild(el);
  return el;
}

export function renderFactory(canvas: HTMLCanvasElement, engine: Engine) {
  function render() {
    window.requestAnimationFrame(render);
    Engine.update(engine, 1000 / 60);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const bodies = Composite.allBodies(engine.world);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();

    for (let i = 0; i < bodies.length; i += 1) {
      const verts = bodies[i].vertices;
      ctx.moveTo(verts[0].x, verts[0].y);
      for (let j = 1; j < verts.length; j += 1) {
        ctx.lineTo(verts[j].x, verts[j].y);
      }
      ctx.lineTo(verts[0].x, verts[0].y);
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#999';
    ctx.stroke();
  }

  render();
}
