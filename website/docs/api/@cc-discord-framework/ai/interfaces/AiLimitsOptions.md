# インターフェイス: AiLimitsOptions

定義: plugins/ai/src/config.ts:186

[AiLimits](AiLimits.md) の部分指定。`cooldown` は期間表記でも書けます。

## プロパティ

### cooldown? \{#cooldown}

```ts
optional cooldown?: false | DurationInput;
```

定義: plugins/ai/src/config.ts:192

#### Default

```ts
false(クールダウンなし)
```

***

### maxPromptLength? \{#maxpromptlength}

```ts
optional maxPromptLength?: number;
```

定義: plugins/ai/src/config.ts:188

#### Default

```ts
4000
```

***

### maxResponseLength? \{#maxresponselength}

```ts
optional maxResponseLength?: number | false;
```

定義: plugins/ai/src/config.ts:190

#### Default

```ts
false(無制限)
```
