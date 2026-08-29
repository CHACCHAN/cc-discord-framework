# インターフェイス: ListenerOptions\<E\>

定義: [src/listener/Listener.ts:12](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/listener/Listener.ts#L12)

`@Listener.define({...})` で宣言するリスナーメタデータ。

## 拡張

- [`ComponentOptions`](ComponentOptions.md)

## 型パラメーター

### E

`E` *extends* [`ListenerEvent`](../type-aliases/ListenerEvent.md) = [`ListenerEvent`](../type-aliases/ListenerEvent.md)

## プロパティ

### event \{#event}

```ts
event: E;
```

定義: [src/listener/Listener.ts:15](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/listener/Listener.ts#L15)

購読するクライアントイベント。

***

### name? \{#name}

```ts
optional name?: string;
```

定義: [src/component/Component.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L13)

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](ComponentOptions.md).[`name`](ComponentOptions.md#name)

***

### once? \{#once}

```ts
optional once?: boolean;
```

定義: [src/listener/Listener.ts:17](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/listener/Listener.ts#L17)

最初の1回だけ処理して購読を解除する。
