import { Service } from "../../../../src/index.js";

@Service.define()
export class CounterService extends Service {
	#count = 0;

	public increment(): number {
		return ++this.#count;
	}

	public get count(): number {
		return this.#count;
	}
}
