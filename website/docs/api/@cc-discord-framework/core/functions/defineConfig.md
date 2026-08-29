# 関数: defineConfig()

```ts
function defineConfig(config): ClientConfig;
```

定義: [src/config.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/config.ts#L38)

設定ファイルの中身に型を付けるだけの関数([definePlugin](definePlugin.md) と同じ
役割)。設定ファイルは必ずこれを default export します:

```ts
// config/music.ts
export default defineConfig({
  priority: 10,
  plugins: [music({ maxVolume: 200 })],
  intents: [GatewayIntentBits.GuildVoiceStates],
});
```

## パラメータ

### config

[`ClientConfig`](../interfaces/ClientConfig.md)

## 戻り値

[`ClientConfig`](../interfaces/ClientConfig.md)
