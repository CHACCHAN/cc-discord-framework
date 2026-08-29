# インターフェイス: ClientEvents

定義: node\_modules/discord.js/typings/index.d.mts:6095

## プロパティ

### commandDenied \{#commanddenied}

```ts
commandDenied: [UserError, CommandRunPayload];
```

定義: [src/events.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L54)

***

### commandError \{#commanderror}

```ts
commandError: [unknown, CommandRunPayload];
```

定義: [src/events.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L55)

***

### commandRun \{#commandrun}

```ts
commandRun: [CommandRunPayload];
```

定義: [src/events.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L53)

***

### commandsSynced \{#commandssynced}

```ts
commandsSynced: [CommandsSyncedResult];
```

定義: [src/events.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L57)

***

### componentLoaded \{#componentloaded}

```ts
componentLoaded: [Component];
```

定義: [src/events.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L51)

***

### componentUnloaded \{#componentunloaded}

```ts
componentUnloaded: [Component];
```

定義: [src/events.ts:52](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L52)

***

### listenerError \{#listenererror}

```ts
listenerError: [unknown, Listener<keyof ClientEvents>];
```

定義: [src/events.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/events.ts#L56)
