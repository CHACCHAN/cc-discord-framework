# クラス: ProviderNotInstalledError

定義: [plugins/ai/src/errors.ts:37](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/errors.ts#L37)

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

定義: [plugins/ai/src/errors.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/errors.ts#L41)

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

定義: [src/errors.ts:80](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L80)

投げた側が添付する任意の追加データ。

#### 継承元

[`AiError`](AiError.md).[`context`](AiError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: [src/errors.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L78)

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`AiError`](AiError.md).[`identifier`](AiError.md#identifier)

***

### packageName \{#packagename}

```ts
readonly packageName: string;
```

定義: [plugins/ai/src/errors.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/errors.ts#L39)

インストールが必要なパッケージ名。
