# インターフェイス: AiRequestInfo

定義: [plugins/ai/src/events.ts:6](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L6)

生成を始めるときに分かっていること。

## プロパティ

### channelId \{#channelid}

```ts
readonly channelId: string | null;
```

定義: [plugins/ai/src/events.ts:10](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L10)

呼び出し元のチャンネル。判らなければ `null`。

***

### guildId \{#guildid}

```ts
readonly guildId: string | null;
```

定義: [plugins/ai/src/events.ts:14](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L14)

呼び出し元のサーバー。DM や判らない場合は `null`。

***

### prompt \{#prompt}

```ts
readonly prompt: string;
```

定義: [plugins/ai/src/events.ts:8](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L8)

ユーザーの入力。

***

### streaming \{#streaming}

```ts
readonly streaming: boolean;
```

定義: [plugins/ai/src/events.ts:16](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L16)

途中経過を編集で見せるか。

***

### toolNames \{#toolnames}

```ts
readonly toolNames: readonly string[];
```

定義: [plugins/ai/src/events.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L18)

モデルへ渡したツールの名前。

***

### userId \{#userid}

```ts
readonly userId: string | null;
```

定義: [plugins/ai/src/events.ts:12](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L12)

呼び出したユーザー。判らなければ `null`。
