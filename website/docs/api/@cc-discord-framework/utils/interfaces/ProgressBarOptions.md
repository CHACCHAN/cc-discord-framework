# インターフェイス: ProgressBarOptions

定義: [plugins/utils/src/text.ts:139](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/text.ts#L139)

## プロパティ

### empty? \{#empty}

```ts
optional empty?: string;
```

定義: [plugins/utils/src/text.ts:145](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/text.ts#L145)

未進捗部分の文字。

#### Default

`defaultTheme.progress.empty`("░")

***

### filled? \{#filled}

```ts
optional filled?: string;
```

定義: [plugins/utils/src/text.ts:143](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/text.ts#L143)

進捗部分の文字。

#### Default

`defaultTheme.progress.filled`("█")

***

### width? \{#width}

```ts
optional width?: number;
```

定義: [plugins/utils/src/text.ts:141](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/text.ts#L141)

全体の文字数。

#### Default

`defaultTheme.progress.width`(20)
