# サービスとイベント

プラグインの価値の中心は「Bot 側が1行で呼べるサービス」と「Bot 側が
リスナーで受けられるイベント」です。このページの例はすべて公式
プラグインの実物からの抜粋です。

## Service を提供する

プラグインのサービスは、コアの `Service` コンポーネントとして書いて
`install` で同梱するのが基本形です。utils プラグインの `UiService` が
最小の実例です:

```ts
// plugins/utils/src/index.ts(抜粋)
install(client) {
	client.container.theme = resolveTheme(options.theme);
	if (options.scheduler ?? true) client.stores.register(new TaskStore());
	if (options.ui ?? true) client.register(UiService);   // ← Service を同梱
}
```

`Services` インターフェースの宣言マージを **サービスを定義したファイル**
に併記します。これで利用者のどのコンポーネントからも
`this.services.ui` が型付きで届きます
([`plugins/utils/src/UiService.ts`](../../plugins/utils/src/UiService.ts)):

```ts
declare module "@cc-discord-framework/core" {
	interface Services {
		ui: UiService;
	}
}
```

music(`audio: AudioService` —
[`plugins/music/src/AudioService.ts`](../../plugins/music/src/AudioService.ts))と
ai(`ai: AiService` —
[`plugins/ai/src/AiService.ts`](../../plugins/ai/src/AiService.ts))も
同じ形です。

サービス名はクラス名から lowerCamelCase で導出されます
(`AudioService` → `audio`)。プロパティとして自然に読める名前になるよう、
**短い1語** を選んでください。

Service にはコンポーネントのライフサイクルがそのまま付いてきます —
リソースを持つサービスは `onUnload` で確実に畳みます(実例:
`AudioService.onUnload` は全ギルドのキューを destroy します)。

### Service か、コンテナ直載せか

| 形 | 向いているもの | 実例 |
| --- | --- | --- |
| Service コンポーネント | メソッド群・状態・ライフサイクルを持つもの | `audio` / `ai` / `ui` |
| `container.x` への直接代入 | 解決済み設定などの「ただの値」 | `container.theme`、`container.musicConfig` |

コンテナ直載せは [`Container` の宣言マージ](./creating-a-plugin.md#2-オプション--解決済み設定--コンテナ配布)とセットです。

## イベントを発火する

### 宣言: `ClientEvents` の宣言マージ

プラグインのイベントは通常の discord.js エミッターに乗せます。イベント名の
定数オブジェクトと、`declare module "discord.js"` による型付けをセットで
書きます(実物:
[`plugins/music/src/events.ts`](../../plugins/music/src/events.ts)):

```ts
export const MusicEvents = {
	/** 再生開始: `(queue, track)` */
	TrackStart: "musicTrackStart",
	/** 再生終了(スキップ含む): `(queue, track)` */
	TrackEnd: "musicTrackEnd",
	/** キューが空になった: `(queue)` */
	QueueEnd: "musicQueueEnd",
	/** ボイス接続の切断: `(queue)` */
	Disconnect: "musicDisconnect",
	/** 再生中のエラー: `(error, queue, track)` */
	Error: "musicError",
} as const;

declare module "discord.js" {
	interface ClientEvents {
		musicTrackStart: [queue: GuildQueue, track: Track];
		musicTrackEnd: [queue: GuildQueue, track: Track];
		musicQueueEnd: [queue: GuildQueue];
		musicDisconnect: [queue: GuildQueue];
		musicError: [error: unknown, queue: GuildQueue, track: Track | null];
	}
}
```

- イベント名には **プラグイン名のプレフィックス** を付けます
  (`music...` / `ai...`)。素の discord.js イベントやコアの
  `FrameworkEvents` と衝突しないためです。
- 宣言マージ先は `"discord.js"` です(`ClientEvents` は discord.js の
  インターフェースなので)。`Stores` / `Services` / `Container` の
  マージ先が `"@cc-discord-framework/core"` なのと混同しないでください。

これで利用者は `Listener` コンポーネントで型付きのまま受けられます:

```ts
@Listener.define({ event: "musicTrackStart" })
export class NowPlayingListener extends Listener<"musicTrackStart"> {
	override async run(queue: GuildQueue, track: Track) {
		await queue.textChannel?.send(`▶ ${track.title}`);
	}
}
```

### 発火の慣例 1: 「発火するところまで」がプラグインの仕事

ユーザーに何かを見せる可能性のあるイベントは、**発火だけ** して見せ方は
Bot に任せます([境界](./overview.md#エンジンの能力とbot-の機能の境界))。
music の `musicError` はこの形です — プラグインは送信せず、Bot が
`listeners/MusicErrorListener.ts` を置いて表示を決めます。

### 発火の慣例 2: 「購読ゼロならログ」— commandError パターン

内部で処理した(握りつぶさずに続行した)エラーは、コアの
`commandError` と同じ「購読ゼロなら既定動作」イディオムで報告します。
`client.emit()` が **リスナーの有無を返す** ことを利用します(実物:
[`plugins/ai/src/events.ts`](../../plugins/ai/src/events.ts)):

```ts
export function reportAiError(
	client: Client,
	logger: Logger,
	error: unknown,
	info: AiErrorInfo,
): void {
	const handled = client.emit(AiEvents.Error, error, info);
	if (handled) return;
	logger.error({ err: error, ...info }, "AI の処理でエラーが発生しました");
}
```

利用者が `aiError` のリスナーを1つでも置けば、既定のログは止まり、
制御が完全に移ります — 設定フラグは要りません。コア側の同じ仕組みは
[ディスパッチ](../architecture/dispatch.md#既定動作のイディオム)を参照して
ください。

### 発火の慣例 3: イベントに載せるのは「実際に起きること」だけ

ai プラグインの `AiErrorPhase` 型のコメントが方針を言い切っています:

> ここに並ぶのは **実際に発火する値だけ** です — 生成そのもの、ツールの
> 実行、Discord への表示、会話履歴の読み書き。モデルの解決に失敗した
> 場合は握りつぶさず throw するので、`aiError` には流れません。

「呼び出し元へ返すべきエラーは throw、続行したエラーだけイベント」という
線引きを守ってください。両方に流すと、利用者は同じ失敗を2回見ることに
なります。

## プラグインをまたいだ連携

サービスの収束(`this.services.*`)が、プラグイン同士を疎結合のまま
つなぎます。リファレンス Bot の実例では、**ai プラグインの種別に置いた
クラスから music プラグインのサービスをそのまま呼んでいます**
([`client/src/ai/NowPlayingTool.ts`](../../client/src/ai/NowPlayingTool.ts)):

```ts
@AiTool.define({ description: "再生中の曲と待機中の曲の状況を返します。", inputSchema: input })
export class NowPlayingTool extends AiTool<z.infer<typeof input>> {
	override execute(args, context) {
		const queue = this.services.audio.queue(context.guildId);   // ← music のサービス
		// ...
	}
}
```

ai と music は互いを import していません。あなたのプラグインのサービスも、
`Services` に宣言マージした瞬間から他のプラグイン・Bot の全コンポーネント
から届きます — **これがサービスを提供する意味** です。
