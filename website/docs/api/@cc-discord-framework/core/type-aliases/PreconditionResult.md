# 型エイリアス: PreconditionResult

```ts
type PreconditionResult = 
  | {
  ok: true;
}
  | {
  error: UserError;
  ok: false;
};
```

定義: [src/precondition/Precondition.ts:31](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L31)

Precondition の判定結果: 通過、またはユーザー向けエラー付きの拒否。
