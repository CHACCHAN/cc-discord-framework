# インターフェイス: CommandsSyncedResult

定義: [src/events.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L42)

アプリケーションコマンド同期の結果サマリ。

## プロパティ

### global \{#global}

```ts
global: number;
```

定義: [src/events.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L44)

グローバル登録されたコマンド数。

***

### guilds \{#guilds}

```ts
guilds: ReadonlyMap<string, number>;
```

定義: [src/events.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L46)

ギルド毎の登録コマンド数。
