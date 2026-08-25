import { describe, expect, test } from "bun:test";
import { join } from "node:path";

interface PackageManifest {
	readonly dependencies?: Readonly<Record<string, string>>;
	readonly devDependencies?: Readonly<Record<string, string>>;
	readonly optionalDependencies?: Readonly<Record<string, string>>;
	readonly peerDependencies?: Readonly<Record<string, string>>;
	readonly files?: readonly string[];
	readonly exports?: Readonly<Record<string, string | Readonly<Record<string, string>>>>;
	readonly scripts?: Readonly<Record<string, string>>;
}

const ROOT = join(import.meta.dir, "..");
const PLUGINS = ["utils", "music", "music-sources", "ai"] as const;

describe("公開パッケージの manifest", () => {
	test("公開インストールでは開発専用セルフリンクを自動実行しない", async () => {
		const manifest = (await Bun.file(join(ROOT, "package.json")).json()) as PackageManifest;

		expect(manifest.scripts?.postinstall).toBeUndefined();
		expect(manifest.scripts?.["link:self"]).toBe("bun run scripts/link-self.ts");
	});

	test("AI プロバイダーはコアではなく利用する参照 Bot が所有する", async () => {
		const core = (await Bun.file(join(ROOT, "package.json")).json()) as PackageManifest;
		const clientFile = Bun.file(join(ROOT, "client", "package.json"));
		const client = (await clientFile.json()) as PackageManifest;
		const providers = ["@ai-sdk/openai", "@ai-sdk/openai-compatible"];

		for (const name of providers) {
			expect(core.dependencies?.[name]).toBeUndefined();
			expect(client.dependencies?.[name]).toBeDefined();
		}
	});

	test("公式プラグインは pack 前に dist を生成する", async () => {
		for (const name of PLUGINS) {
			const manifest = (await Bun.file(
				join(ROOT, "plugins", name, "package.json"),
			).json()) as PackageManifest;
			const rootExport = manifest.exports?.["."];

			expect(manifest.scripts?.prepack).toBe("bun run clean && bun run build");
			expect(manifest.files).toContain("dist");
			expect(typeof rootExport).toBe("object");
			if (typeof rootExport === "object") {
				expect(rootExport.types).toStartWith("./dist/");
				expect(rootExport.import).toStartWith("./dist/");
			}
		}
	});

	test("公開 manifest の依存指定に workspace プロトコルを残さない", async () => {
		for (const name of PLUGINS) {
			const manifest = (await Bun.file(
				join(ROOT, "plugins", name, "package.json"),
			).json()) as PackageManifest;
			const dependencyGroups = [
				manifest.dependencies,
				manifest.devDependencies,
				manifest.optionalDependencies,
				manifest.peerDependencies,
			];

			for (const dependencies of dependencyGroups) {
				for (const version of Object.values(dependencies ?? {})) {
					expect(version).not.toContain("workspace:");
				}
			}
		}
	});
});

describe("README の導入経路", () => {
	test("v2 はスコープ付きパッケージ名で案内する", async () => {
		const readme = await Bun.file(join(ROOT, "README.md")).text();

		expect(readme).toContain("bun add @cc-discord-framework/core");
		expect(readme).toContain("npm の `cc-discord-framework`(スコープなし)は互換性のない");
		// 旧 GitHub 指定の導入案内は公開後に撤去済み。
		expect(readme).not.toContain("bun add github:CHACCHAN/cc-discord-framework");
	});

	test("リポジトリ開発ではセルフリンクを明示実行する", async () => {
		const readme = await Bun.file(join(ROOT, "README.md")).text();

		expect(readme).toContain("bun run link:self");
	});
});

describe("DISCORD_TOKEN の案内", () => {
	test("利用者向け文書はフレームワークが環境変数を解決すると説明する", async () => {
		const paths = [
			join(ROOT, "website", "docs", "framework", "guides", "environment.md"),
			join(ROOT, "website", "docs", "framework", "advanced", "example-bot.md"),
		];

		for (const path of paths) {
			const document = await Bun.file(path).text();
			expect(document).toContain("Client.login()");
			expect(document).toContain("Bun.env.DISCORD_TOKEN");
			expect(document).not.toContain("discord.js が `login()` の中で");
		}
	});
});
