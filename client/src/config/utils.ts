/**
 * utils プラグイン — 定期実行(`tasks/`)・確認 UI・ページ送り・整形。
 * 見た目は theme で変えられます。
 *
 * `priority: 100` で、他の層より先にインストールされます。テーマ
 * (`container.theme`)と `this.services.ui` を用意するのがこの層で、
 * music や ai の出力はそれに乗って表示されるためです。土台が先に入って
 * いれば、後の層は自分の見せ方を考えなくて済みます。
 *
 * `priority` は大きいほど先で、書かなければ 0 です(同じ値ならファイル
 * パス順)。この1行が、ファイルを分けても順序を決められるという仕組みの
 * 実例になっています。
 */
import { defineConfig } from "cc-discord-framework";
import { utils } from "@cc-discord-framework/utils";

export default defineConfig({
	priority: 100,
	plugins: [utils()],
});
