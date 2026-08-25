# インターフェイス: AiErrorInfo

定義: plugins/ai/src/events.ts:45

エラーの発生場所。

## プロパティ

### channelId \{#channelid}

```ts
readonly channelId: string | null;
```

定義: plugins/ai/src/events.ts:49

呼び出し元のチャンネル。判らなければ `null`。

***

### guildId \{#guildid}

```ts
readonly guildId: string | null;
```

定義: plugins/ai/src/events.ts:53

呼び出し元のサーバー。判らなければ `null`。

***

### phase \{#phase}

```ts
readonly phase: AiErrorPhase;
```

定義: plugins/ai/src/events.ts:47

どの処理で失敗したか。

***

### tool \{#tool}

```ts
readonly tool: string | null;
```

定義: plugins/ai/src/events.ts:55

`phase: "tool"` のときのツール名。それ以外は `null`。

***

### userId \{#userid}

```ts
readonly userId: string | null;
```

定義: plugins/ai/src/events.ts:51

呼び出したユーザー。判らなければ `null`。
