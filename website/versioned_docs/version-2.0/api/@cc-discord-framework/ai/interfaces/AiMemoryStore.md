# インターフェイス: AiMemoryStore

定義: [plugins/ai/src/memory.ts:19](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L19)

会話履歴の読み書き口。**メソッドはこの3つだけ**です — 保存先を
差し替えるのに必要な最小限に保っています。

件数の上限([AiMemoryConfig.maxMessages](AiMemoryConfig.md#maxmessages))は
[AiService](../classes/AiService.md) 側が読み出し時に適用するので、実装側で気にする必要は
ありません(メモリを節約したい実装は書き込み時にも切って構いません)。

## メソッド

### append() \{#append}

```ts
append(key, messages): Awaitable<void>;
```

定義: [plugins/ai/src/memory.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L23)

キーの履歴の末尾へ追記します。

#### パラメータ

##### key

`string`

##### messages

readonly `ModelMessage`[]

#### 戻り値

`Awaitable`\<`void`\>

***

### clear() \{#clear}

```ts
clear(key): Awaitable<void>;
```

定義: [plugins/ai/src/memory.ts:25](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L25)

キーの履歴を消します。

#### パラメータ

##### key

`string`

#### 戻り値

`Awaitable`\<`void`\>

***

### get() \{#get}

```ts
get(key): Awaitable<ModelMessage[]>;
```

定義: [plugins/ai/src/memory.ts:21](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/memory.ts#L21)

キーの履歴を古い順に返します。無ければ空配列。

#### パラメータ

##### key

`string`

#### 戻り値

`Awaitable`\<`ModelMessage`[]\>
