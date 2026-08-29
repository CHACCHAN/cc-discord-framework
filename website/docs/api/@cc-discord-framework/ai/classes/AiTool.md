# 抽象 クラス: AiTool\<TInput\>

定義: [plugins/ai/src/AiTool.ts:80](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L80)

LLM から呼べる関数。`ai/` ディレクトリに置くだけで自動ロードされ、
モデルへ渡されます。

中では他のコンポーネントと同じように `this.services.*` / `this.container` /
`this.logger` が使えます — **これがこのプラグインの核心**で、Bot の機能を
そのまま AI から呼べるようにするための入口です。

```ts
import { AiTool } from "@cc-discord-framework/ai";
import { z } from "zod";

const input = z.object({ 詳細: z.boolean().optional() });

@AiTool.define({ description: "このサーバーの情報を返します。", inputSchema: input })
export class ServerInfoTool extends AiTool<z.infer<typeof input>> {
  override async execute(args, context) {
    const guild = context.interaction?.guild;
    return { name: guild?.name, members: guild?.memberCount };
  }
}
```

ツール名はクラス名から導出されます(`ServerInfoTool` → `server-info`)。
`@AiTool.define({ name: "..." })` で明示することもできます。

## 拡張

- [`Component`](../../core/classes/Component.md)

## 型パラメーター

### TInput

`TInput` = `unknown`

## コンストラクター

### コンストラクター \{#constructor}

```ts
new AiTool<TInput>(): AiTool<TInput>;
```

#### 戻り値

`AiTool`\<`TInput`\>

#### 継承元

[`Component`](../../core/classes/Component.md).[`constructor`](../../core/classes/Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](../../core/classes/Component.md).[`container`](../../core/classes/Component.md#container)

***

### description \{#description}

```ts
readonly description: string;
```

定義: [plugins/ai/src/AiTool.ts:82](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L82)

モデルへ渡す説明。

***

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: [plugins/ai/src/AiTool.ts:88](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L88)

モデルへ渡すか。

***

### guildOnly \{#guildonly}

```ts
readonly guildOnly: boolean;
```

定義: [plugins/ai/src/AiTool.ts:91](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L91)

サーバー内からの呼び出しでだけ使うか。

***

### inputSchema \{#inputschema}

```ts
readonly inputSchema: FlexibleSchema<TInput>;
```

定義: [plugins/ai/src/AiTool.ts:85](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L85)

入力のスキーマ。

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](../../core/classes/Component.md).[`location`](../../core/classes/Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](../../core/classes/Component.md).[`logger`](../../core/classes/Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](../../core/classes/Component.md).[`name`](../../core/classes/Component.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](../../core/classes/Component.md).[`store`](../../core/classes/Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](../../core/classes/Client.md)

#### 継承元

[`Component`](../../core/classes/Component.md).[`client`](../../core/classes/Component.md#client)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L50)

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../core/interfaces/Services.md)

#### 継承元

[`Component`](../../core/classes/Component.md).[`services`](../../core/classes/Component.md#services)

## メソッド

### execute() \{#execute}

```ts
abstract execute(input, context): unknown;
```

定義: [plugins/ai/src/AiTool.ts:103](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L103)

ツール本体。戻り値はそのままモデルへ返るので、JSON にできる形に
してください。投げた例外は握りつぶされず、ログと `aiError` を経由して
**エラー内容がモデルへ返ります**(ツール1つの失敗で会話全体が
止まらないようにするためです)。

#### パラメータ

##### input

`TInput`

##### context

[`AiToolContext`](../interfaces/AiToolContext.md)

#### 戻り値

`unknown`

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Component`](../../core/classes/Component.md).[`onLoad`](../../core/classes/Component.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L58)

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`Component`](../../core/classes/Component.md).[`onUnload`](../../core/classes/Component.md#onunload)

***

### define() \{#define}

```ts
static define<TInput>(options): (_target, context) => void;
```

定義: [plugins/ai/src/AiTool.ts:93](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L93)

#### 型パラメーター

##### TInput

`TInput`

#### パラメータ

##### options

[`AiToolOptions`](../interfaces/AiToolOptions.md)\<`TInput`\>

#### 戻り値

(`_target`, `context`) => `void`
