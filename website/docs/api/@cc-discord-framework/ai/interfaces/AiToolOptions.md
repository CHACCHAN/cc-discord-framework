# インターフェイス: AiToolOptions\<TInput\>

定義: [plugins/ai/src/AiTool.ts:37](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L37)

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](../../core/interfaces/ComponentOptions.md)

## 型パラメーター

### TInput

`TInput` = `unknown`

## プロパティ

### description \{#description}

```ts
description: string;
```

定義: [plugins/ai/src/AiTool.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L39)

モデルへ渡す説明。**必須** — これを読んでモデルが呼ぶか決めます。

***

### enabled? \{#enabled}

```ts
optional enabled?: boolean;
```

定義: [plugins/ai/src/AiTool.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L46)

モデルへ渡す。`false` にすると読み込まれても使われません。

#### Default

```ts
true
```

***

### guildOnly? \{#guildonly}

```ts
optional guildOnly?: boolean;
```

定義: [plugins/ai/src/AiTool.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L51)

サーバー内からの呼び出しでだけ使う。

#### Default

```ts
false
```

***

### inputSchema \{#inputschema}

```ts
inputSchema: FlexibleSchema<TInput>;
```

定義: [plugins/ai/src/AiTool.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/AiTool.ts#L41)

入力のスキーマ。**必須** — zod でも JSON Schema でも構いません。

***

### name? \{#name}

```ts
optional name?: string;
```

定義: [src/component/Component.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L13)

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](../../core/interfaces/ComponentOptions.md).[`name`](../../core/interfaces/ComponentOptions.md#name)
