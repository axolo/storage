import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import AxoloStorage from '../dist/storage.es.js';
import MemoryStorage from './lib/memory-storage.js';

describe('_getKey', () => {
  it('前缀拼接', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('test:', engine);
    assert.equal(store._getKey('a'), 'test:a');
    assert.equal(store._getKey(''), 'test:');
  });

  it('空前缀', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('', engine);
    assert.equal(store._getKey('a'), 'a');
  });
});

describe('setItem / getItem', () => {
  it('基本类型', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);

    store.setItem('name', 'axolo');
    assert.equal(store.getItem('name'), 'axolo');

    store.setItem('count', 100);
    assert.equal(store.getItem('count'), 100);

    store.setItem('flag', true);
    assert.equal(store.getItem('flag'), true);

    store.setItem('nil', null);
    assert.equal(store.getItem('nil'), null);
  });

  it('对象与数组', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);

    const user = { id: 1, name: 'axolo', tags: ['a', 'b'] };
    store.setItem('user', user);
    assert.deepEqual(store.getItem('user'), user);

    const list = [1, 2, { n: 3 }];
    store.setItem('list', list);
    assert.deepEqual(store.getItem('list'), list);
  });

  it('不存在的键返回 null', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    assert.equal(store.getItem('missing'), null);
  });

  it('非 JSON 字符串原值返回', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    engine.setItem('demo:raw', 'this-is-not-json');
    assert.equal(store.getItem('raw'), 'this-is-not-json');
  });

  it('链式调用', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    const result = store.setItem('a', 1).setItem('b', 2).setItem('c', 3);
    assert.ok(result === store);
    assert.equal(store.getItem('a'), 1);
    assert.equal(store.getItem('b'), 2);
    assert.equal(store.getItem('c'), 3);
  });
});

describe('removeItem', () => {
  it('基本删除', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);

    store.setItem('x', 1);
    assert.equal(store.getItem('x'), 1);

    const ret = store.removeItem('x');
    assert.ok(ret === store);
    assert.equal(store.getItem('x'), null);
  });

  it('链式调用', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    store.setItem('a', 1).setItem('b', 2);
    const ret = store.removeItem('a').removeItem('b');
    assert.ok(ret === store);
    assert.equal(store.keys().length, 0);
  });
});

describe('keys', () => {
  it('只包含当前前缀的键', () => {
    const engine = new MemoryStorage();
    const a = new AxoloStorage('a:', engine);
    const b = new AxoloStorage('b:', engine);

    a.setItem('k1', 1);
    a.setItem('k2', 2);
    b.setItem('k3', 3);

    const aKeys = a.keys().sort();
    const bKeys = b.keys().sort();
    assert.deepEqual(aKeys, ['k1', 'k2']);
    assert.deepEqual(bKeys, ['k3']);
  });

  it('engine 混合无关键', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('s:', engine);
    engine.setItem('other', 'x');
    engine.setItem('s:k1', '1');
    store.setItem('k2', 2);
    const keys = store.keys().sort();
    assert.deepEqual(keys, ['k1', 'k2']);
  });
});

describe('has', () => {
  it('检查键存在性', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    store.setItem('ok', 1);
    assert.equal(store.has('ok'), true);
    assert.equal(store.has('no'), false);
  });
});

describe('clear', () => {
  it('仅清空当前前缀', () => {
    const engine = new MemoryStorage();
    const a = new AxoloStorage('a:', engine);
    const b = new AxoloStorage('b:', engine);

    a.setItem('x', 1).setItem('y', 2);
    b.setItem('z', 3);

    const ret = a.clear();
    assert.ok(ret === a);
    assert.equal(a.keys().length, 0);
    assert.deepEqual(b.keys(), ['z']);
    assert.equal(b.getItem('z'), 3);
  });
});

describe('getSize', () => {
  it('存储内容长度', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('s:', engine);
    assert.equal(store.getSize(), 0);

    store.setItem('a', 'hello');
    const sizeA = store.getSize();
    assert.equal(sizeA, JSON.stringify('hello').length);

    store.setItem('b', { x: 1 });
    const sizeB = store.getSize();
    const expected = JSON.stringify('hello').length + JSON.stringify({ x: 1 }).length;
    assert.equal(sizeB, expected);
  });
});

describe('前缀隔离', () => {
  it('两个实例互不干扰', () => {
    const engine = new MemoryStorage();
    const s1 = new AxoloStorage('ns1:', engine);
    const s2 = new AxoloStorage('ns2:', engine);

    s1.setItem('data', { a: 1 });
    s2.setItem('data', { a: 2 });

    assert.deepEqual(s1.getItem('data'), { a: 1 });
    assert.deepEqual(s2.getItem('data'), { a: 2 });
    assert.equal(s1.has('data'), true);
    assert.equal(s2.has('data'), true);

    s1.clear();
    assert.equal(s1.has('data'), false);
    assert.equal(s2.has('data'), true);
  });
});

describe('存储 undefined 行为', () => {
  it('undefined 转为字符串存储', () => {
    const engine = new MemoryStorage();
    const store = new AxoloStorage('demo:', engine);
    store.setItem('u', undefined);
    const raw = engine.getItem('demo:u');
    assert.equal(raw, 'undefined');
    assert.equal(store.getItem('u'), 'undefined');
  });
});
