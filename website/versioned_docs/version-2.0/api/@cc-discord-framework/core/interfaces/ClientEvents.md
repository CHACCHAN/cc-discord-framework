# インターフェイス: ClientEvents

定義: node\_modules/discord.js/typings/index.d.mts:6095

## プロパティ

### commandDenied \{#commanddenied}

```ts
commandDenied: [UserError, CommandRunPayload];
```

定義: [src/events.ts:52](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L52)

***

### commandError \{#commanderror}

```ts
commandError: [unknown, CommandRunPayload];
```

定義: [src/events.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L53)

***

### commandRun \{#commandrun}

```ts
commandRun: [CommandRunPayload];
```

定義: [src/events.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L51)

***

### commandsSynced \{#commandssynced}

```ts
commandsSynced: [CommandsSyncedResult];
```

定義: [src/events.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L55)

***

### componentLoaded \{#componentloaded}

```ts
componentLoaded: [Component];
```

定義: [src/events.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L49)

***

### componentUnloaded \{#componentunloaded}

```ts
componentUnloaded: [Component];
```

定義: [src/events.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L50)

***

### listenerError \{#listenererror}

```ts
listenerError: [unknown, Listener<keyof ClientEvents>];
```

定義: [src/events.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/events.ts#L54)
