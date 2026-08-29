# インターフェイス: Stores

定義: [src/component/StoreRegistry.ts:25](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/StoreRegistry.ts#L25)

ストア名から具象ストア型へのマップ。`stores.get("commands")` の型付けを
担います。コンポーネント種別を追加するプラグインはこのインターフェースを
宣言マージしてください:

```ts
declare module "@cc-discord-framework/core" {
  interface Stores {
    tasks: TaskStore;
  }
}
```

## プロパティ

### commands \{#commands}

```ts
commands: CommandStore;
```

定義: [src/component/StoreRegistry.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/StoreRegistry.ts#L27)

***

### listeners \{#listeners}

```ts
listeners: ListenerStore;
```

定義: [src/component/StoreRegistry.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/StoreRegistry.ts#L28)

***

### preconditions \{#preconditions}

```ts
preconditions: PreconditionStore;
```

定義: [src/component/StoreRegistry.ts:29](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/StoreRegistry.ts#L29)

***

### services \{#services}

```ts
services: ServiceStore;
```

定義: [src/component/StoreRegistry.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/StoreRegistry.ts#L26)
