# インターフェイス: AiMemoryConfig

定義: [plugins/ai/src/config.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L32)

会話履歴の扱い。

## プロパティ

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: [plugins/ai/src/config.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L34)

履歴を使う。

***

### maxMessages \{#maxmessages}

```ts
readonly maxMessages: number;
```

定義: [plugins/ai/src/config.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L36)

保持するメッセージ数。超えた分は古いものから捨てます。

***

### store? \{#store}

```ts
readonly optional store?: AiMemoryStore;
```

定義: [plugins/ai/src/config.ts:43](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L43)

保存先。省略すると Map ベースの既定実装([MapMemoryStore](../classes/MapMemoryStore.md))です。
Redis や DB に置きたい場合はここへ差し替えてください。

***

### ttl \{#ttl}

```ts
readonly ttl: number | false;
```

定義: [plugins/ai/src/config.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L38)

最後の書き込みからの有効期間(ミリ秒)。`false` で無期限。
