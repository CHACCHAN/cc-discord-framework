# 型エイリアス: CommandRunPayload

```ts
type CommandRunPayload = 
  | {
  command: Command;
  interaction: ChatInputCommandInteraction;
  type: "chatInput";
}
  | {
  command: Command;
  interaction: AutocompleteInteraction;
  type: "autocomplete";
}
  | {
  args: string[];
  command: Command;
  message: Message;
  type: "message";
};
```

定義: [src/events.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L34)

コマンドイベントが指す1回の呼び出し。
