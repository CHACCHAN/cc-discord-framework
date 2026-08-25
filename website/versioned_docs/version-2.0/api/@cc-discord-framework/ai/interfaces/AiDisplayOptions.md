# インターフェイス: AiDisplayOptions

定義: [plugins/ai/src/config.ts:196](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L196)

[AiDisplayConfig](AiDisplayConfig.md) の部分指定。

## プロパティ

### allowedMentions? \{#allowedmentions}

```ts
optional allowedMentions?: MessageMentionOptions | null;
```

定義: [plugins/ai/src/config.ts:212](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L212)

メンションの解決範囲。`null` で discord.js の既定に任せます。

#### Default

`{ parse: [] }`(どのメンションも解決しない)

***

### decorate? \{#decorate}

```ts
optional decorate?: (embed, kind) => EmbedBuilder;
```

定義: [plugins/ai/src/config.ts:214](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L214)

#### パラメータ

##### embed

`EmbedBuilder`

##### kind

[`AiReplyKind`](../type-aliases/AiReplyKind.md)

#### 戻り値

`EmbedBuilder`

#### Default

```ts
未設定(何もしない)
```

***

### embeds? \{#embeds}

```ts
optional embeds?: boolean;
```

定義: [plugins/ai/src/config.ts:198](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L198)

#### Default

```ts
true
```

***

### ephemeral? \{#ephemeral}

```ts
optional ephemeral?: boolean;
```

定義: [plugins/ai/src/config.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L200)

#### Default

```ts
false
```

***

### payload? \{#payload}

```ts
optional payload?: (payload, context) => AiMessagePayload;
```

定義: [plugins/ai/src/config.ts:216](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L216)

#### パラメータ

##### payload

[`AiMessagePayload`](../type-aliases/AiMessagePayload.md)

##### context

[`AiPayloadContext`](AiPayloadContext.md)

#### 戻り値

[`AiMessagePayload`](../type-aliases/AiMessagePayload.md)

#### Default

```ts
未設定(何もしない)
```

***

### splitThreshold? \{#splitthreshold}

```ts
optional splitThreshold?: number;
```

定義: [plugins/ai/src/config.ts:207](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/config.ts#L207)

明示した値でも、埋め込みなら 4096、プレーンテキストなら 2000 を
超えた分は上限に丸められます(超えた指定は必ず送信に失敗するため)。

#### Default

埋め込みなら 4096、プレーンテキストなら 2000
(指定しなければ、呼び出しごとの `embeds` 上書きにも追従します)
