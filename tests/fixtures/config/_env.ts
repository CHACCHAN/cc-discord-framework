/**
 * "_" 始まりのファイル — 設定ファイルとしては読み込まれず、設定ファイルが
 * import する共有コードの置き場になります。
 *
 * default export が「読み込まれてしまったら分かる」値になっているのは、
 * この規約が実際に効いていることをテストで確かめるためです。
 */
export const GUILD_IDS = ["100", "200"];

export default {
	applicationGuildIds: ["_SHOULD_NOT_LOAD"],
};
