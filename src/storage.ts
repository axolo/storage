class ScopedStorage {
  private prefix: string;
  private engine: Storage;

  constructor(prefix: string, engine: Storage = localStorage) {
    this.prefix = prefix;
    this.engine = engine;
  }

  // 添加前缀
  _getKey(key: string) {
    return [this.prefix, key].filter(i => i).join('');
  }

  // 设置项
  setItem(key: string, value: any) {
    const fullKey = this._getKey(key);
    this.engine.setItem(fullKey, JSON.stringify(value));
    return this;
  }

  // 获取项
  getItem(key: string) {
    const fullKey = this._getKey(key);
    const item = this.engine.getItem(fullKey);
    if (item === null) return null;
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  }

  // 移除项
  removeItem(key: string) {
    const fullKey = this._getKey(key);
    this.engine.removeItem(fullKey);
    return this;
  }

    // 获取所有带前缀的键
  keys() {
    const keys = [];
    for (let i = 0; i < this.engine.length; i++) {
      const key: string | null = this.engine.key(i);
      if (key === null) continue;
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }

  // 清空当前前缀的所有项
  clear() {
    const keys = this.keys();
    keys.forEach(key => this.removeItem(key));
    return this;
  }

  // 检查键是否存在
  has(key: string) {
    return this.keys().includes(key);
  }

  // 获取存储大小
  getSize() {
    let size = 0;
    this.keys().forEach(key => {
      const item = this.engine.getItem(this._getKey(key));
      size += (item ? item.length : 0);
    });
    return size;
  }
}

export default ScopedStorage
