# インターフェイス: MapMemoryStoreOptions

定義: [plugins/ai/src/memory.ts:29](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L29)

[MapMemoryStore](../classes/MapMemoryStore.md) の設定。

## プロパティ

### maxMessages? \{#maxmessages}

```ts
readonly optional maxMessages?: number;
```

定義: [plugins/ai/src/memory.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L34)

保持する件数。超えた分は古いものから捨てます。

#### Default

```ts
20
```

***

### ttl? \{#ttl}

```ts
readonly optional ttl?: number | false;
```

定義: [plugins/ai/src/memory.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L39)

最後の書き込みからの有効期間(ミリ秒)。`false` で無期限。

#### Default

```ts
false
```
