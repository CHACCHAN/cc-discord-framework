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

定義: plugins/ai/src/render.ts:18

送信・編集にそのまま渡せるペイロード。
