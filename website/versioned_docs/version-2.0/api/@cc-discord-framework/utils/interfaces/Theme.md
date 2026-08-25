# インターフェイス: Theme

定義: [plugins/utils/src/theme.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L38)

## プロパティ

### colors \{#colors}

```ts
colors: ColorTheme;
```

定義: [plugins/utils/src/theme.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L39)

***

### confirm \{#confirm}

```ts
confirm: object;
```

定義: [plugins/utils/src/theme.ts:40](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L40)

#### no

```ts
no: ButtonTheme;
```

#### timeout

```ts
timeout: DurationInput;
```

応答を待つ時間。

#### yes

```ts
yes: ButtonTheme;
```

***

### duration \{#duration}

```ts
duration: object;
```

定義: [plugins/utils/src/theme.ts:64](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L64)

#### clock

```ts
clock: FormatDurationOptions;
```

`formatDuration` の時計表記(区切り・ゼロ埋め)。

#### max

```ts
max: number;
```

既定で出す単位の数。

#### separator

```ts
separator: string;
```

単位のあいだに挟む文字列。

#### units

```ts
units: object;
```

`humanizeDuration` が使う単位。日本語にするならここ。

##### units.d

```ts
d: string;
```

##### units.h

```ts
h: string;
```

##### units.m

```ts
m: string;
```

##### units.ms

```ts
ms: string;
```

##### units.s

```ts
s: string;
```

***

### pagination \{#pagination}

```ts
pagination: object;
```

定義: [plugins/utils/src/theme.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L46)

#### counter

```ts
counter: (current, total) => string;
```

中央に出す現在位置の文字列。

##### パラメータ

###### current

`number`

###### total

`number`

##### 戻り値

`string`

#### counterStyle

```ts
counterStyle: ButtonStyle;
```

#### first

```ts
first: ButtonTheme;
```

#### last

```ts
last: ButtonTheme;
```

#### next

```ts
next: ButtonTheme;
```

#### prev

```ts
prev: ButtonTheme;
```

#### showCounter

```ts
showCounter: boolean;
```

現在位置のボタンを出すか。

#### timeout

```ts
timeout: DurationInput;
```

無操作でボタンを無効化するまでの時間。

***

### progress \{#progress}

```ts
progress: object;
```

定義: [plugins/utils/src/theme.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L59)

#### empty

```ts
empty: string;
```

#### filled

```ts
filled: string;
```

#### width

```ts
width: number;
```

***

### text \{#text}

```ts
text: object;
```

定義: [plugins/utils/src/theme.ts:74](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/theme.ts#L74)

#### ellipsis

```ts
ellipsis: string;
```

`truncate` が末尾に付ける文字列。
