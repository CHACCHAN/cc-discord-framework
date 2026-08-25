# 関数: paginationRow()

```ts
function paginationRow(
   current, 
   total, 
   idPrefix, 
options?): ActionRowBuilder<ButtonBuilder>;
```

定義: [plugins/utils/src/paginate.ts:88](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/paginate.ts#L88)

ページ送りのボタン列を作ります。端では自動的に無効化されます。
コレクターを自分で書きたい場合はこれだけ使ってください。

見た目は `options` → `target` のクライアントのテーマ → 既定テーマ の順で
決まります。**`target` を渡さないと `utils({ theme })` は効きません**
(この関数だけではどのクライアントの呼び出しか分からないため)。

```ts
paginationRow(page, pages, "myprefix", { target: interaction });
```

## パラメータ

### current

`number`

### total

`number`

### idPrefix

`string`

### options?

[`PaginationRowOptions`](../interfaces/PaginationRowOptions.md) = `{}`

## 戻り値

`ActionRowBuilder`\<`ButtonBuilder`\>
