# インターフェイス: TrackResolverOptions

定義: plugins/music/src/TrackResolver.ts:10

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](../../../cc-discord-framework/interfaces/ComponentOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: src/component/Component.ts:13

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](../../../cc-discord-framework/interfaces/ComponentOptions.md).[`name`](../../../cc-discord-framework/interfaces/ComponentOptions.md#name)

***

### priority? \{#priority}

```ts
optional priority?: number;
```

定義: plugins/music/src/TrackResolver.ts:12

大きいほど先に試されます。既定 0。
