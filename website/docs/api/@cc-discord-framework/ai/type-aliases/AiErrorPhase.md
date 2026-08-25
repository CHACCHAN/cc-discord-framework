# 型エイリアス: AiErrorPhase

```ts
type AiErrorPhase = "generate" | "tool" | "display" | "memory";
```

定義: plugins/ai/src/events.ts:42

どこで失敗したか。

ここに並ぶのは **実際に発火する値だけ** です — 生成そのもの
(`"generate"`・ストリーミングも含みます)、ツールの実行(`"tool"`)、
Discord への表示(`"display"`)、会話履歴の読み書き(`"memory"`)。
モデルの解決に失敗した場合は握りつぶさず throw するので、`aiError` には
流れません。
