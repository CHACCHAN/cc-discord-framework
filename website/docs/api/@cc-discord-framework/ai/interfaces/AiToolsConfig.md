# インターフェイス: AiToolsConfig

定義: plugins/ai/src/config.ts:24

ツール(`ai/`)の扱い。

## プロパティ

### enabled \{#enabled}

```ts
readonly enabled: boolean;
```

定義: plugins/ai/src/config.ts:26

登録済みの [AiTool](../classes/AiTool.md) を既定でモデルへ渡す。`false` で無効。

***

### timeout \{#timeout}

```ts
readonly timeout: number | false;
```

定義: plugins/ai/src/config.ts:28

1回のツール実行を打ち切るまでのミリ秒。`false` で無制限。
