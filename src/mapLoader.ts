import { Vector } from '../node_modules/@types/matter-js/index';

export function loadTxt(url: string): Promise<string> {
  return new Promise((resolve: any, reject: any) => {
    const xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);

    const cbInner = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(xhr);
        }
        return;
      }
    };

    xhr.onload = cbInner;
    xhr.onerror = cbInner;

    xhr.send();
  });
}

const DOT = '.';
const DOOT = 'o';
const H = '━';
const H1 = '╺';
const H2 = '╸';
const V = '┃';
const TL = '┏';
const TR = '┓';
const BL = '┗';
const BR = '┛';

export const WALL_TEXS = [H, H1, H2, V, TL, TR, BL, BR];

const W = 32;

export type MapItem = {
  x: number;
  y: number;
  tex: string;
  scale: number;
};

export type MapResult = {
  items: Array<MapItem>;
  totalDots: number;
  limits: { x0: number; x1: number; y0: number; y1: number };
  navigatable: Array<Vector>;
};

export function loadMap(mapName: string): Promise<MapResult> {
  return new Promise((resolve: any) => {
    loadTxt(`assets/maps/${mapName}.txt`).then(txt => {
      const lines = txt.split('\n');

      const numLines = lines.length;
      const lineLens = lines.map(l => l.length);
      const numCols = Math.max.apply(null, lineLens);

      let numDots = 0;

      const navigatable: Array<Vector> = [];

      const res: Array<any> = [];
      lines.forEach((l, li) => {
        l.split('').forEach((c, ci) => {
          const x = (ci - numCols / 2) * W;
          const y = (li - numLines / 2) * W;

          let tex;
          let sc = 1;
          switch (c) {
            case DOT:
              tex = 'DOT';
              ++numDots;
              navigatable.push({ x, y });
              break;
            case DOOT:
              tex = 'DOOT';
              ++numDots;
              navigatable.push({ x, y });
              break;

            case V:
              tex = 'V';
              break;
            case H:
              tex = 'H';
              break;
            case H1:
              tex = 'H1';
              break;
            case H2:
              tex = 'H2';
              break;

            case TL:
              tex = 'TL';
              break;
            case TR:
              tex = 'TR';
              break;
            case BL:
              tex = 'BL';
              break;
            case BR:
              tex = 'BR';
              break;

            case ' ':
              navigatable.push({ x, y });
              return;

            case 'G':
              tex = 'G';
              sc = 0.08;
              navigatable.push({ x, y });
              break;

            case 'B':
              tex = 'B';
              sc = 0.08;
              navigatable.push({ x, y });
              break;

            default:
              console.warn(
                'unsupported char in map "%s" at line %s col %s',
                c,
                li,
                ci
              );
              return;
          }
          res.push({
            x,
            y,
            tex,
            scale: sc
          });
        });
      });
      resolve({
        items: res,
        totalDots: numDots,
        navigatable: navigatable,
        limits: {
          x0: numCols * W / -2,
          y0: numLines * W / -2,
          x1: numCols * W / 2,
          y1: numCols * W / 2
        }
      });
    });
  });
}
