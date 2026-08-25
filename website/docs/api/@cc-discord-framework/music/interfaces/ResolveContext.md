# インターフェイス: ResolveContext

定義: plugins/music/src/TrackResolver.ts:16

[TrackResolver.resolve](../classes/TrackResolver.md#resolve) に渡される解決コンテキスト。

## プロパティ

### query \{#query}

```ts
readonly query: string;
```

定義: plugins/music/src/TrackResolver.ts:18

ユーザーが入力した文字列(URL または検索クエリ)。

***

### requestedBy \{#requestedby}

```ts
readonly requestedBy: string | null;
```

定義: plugins/music/src/TrackResolver.ts:20

リクエストしたユーザーの ID。
