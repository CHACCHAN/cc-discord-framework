# インターフェイス: HumanizeDurationOptions

定義: plugins/utils/src/duration.ts:99

## プロパティ

### max? \{#max}

```ts
optional max?: number;
```

定義: plugins/utils/src/duration.ts:101

出す単位の数。

#### Default

`defaultTheme.duration.max`(2)

***

### separator? \{#separator}

```ts
optional separator?: string;
```

定義: plugins/utils/src/duration.ts:105

単位のあいだに挟む文字列。

#### Default

`defaultTheme.duration.separator`(" ")

***

### units? \{#units}

```ts
optional units?: Partial<{
  d: string;
  h: string;
  m: string;
  ms: string;
  s: string;
}>;
```

定義: plugins/utils/src/duration.ts:103

単位の表記。日本語にするならここ。

#### Default

`defaultTheme.duration.units`
