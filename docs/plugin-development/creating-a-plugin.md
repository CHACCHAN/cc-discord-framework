# 最小プラグインを0から

このページを読み終えると、既存プラグインのソースを読まなくても新しい
プラグインの骨格が書けます。題材として「あいさつチャンネルを覚えて、
そこへ送る手段を提供する」小さなプラグインを作ります。パターンはすべて
公式プラグインの実物から取っています(引用元を併記します)。

## 1. ファクトリ関数 + `definePlugin`

プラグインの公開面は「オプションを受け取って `Plugin` を返す関数」
1つです:

```ts
// src/index.ts(あなたのプラグイン)
import { definePlugin, type Plugin } from "@cc-discord-framework/core";
import { resolveGreeterConfig, type GreeterOptions } from "./config.js";

export function greeter(options: GreeterOptions = {}): Plugin {
	return definePlugin({
		name: "greeter",
		install(client) {
			// コンテナ経由で配ることで、複数クライアントでも設定が混ざらない。
			client.container.greeterConfig = resolveGreeterConfig(options);
		},
	});
}
```

これは公式プラグイン4つすべてが取っている形です。実物
([`plugins/ai/src/index.ts`](../../plugins/ai/src/index.ts)):

```ts
export function ai(options: AiOptions = {}): Plugin {
	return definePlugin({
		name: "ai",
		install(client) {
			// コンテナ経由で配ることで、複数クライアントでも設定が混ざらない。
			client.container.aiConfig = resolveAiConfig(options);

			client.stores.register(new AiToolStore());
			client.register(AiService);
		},
	});
}
```

利用者側はこう書きます:

```ts
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	plugins: [greeter({ channelId: "..." })],
});
```

## 2. オプション → 解決済み設定 → コンテナ配布

設定は3点セットで書きます(詳細な規約は
[オプション設計の規約](./configuration.md)):

```ts
// src/config.ts(あなたのプラグイン)

/** 解決済みの設定 — すべて readonly。 */
export interface GreeterConfig {
	readonly channelId: string | null;
	readonly cooldown: number | false;
}

/** 部分指定。指定しなかった項目は既定値のままです。 */
export interface GreeterOptions {
	/** @default null(あいさつ無効) */
	channelId?: string | null;
	/** @default false(制限なし) */
	cooldown?: number | false;
}

/** 部分指定を既定値へ重ねて、完全な設定にします。 */
export function resolveGreeterConfig(options: GreeterOptions = {}): GreeterConfig {
	return {
		channelId: options.channelId ?? null,
		cooldown: options.cooldown ?? false,
	};
}

/** 何も指定しないときの設定。 */
export const defaultGreeterConfig: GreeterConfig = resolveGreeterConfig();

declare module "@cc-discord-framework/core" {
	interface Container {
		/** greeter プラグインの設定。install 時に設定されます。 */
		greeterConfig: GreeterConfig;
	}
}
```

`Container` の宣言マージは **ランタイムコードと同じモジュール** に
置いてください — プラグインを import すれば型も付いてきます。
実物では [`plugins/music/src/config.ts`](../../plugins/music/src/config.ts)
の末尾が同じ形です。

## 3. モジュールレベル状態の禁止

**プラグインの状態(設定・キャッシュ・接続)をモジュールスコープの変数に
置いてはいけません。** 1プロセスに複数の `Client` があるとき(並列テストが
まさにそうです)に状態が混ざるためです。

- 設定は上記のとおり `client.container` に置きます。
- インスタンスが必要な状態(キャッシュ、リゾルバ)は、Service
  コンポーネントのフィールドか、`install` 内で作ってコンテナに載せた
  オブジェクトに持たせます。実例: ai プラグインの `ModelResolver` は
  「クライアントごとに1つ持たせてください(モジュールレベルの共有状態を
  作らないため、AiService が保持します)」と明記されています
  ([`plugins/ai/src/models.ts`](../../plugins/ai/src/models.ts))。

コンテナから設定を取り出すヘルパー `xConfigOf` も慣例です。クライアントに
プラグインが入っていない場合や、`client` に届かない文脈では既定値へ
フォールバックします(実物:
[`plugins/music/src/config.ts`](../../plugins/music/src/config.ts)):

```ts
export function musicConfigOf(source: { client?: unknown } | null | undefined): MusicConfig {
	const container = (source?.client as { container?: { musicConfig?: MusicConfig } } | undefined)
		?.container;
	return container?.musicConfig ?? defaultMusicConfig;
}
```

これがあるおかげで、インタラクションしか受け取らないヘルパー関数でも
「どのクライアントの呼び出しか」を自分で判断でき、利用者が毎回設定を
渡す必要がありません。

## 4. オプションによる条件つき登録

「オプションで無効化できる機能は、install で登録自体を分岐する」のが
慣例です。実物2つ:

```ts
// plugins/utils/src/index.ts — 機能フラグ
if (options.scheduler ?? true) client.stores.register(new TaskStore());
if (options.ui ?? true) client.register(UiService);
```

```ts
// plugins/music/src/index.ts — 設定値から導かれる分岐
if (config.localDirectories.length > 0) {
	client.register(LocalFileResolver, LocalFileStreamProvider);
}
if (config.leaveOnEmpty !== false) {
	client.register(VoiceStateListener);
}
```

## 5. 外部依存の欠如は「警告して続行」

外部コマンドやオプションの依存が見つからなくても、**起動は落とさず
警告します** — その機能だけが使えず、Bot 自体は動くのが正しい姿です。
実物([`plugins/music/src/index.ts`](../../plugins/music/src/index.ts)):

```ts
if (!Bun.which("ffmpeg")) {
	client.logger.warn(
		{ plugin: "music" },
		"ffmpeg が見つかりません。opus を含む .opus / .webm はそのまま再生できますが、mp3 や flac などの変換が必要な形式は再生できません",
	);
}
```

ログには `{ plugin: "名前" }` を添えます(構造化ログでプラグイン単位の
フィルタができるように)。

## 6. パッケージとして仕上げる

ここまでで骨格は完成です。続きはそれぞれのページへ:

- コンポーネントを同梱する / 独自の種別を追加する →
  [コンポーネント種別の追加](./component-kinds.md)
- `this.services.x` を提供する、イベントを発火する →
  [サービスとイベント](./services-and-events.md)
- 文言・上限・見た目を差し替え可能にする →
  [オプション設計の規約](./configuration.md)
- テストを書く → [テスト](./testing.md)
- `package.json` と `exports` → [パッケージング](./packaging.md)

## 最小チェックリスト

- [ ] `xxx(options)` ファクトリが `definePlugin({ name, install })` を返す
- [ ] 設定は `XOptions` → `resolveXConfig` → `container.xConfig` の3点
  セット + `Container` 宣言マージ
- [ ] モジュールレベルの可変状態がない
- [ ] コマンドを登録していない([境界](./overview.md#エンジンの能力とbot-の機能の境界))
- [ ] 外部依存の欠如で起動を落としていない(警告して続行)
- [ ] 差し替えられない文言・数値がない
