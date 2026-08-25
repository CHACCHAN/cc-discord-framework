# 抽象 クラス: AiTool\<TInput\>

定義: plugins/ai/src/AiTool.ts:80

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

- [`Component`](../../../cc-discord-framework/classes/Component.md)

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

[`Component`](../../../cc-discord-framework/classes/Component.md).[`constructor`](../../../cc-discord-framework/classes/Component.md#constructor)

## プロパティ

### container \{#container}

```ts
readonly container: Container;
```

定義: src/component/Component.ts:30

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`container`](../../../cc-discord-framework/classes/Component.md#container)

***

### description \{#description}

```ts
readonly description: string;
```

定義: plugins/ai/src/AiTool.ts:82

モデルへ渡す説明。

***

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: plugins/ai/src/AiTool.ts:88

モデルへ渡すか。

***

### guildOnly \{#guildonly}

```ts
readonly guildOnly: boolean;
```

定義: plugins/ai/src/AiTool.ts:91

サーバー内からの呼び出しでだけ使うか。

***

### inputSchema \{#inputschema}

```ts
readonly inputSchema: FlexibleSchema<TInput>;
```

定義: plugins/ai/src/AiTool.ts:85

入力のスキーマ。

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: src/component/Component.ts:39

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`location`](../../../cc-discord-framework/classes/Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: src/component/Component.ts:36

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`logger`](../../../cc-discord-framework/classes/Component.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: src/component/Component.ts:27

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`name`](../../../cc-discord-framework/classes/Component.md#name)

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: src/component/Component.ts:33

このコンポーネントが属するストア。

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`store`](../../../cc-discord-framework/classes/Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: src/component/Component.ts:42

フレームワーククライアント。

##### 戻り値

[`Client`](../../../cc-discord-framework/classes/Client.md)

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`client`](../../../cc-discord-framework/classes/Component.md#client)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: src/component/Component.ts:50

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../../../cc-discord-framework/interfaces/Services.md)

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`services`](../../../cc-discord-framework/classes/Component.md#services)

## メソッド

### execute() \{#execute}

```ts
abstract execute(input, context): unknown;
```

定義: plugins/ai/src/AiTool.ts:103

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

定義: src/component/Component.ts:55

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`onLoad`](../../../cc-discord-framework/classes/Component.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: src/component/Component.ts:58

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`Component`](../../../cc-discord-framework/classes/Component.md).[`onUnload`](../../../cc-discord-framework/classes/Component.md#onunload)

***

### define() \{#define}

```ts
static define<TInput>(options): (_target, context) => void;
```

定義: plugins/ai/src/AiTool.ts:93

#### 型パラメーター

##### TInput

`TInput`

#### パラメータ

##### options

[`AiToolOptions`](../interfaces/AiToolOptions.md)\<`TInput`\>

#### 戻り値

(`_target`, `context`) => `void`
