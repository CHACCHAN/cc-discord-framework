# インターフェイス: AiRegistry

定義: [plugins/ai/src/models.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L36)

自前のプロバイダーレジストリ。`ai` の `createProviderRegistry()` が
返すものがそのまま入ります(必要な口はモデル解決だけなので、
ここでは最小限の形だけを要求します)。

## メソッド

### languageModel() \{#languagemodel}

```ts
languageModel(id): LanguageModel;
```

定義: [plugins/ai/src/models.ts:37](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L37)

#### パラメータ

##### id

`string`

#### 戻り値

[`LanguageModel`](https://ai-sdk.dev/docs/reference/ai-sdk-core)
