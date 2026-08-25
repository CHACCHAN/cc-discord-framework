# 関数: loadClientConfig()

```ts
function loadClientConfig(directory?): Promise<ClientOptions>;
```

定義: [src/config.ts:70](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/config.ts#L70)

設定ディレクトリを読んで1つの [ClientOptions](../interfaces/ClientOptions.md) にまとめます。

ディレクトリの中身は [collectModuleFiles](collectModuleFiles.md) の規約で集められます —
サブディレクトリも対象、`_` 始まりのファイル・ディレクトリは対象外
(共有コードは `config/_env.ts` のように置きます)。各ファイルは
[ClientConfig](../interfaces/ClientConfig.md) を default export します。

読み込み順は `priority` の降順、同じ値ならパスの昇順です。その順で、
キーごとに次の3つの規則で合成します:

1. `plugins` — **連結**。読み込み順に並び、1つのファイル内に並べた
   プラグインはその配列順を保ちます。
2. `intents` / `partials` / `applicationGuildIds` — **合併**(union)。
   どのファイルも自分が必要なものだけを宣言でき、重複は除かれます。
3. それ以外のキー — **後勝ち**。ただし2つ以上のファイルが同じキーに
   **違う値**を書いていたらエラーです(比較は `Object.is`。同じ内容の
   オブジェクトリテラルでも別の値なのでエラーになります — どちらが
   採用されるか読めない設定は、そもそも書き間違いだからです)。

`priority` はローダーが消費するため、結果には残りません。

## パラメータ

### directory?

`string` \| `URL`

設定ディレクトリ。省略時は
  `<エントリポイントのディレクトリ>/config`(= `src/index.ts` に対する
  `src/config/`)です。コンポーネント自動探索と同じ場所に並ぶので、
  Bot のコードは `src/` の下で完結します(`config` という名前のストアは
  存在しないため、自動探索と衝突しません)。

## 戻り値

`Promise`\<[`ClientOptions`](../interfaces/ClientOptions.md)\>
