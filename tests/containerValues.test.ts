import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ContainerLoadError } from "../src/index.js";
import { createTestClient } from "./helpers.js";
import { log } from "./fixtures/container-order/container/_log.js";
import { log as partialLog } from "./fixtures/container-partial-failure/container/_log.js";

/** container/ を持つフィクスチャの baseDirectory。 */
function fixture(name: string): string {
	return join(import.meta.dir, "fixtures", name);
}

/** 型を気にせずコンテナの動的プロパティを読むためのビュー。 */
function valuesOf(client: ReturnType<typeof createTestClient>): Record<string, unknown> {
	return client.container as unknown as Record<string, unknown>;
}

describe("container/ ディレクトリの自動読み込み", () => {
	test("ファイル名の camelCase 導出・name の明示・サブディレクトリ・_ スキップ", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-bot") });
		await client.load();

		const values = valuesOf(client);
		// my-db.ts → myDb
		expect(values.myDb).toEqual({ kind: "db" });
		// named.ts は name: "renamed" を明示(ファイル名由来の named は生えない)
		expect(values.named).toBeUndefined();
		// async create が await され、create にコンテナが渡っている
		expect(values.renamed).toEqual({ hasClient: true });
		// group/nested.ts も読み込まれる
		expect(values.nested).toBe("nested-value");
		// _shared.ts は対象外(読み込まれたら create が無いのでロードが失敗している)

		await client.destroy();
	});

	test("baseDirectory が null なら何も読み込まない", async () => {
		const client = createTestClient();
		await client.load();
		expect(valuesOf(client).myDb).toBeUndefined();
		await client.destroy();
	});

	test("生成はパスの昇順、破棄は destroy 時に逆順(失敗しても続行)", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-order") });
		await client.load();
		expect(log).toEqual(["create:aFirst", "create:bSecond"]);

		// b-second の dispose は throw するが、destroy は止まらず a-first も破棄される。
		await client.destroy();
		expect(log).toEqual([
			"create:aFirst",
			"create:bSecond",
			"dispose:bSecond",
			"dispose:aFirst",
		]);
	});

	test("途中で失敗したら、生成済みの値はその場で後始末してから失敗を伝える", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-partial-failure") });
		await expect(client.load()).rejects.toThrow(/b-boom\.ts のコンテナ値の作成/);
		// a-ok は生成済みなので、失敗を伝える前に dispose されている
		// (destroy() を呼ばずに終了しても接続などが取り残されない)。
		expect(partialLog).toEqual(["create:aOk", "dispose:aOk"]);
	});

	test("同じ名前を2ファイルが定義すると起動時に失敗する", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-duplicate") });
		await expect(client.load()).rejects.toThrow(/"same" が .* で衝突しています/);
	});

	test("コンテナの既存プロパティと衝突する名前は起動時に失敗する", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-collision") });
		await expect(client.load()).rejects.toThrow(/既存プロパティと衝突しています/);
	});

	test("defineContainerValue の形でない default export は起動時に失敗する", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-invalid") });
		await expect(client.load()).rejects.toThrow(/defineContainerValue\({ create: \(\) => \.\.\. }\)/);
	});

	test("プロパティ名として使えないファイル名は起動時に失敗する", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-bad-name") });
		await expect(client.load()).rejects.toThrow(/プロパティ名として使えません/);
	});

	test("create の失敗は ContainerLoadError に包まれて path を持つ", async () => {
		const client = createTestClient({ baseDirectory: fixture("container-create-throws") });
		try {
			await client.load();
			expect.unreachable("load() は失敗するはず");
		} catch (error) {
			expect(error).toBeInstanceOf(ContainerLoadError);
			expect((error as ContainerLoadError).path).toMatch(/boom\.ts$/);
			expect(((error as ContainerLoadError).cause as Error).message).toBe("create failed");
		}
	});
});
