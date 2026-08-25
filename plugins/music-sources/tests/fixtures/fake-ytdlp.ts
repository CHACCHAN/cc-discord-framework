/**
 * テスト用の偽 yt-dlp。`bun <このファイル> -J ...` として呼ばれ、
 * 渡された引数を無視して opus(webm)の再生情報だけを返します。
 */
console.log(
	JSON.stringify({ url: "https://audio.example.invalid/a.webm", ext: "webm", acodec: "opus" }),
);
