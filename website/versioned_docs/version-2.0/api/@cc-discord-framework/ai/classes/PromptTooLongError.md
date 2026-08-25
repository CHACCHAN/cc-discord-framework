# クラス: PromptTooLongError

定義: [plugins/ai/src/errors.ts:73](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/errors.ts#L73)

入力が `limits.maxPromptLength` を超えていた。

## 拡張

- [`AiError`](AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new PromptTooLongError(
   message, 
   length, 
   max): PromptTooLongError;
```

定義: [plugins/ai/src/errors.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/errors.ts#L74)

#### パラメータ

##### message

`string`

##### length

`number`

##### max

`number`

#### 戻り値

`PromptTooLongError`

#### 上書き

[`AiError`](AiError.md).[`constructor`](AiError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: [src/errors.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L62)

投げた側が添付する任意の追加データ。

#### 継承元

[`AiError`](AiError.md).[`context`](AiError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: [src/errors.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L60)

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`AiError`](AiError.md).[`identifier`](AiError.md#identifier)
