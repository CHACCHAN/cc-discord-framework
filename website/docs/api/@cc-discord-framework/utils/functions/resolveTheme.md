# 関数: resolveTheme()

```ts
function resolveTheme(options?, base?): Theme;
```

定義: [plugins/utils/src/theme.ts:139](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/theme.ts#L139)

部分指定を重ねて、完全なテーマにします。

`base` を渡すとその上へ重ねます。呼び出しごとの上書きが Bot 全体の
テーマを消してしまわないよう、`confirm()` などは
`resolveTheme(options.theme, themeOf(target))` の形で使います。

## パラメータ

### options?

#### colors?

\{
  `error?`: `number`;
  `info?`: `number`;
  `success?`: `number`;
  `warning?`: `number`;
\}

#### colors.error?

`number`

#### colors.info?

`number`

#### colors.success?

`number`

#### colors.warning?

`number`

#### confirm?

\{
  `no?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
  `timeout?`: [`DurationInput`](../type-aliases/DurationInput.md);
  `yes?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
\}

#### confirm.no?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### confirm.no.emoji?

`string`

#### confirm.no.label?

`string`

#### confirm.no.style?

`ButtonStyle`

#### confirm.timeout?

[`DurationInput`](../type-aliases/DurationInput.md)

応答を待つ時間。

#### confirm.yes?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### confirm.yes.emoji?

`string`

#### confirm.yes.label?

`string`

#### confirm.yes.style?

`ButtonStyle`

#### duration?

\{
  `clock?`: \{
     `alwaysHours?`: `boolean`;
     `pad?`: `string`;
     `separator?`: `string`;
  \};
  `max?`: `number`;
  `separator?`: `string`;
  `units?`: \{
     `d?`: `string`;
     `h?`: `string`;
     `m?`: `string`;
     `ms?`: `string`;
     `s?`: `string`;
  \};
\}

#### duration.clock?

\{
  `alwaysHours?`: `boolean`;
  `pad?`: `string`;
  `separator?`: `string`;
\}

`formatDuration` の時計表記(区切り・ゼロ埋め)。

#### duration.clock.alwaysHours?

`boolean`

1時間未満でも時を出す。

**Default**

`defaultTheme.duration.clock.alwaysHours`(false)

#### duration.clock.pad?

`string`

分・秒を2桁に揃える文字。

**Default**

`defaultTheme.duration.clock.pad`("0")

#### duration.clock.separator?

`string`

時・分・秒の区切り。

**Default**

`defaultTheme.duration.clock.separator`(":")

#### duration.max?

`number`

既定で出す単位の数。

#### duration.separator?

`string`

単位のあいだに挟む文字列。

#### duration.units?

\{
  `d?`: `string`;
  `h?`: `string`;
  `m?`: `string`;
  `ms?`: `string`;
  `s?`: `string`;
\}

`humanizeDuration` が使う単位。日本語にするならここ。

#### duration.units.d?

`string`

#### duration.units.h?

`string`

#### duration.units.m?

`string`

#### duration.units.ms?

`string`

#### duration.units.s?

`string`

#### pagination?

\{
  `counter?`: (`current`, `total`) => `string`;
  `counterStyle?`: `ButtonStyle`;
  `first?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
  `last?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
  `next?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
  `prev?`: \{
     `emoji?`: `string`;
     `label?`: `string`;
     `style?`: `ButtonStyle`;
  \};
  `showCounter?`: `boolean`;
  `timeout?`: [`DurationInput`](../type-aliases/DurationInput.md);
\}

#### pagination.counter?

(`current`, `total`) => `string`

中央に出す現在位置の文字列。

#### pagination.counterStyle?

`ButtonStyle`

#### pagination.first?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### pagination.first.emoji?

`string`

#### pagination.first.label?

`string`

#### pagination.first.style?

`ButtonStyle`

#### pagination.last?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### pagination.last.emoji?

`string`

#### pagination.last.label?

`string`

#### pagination.last.style?

`ButtonStyle`

#### pagination.next?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### pagination.next.emoji?

`string`

#### pagination.next.label?

`string`

#### pagination.next.style?

`ButtonStyle`

#### pagination.prev?

\{
  `emoji?`: `string`;
  `label?`: `string`;
  `style?`: `ButtonStyle`;
\}

#### pagination.prev.emoji?

`string`

#### pagination.prev.label?

`string`

#### pagination.prev.style?

`ButtonStyle`

#### pagination.showCounter?

`boolean`

現在位置のボタンを出すか。

#### pagination.timeout?

[`DurationInput`](../type-aliases/DurationInput.md)

無操作でボタンを無効化するまでの時間。

#### progress?

\{
  `empty?`: `string`;
  `filled?`: `string`;
  `width?`: `number`;
\}

#### progress.empty?

`string`

#### progress.filled?

`string`

#### progress.width?

`number`

#### text?

\{
  `ellipsis?`: `string`;
\}

#### text.ellipsis?

`string`

`truncate` が末尾に付ける文字列。

### base?

[`Theme`](../interfaces/Theme.md) = `defaultTheme`

## 戻り値

[`Theme`](../interfaces/Theme.md)
