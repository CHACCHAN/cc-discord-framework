# インターフェイス: ServiceOptions

定義: [src/service/Service.ts:21](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/service/Service.ts#L21)

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](ComponentOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: [src/component/Component.ts:13](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/Component.ts#L13)

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](ComponentOptions.md).[`name`](ComponentOptions.md#name)
