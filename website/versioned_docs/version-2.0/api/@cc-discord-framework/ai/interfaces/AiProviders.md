# インターフェイス: AiProviders

定義: [plugins/ai/src/models.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/models.ts#L59)

プロバイダーごとの接続設定。
`providerLoaders` で足したプロバイダーの設定もここへ書きます。

## インデックス可能

```ts
[name: string]: AiProviderSettings | undefined
```

`providerLoaders` で足したプロバイダーの設定。

## プロパティ

### anthropic? \{#anthropic}

```ts
readonly optional anthropic?: AiProviderSettings;
```

定義: [plugins/ai/src/models.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/models.ts#L61)

***

### compatible? \{#compatible}

```ts
readonly optional compatible?: AiProviderSettings;
```

定義: [plugins/ai/src/models.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/models.ts#L63)

***

### google? \{#google}

```ts
readonly optional google?: AiProviderSettings;
```

定義: [plugins/ai/src/models.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/models.ts#L62)

***

### openai? \{#openai}

```ts
readonly optional openai?: AiProviderSettings;
```

定義: [plugins/ai/src/models.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/models.ts#L60)
