# インターフェイス: AiConfig

定義: [plugins/ai/src/config.ts:129](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L129)

## プロパティ

### display \{#display}

```ts
readonly display: AiDisplayConfig;
```

定義: [plugins/ai/src/config.ts:160](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L160)

応答の見せ方。

***

### instructions \{#instructions}

```ts
readonly instructions: string | null;
```

定義: [plugins/ai/src/config.ts:142](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L142)

既定のシステム指示。

***

### limits \{#limits}

```ts
readonly limits: AiLimits;
```

定義: [plugins/ai/src/config.ts:158](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L158)

数量の上限。

***

### maxOutputTokens \{#maxoutputtokens}

```ts
readonly maxOutputTokens: number | null;
```

定義: [plugins/ai/src/config.ts:146](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L146)

既定の最大出力トークン数。`null` ならプロバイダーの既定。

***

### maxSteps \{#maxsteps}

```ts
readonly maxSteps: number;
```

定義: [plugins/ai/src/config.ts:148](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L148)

ツール呼び出しを含めて何ステップまで回すか。

***

### memory \{#memory}

```ts
readonly memory: AiMemoryConfig;
```

定義: [plugins/ai/src/config.ts:154](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L154)

会話履歴の扱い。

***

### model \{#model}

```ts
readonly model: AiModelInput | null;
```

定義: [plugins/ai/src/config.ts:131](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L131)

既定のモデル。未設定なら呼び出しごとに指定が要ります。

***

### providerLoaders \{#providerloaders}

```ts
readonly providerLoaders: Readonly<Record<string, AiProviderLoader>>;
```

定義: [plugins/ai/src/config.ts:140](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L140)

文字列のモデル指定を解決できるプロバイダーの一覧
([builtinProviders](../variables/builtinProviders.md) に `providerLoaders` を重ねたもの)。

***

### providers \{#providers}

```ts
readonly providers: AiProviders;
```

定義: [plugins/ai/src/config.ts:135](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L135)

プロバイダーの接続設定。

***

### registry \{#registry}

```ts
readonly registry: AiRegistry | null;
```

定義: [plugins/ai/src/config.ts:133](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L133)

自前のプロバイダーレジストリ。

***

### stream \{#stream}

```ts
readonly stream: AiStreamConfig;
```

定義: [plugins/ai/src/config.ts:156](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L156)

Discord へのストリーミング表示。

***

### temperature \{#temperature}

```ts
readonly temperature: number | null;
```

定義: [plugins/ai/src/config.ts:144](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L144)

既定の温度。`null` ならプロバイダーの既定。

***

### texts \{#texts}

```ts
readonly texts: AiTexts;
```

定義: [plugins/ai/src/config.ts:162](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L162)

ユーザーに見える文言。

***

### timeout \{#timeout}

```ts
readonly timeout: number | false;
```

定義: [plugins/ai/src/config.ts:150](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L150)

1回の生成を打ち切るまでのミリ秒。`false` で無制限。

***

### tools \{#tools}

```ts
readonly tools: AiToolsConfig;
```

定義: [plugins/ai/src/config.ts:152](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L152)

ツール(`ai/`)の扱い。
