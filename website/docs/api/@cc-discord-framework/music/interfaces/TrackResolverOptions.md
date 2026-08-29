# インターフェイス: TrackResolverOptions

定義: [plugins/music/src/TrackResolver.ts:10](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/TrackResolver.ts#L10)

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](../../core/interfaces/ComponentOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: [src/component/Component.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L13)

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](../../core/interfaces/ComponentOptions.md).[`name`](../../core/interfaces/ComponentOptions.md#name)

***

### priority? \{#priority}

```ts
optional priority?: number;
```

定義: [plugins/music/src/TrackResolver.ts:12](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/music/src/TrackResolver.ts#L12)

大きいほど先に試されます。既定 0。
