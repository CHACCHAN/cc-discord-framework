# クラス: ModelResolver

定義: plugins/ai/src/models.ts:164

文字列のモデル指定を [LanguageModel](https://ai-sdk.dev/docs/reference/ai-sdk-core) へ解決します。
生成したプロバイダーはインスタンス内にキャッシュされるため、
動的 import とファクトリ呼び出しはプロバイダーごとに1度だけです。

クライアントごとに1つ持たせてください(モジュールレベルの共有状態を
作らないため、[AiService](AiService.md) が保持します)。

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ModelResolver(options): ModelResolver;
```

定義: plugins/ai/src/models.ts:169

#### パラメータ

##### options

[`ModelResolverOptions`](../interfaces/ModelResolverOptions.md)

#### 戻り値

`ModelResolver`

## メソッド

### resolve() \{#resolve}

```ts
resolve(input): Promise<LanguageModel>;
```

定義: plugins/ai/src/models.ts:178

モデル指定を解決します。文字列以外はそのまま返します
(すでに `LanguageModel` なので解決するものがありません)。

#### パラメータ

##### input

[`AiModelInput`](../type-aliases/AiModelInput.md)

#### 戻り値

`Promise`\<[`LanguageModel`](https://ai-sdk.dev/docs/reference/ai-sdk-core)\>
