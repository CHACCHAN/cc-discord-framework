/**
 * 会話履歴の置き場。
 *
 * 既定はメモリ内の履歴({@link MapMemoryStore})です。
 * Redis や DB に置きたい場合は {@link AiMemoryStore} を実装して
 * `ai({ memory: { store } })` に渡してください。
 */
import type { Awaitable } from "cc-discord-framework";
import type { ModelMessage } from "ai";

/**
 * 会話履歴の読み書き口。**メソッドはこの3つだけ**です — 保存先を
 * 差し替えるのに必要な最小限に保っています。
 *
 * 件数の上限({@link AiMemoryConfig.maxMessages})は
 * {@link AiService} 側が読み出し時に適用するので、実装側で気にする必要は
 * ありません(メモリを節約したい実装は書き込み時にも切って構いません)。
 */
export interface AiMemoryStore {
	/** キーの履歴を古い順に返します。無ければ空配列。 */
	get(key: string): Awaitable<ModelMessage[]>;
	/** キーの履歴の末尾へ追記します。 */
	append(key: string, messages: readonly ModelMessage[]): Awaitable<void>;
	/** キーの履歴を消します。 */
	clear(key: string): Awaitable<void>;
}

/** {@link MapMemoryStore} の設定。 */
export interface MapMemoryStoreOptions {
	/**
	 * 保持する件数。超えた分は古いものから捨てます。
	 * @default 20
	 */
	readonly maxMessages?: number;
	/**
	 * 最後の書き込みからの有効期間(ミリ秒)。`false` で無期限。
	 * @default false
	 */
	readonly ttl?: number | false;
}

interface Entry {
	messages: ModelMessage[];
	updatedAt: number;
}

/**
 * Map ベースの既定実装。プロセスが生きているあいだだけ覚えています。
 *
 * **タイマーは持ちません** — TTL 切れは取得時に捨てるだけなので、
 * クライアントを終了させるのに後始末が要りません。
 */
export class MapMemoryStore implements AiMemoryStore {
	readonly #entries = new Map<string, Entry>();
	readonly #maxMessages: number;
	readonly #ttl: number | false;

	public constructor(options: MapMemoryStoreOptions = {}) {
		this.#maxMessages = Math.max(0, options.maxMessages ?? 20);
		this.#ttl = options.ttl ?? false;
	}

	public get(key: string): ModelMessage[] {
		const entry = this.#entries.get(key);
		if (!entry) return [];
		if (this.#expired(entry)) {
			this.#entries.delete(key);
			return [];
		}
		return [...entry.messages];
	}

	public append(key: string, messages: readonly ModelMessage[]): void {
		if (messages.length === 0) return;
		if (this.#maxMessages === 0) return;

		const existing = this.#entries.get(key);
		const previous = existing && !this.#expired(existing) ? existing.messages : [];
		const merged = [...previous, ...messages];
		this.#entries.set(key, {
			messages: merged.slice(-this.#maxMessages),
			updatedAt: Date.now(),
		});
	}

	public clear(key: string): void {
		this.#entries.delete(key);
	}

	/** 覚えているキーの数(テストと診断のため)。 */
	public get size(): number {
		return this.#entries.size;
	}

	#expired(entry: Entry): boolean {
		return this.#ttl !== false && Date.now() - entry.updatedAt >= this.#ttl;
	}
}
