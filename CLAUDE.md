@AGENTS.md

## Claude Code: use the subagents aggressively

Three agents are defined in `~/.claude/agents/`. **Re-read the definition files before using them.**
Owner's policy: codex and web-scout (gemini) are "practically unlimited" — feel free to use them in
bulk, even for rough work.

| Agent | Backed by | When to use / caveats |
|---|---|---|
| **code-builder** | Codex relay (mcp__codex) | Implementation, fixes, bulk verification, and independent-perspective code review — once the spec is settled. Tasks are passed verbatim (it will not fill spec gaps). Never commits. |
| **web-scout** | `agy` relay (gemini) | Fact-checking external information (library specs, official docs). **Strictly one topic per call** — split broad research into many parallel calls. |
| **sonnet-scout** | Sonnet, read-only | In-repo investigation (call tracing, root-cause analysis, reviews). Never implements. |

Proven workflow in this repo: run sonnet-scout reviews in parallel per area → the parent verifies
every finding before fixing → each fix requires a reproducing test plus mutation verification →
one follow-up review round from a different perspective. For documentation or large implementation
work, split areas exclusively across general-purpose agents running in parallel (never let two
agents touch the same file).

**Never trust a code-builder success report without checking the files yourself** (grep for the
claimed changes, run the tests). Incident (2026-08-29): the Codex sandbox failed to start in this
devcontainer (`bwrap: No permissions to create new namespace`) and the relay still returned a
detailed "success" report — 385 tests passing, per-file change list, mutation checks — with **zero
files changed on disk**. If Codex is down, fall back to implementing directly (spec-first, then
the sonnet-scout review round still applies).
