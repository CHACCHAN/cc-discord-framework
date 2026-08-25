# 技術ロゴの出典

Hero では、フレームワークを構成する技術を事実として示すため、次の公式配布物を形状・配色を変えずに使用します。

- `typescript.svg`: [Microsoft / TypeScript-Website 公式リポジトリ](https://github.com/microsoft/TypeScript-Website/blob/v2/packages/typescriptlang-org/static/branding/ts-logo-512.svg)
- `bun.svg`: [oven-sh / bun 公式リポジトリ](https://github.com/oven-sh/bun/blob/main/docs/logo/logo.svg)
- `discordjs.svg`: [discord.js 公式リポジトリ](https://github.com/discordjs/discord.js/blob/main/apps/website/public/logo.svg)
- `ai-sdk.svg`: [Vercel AI SDK 公式リポジトリ](https://github.com/vercel/ai/blob/e21bde74c64351453ac82abeae07e00fe838ee9a/apps/docs/app/icon.svg)
- `openai.svg`: [OpenAI Cookbook 公式リポジトリ](https://github.com/openai/openai-cookbook/blob/51c769595490f7513d4bd7c6e7700a7ab8dedbd4/examples/agents_sdk/deployment_manager/frontend/src/openai-logomark.svg)
- `anthropic.svg`: [Anthropic TypeScript SDK 公式リポジトリ](https://github.com/anthropics/anthropic-sdk-typescript/blob/bfa9197f0182084941052be9752c948638421601/.github/logo.svg)
- Google Gemini のロゴ: このディレクトリには置かず、SVG を配布する [Simple Icons](https://simpleicons.org/) の CDN(`https://cdn.simpleicons.org/googlegemini`)から公式形状・公式色のまま読み込む

また、トップページの構成図(WASM の流れ図・処理の流れ)で使う単色の技術マーク
(TypeScript / Rust / Go / C / C++ / WebAssembly / Discord)は、
[Simple Icons](https://simpleicons.org/)(CC0)の公式形状パスを
`src/components/TechIcon/index.tsx` にインラインで持ち、currentColor の単色で描画します。
単色にするのは装飾を抑えて周囲のタイポグラフィに馴染ませるためで、形状は変更しません。

各名称とロゴは、それぞれの権利者に帰属します。cc-discord-framework のロゴへの合成や、各プロジェクトによる推薦を示す用途には使用しません。
