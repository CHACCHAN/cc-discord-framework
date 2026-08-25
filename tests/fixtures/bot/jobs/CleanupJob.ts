import { Job } from "../../job-kind.js";

export const cleanups: number[] = [];

/** プラグインが追加した種別が自動探索されることの検証用。 */
@Job.define({ intervalMs: 1000 })
export class CleanupJob extends Job {
	override run() {
		cleanups.push(this.intervalMs);
	}
}
