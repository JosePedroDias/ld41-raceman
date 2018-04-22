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

const W = 32;

export function loadMap(mapName: string): Promise<Array<any>> {
  return new Promise((resolve: any) => {
    loadTxt(`assets/maps/${mapName}.txt`).then(txt => {
      const lines = txt.split('\n');

      const numLines = lines.length;
      const lineLens = lines.map(l => l.length);
      const numCols = Math.max.apply(null, lineLens);

      const res: Array<any> = [];
      lines.forEach((l, li) => {
        l.split('').forEach((c, ci) => {
          let tex;
          let sc = 1;
          switch (c) {
            case DOT:
              tex = 'DOT';
              break;
            case DOOT:
              tex = 'DOOT';
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
              return;

            case 'G':
              tex = 'G';
              sc = 0.08;
              break;

            case 'B':
              tex = 'B';
              sc = 0.08;
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
            x: (ci - numCols / 2) * W,
            y: (li - numLines / 2) * W,
            tex: tex,
            scale: sc
          });
        });
      });
      resolve(res);
    });
  });
}
