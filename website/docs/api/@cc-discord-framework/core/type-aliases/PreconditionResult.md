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

定義: [src/precondition/Precondition.ts:31](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/precondition/Precondition.ts#L31)

Precondition の判定結果: 通過、またはユーザー向けエラー付きの拒否。
