import AxoloStorage from '../dist/storage.es.js';
import MemoryStorage from './lib/memory-storage.js';

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    errors.push(message);
    console.log(`  ✗ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    errors.push(`${message} | expected: ${JSON.stringify(expected)}, actual: ${JSON.stringify(actual)}`);
    console.log(`  ✗ ${message} | expected: ${JSON.stringify(expected)}, actual: ${JSON.stringify(actual)}`);
  }
}

function runTest(name, fn) {
  console.log(`\n${name}`);
  try {
    fn();
  } catch (e) {
    failed++;
    errors.push(`${name} threw: ${e.message}`);
    console.log(`  ✗ threw: ${e.message}`);
  }
}

runTest('_getKey: 前缀拼接', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('test:', engine);
  assertEqual(store._getKey('a'), 'test:a', '_getKey("a") 应为 "test:a"');
  assertEqual(store._getKey(''), 'test:', '_getKey("") 应为 "test:"');
});

runTest('_getKey: 空前缀', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('', engine);
  assertEqual(store._getKey('a'), 'a', '空前缀 _getKey("a") 应为 "a"');
});

runTest('setItem / getItem: 基本类型', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);

  store.setItem('name', 'axolo');
  assertEqual(store.getItem('name'), 'axolo', '存储字符串后读取一致');

  store.setItem('count', 100);
  assertEqual(store.getItem('count'), 100, '存储数字后读取一致');

  store.setItem('flag', true);
  assertEqual(store.getItem('flag'), true, '存储布尔值后读取一致');

  store.setItem('nil', null);
  assertEqual(store.getItem('nil'), null, '存储 null 后读取一致');
});

runTest('setItem / getItem: 对象与数组', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);

  const user = { id: 1, name: 'axolo', tags: ['a', 'b'] };
  store.setItem('user', user);
  assertEqual(store.getItem('user'), user, '存储对象后读取深度相等');

  const list = [1, 2, { n: 3 }];
  store.setItem('list', list);
  assertEqual(store.getItem('list'), list, '存储数组后读取深度相等');
});

runTest('getItem: 不存在的键返回 null', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  assertEqual(store.getItem('missing'), null, '不存在键返回 null');
});

runTest('getItem: 非 JSON 字符串原值返回', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  engine.setItem('demo:raw', 'this-is-not-json');
  assertEqual(store.getItem('raw'), 'this-is-not-json', '无法解析 JSON 时返回原始字符串');
});

runTest('setItem: 链式调用', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  const result = store.setItem('a', 1).setItem('b', 2).setItem('c', 3);
  assert(result === store, 'setItem 返回 this 支持链式调用');
  assertEqual(store.getItem('a'), 1, '链式 setItem a');
  assertEqual(store.getItem('b'), 2, '链式 setItem b');
  assertEqual(store.getItem('c'), 3, '链式 setItem c');
});

runTest('removeItem', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);

  store.setItem('x', 1);
  assertEqual(store.getItem('x'), 1, '存储后存在');

  const ret = store.removeItem('x');
  assert(ret === store, 'removeItem 返回 this');
  assertEqual(store.getItem('x'), null, '移除后读取为 null');
});

runTest('keys: 只包含当前前缀的键', () => {
  const engine = new MemoryStorage();
  const a = new AxoloStorage('a:', engine);
  const b = new AxoloStorage('b:', engine);

  a.setItem('k1', 1);
  a.setItem('k2', 2);
  b.setItem('k3', 3);

  const aKeys = a.keys().sort();
  const bKeys = b.keys().sort();
  assertEqual(aKeys, ['k1', 'k2'], 'a 前缀 keys 为 [k1, k2]');
  assertEqual(bKeys, ['k3'], 'b 前缀 keys 为 [k3]');
});

runTest('keys: engine 混合无关键', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('s:', engine);
  engine.setItem('other', 'x');
  engine.setItem('s:k1', '1');
  store.setItem('k2', 2);
  const keys = store.keys().sort();
  assertEqual(keys, ['k1', 'k2'], '过滤掉无前缀和其他前缀的键');
});

runTest('has: 检查键存在性', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  store.setItem('ok', 1);
  assert(store.has('ok') === true, 'has("ok") 为 true');
  assert(store.has('no') === false, 'has("no") 为 false');
});

runTest('clear: 仅清空当前前缀', () => {
  const engine = new MemoryStorage();
  const a = new AxoloStorage('a:', engine);
  const b = new AxoloStorage('b:', engine);

  a.setItem('x', 1).setItem('y', 2);
  b.setItem('z', 3);

  const ret = a.clear();
  assert(ret === a, 'clear 返回 this');
  assertEqual(a.keys().length, 0, 'clear 后 a 无 keys');
  assertEqual(b.keys(), ['z'], 'clear 后 b 的键不受影响');
  assertEqual(b.getItem('z'), 3, 'b 中值仍可读取');
});

runTest('getSize: 存储内容长度', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('s:', engine);
  assertEqual(store.getSize(), 0, '初始 size 为 0');

  store.setItem('a', 'hello');
  const sizeA = store.getSize();
  assert(sizeA === JSON.stringify('hello').length, 'size 为字符串化后的长度');

  store.setItem('b', { x: 1 });
  const sizeB = store.getSize();
  const expected = JSON.stringify('hello').length + JSON.stringify({ x: 1 }).length;
  assertEqual(sizeB, expected, '多个键 size 累加');
});

runTest('前缀隔离: 两个实例互不干扰', () => {
  const engine = new MemoryStorage();
  const s1 = new AxoloStorage('ns1:', engine);
  const s2 = new AxoloStorage('ns2:', engine);

  s1.setItem('data', { a: 1 });
  s2.setItem('data', { a: 2 });

  assertEqual(s1.getItem('data'), { a: 1 }, 'ns1 读取自己的数据');
  assertEqual(s2.getItem('data'), { a: 2 }, 'ns2 读取自己的数据');
  assertEqual(s1.has('data'), true, 'ns1 has data');
  assertEqual(s2.has('data'), true, 'ns2 has data');

  s1.clear();
  assertEqual(s1.has('data'), false, 'ns1 清空后无 data');
  assertEqual(s2.has('data'), true, 'ns2 仍保留 data');
});

runTest('removeItem: 链式调用', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  store.setItem('a', 1).setItem('b', 2);
  const ret = store.removeItem('a').removeItem('b');
  assert(ret === store, 'removeItem 链式返回 this');
  assertEqual(store.keys().length, 0, '链式 removeItem 后 keys 为空');
});

runTest('存储 undefined 行为', () => {
  const engine = new MemoryStorage();
  const store = new AxoloStorage('demo:', engine);
  store.setItem('u', undefined);
  const raw = engine.getItem('demo:u');
  assert(raw === 'undefined', 'undefined 转为字符串 "undefined" 存储');
  assertEqual(store.getItem('u'), 'undefined', '读取得到字符串 "undefined"');
});

console.log(`\n====================================`);
console.log(`通过: ${passed}  失败: ${failed}`);
console.log(`====================================`);

if (failed > 0) {
  console.log('\n失败项:');
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));
  process.exit(1);
} else {
  console.log('\n所有测试通过!');
}
