# インターフェイス: FormatDurationOptions

定義: plugins/utils/src/duration.ts:63

## プロパティ

### alwaysHours? \{#alwayshours}

```ts
optional alwaysHours?: boolean;
```

定義: plugins/utils/src/duration.ts:69

1時間未満でも時を出す。

#### Default

`defaultTheme.duration.clock.alwaysHours`(false)

***

### pad? \{#pad}

```ts
optional pad?: string;
```

定義: plugins/utils/src/duration.ts:65

分・秒を2桁に揃える文字。

#### Default

`defaultTheme.duration.clock.pad`("0")

***

### separator? \{#separator}

```ts
optional separator?: string;
```

定義: plugins/utils/src/duration.ts:67

時・分・秒の区切り。

#### Default

`defaultTheme.duration.clock.separator`(":")
