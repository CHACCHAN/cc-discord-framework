# インターフェイス: PreconditionOptions

定義: src/precondition/Precondition.ts:33

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](ComponentOptions.md)

## プロパティ

### name? \{#name}

```ts
optional name?: string;
```

定義: src/component/Component.ts:13

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](ComponentOptions.md).[`name`](ComponentOptions.md#name)
