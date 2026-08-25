# クラス: MusicError

定義: [plugins/music/src/errors.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/errors.ts#L13)

音楽再生に関する、ユーザーへ提示してよいエラー。

[UserError](../../core/classes/UserError.md) を継承しているため、コマンドから throw すると
フレームワークの既定処理がそのままメッセージを返信します。

どのエラーも **文言は投げる側が渡します**。文言は `texts` に集約されて
いるので、`musicConfigOf(interaction).texts` などから解決したものを
渡してください(既定値もそこにあります)。

## 拡張

- [`UserError`](../../core/classes/UserError.md)

## によって拡張された

- [`NoProviderError`](NoProviderError.md)
- [`NoResultError`](NoResultError.md)
- [`NotPlayingError`](NotPlayingError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new MusicError(message, options?): MusicError;
```

定義: [plugins/music/src/errors.ts:14](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/errors.ts#L14)

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`MusicError`

#### 上書き

[`UserError`](../../core/classes/UserError.md).[`constructor`](../../core/classes/UserError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: [src/errors.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L62)

投げた側が添付する任意の追加データ。

#### 継承元

[`UserError`](../../core/classes/UserError.md).[`context`](../../core/classes/UserError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: [src/errors.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L60)

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`UserError`](../../core/classes/UserError.md).[`identifier`](../../core/classes/UserError.md#identifier)
