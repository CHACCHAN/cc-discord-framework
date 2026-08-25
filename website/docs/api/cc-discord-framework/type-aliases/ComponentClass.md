# 型エイリアス: ComponentClass\<T\>

```ts
type ComponentClass<T> = () => T;
```

定義: src/component/metadata.ts:27

ローダーから見た具象コンポーネントクラス: 引数なしで構築できること。
インスタンスの初期化は構築後にフレームワークが行うため、コンポーネントの
コンストラクタがフレームワーク由来の引数を受け取ることはありません。

## 型パラメーター

### T

`T` *extends* [`Component`](../classes/Component.md) = [`Component`](../classes/Component.md)

## 戻り値

`T`
