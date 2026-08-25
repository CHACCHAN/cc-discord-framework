# 型エイリアス: PreconditionName

```ts
type PreconditionName = keyof Preconditions extends never ? string : keyof Preconditions;
```

定義: src/precondition/Precondition.ts:26

有効な Precondition 名([Preconditions](../interfaces/Preconditions.md) を参照)。
