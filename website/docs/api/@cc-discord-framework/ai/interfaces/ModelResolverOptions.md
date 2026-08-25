# インターフェイス: ModelResolverOptions

定義: plugins/ai/src/models.ts:141

[ModelResolver](../classes/ModelResolver.md) の依存。

## プロパティ

### loaders? \{#loaders}

```ts
readonly optional loaders?: Readonly<Record<string, AiProviderLoader>>;
```

定義: plugins/ai/src/models.ts:153

プロバイダーの読み込み方。省略すると [builtinProviders](../variables/builtinProviders.md)。
足したい・差し替えたい場合は `ai({ providerLoaders })` を使ってください
(プラグインがここへ渡します)。

***

### providers \{#providers}

```ts
readonly providers: AiProviders;
```

定義: plugins/ai/src/models.ts:143

プロバイダーごとの接続設定。

***

### registry \{#registry}

```ts
readonly registry: AiRegistry | null;
```

定義: plugins/ai/src/models.ts:145

自前のレジストリ。指定するとすべての文字列がこれで解決されます。

***

### texts \{#texts}

```ts
readonly texts: AiTexts;
```

定義: plugins/ai/src/models.ts:147

エラー文言。
