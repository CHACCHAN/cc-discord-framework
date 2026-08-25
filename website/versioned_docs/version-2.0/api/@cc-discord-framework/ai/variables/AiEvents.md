# 変数: AiEvents

```ts
const AiEvents: object;
```

定義: [plugins/ai/src/events.ts:72](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/events.ts#L72)

ai プラグインがクライアント上で発火するイベント。
通常の discord.js エミッターに乗るため、`Listener` コンポーネントで
型付きのまま観測できます。

```ts
@Listener.define({ event: "aiResponse" })
export class UsageListener extends Listener<"aiResponse"> {
  override run(response: AiResponseInfo) {
    this.logger.info({ tokens: response.usage?.totalTokens }, "AI が応答しました");
  }
}
```

## 型宣言

### Error \{#error}

```ts
readonly Error: "aiError" = "aiError";
```

内部で処理したエラー: `(error, info)`

### Request \{#request}

```ts
readonly Request: "aiRequest" = "aiRequest";
```

生成の開始: `(request)`

### Response \{#response}

```ts
readonly Response: "aiResponse" = "aiResponse";
```

生成の完了: `(response, request)`

### ToolCall \{#toolcall}

```ts
readonly ToolCall: "aiToolCall" = "aiToolCall";
```

ツールの呼び出し: `(tool, input, context)`
