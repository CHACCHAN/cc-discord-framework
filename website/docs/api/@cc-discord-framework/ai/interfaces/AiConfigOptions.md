# インターフェイス: AiConfigOptions

定義: [plugins/ai/src/config.ts:223](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L223)

[AiConfig](AiConfig.md) の部分指定。指定しなかった項目は既定値のままです。
`ai()` のオプションはこれを受け取ります。

## プロパティ

### display? \{#display}

```ts
optional display?: AiDisplayOptions;
```

定義: [plugins/ai/src/config.ts:295](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L295)

応答の見せ方。指定した項目だけが既定値を上書きします。

***

### instructions? \{#instructions}

```ts
optional instructions?: string | null;
```

定義: [plugins/ai/src/config.ts:269](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L269)

既定のシステム指示。呼び出しごとの `instructions` が優先されます。

#### Default

```ts
null
```

***

### limits? \{#limits}

```ts
optional limits?: AiLimitsOptions;
```

定義: [plugins/ai/src/config.ts:293](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L293)

数量の上限。指定した項目だけが既定値を上書きします。

***

### maxOutputTokens? \{#maxoutputtokens}

```ts
optional maxOutputTokens?: number | null;
```

定義: [plugins/ai/src/config.ts:273](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L273)

#### Default

```ts
null(プロバイダーの既定)
```

***

### maxSteps? \{#maxsteps}

```ts
optional maxSteps?: number;
```

定義: [plugins/ai/src/config.ts:279](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L279)

ツール呼び出しを含めて何ステップまで回すか
(`stopWhen: stepCountIs(maxSteps)` になります)。

#### Default

```ts
5
```

***

### memory? \{#memory}

```ts
optional memory?: AiMemoryOptions;
```

定義: [plugins/ai/src/config.ts:289](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L289)

会話履歴の扱い。指定した項目だけが既定値を上書きします。

***

### model? \{#model}

```ts
optional model?: AiModelInput | null;
```

定義: [plugins/ai/src/config.ts:232](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L232)

既定のモデル。`"<プロバイダー>:<モデルID>"` の文字列か、
SDK が返す `LanguageModel` をそのまま渡します。

**既定値はありません。** 勝手に課金される先を既定にしないためで、
未設定のまま使うと「設定してください」というエラーになります。

#### Default

```ts
null
```

***

### providerLoaders? \{#providerloaders}

```ts
optional providerLoaders?: Readonly<Record<string, AiProviderLoader>>;
```

定義: [plugins/ai/src/config.ts:264](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L264)

文字列のモデル指定で使えるプロバイダーを足す・差し替える。
[builtinProviders](../variables/builtinProviders.md) に重ねられます。

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

#### Default

[builtinProviders](../variables/builtinProviders.md) のみ

***

### providers? \{#providers}

```ts
optional providers?: AiProviders;
```

定義: [plugins/ai/src/config.ts:244](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L244)

プロバイダーの接続設定。API キーを省略すると各 SDK の既定の
環境変数が使われます。

#### Default

```ts
{}
```

***

### registry? \{#registry}

```ts
optional registry?: AiRegistry | null;
```

定義: [plugins/ai/src/config.ts:238](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L238)

自前のプロバイダーレジストリ(`createProviderRegistry()` の戻り値)。
指定すると、文字列のモデル指定はすべてこれで解決されます。

#### Default

```ts
null
```

***

### stream? \{#stream}

```ts
optional stream?: Partial<AiStreamConfig>;
```

定義: [plugins/ai/src/config.ts:291](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L291)

ストリーミング表示。指定した項目だけが既定値を上書きします。

***

### temperature? \{#temperature}

```ts
optional temperature?: number | null;
```

定義: [plugins/ai/src/config.ts:271](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L271)

#### Default

```ts
null(プロバイダーの既定)
```

***

### texts? \{#texts}

```ts
optional texts?: Partial<AiTexts>;
```

定義: [plugins/ai/src/config.ts:300](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L300)

ユーザーに見える文言。指定した項目だけが既定値を上書きします。

#### Default

[defaultAiTexts](../variables/defaultAiTexts.md)

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: [plugins/ai/src/config.ts:285](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L285)

1回の生成を打ち切るまでの時間。`false` で無制限。
Discord のインタラクションは defer 後 15分まで応答できます。

#### Default

```ts
"120s"
```

***

### tools? \{#tools}

```ts
optional tools?: AiToolsOptions;
```

定義: [plugins/ai/src/config.ts:287](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L287)

ツール(`ai/`)の扱い。指定した項目だけが既定値を上書きします。
