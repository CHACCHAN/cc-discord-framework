# インターフェイス: AiConfig

定義: plugins/ai/src/config.ts:129

## プロパティ

### display \{#display}

```ts
readonly display: AiDisplayConfig;
```

定義: plugins/ai/src/config.ts:160

応答の見せ方。

***

### instructions \{#instructions}

```ts
readonly instructions: string | null;
```

定義: plugins/ai/src/config.ts:142

既定のシステム指示。

***

### limits \{#limits}

```ts
readonly limits: AiLimits;
```

定義: plugins/ai/src/config.ts:158

数量の上限。

***

### maxOutputTokens \{#maxoutputtokens}

```ts
readonly maxOutputTokens: number | null;
```

定義: plugins/ai/src/config.ts:146

既定の最大出力トークン数。`null` ならプロバイダーの既定。

***

### maxSteps \{#maxsteps}

```ts
readonly maxSteps: number;
```

定義: plugins/ai/src/config.ts:148

ツール呼び出しを含めて何ステップまで回すか。

***

### memory \{#memory}

```ts
readonly memory: AiMemoryConfig;
```

定義: plugins/ai/src/config.ts:154

会話履歴の扱い。

***

### model \{#model}

```ts
readonly model: AiModelInput | null;
```

定義: plugins/ai/src/config.ts:131

既定のモデル。未設定なら呼び出しごとに指定が要ります。

***

### providerLoaders \{#providerloaders}

```ts
readonly providerLoaders: Readonly<Record<string, AiProviderLoader>>;
```

定義: plugins/ai/src/config.ts:140

文字列のモデル指定を解決できるプロバイダーの一覧
([builtinProviders](../variables/builtinProviders.md) に `providerLoaders` を重ねたもの)。

***

### providers \{#providers}

```ts
readonly providers: AiProviders;
```

定義: plugins/ai/src/config.ts:135

プロバイダーの接続設定。

***

### registry \{#registry}

```ts
readonly registry: AiRegistry | null;
```

定義: plugins/ai/src/config.ts:133

自前のプロバイダーレジストリ。

***

### stream \{#stream}

```ts
readonly stream: AiStreamConfig;
```

定義: plugins/ai/src/config.ts:156

Discord へのストリーミング表示。

***

### temperature \{#temperature}

```ts
readonly temperature: number | null;
```

定義: plugins/ai/src/config.ts:144

既定の温度。`null` ならプロバイダーの既定。

***

### texts \{#texts}

```ts
readonly texts: AiTexts;
```

定義: plugins/ai/src/config.ts:162

ユーザーに見える文言。

***

### timeout \{#timeout}

```ts
readonly timeout: number | false;
```

定義: plugins/ai/src/config.ts:150

1回の生成を打ち切るまでのミリ秒。`false` で無制限。

***

### tools \{#tools}

```ts
readonly tools: AiToolsConfig;
```

定義: plugins/ai/src/config.ts:152

ツール(`ai/`)の扱い。
