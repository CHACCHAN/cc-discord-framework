# インターフェイス: ClientEvents

定義: node\_modules/.bun/discord.js@14.26.4/node\_modules/discord.js/typings/index.d.mts:6036

## プロパティ

### commandDenied \{#commanddenied}

```ts
commandDenied: [UserError, CommandRunPayload];
```

定義: src/events.ts:52

***

### commandError \{#commanderror}

```ts
commandError: [unknown, CommandRunPayload];
```

定義: src/events.ts:53

***

### commandRun \{#commandrun}

```ts
commandRun: [CommandRunPayload];
```

定義: src/events.ts:51

***

### commandsSynced \{#commandssynced}

```ts
commandsSynced: [CommandsSyncedResult];
```

定義: src/events.ts:55

***

### componentLoaded \{#componentloaded}

```ts
componentLoaded: [Component];
```

定義: src/events.ts:49

***

### componentUnloaded \{#componentunloaded}

```ts
componentUnloaded: [Component];
```

定義: src/events.ts:50

***

### listenerError \{#listenererror}

```ts
listenerError: [unknown, Listener<keyof ClientEvents>];
```

定義: src/events.ts:54
