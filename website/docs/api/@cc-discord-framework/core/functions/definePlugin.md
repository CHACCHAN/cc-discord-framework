# 関数: definePlugin()

```ts
function definePlugin<T>(plugin): T;
```

定義: [src/plugin.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/plugin.ts#L38)

プラグインオブジェクトを型付けする恒等ヘルパー。設定可能なプラグインは
`definePlugin({...})` を返すファクトリ関数として書くのが慣例です:

```ts
export function scheduler(options: SchedulerOptions = {}) {
  return definePlugin({
    name: "scheduler",
    install(client) { ... },
  });
}
```

## 型パラメーター

### T

`T` *extends* [`Plugin`](../interfaces/Plugin.md)

## パラメータ

### plugin

`T`

## 戻り値

`T`
