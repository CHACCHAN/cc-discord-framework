# インターフェイス: ComponentOptions

定義: src/component/Component.ts:8

すべてのコンポーネント種別が共有するオプション。

## によって拡張された

- [`ServiceOptions`](ServiceOptions.md)
- [`CommandOptions`](CommandOptions.md)
- [`ListenerOptions`](ListenerOptions.md)
- [`PreconditionOptions`](PreconditionOptions.md)
- [`TaskOptions`](../../@cc-discord-framework/utils/interfaces/TaskOptions.md)
- [`StreamProviderOptions`](../../@cc-discord-framework/music/interfaces/StreamProviderOptions.md)
- [`TrackResolverOptions`](../../@cc-discord-framework/music/interfaces/TrackResolverOptions.md)
- [`AiToolOptions`](../../@cc-discord-framework/ai/interfaces/AiToolOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: src/component/Component.ts:13

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。
