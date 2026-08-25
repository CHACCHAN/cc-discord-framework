# クラス: ProviderNotInstalledError

定義: plugins/ai/src/errors.ts:37

文字列で指定されたプロバイダーのパッケージが入っていない。

プロバイダーは optional peer dependency なので、使うものだけを
`bun add` してください。`packageName` に入れるべきパッケージ名が入ります。

## 拡張

- [`AiError`](AiError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ProviderNotInstalledError(
   message, 
   provider, 
   packageName, 
   cause?): ProviderNotInstalledError;
```

定義: plugins/ai/src/errors.ts:41

#### パラメータ

##### message

`string`

##### provider

`string`

##### packageName

`string`

##### cause?

`unknown`

#### 戻り値

`ProviderNotInstalledError`

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

***

### packageName \{#packagename}

```ts
readonly packageName: string;
```

定義: plugins/ai/src/errors.ts:39

インストールが必要なパッケージ名。
