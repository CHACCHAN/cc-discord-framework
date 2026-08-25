# インターフェイス: AiErrorInfo

定義: [plugins/ai/src/events.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L45)

エラーの発生場所。

## プロパティ

### channelId \{#channelid}

```ts
readonly channelId: string | null;
```

定義: [plugins/ai/src/events.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L49)

呼び出し元のチャンネル。判らなければ `null`。

***

### guildId \{#guildid}

```ts
readonly guildId: string | null;
```

定義: [plugins/ai/src/events.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L53)

呼び出し元のサーバー。判らなければ `null`。

***

### phase \{#phase}

```ts
readonly phase: AiErrorPhase;
```

定義: [plugins/ai/src/events.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L47)

どの処理で失敗したか。

***

### tool \{#tool}

```ts
readonly tool: string | null;
```

定義: [plugins/ai/src/events.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L55)

`phase: "tool"` のときのツール名。それ以外は `null`。

***

### userId \{#userid}

```ts
readonly userId: string | null;
```

定義: [plugins/ai/src/events.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L51)

呼び出したユーザー。判らなければ `null`。
