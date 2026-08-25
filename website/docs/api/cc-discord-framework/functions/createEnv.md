# 関数: createEnv()

```ts
function createEnv(source?, options?): EnvReader;
```

定義: src/env.ts:108

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
