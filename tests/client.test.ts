import { describe, expect, spyOn, test } from "bun:test";
import { createTestClient } from "./helpers.js";

describe("クライアント", () => {
	test("login() の引数を省略すると DISCORD_TOKEN を使う", async () => {
		const previousToken = Bun.env.DISCORD_TOKEN;
		const client = createTestClient();
		const webSocket = client.ws as unknown as { connect(): Promise<void> };
		const connect = spyOn(webSocket, "connect").mockImplementation(async () => {});
		Bun.env.DISCORD_TOKEN = "environment-token";

		try {
			expect(await client.login()).toBe("environment-token");
			expect(client.token).toBe("environment-token");
			expect(connect).toHaveBeenCalledTimes(1);
		} finally {
			connect.mockRestore();
			if (previousToken === undefined) delete Bun.env.DISCORD_TOKEN;
			else Bun.env.DISCORD_TOKEN = previousToken;
			await client.destroy();
		}
	});

	test("login() の明示トークンは DISCORD_TOKEN より優先する", async () => {
		const previousToken = Bun.env.DISCORD_TOKEN;
		const client = createTestClient();
		const webSocket = client.ws as unknown as { connect(): Promise<void> };
		const connect = spyOn(webSocket, "connect").mockImplementation(async () => {});
		Bun.env.DISCORD_TOKEN = "environment-token";

		try {
			expect(await client.login("explicit-token")).toBe("explicit-token");
			expect(client.token).toBe("explicit-token");
			expect(connect).toHaveBeenCalledTimes(1);
		} finally {
			connect.mockRestore();
			if (previousToken === undefined) delete Bun.env.DISCORD_TOKEN;
			else Bun.env.DISCORD_TOKEN = previousToken;
			await client.destroy();
		}
	});
});
