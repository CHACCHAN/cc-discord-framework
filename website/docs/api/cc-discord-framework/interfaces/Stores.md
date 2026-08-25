# インターフェイス: Stores

定義: src/component/StoreRegistry.ts:25

ストア名から具象ストア型へのマップ。`stores.get("commands")` の型付けを
担います。コンポーネント種別を追加するプラグインはこのインターフェースを
宣言マージしてください:

```ts
declare module "cc-discord-framework" {
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

定義: src/component/StoreRegistry.ts:27

***

### listeners \{#listeners}

```ts
listeners: ListenerStore;
```

定義: src/component/StoreRegistry.ts:28

***

### preconditions \{#preconditions}

```ts
preconditions: PreconditionStore;
```

定義: src/component/StoreRegistry.ts:29

***

### services \{#services}

```ts
services: ServiceStore;
```

定義: src/component/StoreRegistry.ts:26
