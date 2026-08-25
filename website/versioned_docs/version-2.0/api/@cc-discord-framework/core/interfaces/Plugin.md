# インターフェイス: Plugin

定義: [src/plugin.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/plugin.ts#L18)

フレームワークプラグイン。

`install` は [Client.load](../classes/Client.md#load) の冒頭 — どのコンポーネントよりも先 —
に実行されるため、プラグインは次のことができます:

- 新しいコンポーネント種別の登録: `client.stores.register(new TaskStore())`
- サービスの提供: `client.container.x = ...`(`Container` の宣言マージと併用)
- コンポーネントの同梱: `client.register(MyCommand, MyListener)`
- クライアント / フレームワークイベントによるランタイム観測

プラグインは配列順にインストールされ、async でも構いません
(データベース接続、設定読み込みなど)。

## プロパティ

### name \{#name}

```ts
readonly name: string;
```

定義: [src/plugin.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/plugin.ts#L20)

ログで使われる一意なプラグイン名。

## メソッド

### install() \{#install}

```ts
install(client): unknown;
```

定義: [src/plugin.ts:22](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/plugin.ts#L22)

クライアント起動時に一度だけ、コンポーネントのロード前に呼ばれます。

#### パラメータ

##### client

[`Client`](../classes/Client.md)

#### 戻り値

`unknown`
