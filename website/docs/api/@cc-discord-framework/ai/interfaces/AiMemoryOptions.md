# インターフェイス: AiMemoryOptions

定義: plugins/ai/src/config.ts:166

[AiMemoryConfig](AiMemoryConfig.md) の部分指定。`ttl` は期間表記でも書けます。

## プロパティ

### enabled? \{#enabled}

```ts
optional enabled?: boolean;
```

定義: plugins/ai/src/config.ts:168

#### Default

```ts
true
```

***

### maxMessages? \{#maxmessages}

```ts
optional maxMessages?: number;
```

定義: plugins/ai/src/config.ts:170

#### Default

```ts
20
```

***

### store? \{#store}

```ts
optional store?: AiMemoryStore;
```

定義: plugins/ai/src/config.ts:174

#### Default

```ts
Map ベースの既定実装
```

***

### ttl? \{#ttl}

```ts
optional ttl?: false | DurationInput;
```

定義: plugins/ai/src/config.ts:172

#### Default

```ts
"1h"
```
