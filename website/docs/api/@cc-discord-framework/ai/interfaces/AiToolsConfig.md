# インターフェイス: AiToolsConfig

定義: [plugins/ai/src/config.ts:24](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L24)

ツール(`ai/`)の扱い。

## プロパティ

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: [plugins/ai/src/config.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L26)

登録済みの [AiTool](../classes/AiTool.md) を既定でモデルへ渡す。`false` で無効。

***

### timeout \{#timeout}

```ts
readonly timeout: number | false;
```

定義: [plugins/ai/src/config.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L28)

1回のツール実行を打ち切るまでのミリ秒。`false` で無制限。
