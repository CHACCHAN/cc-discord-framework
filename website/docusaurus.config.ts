import { themes as prismThemes } from "prism-react-renderer";
import tailwindcss from "@tailwindcss/postcss";
import type { Config, Plugin } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// このファイルは Node.js で実行されます(ブラウザ API・JSX は使えません)。

// Prism の既定テーマには、コード例の背景に対して 4.5:1 を下回る色があります。
// 同じ意味のトークンをまとめて上書きし、通常サイズでも読める配色にします。
const accessibleLightCodeTheme = {
	...prismThemes.github,
	plain: { color: "#2d1b14", backgroundColor: "#fff9f0" },
	styles: [
		...prismThemes.github.styles,
		{
			types: ["comment", "prolog", "doctype", "cdata"],
			style: { color: "#70594c", fontStyle: "italic" as const },
		},
		{ types: ["string", "attr-value"], style: { color: "#873c25" } },
		{
			types: ["entity", "url", "symbol", "number", "boolean", "variable", "constant", "property", "regex", "inserted"],
			style: { color: "#73401f" },
		},
		{ types: ["atrule", "attr-name"], style: { color: "#7b341e" } },
		{ types: ["function", "deleted"], style: { color: "#982d25" } },
		{ types: ["function-variable"], style: { color: "#6c3b2c" } },
		{ types: ["tag", "selector", "keyword"], style: { color: "#673421" } },
	],
};

const accessibleDarkCodeTheme = {
	...prismThemes.dracula,
	plain: { color: "#f9eadb", backgroundColor: "#1c110d" },
	styles: [
		...prismThemes.dracula.styles,
		{ types: ["comment"], style: { color: "#bda899", fontStyle: "italic" as const } },
		{ types: ["prolog", "constant", "builtin"], style: { color: "#e9b17f" } },
		{ types: ["inserted", "function"], style: { color: "#f0c39b" } },
		{ types: ["deleted"], style: { color: "#ff9e82" } },
		{ types: ["changed"], style: { color: "#e8b675" } },
		{ types: ["punctuation", "symbol"], style: { color: "#f9eadb" } },
		{ types: ["string", "char", "tag", "selector"], style: { color: "#e9a879" } },
		{ types: ["keyword", "variable"], style: { color: "#e7b88e", fontStyle: "italic" as const } },
		{ types: ["attr-name"], style: { color: "#f2d2ae" } },
	],
};

/** Docusaurus の CSS パイプラインへ Tailwind v4 の PostCSS 変換を追加します。 */
function tailwindPlugin(): Plugin {
	return {
		name: "tailwindcss-v4",
		configurePostCss(options) {
			options.plugins.push(tailwindcss());
			return options;
		},
	};
}

const config: Config = {
	title: "cc-discord-framework",
	tagline: "置くだけで、動く。discord.js のためのクラス指向フレームワーク",
	favicon: "img/favicon.ico",

	future: {
		v4: true,
	},

	url: "https://discord-framework.oss.cc-chacchan.com",
	baseUrl: "/",

	organizationName: "CHACCHAN",
	projectName: "cc-discord-framework",

	onBrokenLinks: "throw",

	// Cloudflare Pages は末尾スラッシュ付きを正規 URL とするため、true に
	// 揃えるとリダイレクト(308)なしで配信される。
	// https://developers.cloudflare.com/pages/configuration/serving-pages/
	trailingSlash: true,
	markdown: {
		// docs 内の ```mermaid フェンスを図として描画する(theme-mermaid とセット)。
		mermaid: true,
		hooks: {
			onBrokenMarkdownLinks: "throw",
		},
	},
	themes: ["@docusaurus/theme-mermaid"],

	i18n: {
		defaultLocale: "ja",
		locales: ["ja"],
	},

	presets: [
		[
			"classic",
			{
				docs: {
					sidebarPath: "./sidebars.ts",
					editUrl: "https://github.com/CHACCHAN/cc-discord-framework/edit/main/website/",
					// v2.0.0 のリリースで最初の Stable スナップショット(2.0)を作成済み。
					// /docs/ は Stable(2.0)を指し、main の変更は Next(/docs/next/)に載る。
					// 次のリリース時も `bun run --cwd website docusaurus docs:version <版>`
					// でスナップショットを切る。
					lastVersion: "2.0",
					versions: {
						current: {
							label: "v2 Next 🚧",
							banner: "unreleased",
						},
						"2.0": {
							label: "v2.0",
						},
					},
				},
				blog: {
					showReadingTime: true,
					blogTitle: "ブログ",
					blogDescription:
						"cc-discord-framework のリリース情報・技術記事",
					onInlineTags: "throw",
					onInlineAuthors: "throw",
					onUntruncatedBlogPosts: "warn",
				},
				theme: {
					customCss: "./src/css/custom.css",
				},
			} satisfies Preset.Options,
		],
	],
	plugins: [tailwindPlugin],

	themeConfig: {
		image: "img/social-card.png",
		announcementBar: {
			id: "v2-release-2026-08",
			// モバイルでも1行に収まる長さに抑える(リンクは1つに絞る)。
			content:
				'v2.0.0 を公開しました — <a href="/docs/framework/project-status/">旧 v1 パッケージとの違い</a>',
			backgroundColor: "#3b2016",
			textColor: "#fff6eb",
			isCloseable: true,
		},
		colorMode: {
			respectPrefersColorScheme: true,
		},
		navbar: {
			title: "cc-discord-framework",
			logo: {
				alt: "CC の耳を持つ熊。CC は CHACCHAN から",
				src: "img/logo.svg",
				srcDark: "img/logo-dark.svg",
			},
			items: [
				{
					type: "docSidebar",
					sidebarId: "docs",
					position: "left",
					label: "ドキュメント",
				},
				{
					type: "docSidebar",
					sidebarId: "plugins",
					position: "left",
					label: "プラグイン",
				},
				{
					type: "docSidebar",
					sidebarId: "api",
					position: "left",
					label: "API",
				},
				{ to: "/blog", label: "ブログ", position: "left" },
				{
					to: "/docs/framework/project-status",
					label: "ステータス",
					position: "right",
				},
				{
					type: "docsVersionDropdown",
					position: "right",
				},
				{
					href: "https://www.npmjs.com/package/@cc-discord-framework/core",
					label: "npm",
					position: "right",
				},
				{
					href: "https://github.com/CHACCHAN/cc-discord-framework",
					position: "right",
					className: "header-github-link",
					"aria-label": "GitHub リポジトリ",
				},
			],
		},
		footer: {
			style: "dark",
			links: [
				{
					title: "ドキュメント",
					items: [
						{ label: "はじめる", to: "/docs/framework/getting-started/installation" },
						{ label: "ガイド", to: "/docs/framework/guides/commands" },
						{ label: "公式プラグイン", to: "/docs/plugins/" },
					],
				},
				{
					title: "リソース",
					items: [
						{
							label: "GitHub",
							href: "https://github.com/CHACCHAN/cc-discord-framework",
						},
						{
							label: "npm",
							href: "https://www.npmjs.com/package/@cc-discord-framework/core",
						},
						{ label: "ブログ", to: "/blog" },
						{
							label: "バージョン状況",
							to: "/docs/framework/project-status",
						},
						{
							label: "Maintainer: CHACCHAN",
							href: "https://github.com/CHACCHAN",
						},
						{
							label: "Issues",
							href: "https://github.com/CHACCHAN/cc-discord-framework/issues",
						},
					],
				},
				{
					title: "開発者向け",
					items: [
						{
							label: "フレームワーク開発ドキュメント",
							href: "https://github.com/CHACCHAN/cc-discord-framework/tree/main/docs",
						},
						{
							label: "プラグイン開発ガイド",
							href: "https://github.com/CHACCHAN/cc-discord-framework/tree/main/docs/plugin-development",
						},
						{
							label: "Contributing",
							href: "https://github.com/CHACCHAN/cc-discord-framework/blob/main/CONTRIBUTING.md",
						},
					],
				},
			],
			copyright: `MIT License © ${new Date().getFullYear()} CHACCHAN — An open-source Discord framework from Japan 🇯🇵`,
		},
		prism: {
			theme: accessibleLightCodeTheme,
			darkTheme: accessibleDarkCodeTheme,
			additionalLanguages: ["bash", "json", "diff"],
		},
		mermaid: {
			// built-in テーマに任せて両モードの可読性を確保する(独自配色は当てない)。
			theme: { light: "neutral", dark: "dark" },
		},
	} satisfies Preset.ThemeConfig,
};

export default config;
