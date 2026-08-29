# インターフェイス: Preconditions

定義: [src/precondition/Precondition.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/precondition/Precondition.ts#L23)

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
