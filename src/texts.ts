/**
 * **フレームワークがユーザーへ返す文言**のカタログ。
 *
 * ここにあるのは、コマンドランタイムが Discord 上のエンドユーザーへ
 * そのまま返信する文言だけです。開発者向けのログや例外の文言は
 * 含まれません(それらは Discord へは送られません)。
 *
 * ここにある文言は **すべて差し替えられます**。ハードコードされていて
 * 変えられない文言は存在しません。
 *
 * ```ts
 * new Client({ texts: { guildOnly: "This command is server-only." } })
 * ```
 */

export interface ClientTexts {
	/** ギルド内が前提の権限チェックを持つコマンドがギルド外(DM など)から呼ばれた。 */
	guildOnly: string;
	/** 実行者の権限が不足している(引数は不足している権限名の一覧)。 */
	missingUserPermissions: (permissions: readonly string[]) => string;
	/** Bot の権限が不足している(引数は不足している権限名の一覧)。 */
	missingClientPermissions: (permissions: readonly string[]) => string;
	/**
	 * 権限情報そのものを取得できなかった。権限名の代わりに
	 * {@link ClientTexts.missingUserPermissions} /
	 * {@link ClientTexts.missingClientPermissions} の一覧へ渡されます。
	 */
	unknownPermissions: string;
	/** コマンドが予期しないエラーで失敗した。 */
	commandError: string;
}

/**
 * 何も指定しないときの文言。丸ごと差し替えるより、必要な項目だけを
 * `new Client({ texts: { guildOnly: "..." } })` のように上書きするほうが
 * 安全です。
 */
export const defaultClientTexts: ClientTexts = {
	guildOnly: "このコマンドはサーバー内でのみ使用できます。",
	missingUserPermissions: (permissions) =>
		`実行に必要な権限が不足しています: ${permissions.join(", ")}`,
	missingClientPermissions: (permissions) =>
		`Botに必要な権限が不足しています: ${permissions.join(", ")}`,
	unknownPermissions: "不明(権限情報を取得できません)",
	commandError: "コマンドの実行中にエラーが発生しました。",
};

/** {@link ClientTexts} の部分指定。指定しなかった項目は既定値のままです。 */
export type ClientTextsOptions = Partial<ClientTexts>;

/** 部分指定を既定値へ重ねて、完全な文言カタログにします。 */
export function resolveClientTexts(options: ClientTextsOptions = {}): ClientTexts {
	return { ...defaultClientTexts, ...options };
}
