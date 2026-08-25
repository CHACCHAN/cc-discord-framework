# クラス: MusicError

定義: plugins/music/src/errors.ts:13

音楽再生に関する、ユーザーへ提示してよいエラー。

[UserError](../../../cc-discord-framework/classes/UserError.md) を継承しているため、コマンドから throw すると
フレームワークの既定処理がそのままメッセージを返信します。

どのエラーも **文言は投げる側が渡します**。文言は `texts` に集約されて
いるので、`musicConfigOf(interaction).texts` などから解決したものを
渡してください(既定値もそこにあります)。

## 拡張

- [`UserError`](../../../cc-discord-framework/classes/UserError.md)

## によって拡張された

- [`NoProviderError`](NoProviderError.md)
- [`NoResultError`](NoResultError.md)
- [`NotPlayingError`](NotPlayingError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new MusicError(message, options?): MusicError;
```

定義: plugins/music/src/errors.ts:14

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`MusicError`

#### 上書き

[`UserError`](../../../cc-discord-framework/classes/UserError.md).[`constructor`](../../../cc-discord-framework/classes/UserError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: src/errors.ts:62

投げた側が添付する任意の追加データ。

#### 継承元

[`UserError`](../../../cc-discord-framework/classes/UserError.md).[`context`](../../../cc-discord-framework/classes/UserError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: src/errors.ts:60

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`UserError`](../../../cc-discord-framework/classes/UserError.md).[`identifier`](../../../cc-discord-framework/classes/UserError.md#identifier)
