# 関数: createEmbeds()

```ts
function createEmbeds(theme?): Embeds;
```

定義: [plugins/utils/src/embeds.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/embeds.ts#L39)

テーマの色を使う埋め込みファクトリを作ります。

コンポーネントの中では `this.services.ui` が同じものを提供するので、
通常こちらを直接呼ぶ必要はありません。クライアントの外(ユーティリティ
関数やスクリプト)で使いたいときの入口です。

```ts
const embeds = createEmbeds({ colors: { success: 0x00ffaa } });
embeds.success("保存しました").setTitle("設定");
```

## パラメータ

### theme?

  \| [`Theme`](../interfaces/Theme.md)
  \| \{
  `colors?`: \{
     `error?`: `number`;
     `info?`: `number`;
     `success?`: `number`;
     `warning?`: `number`;
  \};
  `confirm?`: \{
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
  \};
  `duration?`: \{
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
  \};
  `pagination?`: \{
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
  \};
  `progress?`: \{
     `empty?`: `string`;
     `filled?`: `string`;
     `width?`: `number`;
  \};
  `text?`: \{
     `ellipsis?`: `string`;
  \};
\}

## 戻り値

[`Embeds`](../interfaces/Embeds.md)
