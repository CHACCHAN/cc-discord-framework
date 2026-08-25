# インターフェイス: AiToolContext

定義: plugins/ai/src/AiTool.ts:19

ツールが「誰の依頼で呼ばれたか」を知るためのコンテキスト。
`execute` の第2引数として渡ります。

## プロパティ

### abortSignal? \{#abortsignal}

```ts
readonly optional abortSignal?: AbortSignal;
```

定義: plugins/ai/src/AiTool.ts:34

中断シグナル。生成が打ち切られたときや `tools.timeout` を超えたときに
abort されます。時間のかかるツールはこれを見て早めに諦めてください。

***

### channelId \{#channelid}

```ts
readonly channelId: string | null;
```

定義: plugins/ai/src/AiTool.ts:29

呼び出し元のチャンネル。判らなければ `null`。

***

### guildId \{#guildid}

```ts
readonly guildId: string | null;
```

定義: plugins/ai/src/AiTool.ts:25

呼び出し元のサーバー。DM や判らない場合は `null`。

***

### interaction? \{#interaction}

```ts
readonly optional interaction?: RepliableInteraction;
```

定義: plugins/ai/src/AiTool.ts:21

スラッシュコマンド等から呼ばれた場合のインタラクション。

***

### message? \{#message}

```ts
readonly optional message?: Message<boolean>;
```

定義: plugins/ai/src/AiTool.ts:23

メッセージから呼ばれた場合のメッセージ。

***

### userId \{#userid}

```ts
readonly userId: string | null;
```

定義: plugins/ai/src/AiTool.ts:27

呼び出したユーザー。判らなければ `null`。
