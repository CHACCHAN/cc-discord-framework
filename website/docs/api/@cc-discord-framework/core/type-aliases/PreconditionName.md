# 型エイリアス: PreconditionName

```ts
type PreconditionName = keyof Preconditions extends never ? string : keyof Preconditions;
```

定義: [src/precondition/Precondition.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/precondition/Precondition.ts#L26)

有効な Precondition 名([Preconditions](../interfaces/Preconditions.md) を参照)。
