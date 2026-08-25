/**
 * `AiTool` の検証。**ネットワークにも API キーにも触りません。**
 */
import { describe, expect, test } from "bun:test";
import { Client, ComponentLoadError } from "@cc-discord-framework/core";
import { z } from "zod";
import {
	ai,
	AiEvents,
	AiTool,
	type AiErrorInfo,
	type AiToolContext,
} from "../src/index.js";
import {
	createAiClient,
	mockModel,
	mockRecordingModel,
	mockToolCallingModel,
} from "./helpers.js";

const echoInput = z.object({ name: z.string().optional() });

@AiTool.define({ description: "受け取った名前を返します。", inputSchema: echoInput })
class EchoTool extends AiTool<z.infer<typeof echoInput>> {
	override execute(args: z.infer<typeof echoInput>, context: AiToolContext) {
		return {
			echoed: args.name ?? "なし",
			// サービスへ到達できることを確かめる(import せずに触れるのが要点)。
			viaServices: this.services.ai.config.maxSteps,
			guildId: context.guildId,
			userId: context.userId,
		};
	}
}

@AiTool.define({ description: "必ず失敗します。", inputSchema: z.object({}) })
class BoomTool extends AiTool<Record<string, never>> {
	override execute(): never {
		throw new Error("壊れた");
	}
}

@AiTool.define({ description: "終わりません。", inputSchema: z.object({}) })
class SlowTool extends AiTool<Record<string, never>> {
	override async execute(): Promise<string> {
		await Bun.sleep(1_000);
		return "遅い";
	}
}

@AiTool.define({ description: "無効なツール。", inputSchema: z.object({}), enabled: false })
class DisabledTool extends AiTool<Record<string, never>> {
	override execute() {
		return "呼ばれない";
	}
}

@AiTool.define({ description: "サーバー限定。", inputSchema: z.object({}), guildOnly: true })
class GuildOnlyTool extends AiTool<Record<string, never>> {
	override execute() {
		return "サーバー内";
	}
}

/** デコレータを付け忘れたツール。 */
class NoMetadataTool extends AiTool<Record<string, never>> {
	override execute() {
		return null;
	}
}

@AiTool.define({ description: "", inputSchema: z.object({}) })
class EmptyDescriptionTool extends AiTool<Record<string, never>> {
	override execute() {
		return null;
	}
}

/** inputSchema を書き忘れたツール(型では止まるので、あえて外して確かめる)。 */
@AiTool.define({ description: "スキーマなし。" } as never)
class NoSchemaTool extends AiTool<Record<string, never>> {
	override execute() {
		return null;
	}
}

@AiTool.define({ description: "あ。", inputSchema: z.object({}) })
class ZebraTool extends AiTool<Record<string, never>> {
	override execute() {
		return null;
	}
}

@AiTool.define({ description: "い。", inputSchema: z.object({}) })
class AlphaTool extends AiTool<Record<string, never>> {
	override execute() {
		return null;
	}
}

const emptyContext: AiToolContext = { guildId: null, userId: null, channelId: null };

describe("ロード", () => {
	test("ai/ から自動探索される", async () => {
		const client = new Client({
			intents: [],
			baseDirectory: new URL("./fixtures/", import.meta.url),
			logger: { level: "silent" },
			plugins: [ai()],
		});
		await client.load();

		const store = client.stores.get("ai");
		// クラス名から種別サフィックスを外した名前になる。
		expect([...store.keys()]).toEqual(["server-info"]);
		expect(store.get("server-info")?.description).toBe("このサーバーの情報を返します。");
		await client.destroy();
	});

	test("明示登録した名前はクラス名から導出される", async () => {
		const client = createAiClient();
		client.register(EchoTool, BoomTool);
		await client.load();
		expect([...client.stores.get("ai").keys()].sort()).toEqual(["boom", "echo"]);
		await client.destroy();
	});

	test("description が無ければロード時に落ちる", async () => {
		const client = createAiClient();
		client.register(NoMetadataTool);
		const error = await client.load().catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(ComponentLoadError);
		expect((error as Error).message).toContain("description");
		await client.destroy();
	});

	test("inputSchema が無ければロード時に落ちる", async () => {
		const client = createAiClient();
		client.register(NoSchemaTool);
		const error = await client.load().catch((cause: unknown) => cause);
		expect(error).toBeInstanceOf(ComponentLoadError);
		expect((error as Error).message).toContain("inputSchema");
		await client.destroy();
	});

	test("description が空文字でも落ちる", async () => {
		const client = createAiClient();
		client.register(EmptyDescriptionTool);
		await expect(client.load()).rejects.toBeInstanceOf(ComponentLoadError);
		await client.destroy();
	});
});

describe("toToolSet", () => {
	test("AI SDK の形になる", async () => {
		const client = createAiClient();
		client.register(EchoTool);
		await client.load();

		const set = client.stores.get("ai").toToolSet(emptyContext);
		expect(Object.keys(set)).toEqual(["echo"]);
		expect(set.echo?.description).toBe("受け取った名前を返します。");
		expect(set.echo?.inputSchema).toBeDefined();
		expect(typeof set.echo?.execute).toBe("function");
		await client.destroy();
	});

	test("登録順によらず名前順に並ぶ(モデルへ渡す順が安定する)", async () => {
		const client = createAiClient();
		client.register(ZebraTool, AlphaTool, EchoTool);
		await client.load();
		expect(Object.keys(client.stores.get("ai").toToolSet(emptyContext))).toEqual([
			"alpha",
			"echo",
			"zebra",
		]);
		await client.destroy();
	});

	test("enabled: false と guildOnly が効く", async () => {
		const client = createAiClient();
		client.register(EchoTool, DisabledTool, GuildOnlyTool);
		await client.load();
		const store = client.stores.get("ai");

		// 無効なツールはどちらの場合も入らない。
		expect(Object.keys(store.toToolSet(emptyContext))).toEqual(["echo"]);
		expect(Object.keys(store.toToolSet({ ...emptyContext, guildId: "g1" })).sort()).toEqual([
			"echo",
			"guild-only",
		]);
		await client.destroy();
	});

	test("tools.enabled: false なら AiService.tools() は空", async () => {
		const client = createAiClient({ tools: { enabled: false } });
		client.register(EchoTool);
		await client.load();
		expect(client.container.services.ai.tools()).toEqual({});
		// ストアには読まれている(渡さないだけ)。
		expect(client.stores.get("ai").size).toBe(1);
		await client.destroy();
	});

	test("既定では登録済みのツール全部が渡る", async () => {
		const client = createAiClient();
		client.register(EchoTool, BoomTool);
		await client.load();
		expect(Object.keys(client.container.services.ai.tools()).sort()).toEqual(["boom", "echo"]);
		await client.destroy();
	});
});

describe("実行", () => {
	test("モデルから呼べて、中で this.services が使える", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("echo", { name: "太郎" }, "呼びました"),
			maxSteps: 3,
		});
		client.register(EchoTool);
		await client.load();

		const result = await client.container.services.ai.generate({
			prompt: "呼んで",
			context: { guildId: "g1", userId: "u1", channelId: "c1" },
		});
		expect(result.text).toBe("呼びました");
		expect(result.toolResults[0]?.output).toEqual({
			echoed: "太郎",
			viaServices: 3,
			guildId: "g1",
			userId: "u1",
		});
		await client.destroy();
	});

	test("aiToolCall が発火する", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("echo", { name: "花子" }, "はい"),
		});
		client.register(EchoTool);
		await client.load();

		const seen: string[] = [];
		client.on(AiEvents.ToolCall, (tool, input) => {
			seen.push(`${tool.name}:${JSON.stringify(input)}`);
		});
		await client.container.services.ai.generate({ prompt: "呼んで" });
		expect(seen).toEqual(['echo:{"name":"花子"}']);
		await client.destroy();
	});

	test("失敗しても会話は死なず、エラー内容がモデルへ返る", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("boom", {}, "失敗を踏まえた答え"),
		});
		client.register(BoomTool);
		await client.load();

		const result = await client.container.services.ai.generate({ prompt: "呼んで" });
		expect(result.text).toBe("失敗を踏まえた答え");
		expect(result.toolResults[0]?.output).toEqual({
			error: 'ツール "boom" の実行に失敗しました: 壊れた',
		});
		await client.destroy();
	});

	test("失敗の文言は差し替えられる", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("boom", {}, "はい"),
			texts: { toolFailed: (tool, message) => `${tool} が ${message} で死んだ` },
		});
		client.register(BoomTool);
		await client.load();

		const result = await client.container.services.ai.generate({ prompt: "呼んで" });
		expect(result.toolResults[0]?.output).toEqual({ error: "boom が 壊れた で死んだ" });
		await client.destroy();
	});

	test("aiError にリスナーがいれば既定動作(ログ)は走らない", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("boom", {}, "はい"),
		});
		client.register(BoomTool);
		await client.load();

		const infos: AiErrorInfo[] = [];
		client.on(AiEvents.Error, (_error, info) => infos.push(info));
		await client.container.services.ai.generate({
			prompt: "呼んで",
			context: { channelId: "c1", userId: "u1", guildId: "g1" },
		});

		expect(infos).toEqual([
			{ phase: "tool", tool: "boom", channelId: "c1", userId: "u1", guildId: "g1" },
		]);
		await client.destroy();
	});

	test("tools.timeout を超えると打ち切られ、その旨がモデルへ返る", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("slow", {}, "諦めました"),
			tools: { timeout: 20 },
		});
		client.register(SlowTool);
		await client.load();

		const result = await client.container.services.ai.generate({ prompt: "呼んで" });
		expect(result.toolResults[0]?.output).toMatchObject({
			error: expect.stringContaining("時間内"),
		});
		await client.destroy();
	});

	test("tools.timeout: false なら打ち切らない(既定の 30s より長い処理も通る)", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("slow", {}, "終わりました"),
			tools: { timeout: false },
		});
		client.register(SlowTool);
		await client.load();

		const result = await client.container.services.ai.generate({ prompt: "呼んで" });
		expect(result.toolResults[0]?.output).toBe("遅い");
		await client.destroy();
	});

	test("tools: false を渡すとツールなしで生成する", async () => {
		const client = createAiClient({ model: mockModel("素の答え") });
		client.register(EchoTool);
		await client.load();

		const seen: string[][] = [];
		client.on(AiEvents.Request, (request) => seen.push([...request.toolNames]));
		expect(await client.container.services.ai.ask("やあ", { tools: false })).toBe("素の答え");
		expect(seen).toEqual([[]]);
		await client.destroy();
	});
});

describe("生成の設定がモデルへ届く", () => {
	test("instructions は設定の既定 → 呼び出しごとの指定 の順で効く", async () => {
		const fromConfig = mockRecordingModel("はい");
		const config = createAiClient({ model: fromConfig.model, instructions: "あなたは猫" });
		await config.load();
		await config.container.services.ai.ask("やあ");
		expect(fromConfig.calls[0]?.prompt[0]).toEqual({ role: "system", content: "あなたは猫" });
		await config.destroy();

		const overridden = mockRecordingModel("はい");
		const client = createAiClient({ model: overridden.model, instructions: "あなたは猫" });
		await client.load();
		await client.container.services.ai.ask("やあ", { instructions: "あなたは犬" });
		expect(overridden.calls[0]?.prompt[0]).toEqual({ role: "system", content: "あなたは犬" });
		await client.destroy();
	});

	test("instructions を指定しなければ system メッセージは付かない", async () => {
		const recording = mockRecordingModel("はい");
		const client = createAiClient({ model: recording.model });
		await client.load();
		await client.container.services.ai.ask("やあ");
		expect(recording.calls[0]?.prompt[0]?.role).toBe("user");
		await client.destroy();
	});

	test("instructions: null で既定の指示を打ち消せる", async () => {
		const recording = mockRecordingModel("はい");
		const client = createAiClient({ model: recording.model, instructions: "あなたは猫" });
		await client.load();
		await client.container.services.ai.ask("やあ", { instructions: null });
		expect(recording.calls[0]?.prompt[0]?.role).toBe("user");
		await client.destroy();
	});

	test("temperature / maxOutputTokens が渡る", async () => {
		const recording = mockRecordingModel("はい");
		const client = createAiClient({
			model: recording.model,
			temperature: 0.3,
			maxOutputTokens: 64,
		});
		await client.load();
		await client.container.services.ai.ask("やあ");
		expect(recording.calls[0]?.temperature).toBe(0.3);
		expect(recording.calls[0]?.maxOutputTokens).toBe(64);
		await client.destroy();
	});

	test("既定では temperature も maxOutputTokens も渡さない(プロバイダーの既定に任せる)", async () => {
		const recording = mockRecordingModel("はい");
		const client = createAiClient({ model: recording.model });
		await client.load();
		await client.container.services.ai.ask("やあ");
		expect(recording.calls[0]?.temperature).toBeUndefined();
		expect(recording.calls[0]?.maxOutputTokens).toBeUndefined();
		await client.destroy();
	});

	test("maxSteps が stopWhen に反映される", async () => {
		const one = createAiClient({
			model: mockToolCallingModel("echo", {}, "続きの答え"),
			maxSteps: 1,
		});
		one.register(EchoTool);
		await one.load();
		const stopped = await one.container.services.ai.generate({ prompt: "呼んで" });
		// 1ステップで打ち切られるので、ツール結果を踏まえた本文は返らない。
		expect(stopped.steps.length).toBe(1);
		expect(stopped.text).toBe("");
		await one.destroy();

		const many = createAiClient({
			model: mockToolCallingModel("echo", {}, "続きの答え"),
			maxSteps: 3,
		});
		many.register(EchoTool);
		await many.load();
		const finished = await many.container.services.ai.generate({ prompt: "呼んで" });
		expect(finished.steps.length).toBe(2);
		expect(finished.text).toBe("続きの答え");
		await many.destroy();
	});

	test("呼び出しごとに maxSteps を上書きできる", async () => {
		const client = createAiClient({
			model: mockToolCallingModel("echo", {}, "続きの答え"),
			maxSteps: 5,
		});
		client.register(EchoTool);
		await client.load();
		const result = await client.container.services.ai.generate({ prompt: "呼んで", maxSteps: 1 });
		expect(result.steps.length).toBe(1);
		await client.destroy();
	});
});
