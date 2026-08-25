# クラス: UserError

定義: src/errors.ts:58

`message` が Discord 上のエンドユーザーに向けられたエラー。

コマンド内から throw するとユーザー向けメッセージ付きで中断でき、
Precondition は [Precondition.deny](Precondition.md#deny) で生成します。デフォルトの
`commandError` / `commandDenied` 処理はスタックトレースを記録する
代わりに `message` を返信します。

## 拡張

- [`FrameworkError`](FrameworkError.md)

## によって拡張された

- [`MusicError`](../../@cc-discord-framework/music/classes/MusicError.md)
- [`AiError`](../../@cc-discord-framework/ai/classes/AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new UserError(message, options?): UserError;
```

定義: src/errors.ts:64

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`UserError`

#### 上書き

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: src/errors.ts:62

投げた側が添付する任意の追加データ。

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: src/errors.ts:60

機械可読な識別子(Precondition 由来なら Precondition 名)。
