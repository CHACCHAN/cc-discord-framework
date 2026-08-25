# インターフェイス: PaginateOptions

定義: plugins/utils/src/paginate.ts:49

## 拡張

- [`PaginationLook`](PaginationLook.md)

## プロパティ

### anyone? \{#anyone}

```ts
optional anyone?: boolean;
```

定義: plugins/utils/src/paginate.ts:59

誰でも押せるようにする。

#### Default

```ts
false
```

***

### buttons? \{#buttons}

```ts
optional buttons?: PaginationButtons;
```

定義: plugins/utils/src/paginate.ts:38

ボタンの見た目。

#### Default

テーマの `pagination`

#### 継承元

[`PaginationLook`](PaginationLook.md).[`buttons`](PaginationLook.md#buttons)

***

### counter? \{#counter}

```ts
optional counter?: (current, total) => string;
```

定義: plugins/utils/src/paginate.ts:40

中央の現在位置表示。

#### パラメータ

##### current

`number`

##### total

`number`

#### 戻り値

`string`

#### Default

テーマの `pagination.counter`

#### 継承元

[`PaginationLook`](PaginationLook.md).[`counter`](PaginationLook.md#counter)

***

### counterStyle? \{#counterstyle}

```ts
optional counterStyle?: ButtonStyle;
```

定義: plugins/utils/src/paginate.ts:42

中央の現在位置ボタンの色。

#### Default

テーマの `pagination.counterStyle`

#### 継承元

[`PaginationLook`](PaginationLook.md).[`counterStyle`](PaginationLook.md#counterstyle)

***

### ephemeral? \{#ephemeral}

```ts
optional ephemeral?: boolean;
```

定義: plugins/utils/src/paginate.ts:61

本人にだけ見える返信にする(インタラクションのみ)。

#### Default

```ts
false
```

***

### pages \{#pages}

```ts
pages: readonly Page[];
```

定義: plugins/utils/src/paginate.ts:51

表示するページ。`chunk()` と組み合わせると配列から簡単に作れます。

***

### showCounter? \{#showcounter}

```ts
optional showCounter?: boolean;
```

定義: plugins/utils/src/paginate.ts:44

現在位置ボタンを出す。

#### Default

テーマの `pagination.showCounter`(true)

#### 継承元

[`PaginationLook`](PaginationLook.md).[`showCounter`](PaginationLook.md#showcounter)

***

### startPage? \{#startpage}

```ts
optional startPage?: number;
```

定義: plugins/utils/src/paginate.ts:55

最初に表示するページ(1 始まり)。

#### Default

```ts
1
```

***

### theme? \{#theme}

```ts
optional theme?: object;
```

定義: plugins/utils/src/paginate.ts:46

この呼び出しだけテーマを上書きする。

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

#### 継承元

[`PaginationLook`](PaginationLook.md).[`theme`](PaginationLook.md#theme)

***

### timeout? \{#timeout}

```ts
optional timeout?: DurationInput;
```

定義: plugins/utils/src/paginate.ts:53

無操作でこの時間が過ぎるとボタンを無効化します。

#### Default

テーマの `pagination.timeout`("2m")

***

### userId? \{#userid}

```ts
optional userId?: string;
```

定義: plugins/utils/src/paginate.ts:57

押せるユーザー。

#### Default

```ts
呼び出したユーザー
```
