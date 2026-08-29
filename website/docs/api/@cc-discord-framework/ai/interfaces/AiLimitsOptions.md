# インターフェイス: AiLimitsOptions

定義: [plugins/ai/src/config.ts:186](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L186)

[AiLimits](AiLimits.md) の部分指定。`cooldown` は期間表記でも書けます。

## プロパティ

### cooldown? \{#cooldown}

```ts
optional cooldown?: false | DurationInput;
```

定義: [plugins/ai/src/config.ts:192](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L192)

#### Default

```ts
false(クールダウンなし)
```

***

### maxPromptLength? \{#maxpromptlength}

```ts
optional maxPromptLength?: number;
```

定義: [plugins/ai/src/config.ts:188](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L188)

#### Default

```ts
4000
```

***

### maxResponseLength? \{#maxresponselength}

```ts
optional maxResponseLength?: number | false;
```

定義: [plugins/ai/src/config.ts:190](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/config.ts#L190)

#### Default

```ts
false(無制限)
```
