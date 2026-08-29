# 関数: defineContainerValue()

```ts
function defineContainerValue<T>(definition): ContainerValueDefinition<T>;
```

定義: src/containerValues.ts:55

型付けだけの関数([defineConfig](defineConfig.md) / [definePlugin](definePlugin.md) と同じ役割)。
`container/` のファイルは必ずこれを default export します:

```ts
// container/prisma.ts
export default defineContainerValue({
  create: () => new PrismaClient(),
  dispose: (prisma) => prisma.$disconnect(),
});

// 型はコアの他の拡張と同じく宣言マージで付けます:
declare module "@cc-discord-framework/core" {
  interface Container {
    prisma: PrismaClient;
  }
}
```

これで、どのコンポーネントからも `this.container.prisma` で参照できます。

## 型パラメーター

### T

`T`

## パラメータ

### definition

[`ContainerValueDefinition`](../interfaces/ContainerValueDefinition.md)\<`T`\>

## 戻り値

[`ContainerValueDefinition`](../interfaces/ContainerValueDefinition.md)\<`T`\>
