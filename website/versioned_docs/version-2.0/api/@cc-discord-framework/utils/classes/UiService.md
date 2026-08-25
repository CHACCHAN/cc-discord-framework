# クラス: UiService

定義: [plugins/utils/src/UiService.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L32)

`this.services.ui` — テーマ済みの埋め込みと UI ヘルパー。

```ts
await interaction.reply({ embeds: [this.services.ui.success("保存しました。")] });
if (!(await this.services.ui.confirm(interaction, { content: "削除しますか?" }))) return;
```

## 拡張

- [`Service`](../../core/classes/Service.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new UiService(): UiService;
```

#### 戻り値

`UiService`

#### 継承元

[`Service`](../../core/classes/Service.md).[`constructor`](../../core/classes/Service.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Service`](../../core/classes/Service.md).[`container`](../../core/classes/Service.md#container)

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Service`](../../core/classes/Service.md).[`location`](../../core/classes/Service.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Service`](../../core/classes/Service.md).[`logger`](../../core/classes/Service.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Service`](../../core/classes/Service.md).[`name`](../../core/classes/Service.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Service`](../../core/classes/Service.md).[`store`](../../core/classes/Service.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](../../core/classes/Client.md)

#### 継承元

[`Service`](../../core/classes/Service.md).[`client`](../../core/classes/Service.md#client)

***

### colors \{#colors}

#### 署名を取得する

```ts
get colors(): ColorTheme;
```

定義: [plugins/utils/src/UiService.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L41)

テーマの色。

##### 戻り値

[`ColorTheme`](../interfaces/ColorTheme.md)

***

### embeds \{#embeds}

#### 署名を取得する

```ts
get embeds(): Embeds;
```

定義: [plugins/utils/src/UiService.ts:100](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L100)

##### 戻り値

[`Embeds`](../interfaces/Embeds.md)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L50)

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../core/interfaces/Services.md)

#### 継承元

[`Service`](../../core/classes/Service.md).[`services`](../../core/classes/Service.md#services)

***

### theme \{#theme}

#### 署名を取得する

```ts
get theme(): Theme;
```

定義: [plugins/utils/src/UiService.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L36)

このクライアントのテーマ。

##### 戻り値

[`Theme`](../interfaces/Theme.md)

## メソッド

### confirm() \{#confirm}

```ts
confirm(target, options?): Promise<boolean>;
```

定義: [plugins/utils/src/UiService.ts:71](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L71)

確認ダイアログ。テーマのラベル・色・待ち時間が既定になります。

#### パラメータ

##### target

[`ReplyTarget`](../type-aliases/ReplyTarget.md)

##### options?

[`ConfirmOptions`](../interfaces/ConfirmOptions.md) = `{}`

#### 戻り値

`Promise`\<`boolean`\>

***

### error() \{#error}

```ts
error(description?): EmbedBuilder;
```

定義: [plugins/utils/src/UiService.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L51)

失敗(テーマの色)。`Error` をそのまま渡せます。

#### パラメータ

##### description?

`string` \| `Error`

#### 戻り値

`EmbedBuilder`

***

### formatDuration() \{#formatduration}

```ts
formatDuration(ms, options?): string;
```

定義: [plugins/utils/src/UiService.ts:91](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L91)

時計表記。テーマの区切り・ゼロ埋めが既定になります。

#### パラメータ

##### ms

`number`

##### options?

[`FormatDurationOptions`](../interfaces/FormatDurationOptions.md) = `{}`

#### 戻り値

`string`

***

### humanize() \{#humanize}

```ts
humanize(ms, options?): string;
```

定義: [plugins/utils/src/UiService.ts:86](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L86)

大まかな長さ。テーマの単位・区切り・単位数が既定になります。

#### パラメータ

##### ms

`number`

##### options?

[`HumanizeDurationOptions`](../interfaces/HumanizeDurationOptions.md) = `{}`

#### 戻り値

`string`

***

### info() \{#info}

```ts
info(description?): EmbedBuilder;
```

定義: [plugins/utils/src/UiService.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L61)

情報(テーマの色)。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`

***

### of() \{#of}

```ts
of(color, description?): EmbedBuilder;
```

定義: [plugins/utils/src/UiService.ts:66](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L66)

任意の色。テーマの色名か色コードを渡します。

#### パラメータ

##### color

`number` \| keyof ColorTheme

##### description?

`string` \| `Error`

#### 戻り値

`EmbedBuilder`

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Service`](../../core/classes/Service.md).[`onLoad`](../../core/classes/Service.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L58)

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`Service`](../../core/classes/Service.md).[`onUnload`](../../core/classes/Service.md#onunload)

***

### paginate() \{#paginate}

```ts
paginate(target, options): Promise<Message<boolean>>;
```

定義: [plugins/utils/src/UiService.ts:76](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L76)

ページ送り。テーマのボタン・待ち時間が既定になります。

#### パラメータ

##### target

[`ReplyTarget`](../type-aliases/ReplyTarget.md)

##### options

[`PaginateOptions`](../interfaces/PaginateOptions.md)

#### 戻り値

`Promise`\<`Message`\<`boolean`\>\>

***

### progressBar() \{#progressbar}

```ts
progressBar(
   value, 
   total, 
   options?): string;
```

定義: [plugins/utils/src/UiService.ts:81](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L81)

進捗バー。テーマの文字と幅が既定になります。

#### パラメータ

##### value

`number`

##### total

`number`

##### options?

[`ProgressBarOptions`](../interfaces/ProgressBarOptions.md) = `{}`

#### 戻り値

`string`

***

### success() \{#success}

```ts
success(description?): EmbedBuilder;
```

定義: [plugins/utils/src/UiService.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L46)

成功(テーマの色)。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`

***

### truncate() \{#truncate}

```ts
truncate(
   text, 
   max, 
   suffix?): string;
```

定義: [plugins/utils/src/UiService.ts:96](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L96)

文字列の切り詰め。テーマの省略記号が既定になります。

#### パラメータ

##### text

`string`

##### max

`number`

##### suffix?

`string` = `...`

#### 戻り値

`string`

***

### warning() \{#warning}

```ts
warning(description?): EmbedBuilder;
```

定義: [plugins/utils/src/UiService.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/UiService.ts#L56)

警告(テーマの色)。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [src/service/Service.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/service/Service.ts#L47)

サービスのメタデータを宣言します。省略可能です。

#### パラメータ

##### options?

[`ServiceOptions`](../../core/interfaces/ServiceOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`

#### 継承元

[`Service`](../../core/classes/Service.md).[`define`](../../core/classes/Service.md#define)
