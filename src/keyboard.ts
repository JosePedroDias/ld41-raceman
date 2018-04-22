export const KC_SPACE = 32;
export const KC_LEFT = 37;
export const KC_RIGHT = 39;
export const KC_UP = 38;
export const KC_DOWN = 40;

type HashOfKeyStates = { [index: number]: boolean };

export const isDown: HashOfKeyStates = {};
export let justChanged: HashOfKeyStates = {};

export function hookKeys() {
  document.addEventListener('keydown', (ev: KeyboardEvent) => {
    // @ts-ignore
    const kc: number = ev.keyCode;

    if (ev.ctrlKey || ev.altKey || ev.shiftKey) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();

    if (isDown[kc]) {
      return;
    }

    isDown[kc] = true;
    justChanged[kc] = true;
  });

  document.addEventListener('keyup', (ev: KeyboardEvent) => {
    // @ts-ignore
    const kc: number = ev.keyCode;
    if (ev.ctrlKey || ev.altKey || ev.shiftKey) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();

    if (!isDown[kc]) {
      return;
    }

    isDown[kc] = false;
    justChanged[kc] = true;
  });
}
