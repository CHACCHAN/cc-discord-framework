# インターフェイス: AiProviderLoader

定義: plugins/ai/src/models.ts:69

プロバイダーの読み込み方。`ai({ providerLoaders })` で足せます。

## プロパティ

### apiKeyEnv \{#apikeyenv}

```ts
readonly apiKeyEnv: string | null;
```

定義: plugins/ai/src/models.ts:78

その SDK が既定で読む API キーの環境変数名。
`null` なら API キーを要求しません。

***

### factory \{#factory}

```ts
readonly factory: string;
```

定義: plugins/ai/src/models.ts:73

そのパッケージが export しているファクトリ関数の名前。

***

### package \{#package}

```ts
readonly package: string;
```

定義: plugins/ai/src/models.ts:71

動的 import するパッケージ名。

***

### requiresEndpoint \{#requiresendpoint}

```ts
readonly requiresEndpoint: boolean;
```

定義: plugins/ai/src/models.ts:80

`baseURL` と `name` の指定が必須か。
