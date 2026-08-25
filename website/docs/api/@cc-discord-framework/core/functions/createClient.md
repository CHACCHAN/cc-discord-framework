# 関数: createClient()

```ts
function createClient(directory?, overrides?): Promise<Client<boolean>>;
```

定義: [src/config.ts:115](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/config.ts#L115)

設定ディレクトリを読んでクライアントを作ります。`load()` はしません —
呼び出し側が `login()`(内部で `load()`)を呼ぶまで、副作用は起きません。

```ts
// src/index.ts — エントリポイントはこれだけで済みます。
const client = await createClient();
await client.login();
```

`baseDirectory` は設定の読み込み先とは無関係で、既定どおり
エントリポイント(`Bun.main`)のあるディレクトリのままです。設定
ディレクトリを別の場所に移してもコンポーネント自動探索は動きます。

## パラメータ

### directory?

`string` \| `URL`

[loadClientConfig](loadClientConfig.md) と同じ。

### overrides?

`Partial`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>

ファイルの内容の上に素直に後勝ちで重ねます(衝突検査は
  しません)。テストや一時的な上書きのための逃げ道です。**浅い上書きな
  ので、合成の規則は適用されません** — `plugins` を渡せば連結済みの配列
  ごと、`intents` を渡せば合併済みの値ごと置き換わります。

## 戻り値

`Promise`\<[`Client`](../classes/Client.md)\<`boolean`\>\>
