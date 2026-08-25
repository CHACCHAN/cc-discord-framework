/** 自動探索(`ai/`)で読まれることを確かめるための置きもの。 */
import { z } from "zod";
import { AiTool } from "../../../src/index.js";

const input = z.object({ 詳細: z.boolean().optional() });

@AiTool.define({ description: "このサーバーの情報を返します。", inputSchema: input })
export class ServerInfoTool extends AiTool<z.infer<typeof input>> {
	override execute(args: z.infer<typeof input>, context: { guildId: string | null }) {
		return { guildId: context.guildId, 詳細: args.詳細 ?? false };
	}
}
