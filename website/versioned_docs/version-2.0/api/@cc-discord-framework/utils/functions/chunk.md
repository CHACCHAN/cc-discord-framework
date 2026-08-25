# 関数: chunk()

```ts
function chunk<T>(items, size): T[][];
```

定義: [plugins/utils/src/text.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/text.ts#L49)

配列を一定の大きさに分割します。ページネーションの元データ作りに。

```ts
const pages = chunk(members, 10).map((page) => page.join("\n"));
```

## 型パラメーター

### T

`T`

## パラメータ

### items

readonly `T`[]

### size

`number`

## 戻り値

`T`[][]
