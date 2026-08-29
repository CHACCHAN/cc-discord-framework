# 関数: parseDuration()

```ts
function parseDuration(input): number;
```

定義: [plugins/utils/src/duration.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/duration.ts#L39)

期間をミリ秒へ変換します。数値はそのままミリ秒として扱われるため、
期間を受け取るあらゆる API の入口に置けます。

```ts
parseDuration(500);      // 500
parseDuration("90s");    // 90000
parseDuration("1h30m");  // 5400000
parseDuration("1d 12h"); // 129600000 (空白は無視される)
```

## パラメータ

### input

[`DurationInput`](../type-aliases/DurationInput.md)

## 戻り値

`number`

## Throws

解釈できない値を渡した場合。
