# クラス: ContainerLoadError

定義: [src/errors.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L58)

`container/` ディレクトリの読み込みに失敗したときのエラー — default export
が [defineContainerValue](../functions/defineContainerValue.md) の形になっていない、名前がコンテナの既存
プロパティや他のファイルと衝突している、ファクトリが例外を投げた、など。

ロードエラーは [Client.load](Client.md#load) 中に投げられるため、コンテナ値の定義に
問題のある Bot は実行時に誤動作する前に、起動時点で確実に失敗します。

## 拡張

- [`FrameworkError`](FrameworkError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new ContainerLoadError(message, options?): ContainerLoadError;
```

定義: [src/errors.ts:62](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L62)

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions` & `object`

#### 戻り値

`ContainerLoadError`

#### 上書き

[`FrameworkError`](FrameworkError.md).[`constructor`](FrameworkError.md#constructor)

## プロパティ

### path \{#path}

```ts
readonly path: string | null;
```

定義: [src/errors.ts:60](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/errors.ts#L60)

問題のあった定義ファイル、または container ディレクトリの絶対パス(あれば)。
