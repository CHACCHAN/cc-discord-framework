# クラス: AiError

定義: plugins/ai/src/errors.ts:15

AI 機能に関する、ユーザーへ提示してよいエラー。

[UserError](../../../cc-discord-framework/classes/UserError.md) を継承しているため、コマンドから throw すると
フレームワークの既定処理がそのままメッセージを返信します。

どのエラーも **文言は投げる側が渡します**。文言は `texts` に集約されて
いるので、`aiConfigOf(interaction).texts` などから解決したものを
渡してください(既定値もそこにあります)。

## 拡張

- [`UserError`](../../../cc-discord-framework/classes/UserError.md)

## によって拡張された

- [`ApiKeyMissingError`](ApiKeyMissingError.md)
- [`AiTimeoutError`](AiTimeoutError.md)
- [`CooldownError`](CooldownError.md)
- [`ModelNotConfiguredError`](ModelNotConfiguredError.md)
- [`ModelResolutionError`](ModelResolutionError.md)
- [`PromptTooLongError`](PromptTooLongError.md)
- [`ProviderNotInstalledError`](ProviderNotInstalledError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new AiError(message, options?): AiError;
```

定義: plugins/ai/src/errors.ts:16

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`AiError`

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
