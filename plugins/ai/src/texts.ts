/**
 * ユーザーに見える文言のカタログ。
 *
 * このプラグインが出す文字列は **すべてここに集約されていて、すべて
 * 差し替えられます**。ハードコードされていて変えられない文言は存在しません。
 *
 * ```ts
 * ai({ texts: { thinking: "考え中…" } })
 * ```
 *
 * 絵文字も文言の一部としてそのまま含めています。設定を二重化しないため、
 * 絵文字だけを差し替える枠は用意していません — 文言ごと差し替えてください。
 *
 * **本文の組み立て自体も差し替えられます。** {@link AiTexts.answerBody} は
 * 回答・引用元・使用ツール・トークン数の断片を受け取って1つの本文にする
 * 関数で、並び順・区切り・空行まで利用者が決められます(music の
 * `queueBody` / `nowPlayingBody` と同じ形)。
 *
 * ストリーミング中のカーソル記号だけは
 * {@link AiStreamConfig.cursor `stream.cursor`} 側にあります(間隔などの
 * ストリーミング設定と一緒に並べたほうが分かりやすいため)。もちろん
 * そちらも差し替えられます。
 *
 * ここに載るのは **このプラグインが出す文言だけ** です。コマンドの説明文や
 * 「履歴を消しました」のような Bot の応答は Bot の機能なので、Bot 側の
 * コードで持ってください。
 */
import type { generateText, LanguageModelUsage } from "ai";

/**
 * 引用元(モデルが Web 検索などで参照した先)。
 * AI SDK は `Source` 型を公開していないので、結果の型から取り出しています。
 */
export type AiSource = Awaited<ReturnType<typeof generateText>>["sources"][number];

/**
 * 応答の意味づけ。埋め込みの色に反映されます。
 * `"error"` は生成に失敗したことを応答へ表示するときに使われます。
 */
export type AiReplyKind = "success" | "info" | "error";

/**
 * {@link AiTexts.answerBody} に渡る断片。
 *
 * 整形済みの文字列と生の値の両方が入るので、既定の整形を流用することも、
 * 生の値から作り直すこともできます。
 */
export interface AiAnswerParts {
	/** モデルが返した本文(ストリーミング中は途中まで)。空のこともあります。 */
	readonly answer: string;
	/**
	 * ストリーミング中に本文の末尾へ添える記号
	 * ({@link AiStreamConfig.cursor})。最後の1回と非ストリーミング時は `null`。
	 */
	readonly cursor: string | null;
	/** {@link AiTexts.sourceLine} で整形済みの引用元。無ければ空配列。 */
	readonly sources: readonly string[];
	/** {@link AiTexts.toolLine} で整形済みの、呼ばれたツール。無ければ空配列。 */
	readonly tools: readonly string[];
	/** {@link AiTexts.usageLine} で整形済みのトークン数。判らなければ `null`。 */
	readonly usage: string | null;
	/** 引用元(生の値)。 */
	readonly rawSources: readonly AiSource[];
	/** 呼ばれたツール名(生の値・重複なし・呼ばれた順)。 */
	readonly rawTools: readonly string[];
	/** トークン数(生の値)。判らなければ `null`。 */
	readonly rawUsage: LanguageModelUsage | null;
	/** まだ生成中か。最後の1回だけ `false` になります。 */
	readonly streaming: boolean;
	/**
	 * 生成が失敗したときの、整形済みのエラー文言
	 * ({@link AiTexts.generationFailed} を通したもの)。成功なら `null`。
	 *
	 * **失敗した場合もこの関数が呼ばれます。** `answer` には途中まで
	 * 生成された本文が残っているので、「途中までの回答を残してエラーを
	 * 添える」も「失敗時もヘッダーを付ける」もここで書けます。
	 * 既定の実装は `failure` だけを出します。
	 */
	readonly failure: string | null;
}

export interface AiTexts {
	// ---- 応答 --------------------------------------------------------------

	/** 生成が始まる前・本文がまだ空のときの仮表示。 */
	thinking: string;
	/** モデルが空の応答を返した。 */
	emptyResponse: string;
	/** `limits.maxResponseLength` で切り詰めたときに末尾へ付ける印。 */
	truncated: string;
	/** 引用元の見出し。 */
	sourcesHeader: string;
	/**
	 * 引用元1件。`position` は1始まり、`title` は題名(無ければ URL)、
	 * `url` は URL(文書ソースなど URL が無ければ `null`)。
	 */
	sourceLine: (position: number, title: string, url: string | null) => string;
	/**
	 * 使用ツールの見出し。
	 *
	 * **既定の {@link AiTexts.answerBody} では使われません** — 既定の本文は
	 * 回答と引用元だけを出すためです。使用ツールも見せたい場合は
	 * `answerBody` を差し替えて、この見出しと {@link AiTexts.toolLine} を
	 * 使ってください(断片は常に計算されて渡っています)。
	 */
	toolsHeader: string;
	/** 使用ツール1件。 */
	toolLine: (name: string) => string;
	/** トークン数の行。判らない項目は `null` で渡ります。 */
	usageLine: (input: number | null, output: number | null, total: number | null) => string;
	/**
	 * 応答の本文全体。断片の並べ方(見出し・空行・順序)まで ここで決まります。
	 * `texts` には解決後のカタログが入るので、既定の見出しを流用できます。
	 *
	 * 既定の実装は「本文(+カーソル)」と「引用元」だけを出します。
	 * 使用ツールやトークン数も出したい場合は、この関数を差し替えてください
	 * — 断片は常に計算されて渡っています。
	 *
	 * **生成に失敗したときもここを通ります**({@link AiAnswerParts.failure}
	 * にエラー文言が入り、`answer` には途中まで生成された本文が残ります)。
	 */
	answerBody: (parts: AiAnswerParts, texts: AiTexts) => string;

	// ---- エラー ------------------------------------------------------------

	/** 使うモデルが決まっていない。 */
	modelNotConfigured: string;
	/** モデル指定の書式が `"<provider>:<modelId>"` になっていない。 */
	modelIdInvalid: (id: string) => string;
	/** 同梱リゾルバが知らないプロバイダー名だった。 */
	providerUnknown: (provider: string, known: readonly string[]) => string;
	/** プロバイダーのパッケージが入っていない。 */
	providerNotInstalled: (provider: string, packageName: string) => string;
	/** API キーが見つからない(`variable` は既定の環境変数名)。 */
	apiKeyMissing: (provider: string, variable: string) => string;
	/** `compatible` に `baseURL` / `name` が設定されていない。 */
	compatibleNotConfigured: string;
	/** 入力が空だった。 */
	promptEmpty: string;
	/** 入力が長すぎた。 */
	promptTooLong: (length: number, max: number) => string;
	/** 生成が制限時間を超えた。 */
	timedOut: (ms: number) => string;
	/** クールダウン中。 */
	cooldown: (remainingMs: number) => string;
	/**
	 * ツールの実行が失敗した。この文言は **AI へ返されます**
	 * (会話全体を止めず、モデルが失敗を踏まえて続けられるようにするため)。
	 */
	toolFailed: (tool: string, message: string) => string;
	/** ツールの実行が `tools.timeout` を超えた。 */
	toolTimedOut: (tool: string, ms: number) => string;
	/**
	 * プロバイダーが HTTP エラーを返したときの言い換え。
	 *
	 * `status` はステータスコード、`message` はプロバイダーが返した文言です。
	 * ここを通した結果が {@link AiTexts.generationFailed} へ渡ります
	 * (状態を見て言い換えたい場合はここを差し替えてください —
	 * 例えば 401 だけ「APIキーを確認してください」にする)。
	 */
	apiCallFailed: (status: number, message: string) => string;
	/**
	 * 生成そのものが失敗したときに、Discord の応答へ出す本文
	 * ({@link AiService.reply} が使います)。
	 */
	generationFailed: (message: string) => string;
}

/**
 * 何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
 * `ai({ texts: { thinking: "考え中…" } })` のように上書きするほうが安全です。
 */
export const defaultAiTexts: AiTexts = {
	thinking: "考えています…",
	emptyResponse: "応答がありませんでした。",
	truncated: "…(以下省略)",
	sourcesHeader: "**引用元:**",
	sourceLine: (position, title, url) =>
		url === null ? `\`${position}.\` ${title}` : `\`${position}.\` [${title}](${url})`,
	toolsHeader: "**使用ツール:**",
	toolLine: (name) => `\`${name}\``,
	usageLine: (input, output, total) =>
		`トークン: 入力 ${input ?? "?"} / 出力 ${output ?? "?"} / 合計 ${total ?? "?"}`,
	answerBody: ({ answer, cursor, sources, failure }, texts) => {
		// 失敗したときはエラー文言だけを出す。途中まで出ていた本文も添えたい
		// 場合は、この関数を差し替えて `answer` を使ってください。
		if (failure !== null) return failure;
		// 本文がまだ空なら仮表示を出す(カーソルだけの空メッセージにしない)。
		const head = answer.length === 0 ? texts.thinking : answer;
		const body = cursor === null ? head : head + cursor;
		// 引用元は本文との間を1行空けて末尾へ。
		return sources.length === 0 ? body : [body, "", texts.sourcesHeader, ...sources].join("\n");
	},

	modelNotConfigured:
		"使用するモデルが設定されていません。" +
		'`ai({ model: "google:gemini-2.5-flash" })` のように指定してください。',
	modelIdInvalid: (id) =>
		`モデルの指定 "${id}" を解釈できません。` +
		'`"<プロバイダー>:<モデルID>"`(例: `"openai:gpt-5"`)の形で指定してください。',
	providerUnknown: (provider, known) =>
		`プロバイダー "${provider}" は解決できません` +
		`(解決できるのは ${known.join(" / ")})。` +
		"足したい場合は `ai({ providerLoaders })`、" +
		"OpenAI 互換 API なら `compatible` を使ってください。",
	providerNotInstalled: (provider, packageName) =>
		`プロバイダー "${provider}" を使うには ${packageName} が必要です。\`bun add ${packageName}\` を実行してください。`,
	apiKeyMissing: (provider, variable) =>
		`プロバイダー "${provider}" の API キーが見つかりません。` +
		`環境変数 ${variable} を設定するか、` +
		`\`ai({ providers: { ${provider}: { apiKey } } })\` で渡してください。`,
	compatibleNotConfigured:
		"`compatible` を使うには接続先の設定が必要です。" +
		"`ai({ providers: { compatible: { name, baseURL } } })` を指定してください" +
		'(例: Ollama なら `baseURL: "http://localhost:11434/v1"`)。',
	promptEmpty: "入力が空です。",
	promptTooLong: (length, max) => `入力が長すぎます(${length} 文字 / 上限 ${max} 文字)。`,
	timedOut: (ms) => `応答が時間内(${Math.round(ms / 1000)} 秒)に返りませんでした。`,
	cooldown: (remainingMs) =>
		`連続では使えません。あと ${Math.ceil(remainingMs / 1000)} 秒お待ちください。`,
	toolFailed: (tool, message) => `ツール "${tool}" の実行に失敗しました: ${message}`,
	toolTimedOut: (tool, ms) =>
		`ツール "${tool}" が時間内(${Math.round(ms / 1000)} 秒)に終わりませんでした。`,
	// ステータスコードは診断にそのまま効くので既定で添える
	// (401 ならキー、429 なら制限、5xx なら相手側 — と切り分けられる)。
	apiCallFailed: (status, message) => `${message}(HTTP ${status})`,
	generationFailed: (message) => `応答の生成に失敗しました: ${message}`,
};

/** {@link AiTexts} の部分指定。指定しなかった項目は既定値のままです。 */
export type AiTextsOptions = Partial<AiTexts>;

/** 部分指定を既定値へ重ねて、完全な文言カタログにします。 */
export function resolveAiTexts(options: AiTextsOptions = {}): AiTexts {
	return { ...defaultAiTexts, ...options };
}
