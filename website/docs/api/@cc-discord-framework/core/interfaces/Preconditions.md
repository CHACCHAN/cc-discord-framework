# インターフェイス: Preconditions

定義: [src/precondition/Precondition.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L23)

Precondition 名のレジストリ。コマンドの `preconditions: [...]` の型付けに
使われます。各 Precondition の隣で宣言マージしてください:

```ts
declare module "@cc-discord-framework/core" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
```

宣言マージが1つもない間は任意の文字列を受け付け、宣言した時点で
宣言済みの名前だけが型チェックを通ります。いずれの場合も、未知の名前は
必ず起動時エラーになります。
