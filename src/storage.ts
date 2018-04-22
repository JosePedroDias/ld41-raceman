let _memoryStorage: { [index: string]: string } = {};

export function save(key: string, value: any) {
  try {
    const s: string = JSON.stringify(value);
    _memoryStorage[key] = s;
    localStorage.setItem(key, s);
  } catch (_) {}
}

export function load(key: string, defaultValue: any): any {
  try {
    const s: string | null = localStorage.getItem(key);
    if (s == null) {
      return defaultValue;
    }
    return JSON.parse(s);
  } catch (ex) {
    const s = _memoryStorage[key];
    if (s === undefined) {
      return defaultValue;
    }
    try {
      return JSON.parse(s);
    } catch (_) {
      return defaultValue;
    }
  }
}

export function remove(key: string) {
  delete _memoryStorage[key];
  try {
    localStorage.removeItem(key);
  } catch (_) {}
}

export function reset() {
  try {
    _memoryStorage = {};
    localStorage.clear();
  } catch (_) {}
}
