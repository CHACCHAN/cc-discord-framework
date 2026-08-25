# インターフェイス: AiRequestInfo

定義: plugins/ai/src/events.ts:6

生成を始めるときに分かっていること。

## プロパティ

### channelId \{#channelid}

```ts
readonly channelId: string | null;
```

定義: plugins/ai/src/events.ts:10

呼び出し元のチャンネル。判らなければ `null`。

***

### guildId \{#guildid}

```ts
readonly guildId: string | null;
```

定義: plugins/ai/src/events.ts:14

呼び出し元のサーバー。DM や判らない場合は `null`。

***

### prompt \{#prompt}

```ts
readonly prompt: string;
```

定義: plugins/ai/src/events.ts:8

ユーザーの入力。

***

### streaming \{#streaming}

```ts
readonly streaming: boolean;
```

定義: plugins/ai/src/events.ts:16

途中経過を編集で見せるか。

***

### toolNames \{#toolnames}

```ts
readonly toolNames: readonly string[];
```

定義: plugins/ai/src/events.ts:18

モデルへ渡したツールの名前。

***

### userId \{#userid}

```ts
readonly userId: string | null;
```

定義: plugins/ai/src/events.ts:12

呼び出したユーザー。判らなければ `null`。
