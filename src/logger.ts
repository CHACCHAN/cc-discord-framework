import { pino, type Logger, type LoggerOptions } from "pino";

/**
 * クライアントの `logger` オプションを pino インスタンスへ解決します。
 *
 * - pino の `Logger` はそのまま採用(独自の transport / serializer を利用可)
 * - `LoggerOptions` は `pino()` へ渡して構築
 * - 省略時は `pino({ level: "info" })`
 */
export function resolveLogger(option?: Logger | LoggerOptions): Logger {
	if (isLogger(option)) return option;
	return pino({ level: "info", ...option });
}

function isLogger(option?: Logger | LoggerOptions): option is Logger {
	return (
		typeof option === "object" &&
		option !== null &&
		typeof (option as Logger).info === "function" &&
		typeof (option as Logger).child === "function"
	);
}
