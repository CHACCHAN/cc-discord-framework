# インターフェイス: CommandsSyncedResult

定義: src/events.ts:40

アプリケーションコマンド同期の結果サマリ。

## プロパティ

### global \{#global}

```ts
global: number;
```

定義: src/events.ts:42

グローバル登録されたコマンド数。

***

### guilds \{#guilds}

```ts
guilds: ReadonlyMap<string, number>;
```

定義: src/events.ts:44

ギルド毎の登録コマンド数。
