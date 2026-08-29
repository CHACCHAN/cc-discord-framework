import { basename, join } from "node:path";
import type { Client } from "./client.js";
import type { Container } from "./container.js";
import { collectModuleFiles } from "./discovery.js";
import { ContainerLoadError } from "./errors.js";

/**
 * `container/` ディレクトリの1ファイルが定義する、コンテナへ登録する値。
 *
 * Prisma クライアントや Redis 接続のような「プロジェクト全体で共有したい
 * インスタンス」の置き場を規約で決めるための仕組みです。ファイルを置くだけで
 * 起動時に {@link Container} へ登録され、どのコンポーネントからも
 * `this.container.<名前>` で参照できます。
 */
export interface ContainerValueDefinition<T = unknown> {
	/**
	 * コンテナ上のプロパティ名。省略するとファイル名から導出されます
	 * (`prisma.ts` → `prisma`、`my-db.ts` → `myDb`、`user_store.ts` → `userStore`)。
	 */
	name?: string;
	/**
	 * 値を作るファクトリ。async でもかまいません。クライアント毎に呼ばれる
	 * ため、モジュールレベルでインスタンスを作らずに済みます(複数クライアント
	 * 構成やテストでも状態が混ざりません)。
	 */
	create: (container: Container) => T | Promise<T>;
	/**
	 * `client.destroy()` 時の後始末(Prisma の `$disconnect()` など)。省略可。
	 * 読み込みの逆順で呼ばれます。
	 */
	dispose?: (value: T, container: Container) => unknown;
}

/**
 * 型付けだけの関数({@link defineConfig} / {@link definePlugin} と同じ役割)。
 * `container/` のファイルは必ずこれを default export します:
 *
 * ```ts
 * // container/prisma.ts
 * export default defineContainerValue({
 *   create: () => new PrismaClient(),
 *   dispose: (prisma) => prisma.$disconnect(),
 * });
 *
 * // 型はコアの他の拡張と同じく宣言マージで付けます:
 * declare module "@cc-discord-framework/core" {
 *   interface Container {
 *     prisma: PrismaClient;
 *   }
 * }
 * ```
 *
 * これで、どのコンポーネントからも `this.container.prisma` で参照できます。
 */
export function defineContainerValue<T>(
	definition: ContainerValueDefinition<T>,
): ContainerValueDefinition<T> {
	return definition;
}

/** @internal 読み込み済みのコンテナ値1件。破棄(dispose)のために保持します。 */
export interface LoadedContainerValue {
	/** コンテナ上のプロパティ名。 */
	readonly name: string;
	/** 読み込み元ファイルの絶対パス。 */
	readonly path: string;
	/** 後始末。定義に無ければ何もしない関数です。 */
	readonly dispose: (container: Container) => Promise<void>;
}

/** コンテナのプロパティ名として通す形(宣言マージでそのまま書ける名前)。 */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * @internal `<baseDirectory>/container` を走査して、各ファイルの定義する値を
 * `client.container` へ登録します。{@link Client.load} から呼ばれます。
 *
 * ファイルの収集規則は {@link collectModuleFiles} と同じです — サブディレクトリ
 * も対象、`_` 始まりのファイル・ディレクトリは対象外(値の定義ではない共有
 * コードは `container/_shared.ts` のように置きます)。
 *
 * 登録はパスの昇順に **逐次** 行います(ロード順を決定的にするため)。
 * ファクトリには初期化済みのコンテナが渡るので、`client` やプラグインの設定
 * (`container.<name>Config`)を参照できます。
 */
export async function loadContainerValues(client: Client): Promise<LoadedContainerValue[]> {
	if (client.baseDirectory === null) return [];

	const root = join(client.baseDirectory, "container");
	const paths = await collectModuleFiles(root);
	const container = client.container;

	const loaded: LoadedContainerValue[] = [];
	const origins = new Map<string, string>();

	try {
		await loadInto(loaded, origins, paths, container);
	} catch (error) {
		// 途中で失敗したら、すでに生成した値をその場で逆順に後始末してから
		// 失敗を伝える(load() が失敗した Bot は destroy() を呼ばずに終了する
		// ことが多く、DB 接続などを開いたまま取り残さないため)。
		for (const value of [...loaded].reverse()) {
			try {
				await value.dispose(container);
			} catch (disposeError) {
				client.logger.error(
					{ err: disposeError, value: value.name },
					"container 値の破棄に失敗しました",
				);
			}
		}
		throw error;
	}

	return loaded;
}

/** 1ファイルずつ値を生成してコンテナへ登録します(失敗時の後始末は呼び出し側)。 */
async function loadInto(
	loaded: LoadedContainerValue[],
	origins: Map<string, string>,
	paths: readonly string[],
	container: Container,
): Promise<void> {
	for (const path of paths) {
		const definition = await importDefinition(path);
		const name = resolveName(definition, path);

		const origin = origins.get(name);
		if (origin !== undefined) {
			throw new ContainerLoadError(
				`コンテナ値の名前 "${name}" が ${origin} と ${path} で衝突しています。` +
					"どちらかを name オプションで別の名前にしてください。",
				{ path },
			);
		}
		// `in` はプロトタイプの getter(services)や、プラグインが install で
		// 生やした設定(aiConfig など)も拾う。既存の値を黙って潰さない。
		if (name in container) {
			throw new ContainerLoadError(
				`コンテナ値の名前 "${name}"(${path})は、コンテナの既存プロパティと衝突しています。` +
					"name オプションで別の名前を指定してください。",
				{ path },
			);
		}

		let value: unknown;
		try {
			value = await definition.create(container);
		} catch (error) {
			throw new ContainerLoadError(`${path} のコンテナ値の作成(create)に失敗しました`, {
				cause: error,
				path,
			});
		}

		(container as unknown as Record<string, unknown>)[name] = value;
		origins.set(name, path);
		loaded.push({
			name,
			path,
			dispose: async (target) => {
				await definition.dispose?.(value, target);
			},
		});
	}
}

/** 1ファイルを import して、defineContainerValue の形であることを確かめます。 */
async function importDefinition(path: string): Promise<ContainerValueDefinition> {
	let module: { default?: unknown };
	try {
		module = (await import(path)) as { default?: unknown };
	} catch (error) {
		throw new ContainerLoadError(`${path} のインポートに失敗しました`, { cause: error, path });
	}

	const definition = module.default;
	if (
		typeof definition !== "object" ||
		definition === null ||
		typeof (definition as ContainerValueDefinition).create !== "function"
	) {
		throw new ContainerLoadError(
			`${path} にはコンテナ値定義の default export が必要です — ` +
				"export default defineContainerValue({ create: () => ... }) と書いてください。" +
				"値の定義ではない共有コード(接続文字列の組み立てなど)は、" +
				'読み込み対象から外れる "_" 始まりのファイル(container/_shared.ts など)に置いてください。',
			{ path },
		);
	}

	return definition as ContainerValueDefinition;
}

/** 定義とファイル名からコンテナ上のプロパティ名を決めます。 */
function resolveName(definition: ContainerValueDefinition, path: string): string {
	const name = definition.name ?? camelCase(basename(path).replace(/\.[^.]+$/, ""));
	if (!IDENTIFIER.test(name)) {
		throw new ContainerLoadError(
			`${path} から導出したコンテナ値の名前 "${name}" はプロパティ名として使えません。` +
				'defineContainerValue({ name: "..." }) で名前を明示してください。',
			{ path },
		);
	}
	return name;
}

/** `my-db` / `user_store` のような区切りを camelCase にします。 */
function camelCase(word: string): string {
	return word.replace(/[-_]+(.)/g, (_, next: string) => next.toUpperCase());
}
