# インターフェイス: AiRegistry

定義: plugins/ai/src/models.ts:36

自前のプロバイダーレジストリ。`ai` の `createProviderRegistry()` が
返すものがそのまま入ります(必要な口はモデル解決だけなので、
ここでは最小限の形だけを要求します)。

## メソッド

### languageModel() \{#languagemodel}

```ts
languageModel(id): LanguageModel;
```

定義: plugins/ai/src/models.ts:37

#### パラメータ

##### id

`string`

#### 戻り値

[`LanguageModel`](https://ai-sdk.dev/docs/reference/ai-sdk-core)
