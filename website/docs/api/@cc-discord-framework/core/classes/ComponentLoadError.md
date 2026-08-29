# クラス: ComponentLoadError

定義: [src/errors.ts:21](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L21)

コンポーネントのロード・登録に失敗したときのエラー — 名前の重複、
不正なメタデータ、存在しない Precondition 参照など。

ロードエラーは [Client.load](Client.md#load) 中に投げられるため、設定ミスのある
Bot は実行時に誤動作する前に、起動時点で確実に失敗します。

## 拡張

- [`FrameworkError`](FrameworkError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ComponentLoadError(message, options?): ComponentLoadError;
```

定義: [src/errors.ts:25](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L25)

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`ComponentLoadError`

#### 上書き

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## プロパティ

### path \{#path}

```ts
readonly path: string | null;
```

定義: [src/errors.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L23)

ロード元ファイルの絶対パス(あれば)。
