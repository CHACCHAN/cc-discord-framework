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
}
  | {
  command: Command;
  content: string;
  message: Message;
  type: "mention";
};
```

定義: [src/events.ts:34](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L34)

コマンドイベントが指す1回の呼び出し。
