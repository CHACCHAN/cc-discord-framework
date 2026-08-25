# クラス: CooldownError

定義: plugins/ai/src/errors.ts:80

`limits.cooldown` の待ち時間が明けていない。

## 拡張

- [`AiError`](AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new CooldownError(message, remainingMs): CooldownError;
```

定義: plugins/ai/src/errors.ts:81

#### パラメータ

##### message

`string`

##### remainingMs

`number`

#### 戻り値

`CooldownError`

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
