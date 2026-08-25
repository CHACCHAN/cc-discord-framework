# 型エイリアス: AiMessagePayload

```ts
type AiMessagePayload = 
  | {
  allowedMentions?: MessageMentionOptions;
  content: string;
  embeds?: undefined;
}
  | {
  allowedMentions?: MessageMentionOptions;
  embeds: EmbedBuilder[];
};
```

定義: [plugins/ai/src/render.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/ai/src/render.ts#L18)

送信・編集にそのまま渡せるペイロード。
