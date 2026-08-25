# インターフェイス: ComponentStoreOptions\<T\>

定義: src/component/ComponentStore.ts:16

## 型パラメーター

### T

`T` *extends* [`Component`](../classes/Component.md)

## プロパティ

### base \{#base}

```ts
base: AbstractComponentClass<T>;
```

定義: src/component/ComponentStore.ts:23

この種別のコンポーネントが継承すべき基底クラス。

***

### name \{#name}

```ts
name: string;
```

定義: src/component/ComponentStore.ts:21

ストア名。ファイル自動探索の対象ディレクトリ名でもあります
(`<baseDirectory>/<name>`)。慣例として複数形にします(例: `"commands"`)。

***

### suffix? \{#suffix}

```ts
optional suffix?: string;
```

定義: src/component/ComponentStore.ts:30

クラス名から取り除く接尾辞。既定はストア名の単数形
(`"commands"` → `Command`)。**ディレクトリ名とクラス名の語が
揃わないときだけ** 指定します(例: `ai/` に置く `AiTool` は
`{ name: "ai", suffix: "Tool" }`)。
