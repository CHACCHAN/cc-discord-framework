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

定義: src/precondition/Precondition.ts:31

Precondition の判定結果: 通過、またはユーザー向けエラー付きの拒否。
