# 型エイリアス: PreconditionName

```ts
type PreconditionName = keyof Preconditions extends never ? string : keyof Preconditions;
```

定義: [src/precondition/Precondition.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/precondition/Precondition.ts#L26)

有効な Precondition 名([Preconditions](../interfaces/Preconditions.md) を参照)。
