# インターフェイス: ComponentOptions

定義: [src/component/Component.ts:8](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L8)

すべてのコンポーネント種別が共有するオプション。

## によって拡張された

- [`ServiceOptions`](ServiceOptions.md)
- [`CommandOptions`](CommandOptions.md)
- [`ListenerOptions`](ListenerOptions.md)
- [`PreconditionOptions`](PreconditionOptions.md)
- [`TaskOptions`](../../utils/interfaces/TaskOptions.md)
- [`StreamProviderOptions`](../../music/interfaces/StreamProviderOptions.md)
- [`TrackResolverOptions`](../../music/interfaces/TrackResolverOptions.md)
- [`AiToolOptions`](../../ai/interfaces/AiToolOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: [src/component/Component.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L13)

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。
