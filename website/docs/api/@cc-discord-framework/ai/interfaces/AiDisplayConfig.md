# インターフェイス: AiDisplayConfig

定義: [plugins/ai/src/config.ts:79](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L79)

応答の見せ方。

## プロパティ

### allowedMentions \{#allowedmentions}

```ts
readonly allowedMentions: MessageMentionOptions | null;
```

定義: [plugins/ai/src/config.ts:106](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L106)

応答のメンションをどこまで解決するか。`null` を渡すと discord.js の
既定(本文に書かれたメンションはすべて解決される)に任せます。

**既定は `{ parse: [] }` = どのメンションも解決しません。** モデルの
出力をそのまま本文へ流すため、既定のままだとプロンプトインジェクション
で `@everyone` を書かれても発火しません。許可する場合は明示してください。

***

### decorate? \{#decorate}

```ts
readonly optional decorate?: (embed, kind) => EmbedBuilder;
```

定義: [plugins/ai/src/config.ts:116](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L116)

応答の埋め込みに手を入れるフック。title・footer・timestamp などを
足したい場合に使います。返した EmbedBuilder が送られます。

**埋め込み経路でだけ**呼ばれます(`embeds: false` のときは通りません)。
どちらの経路でも通したい場合は [AiDisplayConfig.payload](#payload) を
使ってください。

#### パラメータ

##### embed

`EmbedBuilder`

##### kind

[`AiReplyKind`](../type-aliases/AiReplyKind.md)

#### 戻り値

`EmbedBuilder`

#### Default

```ts
何もしない
```

***

### embeds \{#embeds}

```ts
readonly embeds: boolean;
```

定義: [plugins/ai/src/config.ts:81](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L81)

応答を埋め込みで返す。`false` でプレーンテキスト。

***

### ephemeral \{#ephemeral}

```ts
readonly ephemeral: boolean;
```

定義: [plugins/ai/src/config.ts:83](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L83)

応答を本人にだけ見える形にする。

***

### payload? \{#payload}

```ts
readonly optional payload?: (payload, context) => AiMessagePayload;
```

定義: [plugins/ai/src/config.ts:126](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L126)

送信ペイロードそのものに手を入れるフック。

**埋め込み経路とプレーンテキスト経路の両方で、送信直前に必ず**
通ります(`decorate` より後)。`components` を足す・
`allowedMentions` を1通だけ変える・分割された2通目以降だけ
見た目を変える、といったことができます。

#### パラメータ

##### payload

[`AiMessagePayload`](../type-aliases/AiMessagePayload.md)

##### context

[`AiPayloadContext`](AiPayloadContext.md)

#### 戻り値

[`AiMessagePayload`](../type-aliases/AiMessagePayload.md)

#### Default

```ts
何もしない
```

***

### splitThreshold \{#splitthreshold}

```ts
readonly splitThreshold: number | "auto";
```

定義: [plugins/ai/src/config.ts:97](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L97)

1通に収める最大文字数。超えた分は分割して2通目以降へ送ります。

既定の `"auto"` は **その呼び出しで実際に使う表示方法** から
Discord の上限を選びます(埋め込みなら 4096、プレーンテキストなら
2000)。`reply(interaction, { embeds: false })` のように呼び出しごとに
表示方法を変えても分割位置がずれません。

数値を指定すると、表示方法にかかわらずその値を使います。ただし
明示した値でも、埋め込みなら 4096、プレーンテキストなら 2000 を
超えた分は上限に丸められます(超えた指定は必ず送信に失敗するため)。
実際に使われる値は [aiSplitThreshold](../functions/aiSplitThreshold.md) で解決します。
