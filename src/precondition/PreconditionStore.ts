import { FrameworkError } from "../errors.js";
import { ComponentStore } from "../component/ComponentStore.js";
import type { CommandRunPayload } from "../events.js";
import { Precondition, type PreconditionResult } from "./Precondition.js";

/** {@link Precondition} コンポーネントのストア。`preconditions/` を走査します。 */
export class PreconditionStore extends ComponentStore<Precondition> {
	public constructor() {
		super({ name: "preconditions", base: Precondition });
	}

	/**
	 * Precondition 名は {@link Preconditions} インターフェースのキーと
	 * 一致させるため、大文字小文字を保持します
	 * (`OwnerOnlyPrecondition` → `OwnerOnly`)。
	 */
	protected override deriveName(className: string): string {
		const suffix = "Precondition";
		return className.endsWith(suffix) && className.length > suffix.length
			? className.slice(0, -suffix.length)
			: className;
	}

	/**
	 * コマンド呼び出しに対して指定された Precondition を順番に実行し、
	 * 最初の拒否で停止します。
	 *
	 * @throws FrameworkError 呼び出されたフローを Precondition が実装して
	 * いない場合。設定ミスは黙って通過させず、明示的に失敗させます。
	 */
	public async run(
		names: readonly string[],
		payload: CommandRunPayload & { type: "chatInput" | "message" },
	): Promise<PreconditionResult> {
		for (const name of names) {
			const precondition = this.get(name);
			if (!precondition) {
				// 通常は起動時検証で検出済み。遅延ロードに対する防御。
				throw new FrameworkError(`未知の Precondition "${name}" です`);
			}

			let result: PreconditionResult;
			if (payload.type === "chatInput") {
				if (!precondition.chatInputRun) {
					throw new FrameworkError(
						`Precondition "${name}" は chatInputRun を実装していませんが、スラッシュコマンド "${payload.command.name}" をガードしています`,
					);
				}
				result = await precondition.chatInputRun(payload.interaction, payload.command);
			} else {
				if (!precondition.messageRun) {
					throw new FrameworkError(
						`Precondition "${name}" は messageRun を実装していませんが、メッセージコマンド "${payload.command.name}" をガードしています`,
					);
				}
				result = await precondition.messageRun(payload.message, payload.command);
			}

			if (!result.ok) return result;
		}
		return { ok: true };
	}
}
