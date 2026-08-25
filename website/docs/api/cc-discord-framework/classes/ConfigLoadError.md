# クラス: ConfigLoadError

定義: src/errors.ts:40

設定ディレクトリの読み込みに失敗したときのエラー — ディレクトリや設定
ファイルが見つからない、default export がない、複数のファイルが同じ
キーに違う値を書いている、`intents` がどこにもない、など。

設定エラーは [createClient](../functions/createClient.md) / [loadClientConfig](../functions/loadClientConfig.md) の時点で
投げられるため、設定の取りこぼしを抱えた Bot は Discord へ接続する前に
確実に失敗します。

## 拡張

- [`FrameworkError`](FrameworkError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ConfigLoadError(message, options?): ConfigLoadError;
```

定義: src/errors.ts:44

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`ConfigLoadError`

#### 上書き

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## プロパティ

### path \{#path}

```ts
readonly path: string | null;
```

定義: src/errors.ts:42

問題のあった設定ファイル、または設定ディレクトリの絶対パス(あれば)。
