class MemoryStorage {
  constructor() {
    this._data = {};
  }
  get length() {
    return Object.keys(this._data).length;
  }
  key(n) {
    const keys = Object.keys(this._data);
    return keys[n] || null;
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this._data, key) ? this._data[key] : null;
  }
  setItem(key, value) {
    this._data[key] = String(value);
  }
  removeItem(key) {
    delete this._data[key];
  }
  clear() {
    this._data = {};
  }
}

export default MemoryStorage;
