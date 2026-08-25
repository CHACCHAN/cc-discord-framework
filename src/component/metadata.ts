import type { Component } from "./Component.js";

/**
 * デコレータメタデータ基盤。
 *
 * フレームワークは標準(TC39 / TypeScript 5+)デコレータのみを使用します。
 * クラスデコレータは宣言的なオプションを `context.metadata` へ書き込み、
 * ストアがロード時に読み出します。「宣言」と「実行」は厳密に分離されて
 * おり、デコレータがストア・クライアント・I/O に触れることはありません。
 *
 * ランタイムはクラスのメタデータオブジェクトを `Symbol.metadata` に
 * 配置します。Bun(および tsc の ESNext 出力を Bun が実行する場合)は
 * 登録シンボル `Symbol.for("Symbol.metadata")` を使うため、書き込み側と
 * 読み出し側は必ず一致します。
 */
export const METADATA_KEY: symbol =
	(Symbol as { metadata?: symbol }).metadata ?? Symbol.for("Symbol.metadata");

/** メタデータオブジェクト内でコンポーネントオプションを保持するキー。 */
const OPTIONS_KEY = Symbol.for("cc-discord-framework.componentOptions");

/**
 * ローダーから見た具象コンポーネントクラス: 引数なしで構築できること。
 * インスタンスの初期化は構築後にフレームワークが行うため、コンポーネントの
 * コンストラクタがフレームワーク由来の引数を受け取ることはありません。
 */
export type ComponentClass<T extends Component = Component> = new () => T;

/** 抽象クラスも許容するコンポーネントクラス型 — デコレータが受け取る型。 */
export type AbstractComponentClass<T extends Component = Component> = abstract new () => T;

/**
 * `options` をコンポーネントメタデータとして記録するクラスデコレータを
 * 生成します。
 *
 * すべての `X.define(...)` デコレータ — プラグインが追加するカスタム種別の
 * ものも含めて — の唯一のプリミティブです:
 *
 * ```ts
 * export abstract class Task extends Component {
 *   static define(options: TaskOptions = {}) {
 *     return defineOptions<Task>(options);
 *   }
 * }
 * ```
 *
 * ジェネリクスにより、意図した基底クラスを継承していないクラスへの適用は
 * コンパイルエラーになります — `Listener<"clientReady">` のサブクラスに
 * `@Listener.define({ event: "messageCreate" })` は付けられません。
 */
export function defineOptions<T extends Component>(options: object) {
	return (_target: AbstractComponentClass<T>, context: ClassDecoratorContext): void => {
		if (context.kind !== "class") {
			throw new TypeError("コンポーネントオプションはクラスにのみ定義できます");
		}
		const metadata = context.metadata as Record<symbol, unknown>;
		// 同じクラスの下段デコレータが書いたオプションとマージする。
		// 継承されたメタデータ(プロトタイプチェーン)には触れない。
		const own = Object.getOwnPropertyDescriptor(metadata, OPTIONS_KEY)?.value as
			| object
			| undefined;
		metadata[OPTIONS_KEY] = { ...own, ...options };
	};
}

/**
 * クラスのコンポーネントオプションをマージして読み出します。
 *
 * メタデータオブジェクトはプロトタイプチェーンで継承されるため、基底クラス
 * に宣言したオプションはサブクラスにも適用されます。マージは浅く、ルート
 * から順に行われます — 具象クラスに近い側の宣言が勝ちます。
 */
export function getComponentOptions(cls: object): Record<string, unknown> {
	const layers: object[] = [];
	let metadata = (cls as Record<symbol, unknown>)[METADATA_KEY] as object | null | undefined;
	while (metadata) {
		const own = Object.getOwnPropertyDescriptor(metadata, OPTIONS_KEY)?.value as
			| object
			| undefined;
		if (own) layers.unshift(own);
		metadata = Object.getPrototypeOf(metadata) as object | null;
	}
	return Object.assign({}, ...layers) as Record<string, unknown>;
}

/**
 * `cls` 自身に直接宣言されたオプションのみを読み出します(継承分は除く)。
 *
 * `name` のような同一性フィールドは自身のオプションからのみ解決するため、
 * デコレータのないサブクラスが親の名前を黙って引き継ぐことはありません。
 */
export function getOwnComponentOptions(cls: object): Record<string, unknown> | undefined {
	const metadata = Object.getOwnPropertyDescriptor(cls, METADATA_KEY)?.value as
		| object
		| undefined;
	if (!metadata) return undefined;
	return Object.getOwnPropertyDescriptor(metadata, OPTIONS_KEY)?.value as
		| Record<string, unknown>
		| undefined;
}
