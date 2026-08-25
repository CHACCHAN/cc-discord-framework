# インターフェイス: AiToolsOptions

定義: plugins/ai/src/config.ts:178

[AiToolsConfig](AiToolsConfig.md) の部分指定。`timeout` は期間表記でも書けます。

## プロパティ

### enabled? \{#enabled}

```ts
optional enabled?: boolean;
```

定義: plugins/ai/src/config.ts:180

#### Default

```ts
true
```

***

### timeout? \{#timeout}

```ts
optional timeout?: false | DurationInput;
```

定義: plugins/ai/src/config.ts:182

#### Default

```ts
"30s"
```
