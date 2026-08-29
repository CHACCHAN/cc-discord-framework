# インターフェイス: ResolveContext

定義: [plugins/music/src/TrackResolver.ts:16](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/TrackResolver.ts#L16)

[TrackResolver.resolve](../classes/TrackResolver.md#resolve) に渡される解決コンテキスト。

## プロパティ

### query \{#query}

```ts
readonly query: string;
```

定義: [plugins/music/src/TrackResolver.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/TrackResolver.ts#L18)

ユーザーが入力した文字列(URL または検索クエリ)。

***

### requestedBy \{#requestedby}

```ts
readonly requestedBy: string | null;
```

定義: [plugins/music/src/TrackResolver.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/TrackResolver.ts#L20)

リクエストしたユーザーの ID。
