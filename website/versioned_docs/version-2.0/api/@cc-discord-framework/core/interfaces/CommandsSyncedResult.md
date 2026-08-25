# インターフェイス: CommandsSyncedResult

定義: [src/events.ts:40](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L40)

アプリケーションコマンド同期の結果サマリ。

## プロパティ

### global \{#global}

```ts
global: number;
```

定義: [src/events.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L42)

グローバル登録されたコマンド数。

***

### guilds \{#guilds}

```ts
guilds: ReadonlyMap<string, number>;
```

定義: [src/events.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L44)

ギルド毎の登録コマンド数。
