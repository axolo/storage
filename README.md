# ScopedStorage

一个支持命名空间前缀和自动编解码的 JavaScript Storage 封装库。

## 特性

- **命名空间隔离**：通过前缀实现多实例数据隔离，避免 key 冲突
- **自动编解码**：自动 JSON.stringify/JSON.parse，支持任意数据类型
- **灵活引擎**：默认使用 localStorage，可切换为 sessionStorage 或自定义存储引擎
- **链式调用**：setItem、removeItem、clear 等方法支持链式操作
- **TypeScript 支持**：完整的类型声明
- **零依赖**：轻量级，不依赖任何第三方库
- **UMD/ESM 双格式**：支持浏览器直接引入和模块化引入

## 安装

```bash
npm i @axolo/storage
```

### 使用

```javascript
import ScopedStorage from '@axolo/storage';

// 创建带前缀的存储实例
const store = new ScopedStorage('app:');

// 存储数据
store.setItem('user', { id: 1, name: 'axolo' });
store.setItem('token', 'abc123');
store.setItem('count', 100);

// 读取数据
const user = store.getItem('user'); // { id: 1, name: 'axolo' }
const token = store.getItem('token'); // 'abc123'
const count = store.getItem('count'); // 100

store.has('user'); // true
store.keys(); // ['user', 'token', 'count']
store.removeItem('count');
store.clear();
```

## API

### new ScopedStorage(prefix?: string, engine?: Storage)

|   参数   |   类型    |     默认值     |                  说明                   |
| -------- | --------- | -------------- | --------------------------------------- |
| `prefix` | `string`  |                | 命名空间前缀，所有 key 会自动拼接此前缀 |
| `engine` | `Storage` | `localStorage` | 存储引擎，可选`sessionStorage`          |

### `setItem(key: string, value: any): this`

存储数据，自动 JSON 序列化。

### `getItem(key: string): any`

读取数据，自动 JSON 反序列化。

### `removeItem(key: string): this`

移除指定 key。

### `keys(): string[]`

返回所有带当前前缀的 key 列表（已去除前缀）。

### `has(key: string): boolean`

检查 key 是否存在。

### `clear(): this`

清空当前前缀下的所有数据，不影响其他前缀的数据。

### `getSize(): number`

获取当前前缀下所有存储内容的总字符长度（基于 JSON 序列化后的字符串）。

## License

[MIT](LICENSE)
