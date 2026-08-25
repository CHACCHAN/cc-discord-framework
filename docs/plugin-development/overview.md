# プラグインとは何か

プラグインは `name` と `install` 関数を持つただのオブジェクトです。
定義は [`src/plugin.ts`](../../src/plugin.ts) にあり、これがすべてです:

```ts
export interface Plugin {
	/** ログで使われる一意なプラグイン名。 */
	readonly name: string;
	/** クライアント起動時に一度だけ、コンポーネントのロード前に呼ばれます。 */
	install(client: Client): Awaitable<unknown>;
}
```

`install` は `client.load()` の冒頭 — **どのコンポーネントよりも先** —
に実行され、async でも構いません(データベース接続などのセットアップは
コンポーネントのロード前に完了します)。

`definePlugin` は型付けのための恒等ヘルパーで、「オプションを受け取る
ファクトリ関数が `definePlugin({...})` を返す」形が公式プラグイン全体の
慣例です:

```ts
// plugins/utils/src/index.ts(実物)
export function utils(options: UtilsOptions = {}): Plugin {
	return definePlugin({
		name: "utils",
		install(client) {
			// クライアント毎に持たせることで、複数クライアントでもテーマが混ざらない。
			client.container.theme = resolveTheme(options.theme);

			if (options.scheduler ?? true) client.stores.register(new TaskStore());
			if (options.ui ?? true) client.register(UiService);
		},
	});
}
```

## プラグインにできること

すべて Public API 経由です — プラグインがフレームワーク内部を知る必要は
ありません:

| できること | 方法 | 詳細 |
| --- | --- | --- |
| コンポーネント種別の追加 | `client.stores.register(new MyStore())` | [コンポーネント種別の追加](./component-kinds.md) |
| コンポーネントの同梱 | `client.register(MyService, MyListener, ...)` | 同上 + [サービスとイベント](./services-and-events.md) |
| サービスの提供 | Service コンポーネントを同梱、または `Container` の宣言マージ + 代入 | [サービスとイベント](./services-and-events.md) |
| 設定の受け取りと配布 | オプション → `resolveXConfig` → `client.container.xConfig` | [オプション設計の規約](./configuration.md) |
| イベントの発火・観測 | `client.emit(...)` / `client.on(...)` + `ClientEvents` の宣言マージ | [サービスとイベント](./services-and-events.md) |
| 非同期セットアップ | `install` を async に | — |
| ログ | `client.logger.warn({ plugin: "x" }, "...")` | — |

## 「エンジンの能力」と「Bot の機能」の境界

公式プラグイン全体を貫く、このリポジトリで最も重要な設計方針です:

> プラグインが提供するのはあくまで **自動ロード機能やサービス
> (メソッド群)の提供** です。勝手にコマンド登録等はしません。
> Bot の機能として実装するものは Bot 側(`client/src/`)で明示的に
> 書きます。

**プラグインが持ってよいもの**:

- コンポーネント種別と自動ロード(`tasks/`、`ai/`、`resolvers/` ...)
- サービス(`this.services.audio` のようなメソッド群)
- イベントの発火(`musicTrackStart`、`aiError` ...)
- エンジンのふるまいの設定(上限・タイムアウト・接続挙動)
- **エンジン自身が投げるエラー** の文言カタログ

**持ってはいけないもの**:

- スラッシュコマンドの登録
- コマンドの応答文言のカタログ
- プラグインが勝手にユーザーへメッセージを送る既定動作

判断基準は「**利用者が Discord 上で見るものか**」です。見るものなら
Bot の機能 — Bot 側が書きます。実例として、music プラグインの
エラー報告はこう書かれています
([`plugins/music/src/GuildQueue.ts`](../../plugins/music/src/GuildQueue.ts)):

```ts
/**
 * 再生エラーを `musicError` イベントとして知らせます。
 *
 * プラグインの仕事は **発火するところまで** です。ユーザーへ見せるか
 * どうか・どう見せるかは Bot の機能なので、`listeners/` に
 * `musicError` のリスナーを置いて Bot 側で決めてください。
 */
#reportError(error: unknown, track: Track | null): void {
	this.#emit(MusicEvents.Error, error, this, track);
}
```

この境界の帰結が [`client/`](../../client/) です — `/play` などの
17コマンドはすべて client 側に明示的に書かれ、1コマンドが短く済むのは
プラグインのサービス(`this.services.audio` / `this.services.ai.reply()`)
があるからです。**そこがプラグインの価値** であり、コマンドを同梱しない
理由でもあります(応答の見た目を利用者が完全に決められる)。

例外の線引きも実例があります: ai プラグインの `display` / `stream`
設定はプラグイン側に残されています — `reply()` が defer・分割・送信まで
引き受ける以上、その既定値を持たないと「コマンドが1行で書ける」が
成り立たないためです。**サービスが送信まで代行するなら、その送信の
ふるまいはエンジンの能力** です。

## 守ってほしいこと

- **インストール順 = 配列順** です。利用者が設定ディレクトリを使う場合、
  その配列は各設定ファイルの `plugins` を `priority` 順に連結したものに
  なります([設定の合成](../architecture/config-loading.md))。いずれに
  せよ、他のプラグインへの依存はドキュメントに明記しない限り持たないで
  ください(明記している実例: music-sources は「`music()` より後に
  並べてください」)。
- `install` の中で呼ぶ `client.register()` は、**何番目のプラグインから
  でも** 同じ扱いです。自分が配列の先頭に置かれるかどうかで、同梱
  コンポーネントのロード順が変わることはありません
  ([ライフサイクル](../architecture/lifecycle.md#doload-の内部単一飛行と-started))。
- `install` はコンポーネントのロード前に走ります — そこでストアの中身を
  当てにしないでください。ロード済みコンポーネントに反応するには
  `componentLoaded` や ready イベントを使います。
- クライアントやストアへのモンキーパッチは禁止です。拡張点で足りない
  場合は、穴を開けて回避するのではなく、フレームワーク側の課題として
  報告してください。
- **モジュールレベルの可変状態を持たないでください。** クライアント毎の
  状態はすべて `container` 経由で配ります
  ([最小プラグインを0から](./creating-a-plugin.md))。

## このセクションの読み進め方

1. [最小プラグインを0から](./creating-a-plugin.md) — ファクトリ関数と
   設定配布の骨格
2. [コンポーネント種別の追加](./component-kinds.md) — 独自の `tasks/` の
   ようなディレクトリを作る
3. [サービスとイベント](./services-and-events.md) — `this.services.x` と
   イベント発火の慣例
4. [オプション設計の規約](./configuration.md) — XOptions / XConfig /
   texts カタログ
5. [テスト](./testing.md) → [パッケージング](./packaging.md) →
   [互換性](./compatibility.md)
