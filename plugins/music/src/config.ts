/**
 * 解決済みのプラグイン設定。
 *
 * モジュールレベルの可変状態にせず **コンテナ経由** で配るため、
 * 1プロセスに複数クライアントがあっても設定が混ざりません。
 *
 * ここにあるのは **再生エンジンのふるまい** に関わる設定だけです。
 * 応答の見せ方(埋め込み・ページ送りの件数・装飾など)は Bot の機能なので、
 * Bot 側(`client/`)が自分のコードで決めます。
 *
 * 既定値を持つだけで、すべて `music({ ... })` から差し替えられます。
 * 変更できない値は残していません。
 */
import { NoSubscriberBehavior } from "@discordjs/voice";
import { resolve } from "node:path";
import { DEFAULT_AUDIO_EXTENSIONS } from "./format.js";
import { resolveMusicTexts, type MusicTexts, type MusicTextsOptions } from "./texts.js";

/** 数量の上限。 */
export interface MusicLimits {
	/** 音量の上限(1 が原音)。 */
	readonly maxVolume: number;
	/** 再生済みとして保持する曲数。 */
	readonly historySize: number;
	/** 連続で再生に失敗したとき、何曲まで飛ばして試すか。 */
	readonly maxConsecutiveFailures: number;
}

/** ボイス接続の挙動。 */
export interface MusicVoiceConfig {
	/** 接続時に自分のマイクを塞ぐ(受信専用にする)。 */
	readonly selfDeaf: boolean;
	/** 接続完了を待つミリ秒。 */
	readonly readyTimeout: number;
	/** 一時的な切断からの復帰を待つミリ秒。 */
	readonly reconnectTimeout: number;
	/**
	 * 購読者(ボイス接続)がいないときの挙動。既定は `Pause` —
	 * 一時的に切断されても曲を消費してしまわないようにするためです。
	 * ボイス接続を張らずに再生を進めたいテストでは `Play` にします。
	 */
	readonly noSubscriberBehavior: NoSubscriberBehavior;
}

/** 音源の取得まわり。 */
export interface MusicNetworkConfig {
	/** このプラグインが外部へ出すリクエストの User-Agent(音源取得・メタデータ取得とも)。 */
	readonly userAgent: string;
	/** 音声ファイルとして扱う拡張子(小文字・ドットなし)。 */
	readonly audioExtensions: readonly string[];
	/**
	 * HTTP 音源でレスポンスヘッダーを待つ上限(ミリ秒)。DNS 解決と
	 * リダイレクトもこの時間に含みます。
	 */
	readonly requestTimeout: number;
	/** HTTP 音源で追従するリダイレクトの上限。 */
	readonly maxRedirects: number;
	/**
	 * プライベート・ループバック・link-local などのアドレスへの接続を
	 * 明示的に許可するホスト名または IP アドレス。完全一致で比較します。
	 * リダイレクト先は、そのホストも個別に許可する必要があります。
	 */
	readonly privateHostAllowlist: readonly string[];
}

export interface MusicConfig {
	readonly defaultVolume: number;
	readonly leaveOnEnd: number | false;
	readonly leaveOnEmpty: number | false;
	/** ローカル再生を許可する絶対パス。空ならローカル再生は無効。 */
	readonly localDirectories: readonly string[];
	/** エンジンが投げるエラーの文言。 */
	readonly texts: MusicTexts;
	/** 数量の上限。 */
	readonly limits: MusicLimits;
	/** ボイス接続の挙動。 */
	readonly voice: MusicVoiceConfig;
	/** 音源の取得まわり。 */
	readonly network: MusicNetworkConfig;
}

/**
 * {@link MusicConfig} の部分指定。指定しなかった項目は既定値のままです。
 * `music()` のオプションはこれを受け取ります。
 */
export interface MusicConfigOptions {
	/**
	 * 既定の音量(1 が原音)。
	 * @default 1
	 */
	defaultVolume?: number;
	/**
	 * キューが空になってから切断するまでのミリ秒。`false` で切断しない。
	 * @default 30000
	 */
	leaveOnEnd?: number | false;
	/**
	 * ボイスチャンネルが無人になってから切断するまでのミリ秒。
	 * `false` で切断しない。
	 * @default 30000
	 */
	leaveOnEmpty?: number | false;
	/**
	 * ローカルファイル再生を許可するディレクトリ。
	 * 指定した場合のみローカル用の Resolver / Provider が登録されます。
	 * ここで指定したディレクトリの外へは(シンボリックリンク経由でも)
	 * アクセスできません。
	 * @default [] (ローカル再生は無効)
	 */
	localDirectories?: readonly string[];
	/**
	 * エンジンが投げるエラーの文言。指定した項目だけが既定値を上書きします。
	 * @default {@link defaultMusicTexts}
	 */
	texts?: MusicTextsOptions;
	/** 数量の上限。指定した項目だけが既定値を上書きします。 */
	limits?: Partial<MusicLimits>;
	/** ボイス接続の挙動。指定した項目だけが既定値を上書きします。 */
	voice?: Partial<MusicVoiceConfig>;
	/** 音源の取得まわり。指定した項目だけが既定値を上書きします。 */
	network?: Partial<MusicNetworkConfig>;
}

const DEFAULT_LIMITS: MusicLimits = {
	maxVolume: 2,
	historySize: 50,
	maxConsecutiveFailures: 10,
};

const DEFAULT_VOICE: MusicVoiceConfig = {
	selfDeaf: true,
	readyTimeout: 20_000,
	reconnectTimeout: 5_000,
	noSubscriberBehavior: NoSubscriberBehavior.Pause,
};

const DEFAULT_NETWORK: MusicNetworkConfig = {
	userAgent: "cc-discord-framework-music",
	audioExtensions: DEFAULT_AUDIO_EXTENSIONS,
	requestTimeout: 15_000,
	maxRedirects: 5,
	privateHostAllowlist: [],
};

/** 部分指定を既定値へ重ねて、完全な設定にします。 */
export function resolveMusicConfig(options: MusicConfigOptions = {}): MusicConfig {
	const network = { ...DEFAULT_NETWORK, ...options.network };
	if (
		!Number.isFinite(network.requestTimeout) ||
		network.requestTimeout <= 0 ||
		network.requestTimeout > 2_147_483_647
	) {
		throw new RangeError("network.requestTimeout は 1〜2147483647 ミリ秒で指定してください");
	}
	if (!Number.isSafeInteger(network.maxRedirects) || network.maxRedirects < 0) {
		throw new RangeError("network.maxRedirects は 0 以上の安全な整数で指定してください");
	}

	return {
		defaultVolume: options.defaultVolume ?? 1,
		leaveOnEnd: options.leaveOnEnd ?? 30_000,
		leaveOnEmpty: options.leaveOnEmpty ?? 30_000,
		localDirectories: (options.localDirectories ?? []).map((dir) => resolve(dir)),
		texts: resolveMusicTexts(options.texts),
		limits: { ...DEFAULT_LIMITS, ...options.limits },
		voice: { ...DEFAULT_VOICE, ...options.voice },
		network: {
			...network,
			audioExtensions: [...network.audioExtensions],
			privateHostAllowlist: [...network.privateHostAllowlist],
		},
	};
}

/** 何も指定しないときの設定。 */
export const defaultMusicConfig: MusicConfig = resolveMusicConfig();

/**
 * そのクライアントに設定された music の設定を取り出します。
 * `music()` を入れていない場合や、クライアント以外から呼ばれた場合は既定値です。
 *
 * これがあるおかげで、インタラクションしか受け取らないヘルパーでも
 * 「どのクライアントの呼び出しか」を自分で判断でき、利用者が毎回
 * 設定を渡す必要がありません。
 */
export function musicConfigOf(source: { client?: unknown } | null | undefined): MusicConfig {
	const container = (source?.client as { container?: { musicConfig?: MusicConfig } } | undefined)
		?.container;
	return container?.musicConfig ?? defaultMusicConfig;
}

declare module "@cc-discord-framework/core" {
	interface Container {
		/** music プラグインの設定。install 時に設定されます。 */
		musicConfig: MusicConfig;
	}
}
