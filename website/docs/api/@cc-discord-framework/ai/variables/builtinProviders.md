# 変数: builtinProviders

```ts
const builtinProviders: Readonly<Record<AiProviderName, AiProviderLoader>>;
```

定義: plugins/ai/src/models.ts:107

同梱リゾルバが最初から知っているプロバイダー。

**ここに無いプロバイダーも足せます** — `ai({ providerLoaders })` に
同じ形で書けば、そのプロバイダーも文字列で指定できるようになります。

```ts
ai({
  model: "groq:llama-3.3-70b-versatile",
  providerLoaders: {
    groq: {
      package: "@ai-sdk/groq",
      factory: "createGroq",
      apiKeyEnv: "GROQ_API_KEY",
      requiresEndpoint: false,
    },
  },
})
```

OpenAI 互換 API(Ollama / LM Studio / vLLM / llama.cpp / OpenRouter)は
`compatible` から使えます。もっと自由に組みたい場合は
`ai({ registry })` に自前のレジストリを渡してください。
