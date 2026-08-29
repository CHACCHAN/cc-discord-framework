# インターフェイス: AiProviderSettings

定義: [plugins/ai/src/models.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L41)

プロバイダーへ渡す接続設定。各 SDK の `create*()` にそのまま渡されます。

## プロパティ

### apiKey? \{#apikey}

```ts
readonly optional apiKey?: string;
```

定義: [plugins/ai/src/models.ts:43](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L43)

API キー。省略すると各 SDK の既定の環境変数が使われます。

***

### baseURL? \{#baseurl}

```ts
readonly optional baseURL?: string;
```

定義: [plugins/ai/src/models.ts:45](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L45)

接続先。`compatible` では必須です。

***

### headers? \{#headers}

```ts
readonly optional headers?: Record<string, string>;
```

定義: [plugins/ai/src/models.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L47)

追加の HTTP ヘッダー。

***

### name? \{#name}

```ts
readonly optional name?: string;
```

定義: [plugins/ai/src/models.ts:49](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/models.ts#L49)

プロバイダー名(`compatible` では必須。ログや provider metadata に出ます)。
