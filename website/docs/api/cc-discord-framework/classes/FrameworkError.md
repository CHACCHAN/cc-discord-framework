# クラス: FrameworkError

定義: src/errors.ts:7

フレームワーク自身が投げるすべてのエラーの基底クラス。

`FrameworkError` を catch することで、Discord API のエラーや
アプリケーション自身のエラーとフレームワーク起因の失敗を区別できます。

## 拡張

- `Error`

## によって拡張された

- [`ComponentLoadError`](ComponentLoadError.md)
- [`ConfigLoadError`](ConfigLoadError.md)
- [`UserError`](UserError.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new FrameworkError(message, options?): FrameworkError;
```

定義: src/errors.ts:8

#### パラメータ

##### message

`string`

##### options?

`ErrorOptions`

#### 戻り値

`FrameworkError`

#### 上書き

```ts
Error.constructor
```
