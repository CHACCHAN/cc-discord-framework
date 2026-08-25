# インターフェイス: FormatDurationOptions

定義: [plugins/utils/src/duration.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/duration.ts#L63)

## プロパティ

### alwaysHours? \{#alwayshours}

```ts
optional alwaysHours?: boolean;
```

定義: [plugins/utils/src/duration.ts:69](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/duration.ts#L69)

1時間未満でも時を出す。

#### Default

`defaultTheme.duration.clock.alwaysHours`(false)

***

### pad? \{#pad}

```ts
optional pad?: string;
```

定義: [plugins/utils/src/duration.ts:65](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/duration.ts#L65)

分・秒を2桁に揃える文字。

#### Default

`defaultTheme.duration.clock.pad`("0")

***

### separator? \{#separator}

```ts
optional separator?: string;
```

定義: [plugins/utils/src/duration.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/utils/src/duration.ts#L67)

時・分・秒の区切り。

#### Default

`defaultTheme.duration.clock.separator`(":")
