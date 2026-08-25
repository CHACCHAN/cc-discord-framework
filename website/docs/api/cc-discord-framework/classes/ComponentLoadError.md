# クラス: ComponentLoadError

定義: src/errors.ts:21

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

定義: src/errors.ts:25

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

定義: src/errors.ts:23

ロード元ファイルの絶対パス(あれば)。
