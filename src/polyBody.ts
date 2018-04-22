import { Bodies, Vertices, Vector } from 'matter-js';
import { Point } from 'pixi.js';

function p(arr: number[]): Vector {
  return { x: arr[0], y: arr[1] };
}

export function polyBody(center: Point, verts: Vector[][], opts: any) {
  // @ts-ignore
  const verts2 = verts.map(p => Vector.create(p[0], p[1]));
  // @ts-ignore
  //const center_ = Vertices.centre(verts2);
  // @ts-ignore
  const body = Bodies.fromVertices(
    center.x,
    center.y,
    verts2,
    opts,
    false,
    0,
    0.0000001
  );
  //body.position.x = center.x;
  //body.position.y = center.y;
  return body;
}
