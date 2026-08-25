# インターフェイス: UtilsOptions

定義: [plugins/utils/src/index.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/index.ts#L39)

## プロパティ

### scheduler? \{#scheduler}

```ts
optional scheduler?: boolean;
```

定義: [plugins/utils/src/index.ts:44](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/index.ts#L44)

`tasks/` の自動ロードと定期実行を有効にする。

#### Default

```ts
true
```

***

### theme? \{#theme}

```ts
optional theme?: object;
```

定義: [plugins/utils/src/index.ts:54](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/index.ts#L54)

Bot 全体の見た目。指定した項目だけが既定値を上書きします。

#### colors?

```ts
optional colors?: object;
```

##### colors.error?

```ts
optional error?: number;
```

##### colors.info?

```ts
optional info?: number;
```

##### colors.success?

```ts
optional success?: number;
```

##### colors.warning?

```ts
optional warning?: number;
```

#### confirm?

```ts
optional confirm?: object;
```

##### confirm.no?

```ts
optional no?: object;
```

##### confirm.no.emoji?

```ts
optional emoji?: string;
```

##### confirm.no.label?

```ts
optional label?: string;
```

##### confirm.no.style?

```ts
optional style?: ButtonStyle;
```

##### confirm.timeout?

```ts
optional timeout?: DurationInput;
```

応答を待つ時間。

##### confirm.yes?

```ts
optional yes?: object;
```

##### confirm.yes.emoji?

```ts
optional emoji?: string;
```

##### confirm.yes.label?

```ts
optional label?: string;
```

##### confirm.yes.style?

```ts
optional style?: ButtonStyle;
```

#### duration?

```ts
optional duration?: object;
```

##### duration.clock?

```ts
optional clock?: object;
```

`formatDuration` の時計表記(区切り・ゼロ埋め)。

##### duration.clock.alwaysHours?

```ts
optional alwaysHours?: boolean;
```

1時間未満でも時を出す。

###### Default

`defaultTheme.duration.clock.alwaysHours`(false)

##### duration.clock.pad?

```ts
optional pad?: string;
```

分・秒を2桁に揃える文字。

###### Default

`defaultTheme.duration.clock.pad`("0")

##### duration.clock.separator?

```ts
optional separator?: string;
```

時・分・秒の区切り。

###### Default

`defaultTheme.duration.clock.separator`(":")

##### duration.max?

```ts
optional max?: number;
```

既定で出す単位の数。

##### duration.separator?

```ts
optional separator?: string;
```

単位のあいだに挟む文字列。

##### duration.units?

```ts
optional units?: object;
```

`humanizeDuration` が使う単位。日本語にするならここ。

##### duration.units.d?

```ts
optional d?: string;
```

##### duration.units.h?

```ts
optional h?: string;
```

##### duration.units.m?

```ts
optional m?: string;
```

##### duration.units.ms?

```ts
optional ms?: string;
```

##### duration.units.s?

```ts
optional s?: string;
```

#### pagination?

```ts
optional pagination?: object;
```

##### pagination.counter?

```ts
optional counter?: (current, total) => string;
```

中央に出す現在位置の文字列。

###### パラメータ

###### current

`number`

###### total

`number`

###### 戻り値

`string`

##### pagination.counterStyle?

```ts
optional counterStyle?: ButtonStyle;
```

##### pagination.first?

```ts
optional first?: object;
```

##### pagination.first.emoji?

```ts
optional emoji?: string;
```

##### pagination.first.label?

```ts
optional label?: string;
```

##### pagination.first.style?

```ts
optional style?: ButtonStyle;
```

##### pagination.last?

```ts
optional last?: object;
```

##### pagination.last.emoji?

```ts
optional emoji?: string;
```

##### pagination.last.label?

```ts
optional label?: string;
```

##### pagination.last.style?

```ts
optional style?: ButtonStyle;
```

##### pagination.next?

```ts
optional next?: object;
```

##### pagination.next.emoji?

```ts
optional emoji?: string;
```

##### pagination.next.label?

```ts
optional label?: string;
```

##### pagination.next.style?

```ts
optional style?: ButtonStyle;
```

##### pagination.prev?

```ts
optional prev?: object;
```

##### pagination.prev.emoji?

```ts
optional emoji?: string;
```

##### pagination.prev.label?

```ts
optional label?: string;
```

##### pagination.prev.style?

```ts
optional style?: ButtonStyle;
```

##### pagination.showCounter?

```ts
optional showCounter?: boolean;
```

現在位置のボタンを出すか。

##### pagination.timeout?

```ts
optional timeout?: DurationInput;
```

無操作でボタンを無効化するまでの時間。

#### progress?

```ts
optional progress?: object;
```

##### progress.empty?

```ts
optional empty?: string;
```

##### progress.filled?

```ts
optional filled?: string;
```

##### progress.width?

```ts
optional width?: number;
```

#### text?

```ts
optional text?: object;
```

##### text.ellipsis?

```ts
optional ellipsis?: string;
```

`truncate` が末尾に付ける文字列。

#### Default

[defaultTheme](../variables/defaultTheme.md)

***

### ui? \{#ui}

```ts
optional ui?: boolean;
```

定義: [plugins/utils/src/index.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/index.ts#L49)

`this.services.ui` を登録する。

#### Default

```ts
true
```
