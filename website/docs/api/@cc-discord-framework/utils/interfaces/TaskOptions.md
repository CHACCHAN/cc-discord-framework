# インターフェイス: TaskOptions

定義: plugins/utils/src/scheduler.ts:15

すべてのコンポーネント種別が共有するオプション。

## 拡張

- [`ComponentOptions`](../../../cc-discord-framework/interfaces/ComponentOptions.md)

## プロパティ

### every \{#every}

```ts
every: DurationInput;
```

定義: plugins/utils/src/scheduler.ts:23

実行間隔。ミリ秒か `"1h"` `"30m"` のような期間表記。**必須**。
上限は約24.8日(2^31-1 ミリ秒)です — タイマーの遅延が 32bit を
超えると **1ms に化けて連発する** ため、超える指定はロード時に
エラーになります。それより長い周期は run() 側で日付を見て
間引いてください。

***

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

### overlap? \{#overlap}

```ts
optional overlap?: boolean;
```

定義: plugins/utils/src/scheduler.ts:32

前回の run() がまだ終わっていないときに、次の周期を重ねて
実行するか。既定では **重ねずにスキップ** します(遅い run() が
積み重なって暴走しないように)。

#### Default

```ts
false
```

***

### runOnStart? \{#runonstart}

```ts
optional runOnStart?: boolean;
```

定義: plugins/utils/src/scheduler.ts:25

クライアントの ready 直後にも一度実行する。

#### Default

```ts
false
```
