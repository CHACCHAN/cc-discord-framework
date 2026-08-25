# プラグインのテスト

公式プラグインのテストはすべて **ネットワークにも API キーにも Discord
にも触れません**。`bun test` で数秒で回り、CI もトークンも要りません。
このページのパターンはすべて実物のテストからの抜粋です。全体戦略は
[テスト戦略](../testing/strategy.md)を参照してください。

## オフライン Client

土台は「自動探索なし・intents 空・ログ抑制」のクライアントに自分の
プラグインを入れて `load()` する形です。**`login()` は呼びません** —
`load()` だけで install・コンポーネントロード・ディスパッチャ接続まで
すべて走ります([ライフサイクル](../architecture/lifecycle.md))。

```ts
// plugins/music/tests/helpers.ts(実物・全文)
import { Client } from "cc-discord-framework";
import { music, type MusicOptions } from "../src/index.js";

/** music プラグイン入りのオフラインクライアント。 */
export function createMusicClient(options: MusicOptions = {}) {
	return new Client({
		intents: [],
		baseDirectory: null,     // 自動探索を無効化
		logger: { level: "silent" },
		plugins: [music(options)],
	});
}
```

まず書くべきは「install が何を登録するか」のテストです(実物:
[`plugins/music/tests/plugin.test.ts`](../../plugins/music/tests/plugin.test.ts)):

```ts
test("resolvers / providers ストアと audio サービスを追加する", async () => {
	const client = createMusicClient();
	await client.load();

	expect(client.stores.get("resolvers")).toBeDefined();
	expect(client.stores.get("providers")).toBeDefined();
	expect(client.container.services.audio).toBeDefined();
	await client.destroy();
});

test("コマンドは登録しない(Bot の機能は client 側で書く)", async () => {
	const client = createMusicClient();
	await client.load();
	expect(client.stores.get("commands").size).toBe(0);
	// ...
});
```

「コマンドを登録しない」ことまでテストで固定しているのがポイントです —
[境界](./overview.md#エンジンの能力とbot-の機能の境界)は方針ではなく
検証対象です。テストの終わりには `await client.destroy()` を呼び、
タイマーや購読を畳みます。

## fixtures で自動探索を検証する

種別を追加するプラグインは、「利用者がディレクトリに置いたクラスが
本当に読まれるか」を fixtures で検証します。`baseDirectory` にテスト用
ディレクトリを渡すだけです(実物:
[`plugins/ai/tests/tools.test.ts`](../../plugins/ai/tests/tools.test.ts)):

```ts
const client = new Client({
	intents: [],
	baseDirectory: new URL("./fixtures/", import.meta.url),   // fixtures/ai/ が走査される
	logger: { level: "silent" },
	plugins: [ai({ model: mockModel("...") })],
});
```

fixture 側は利用者が書くのと同じただのコンポーネントです
([`plugins/ai/tests/fixtures/ai/ServerInfoTool.ts`](../../plugins/ai/tests/fixtures/ai/ServerInfoTool.ts)):

```ts
/** 自動探索(`ai/`)で読まれることを確かめるための置きもの。 */
import { z } from "zod";
import { AiTool } from "../../../src/index.js";

const input = z.object({ 詳細: z.boolean().optional() });

@AiTool.define({ description: "このサーバーの情報を返します。", inputSchema: input })
export class ServerInfoTool extends AiTool<z.infer<typeof input>> {
	override execute(args: z.infer<typeof input>, context: { guildId: string | null }) {
		return { guildId: context.guildId, 詳細: args.詳細 ?? false };
	}
}
```

テストの中でだけ使うコンポーネントは、fixture にせずテストファイル内で
クラス定義して `client.register(...)` でも構いません(tools.test.ts は
両方使っています)。ヘルパーを fixtures に置くときは `_` 始まりの
ファイル名にすれば自動探索されません(実例:
`plugins/ai/tests/_fake-provider.ts`)。

## 外部サービスの偽物

### LLM: `ai/test` の `MockLanguageModelV3`

Vercel AI SDK は公式のモックモデルを同梱しています。API キーなしで
生成・ストリーミング・ツール呼び出し・失敗まで再現できます(実物:
[`plugins/ai/tests/helpers.ts`](../../plugins/ai/tests/helpers.ts)):

```ts
import { MockLanguageModelV3 } from "ai/test";

/** 決まった文章をまとめて返すモデル。 */
export function mockModel(text: string): LanguageModel {
	return new MockLanguageModelV3({
		doGenerate: async () => ({
			content: [{ type: "text", text }],
			finishReason: finish("stop"),
			usage: usage(3, 5),
			warnings: [],
		}),
	});
}

/** 断片を順に流すモデル。`gap` を渡すと断片のあいだで待ちます。 */
export function mockStreamModel(chunks: readonly string[], gap = 0): LanguageModel {
	return new MockLanguageModelV3({
		doStream: async () => ({ stream: new ReadableStream({ /* text-delta を enqueue */ }) }),
	});
}
```

同ファイルには「失敗の仕方」ごとのモデルが揃っています —
タイムアウト(同期 throw と graceful abort の両経路)、HTTP エラー、
途中失敗、空応答、手動で失敗タイミングを制御するモデル。**失敗経路は
本物の SDK が通る形で再現する** のが方針です(例: AI SDK v7 の
タイムアウトは graceful abort なので、同期 throw のモックでは実経路を
踏めない — helpers.ts のコメント参照)。

### 外部プロセス: `bun -e` を偽の yt-dlp にする

外部コマンドに依存するコードは、**bun 自身を偽のコマンドとして** 実行
します(実物:
[`plugins/music-sources/tests/ytdlp.test.ts`](../../plugins/music-sources/tests/ytdlp.test.ts)):

```ts
/** bun を偽の yt-dlp として使います。`-e` のスクリプトが本体です。 */
function bunAs(script: string, timeout: YtdlpConfig["timeout"]): YtdlpConfig {
	return { path: "bun", format: "best", commonArgs: ["-e", script], timeout };
}

// 実際の yt-dlp がハングした状況を、眠り続けるプロセスで再現する。
await ytdlpJson([], bunAs("await Bun.sleep(10_000);", 200), silentLogger);
```

ハング・不正 JSON・異常終了コードを決定的に再現できます。ここでも
「path を差し替えられる設定にしてあること」が効いています —
テスト容易性は[オプション設計](./configuration.md)の副産物です。

### Discord: 「実際に触るぶんだけ」の偽インタラクション

Discord の偽物は本物のインターフェース全体ではなく、**テスト対象が
実際に触るプロパティとメソッドだけ** を持たせます。ai の
`fakeInteraction`(helpers.ts)は `deferReply` / `reply` / `editReply` /
`followUp` を記録し、編集の同時実行数(`flight.max`)まで観測できるように
してあります — 「編集が重なっていないか」のような時間的な性質も、
偽物側に観測点を仕込めばアサートできます。

## 既定動作(購読ゼロならログ)のテスト

[イベント発火の慣例](./services-and-events.md#発火の慣例-2-購読ゼロならログ-commanderror-パターン)の
既定動作は、記録する偽ロガーを注入して検証します(実物: ai の
`fakeLogger` — `errors` / `warnings` 配列に積むだけの pino 互換
オブジェクトを `new Client({ logger })` へ渡す)。「リスナーを置いたら
既定のログが出ない」side も忘れずに固定します。

## 実部品をどこまで使うか

偽物にするのは **境界の外**(ネットワーク・外部プロセス・Discord)だけで、
内側の部品は本物を使います。music のキューのテストは `@discordjs/voice` の
`AudioPlayer` を本物のまま、無音 PCM を食わせて状態遷移を実経路で
検証しています
([`plugins/music/tests/queue.test.ts`](../../plugins/music/tests/queue.test.ts)):

```ts
/**
 * 実際に音を出さずキューの遷移を検証します。`@discordjs/voice` の
 * AudioPlayer は本物なので、状態遷移は実運用と同じ経路を通ります。
 */
function silentPcm(ms: number): Readable {
	// 48kHz ステレオ 16bit = 1ms あたり 192 バイト
	return Readable.from([Buffer.alloc(Math.max(1, Math.round(ms * 192)))]);
}
```

## ミューテーション検証

テストを書いたら、**対象コードへ意図的な変異を仕込んで赤くなることを
確かめて** ください([文化の説明](../development/validation.md#ミューテーション検証の文化))。
特に設定まわりは「設定できるのに読まれていない」が緑のまま通りがちです —
**リーフの設定値を1つ変えたら出力が変わる** ことをテストで実証するのが
このリポジトリの基準です。

## 落とし穴

- **「パッケージが入っていない」ことに依存するテストを書かない。**
  optional peer の不在経路をテストするときは、実在するパッケージ名では
  なく **存在しないパッケージ名** を指す設定を渡してください。実在名に
  依存すると、誰かがそのパッケージをインストールした瞬間にテストが
  壊れます(ai の models.test.ts で実際に起きた事故です)。読み込み
  成功側の経路は、テスト内のファイルをパッケージの代わりに指せます
  (実例: `plugins/ai/tests/_fake-provider.ts`)。
- **タイマーに実時間で頼りすぎない。** 待つ場合も `Bun.sleep` は最小に
  し、ハングしうる偽物には保険のタイムアウトを持たせます
  (`mockStallingStreamModel` は abort されない場合に備えて2秒の保険を
  持っています)。
- **テストの後始末。** `client.destroy()` を必ず呼ぶこと。ストアの
  `unbind` が呼ばれ、タイマーや購読が残りません。
