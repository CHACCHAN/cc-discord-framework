/**
 * サードパーティのプラグイン作者が書くのと同じ形の、最小のカスタム
 * コンポーネント種別。拡張点の証明に使います: 新しい種別の追加に
 * コアの変更は不要です。
 */
import type { Awaitable } from "discord.js";
import {
	Component,
	ComponentStore,
	definePlugin,
	defineOptions,
	type ComponentOptions,
} from "../../src/index.js";

export interface JobOptions extends ComponentOptions {
	intervalMs?: number;
}

export abstract class Job extends Component {
	declare public readonly intervalMs: number;

	public static define(options: JobOptions = {}) {
		return defineOptions<Job>(options);
	}

	public abstract run(): Awaitable<unknown>;
}

export class JobStore extends ComponentStore<Job> {
	public constructor() {
		super({ name: "jobs", base: Job });
	}

	protected override applyOptions(job: Job, options: JobOptions): void {
		Object.assign(job, { intervalMs: options.intervalMs ?? 60_000 });
	}

	public async runAll(): Promise<void> {
		for (const job of this.values()) await job.run();
	}
}

export function jobPlugin() {
	return definePlugin({
		name: "jobs",
		install(client) {
			client.stores.register(new JobStore());
		},
	});
}
