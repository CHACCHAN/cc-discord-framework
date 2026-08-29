# クラス: NoResultError

定義: [plugins/music/src/errors.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/errors.ts#L23)

クエリを解釈できる Resolver がなかった、または結果が空だった。

## 拡張

- [`MusicError`](MusicError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new NoResultError(message, query): NoResultError;
```

定義: [plugins/music/src/errors.ts:24](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/errors.ts#L24)

#### パラメータ

##### message

`string`

##### query

`string`

#### 戻り値

`NoResultError`

#### 上書き

[`MusicError`](MusicError.md).[`constructor`](MusicError.md#constructor)

## プロパティ

### context \{#context}

```ts
readonly context: unknown;
```

定義: [src/errors.ts:80](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L80)

投げた側が添付する任意の追加データ。

#### 継承元

[`MusicError`](MusicError.md).[`context`](MusicError.md#context)

***

### identifier \{#identifier}

```ts
readonly identifier: string;
```

定義: [src/errors.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L78)

機械可読な識別子(Precondition 由来なら Precondition 名)。

#### 継承元

[`MusicError`](MusicError.md).[`identifier`](MusicError.md#identifier)
