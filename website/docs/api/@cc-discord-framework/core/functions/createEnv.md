# 関数: createEnv()

```ts
function createEnv(source?, options?): EnvReader;
```

定義: [src/env.ts:108](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/env.ts#L108)

環境変数の読み手を作ります。

## パラメータ

### source?

`Readonly`\<`Record`\<`string`, `string` \| `undefined`\>\> = `Bun.env`

読む対象。既定は `Bun.env`。テストでは
  `createEnv({ OWNER_IDS: "1,2" })` のように偽の環境を渡せます。

### options?

[`EnvOptions`](../interfaces/EnvOptions.md) = `{}`

解釈の語彙や区切り文字([EnvOptions](../interfaces/EnvOptions.md))。

## 戻り値

[`EnvReader`](../interfaces/EnvReader.md)
