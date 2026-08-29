# 型エイリアス: AiMessagePayload

```ts
type AiMessagePayload = 
  | {
  allowedMentions?: MessageMentionOptions;
  components?: BaseMessageOptions["components"];
  content: string;
  embeds?: undefined;
  files?: BaseMessageOptions["files"];
}
  | {
  allowedMentions?: MessageMentionOptions;
  components?: BaseMessageOptions["components"];
  embeds: EmbedBuilder[];
  files?: BaseMessageOptions["files"];
};
```

定義: [plugins/ai/src/render.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/render.ts#L27)

送信・編集にそのまま渡せるペイロード。

`components` / `files` は同梱機能では付けませんが、`display.payload` フックが
ボタンや添付を足して返せるように型に含めています。
