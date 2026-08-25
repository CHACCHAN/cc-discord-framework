# クラス: FrameworkError

定義: [src/errors.ts:7](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L7)

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

定義: [src/errors.ts:8](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/errors.ts#L8)

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
