/**
 * 定期実行タスク — コンポーネント種別 `Task`(`tasks/` ディレクトリ)。
 */
import {
	Component,
	ComponentLoadError,
	ComponentStore,
	defineOptions,
	Events,
	type Awaitable,
	type ComponentOptions,
} from "@cc-discord-framework/core";
import { parseDuration, type DurationInput } from "./duration.js";

export interface TaskOptions extends ComponentOptions {
	/**
	 * 実行間隔。ミリ秒か `"1h"` `"30m"` のような期間表記。**必須**。
	 * 上限は約24.8日(2^31-1 ミリ秒)です — タイマーの遅延が 32bit を
	 * 超えると **1ms に化けて連発する** ため、超える指定はロード時に
	 * エラーになります。それより長い周期は run() 側で日付を見て
	 * 間引いてください。
	 */
	every: DurationInput;
	/** クライアントの ready 直後にも一度実行する。 @default false */
	runOnStart?: boolean;
	/**
	 * 前回の run() がまだ終わっていないときに、次の周期を重ねて
	 * 実行するか。既定では **重ねずにスキップ** します(遅い run() が
	 * 積み重なって暴走しないように)。
	 * @default false
	 */
	overlap?: boolean;
}

/**
 * 定期実行されるバックグラウンドジョブ。
 *
 * ```ts
 * // tasks/CleanupTask.ts — 置くだけで動く
 * import { Task } from "@cc-discord-framework/utils";
 *
 * @Task.define({ every: "1h", runOnStart: true })
 * export class CleanupTask extends Task {
 *   override async run() {
 *     this.logger.info("クリーンアップを実行します");
 *   }
 * }
 * ```
 */
export abstract class Task extends Component {
	/** 解決済みの実行間隔(ミリ秒)。 */
	declare public readonly every: number;
	declare public readonly runOnStart: boolean;
	/** 前回の run() の実行中に次の周期を重ねるか。 */
	declare public readonly overlap: boolean;

	/** タスクのメタデータを宣言します。`every` は必須です。 */
	public static define(options: TaskOptions) {
		return defineOptions<Task>(options);
	}

	public abstract run(): Awaitable<unknown>;
}

/** タイマーの遅延の上限(2^31-1 ミリ秒 ≒ 24.8日)。超えると 1ms に化ける。 */
const MAX_INTERVAL = 2 ** 31 - 1;

/** {@link Task} コンポーネントのストア。`tasks/` を走査し、稼働中はスケジュールを管理します。 */
export class TaskStore extends ComponentStore<Task> {
	readonly #timers = new Map<Task, ReturnType<typeof setInterval>>();
	/** 実行中の run()。重ね実行の抑止に使う(unload では中断しません)。 */
	readonly #running = new Set<Task>();

	public constructor() {
		super({ name: "tasks", base: Task });
	}

	protected override applyOptions(task: Task, options: TaskOptions): void {
		let every: number;
		try {
			every = parseDuration(options.every);
		} catch (error) {
			throw new ComponentLoadError(
				`タスク "${task.name}" の実行間隔が不正です — @Task.define({ every }) に 3600000 や "1h" を指定してください`,
				{ cause: error },
			);
		}
		if (every <= 0) {
			throw new ComponentLoadError(`タスク "${task.name}" には正の実行間隔が必要です`);
		}
		if (every > MAX_INTERVAL) {
			// setInterval の遅延は 32bit — 超えると 1ms に化けて連発する(実測済み)。
			throw new ComponentLoadError(
				`タスク "${task.name}" の実行間隔 ${every}ms はタイマーの上限` +
					`(${MAX_INTERVAL}ms ≒ 24.8日)を超えています。` +
					"それより長い周期は、短い間隔で起きて run() 側で日付を確かめてください",
			);
		}
		Object.assign(task, {
			every,
			runOnStart: options.runOnStart ?? false,
			overlap: options.overlap ?? false,
		});
	}

	protected override bind(task: Task): void {
		const client = this.container.client;
		if (client.isReady()) this.#start(task);
		else client.once(Events.ClientReady, () => this.#start(task));
	}

	protected override unbind(task: Task): void {
		const timer = this.#timers.get(task);
		if (timer !== undefined) {
			clearInterval(timer);
			this.#timers.delete(task);
		}
	}

	#start(task: Task): void {
		if (this.get(task.name) !== task) return; // ready 前にアンロードされた場合
		const execute = async () => {
			// 前回の run() がまだ走っているなら、この周期は飛ばす(既定)。
			// 遅い run() が interval ごとに積み重なって暴走しないように。
			if (!task.overlap && this.#running.has(task)) {
				task.logger.debug("前回の実行が終わっていないため、この周期をスキップします");
				return;
			}
			this.#running.add(task);
			try {
				await task.run();
			} catch (error) {
				task.logger.error({ err: error }, "タスクの実行に失敗しました");
			} finally {
				this.#running.delete(task);
			}
		};
		this.#timers.set(task, setInterval(execute, task.every));
		if (task.runOnStart) void execute();
	}
}
