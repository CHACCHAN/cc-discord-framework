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
