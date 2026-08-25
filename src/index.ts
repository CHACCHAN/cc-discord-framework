/**
 * cc-discord-framework — Bun 専用・Class 指向の Discord Bot フレームワーク
 * (discord.js ベース)。
 *
 * このモジュールが Public API のすべてです。ここから export されていない
 * ものは内部実装であり、package exports により外部から到達できません。
 *
 * discord.js の全 API もここから再エクスポートされるため、Bot 側は
 * `cc-discord-framework` だけを import すれば完結します
 * (`GatewayIntentBits`、`Events`、`EmbedBuilder`、各種型 など)。
 */

// 相互運用: TypeScript のネイティブデコレータ出力と Bun はどちらも
// Symbol.for("Symbol.metadata") にメタデータを紐付けるため、well-known
// symbol を参照するツール向けに Symbol.metadata としても公開しておく。
(Symbol as { metadata?: symbol }).metadata ??= Symbol.for("Symbol.metadata");

// discord.js の全再エクスポート。
// 下の明示 export(Client / ClientOptions / Component)は意図的に
// discord.js の同名エクスポートを上書きします。
export * from "discord.js";

// クライアント
export { Client, type ClientOptions } from "./client.js";

// 文言(フレームワークがユーザーへ返す文言のカタログ)
export {
	defaultClientTexts,
	resolveClientTexts,
	type ClientTexts,
	type ClientTextsOptions,
} from "./texts.js";

// 設定ディレクトリ(`config/` 規約)
export {
	createClient,
	defineConfig,
	loadClientConfig,
	type ClientConfig,
} from "./config.js";

// 環境変数の読み出し(型のついた定番の読み方 + 警告の収集)
export { createEnv, type EnvOptions, type EnvReader } from "./env.js";

// コンテナ
export { Container } from "./container.js";

// コンポーネントモデル
export { Component, type ComponentOptions } from "./component/Component.js";
export {
	ComponentStore,
	type ComponentStoreOptions,
} from "./component/ComponentStore.js";
export { StoreRegistry, type Stores } from "./component/StoreRegistry.js";
export {
	defineOptions,
	type AbstractComponentClass,
	type ComponentClass,
} from "./component/metadata.js";

// ディレクトリ規約のファイル収集(独自ディレクトリを走査するプラグイン向け)
export { collectModuleFiles } from "./discovery.js";

// サービス
export { Service, type ServiceOptions, type Services } from "./service/Service.js";
export { ServiceStore } from "./service/ServiceStore.js";

// コマンド
export { Command, type CommandOptions } from "./command/Command.js";
export { CommandStore } from "./command/CommandStore.js";

// リスナー
export { Listener, type ListenerEvent, type ListenerOptions } from "./listener/Listener.js";
export { ListenerStore } from "./listener/ListenerStore.js";

// Precondition
export {
	Precondition,
	type PreconditionName,
	type PreconditionOptions,
	type PreconditionResult,
	type Preconditions,
} from "./precondition/Precondition.js";
export { PreconditionStore } from "./precondition/PreconditionStore.js";

// プラグイン
export { definePlugin, type Plugin } from "./plugin.js";

// イベント
export {
	FrameworkEvents,
	type CommandRunPayload,
	type CommandsSyncedResult,
	type FrameworkEvent,
} from "./events.js";

// エラー
export { ComponentLoadError, ConfigLoadError, FrameworkError, UserError } from "./errors.js";

// ロギング(標準ロガーは pino。型も pino のものをそのまま使う)
export type { Logger, LoggerOptions } from "pino";
