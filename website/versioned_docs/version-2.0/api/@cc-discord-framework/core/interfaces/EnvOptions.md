# インターフェイス: EnvOptions

定義: [src/env.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/env.ts#L41)

[createEnv](../functions/createEnv.md) のオプション。語彙も区切りもここで差し替えられます。

## プロパティ

### falseWords? \{#falsewords}

```ts
optional falseWords?: readonly string[];
```

定義: [src/env.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/env.ts#L51)

[EnvReader.flag](EnvReader.md#flag) が「無効」と解釈する語(小文字で比較)。

#### Default

```ts
["off", "false", "0", "no"]
```

***

### listSeparator? \{#listseparator}

```ts
optional listSeparator?: string;
```

定義: [src/env.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/env.ts#L56)

[EnvReader.list](EnvReader.md#list) の区切り文字。

#### Default

```ts
","
```

***

### trueWords? \{#truewords}

```ts
optional trueWords?: readonly string[];
```

定義: [src/env.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/env.ts#L46)

[EnvReader.flag](EnvReader.md#flag) が「有効」と解釈する語(小文字で比較)。

#### Default

```ts
["on", "true", "1", "yes"]
```
