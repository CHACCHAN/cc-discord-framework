# インターフェイス: AiProviderSettings

定義: plugins/ai/src/models.ts:41

プロバイダーへ渡す接続設定。各 SDK の `create*()` にそのまま渡されます。

## プロパティ

### apiKey? \{#apikey}

```ts
readonly optional apiKey?: string;
```

定義: plugins/ai/src/models.ts:43

API キー。省略すると各 SDK の既定の環境変数が使われます。

***

### baseURL? \{#baseurl}

```ts
readonly optional baseURL?: string;
```

定義: plugins/ai/src/models.ts:45

接続先。`compatible` では必須です。

***

### headers? \{#headers}

```ts
readonly optional headers?: Record<string, string>;
```

定義: plugins/ai/src/models.ts:47

追加の HTTP ヘッダー。

***

### name? \{#name}

```ts
readonly optional name?: string;
```

定義: plugins/ai/src/models.ts:49

プロバイダー名(`compatible` では必須。ログや provider metadata に出ます)。
