# クラス: NotPlayingError

定義: [plugins/music/src/errors.ts:37](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/errors.ts#L37)

ボイスチャンネルに接続していない状態で再生操作が行われた。

## 拡張

- [`MusicError`](MusicError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new NotPlayingError(message): NotPlayingError;
```

定義: [plugins/music/src/errors.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/errors.ts#L38)

#### パラメータ

##### message

`string`

#### 戻り値

`NotPlayingError`

#### 上書き

[`MusicError`](MusicError.md).[`constructor`](MusicError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: [src/errors.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L62)

投げた側が添付する任意の追加データ。

#### 継承元

[`MusicError`](MusicError.md).[`context`](MusicError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: [src/errors.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L60)

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`MusicError`](MusicError.md).[`identifier`](MusicError.md#identifier)
