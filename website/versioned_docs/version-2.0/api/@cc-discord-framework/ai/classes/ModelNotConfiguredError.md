# クラス: ModelNotConfiguredError

定義: [plugins/ai/src/errors.ts:25](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/errors.ts#L25)

使うモデルが決まっていない(`ai({ model })` も呼び出し時の指定も無い)。

## 拡張

- [`AiError`](AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ModelNotConfiguredError(message): ModelNotConfiguredError;
```

定義: [plugins/ai/src/errors.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/errors.ts#L26)

#### パラメータ

##### message

`string`

#### 戻り値

`ModelNotConfiguredError`

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
