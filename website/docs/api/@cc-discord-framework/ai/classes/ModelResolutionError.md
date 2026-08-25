# クラス: ModelResolutionError

定義: plugins/ai/src/errors.ts:52

モデル指定を解釈できなかった(未知のプロバイダー・書式違い・設定不足)。

## 拡張

- [`AiError`](AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ModelResolutionError(message, context?): ModelResolutionError;
```

定義: plugins/ai/src/errors.ts:53

#### パラメータ

##### message

`string`

##### context?

`unknown`

#### 戻り値

`ModelResolutionError`

#### 上書き

[`AiError`](AiError.md).[`constructor`](AiError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: src/errors.ts:62

投げた側が添付する任意の追加データ。

#### 継承元

[`AiError`](AiError.md).[`context`](AiError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: src/errors.ts:60

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`AiError`](AiError.md).[`identifier`](AiError.md#identifier)
