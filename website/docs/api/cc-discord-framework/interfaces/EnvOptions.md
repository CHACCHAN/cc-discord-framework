# インターフェイス: EnvOptions

定義: src/env.ts:41

[createEnv](../functions/createEnv.md) のオプション。語彙も区切りもここで差し替えられます。

## プロパティ

### falseWords? \{#falsewords}

```ts
optional falseWords?: readonly string[];
```

定義: src/env.ts:51

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

定義: src/env.ts:56

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

定義: src/env.ts:46

[EnvReader.flag](EnvReader.md#flag) が「有効」と解釈する語(小文字で比較)。

#### Default

```ts
["on", "true", "1", "yes"]
```
