# AGENTS.md — Working Guide for AI Agents

Rules for every AI agent (Claude / Codex / others) working in this repository.
Human-facing material lives in `docs/` (contributors) and `website/` (public user site).

## What this is

**cc-discord-framework** — a Bun-only, class-oriented Discord bot framework built on discord.js 14.
The core idea is convention-based auto-loading ("drop a file in, and it works"). discord.js is fully
re-exported, and `Client` extends the discord.js Client.

```
src/          Framework core
plugins/      Official plugins (utils / music / music-sources / ai) — workspace members
client/       Production reference bot (NOT a sample — the owner runs it on their own server)
docs/         Developer documentation (contributors, plugin authors)
website/      Docusaurus public site (for users; different role from docs/ — never plain-copy between them)
scripts/      link-self.ts (self-link: node_modules/@cc-discord-framework/core -> repo root)
```

## Absolute rules (violations = rework)

1. **Never create an unoverridable value.** For anything user-visible — colors, text, symbols, limits —
   defaults are fine; unchangeable is forbidden. Text goes into the `texts` catalogs
   (core: `src/texts.ts`, each plugin: its own `src/texts.ts`); numbers/behavior go into config.
2. **Standard TC39 decorators only.** Never reintroduce `experimentalDecorators` / `reflect-metadata`.
   The build target must stay **ESNext** (lowering it silently drops `context.metadata` under Bun).
3. **No module-level mutable state.** Distribute config via `client.container.<name>Config`
   (so multiple clients never share state).
4. **Plugin/bot boundary:** plugins provide component-kind auto-loading, services, events, and engine
   config — nothing else. **Plugins never register slash commands.** Bot features are written
   explicitly in `client/src/`.
5. **Project language is Japanese.** Code comments, JSDoc, error messages, and documentation are
   written in calm, explanatory Japanese. No emoji in code comments. (This instruction file is in
   English for agent performance; the deliverables stay Japanese.)
6. **git commit / push only when the user asks.** npm publishing happens via GitHub Release
   `published` → Actions. Never publish on a plain push.

## Validation commands (always run after changes)

```bash
bun test                        # all tests (root run covers plugins too)
bun run typecheck               # core; also run per plugins/* and client/
bun run build                   # core + each plugin tsc build
cd client && bun run check      # offline boot check (validates loading of every component)
bun run website:build           # website (onBrokenLinks: throw — broken links fail the build)
```

There is a **mutation-testing culture** here: after fixing something, temporarily break the fix and
confirm a test fails, then restore. If no test fails, add one.

## Implementation conventions

- **Config triple:** `XOptions` (partial input) → `resolveXConfig()` (merge onto defaults) →
  `XConfig` (resolved, readonly). Read back via `xConfigOf(source)`. Export defaults as `defaultXConfig`.
- **Component kinds:** subclass `ComponentStore` + `stores.register()` + `Stores` declaration merging.
  Directory name = store name. Use the `suffix` option only when the directory word differs from the
  class-name suffix (e.g. `ai/` holding `AiTool` classes → `suffix: "Tool"`).
- **Services:** converge on `this.services.<name>` via `Services` declaration merging. Cross-plugin
  integration goes through services (plugins never import each other).
- **package.json exports:** write the **`"bun"` condition BEFORE `"types"`** (the reverse makes
  TypeScript typecheck against stale `dist/` types — this caused real damage once).
  `files` must include both `src` and `dist` (Bun consumers read src).
- **Optional peers + dynamic import:** never statically import optional dependencies
  (`@ai-sdk/*` etc.) — startup would crash when they're absent. See `plugins/ai/src/models.ts`.
- **Errors:** anything shown to end users derives from `UserError`. Fail loud — never swallow.
  Event default actions follow the "only when zero listeners" pattern.

## Known traps (all actually hit in this repo)

- `baseDirectory` and the config directory (`src/config/`) are derived from **`Bun.main`
  (the entry file's location)**. Moving the entry file empties every component store with no error.
  Never move `client/src/index.ts`.
- `setInterval` delays cap at 2^31-1 ms (~24.8 days); beyond that they degrade to ~1 ms rapid-fire
  (Task's `every` validates this at load time).
- AI SDK v7 does not surface failures through `textStream` — without an `onError` hook, a 401 turns
  into a bare `NoOutputGeneratedError` (already handled; beware when writing similar code).
- Some endpoints return an empty response with no error when tools are sent to a model without
  function-calling support.
- Never write tests that depend on a package being ABSENT (they break the moment a user runs
  `bun add`). Point loaders at nonexistent package names instead.
- `plugins/`, `docs/`, etc. are untracked (invisible to `git diff`). Verify changes via hashes or builds.

## Documentation split

| Reader | Location |
|---|---|
| People **using** the framework/plugins | `website/docs/` (framework / plugins / api) |
| People **developing** the framework | `docs/architecture/` `docs/development/` |
| People **authoring** plugins | `docs/plugin-development/` |

Never write the same content in both places. The website is Docusaurus (ja locale,
`trailingSlash: true`). The API reference is regenerated from TypeDoc via
`bun run --cwd website api:generate` and committed (not generated at build time).
If you touch a Mermaid diagram under `docs/`, run it through syntax validation.

## Tools available in the devcontainer (all verified working)

The environment is provisioned with agent work in mind. Check here before assuming a tool is missing.

| Tool | Location / invocation | Purpose |
|---|---|---|
| Bun 1.4 / Node 24 | `bun` / `node` | run, test, build |
| **Playwright** | `playwright-cli` (Chromium installed) | **Visual verification and screenshots of the website.** `open --browser=chromium <url>` → `screenshot --filename=...` → `close`. If the CLI/browser versions drift, run `playwright-cli install-browser` |
| yt-dlp | `/usr/local/bin/yt-dlp` | YouTube stream URLs (music-sources runtime requirement; e2e checks) |
| ffmpeg | `/usr/bin/ffmpeg` | SoundCloud/HLS transcoding; synthesizing test audio (`-f lavfi -i sine=...`) |
| agy CLI | `~/.local/bin/agy` | Web-search-backed research (normally used through the web-scout agent, not directly) |
| gltf-transform | `bunx gltf-transform` (website devDependency) | Inspect/optimize glTF assets for the 3D mascot (BearScene). Visual tuning happens on the dev-only page `/bear-lab` (`bun run website:dev`) |
| python3 3.13 / jq / git / curl / unzip | on PATH | scripting, JSON processing |

Verify site appearance, mobile layout, and dark mode by **actually opening pages with Playwright and
taking screenshots** (after `bun run website:preview`) — not by grepping CSS.

## Current status notes (as of 2026-08)

- v2 ships on npm as **`@cc-discord-framework/core`@2.0.0** (renamed from the unscoped
  `cc-discord-framework`, whose npm latest remains the incompatible legacy v1.0.5). The four
  plugins publish as `@cc-discord-framework/{utils,music,music-sources,ai}`@1.0.0. Future packages
  accumulate under the `@cc-discord-framework` npm org.
- The publish workflow publishes core + all four plugins in dependency order via npm Trusted
  Publishing (OIDC, no tokens), skipping versions already on the registry. Each package needs a
  Trusted Publisher registered on npmjs.com (repo `CHACCHAN/cc-discord-framework`, workflow
  `publish.yml`) — the owner manages those registrations.
- The website (`website/`) has NOT been updated for the package rename yet: it still shows the old
  package name and "npm 未公開" notices, and runs under the "Next 🚧" banner. A dedicated
  post-publish site pass is planned (rename sweep, TypeDoc regeneration, install pages, and the
  first Stable snapshot via `bun run --cwd website docusaurus docs:version 2.0`).
- Running `client/` requires `yt-dlp` (YouTube) and `ffmpeg` (SoundCloud) on the host. The bot still
  boots without them.
