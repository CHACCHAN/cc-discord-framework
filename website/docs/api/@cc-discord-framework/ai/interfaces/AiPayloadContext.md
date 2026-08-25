# インターフェイス: AiPayloadContext

定義: plugins/ai/src/render.ts:28

`display.payload` フックへ渡る文脈。

分割された応答は2通目以降も同じフックを通るので、`index` / `total` で
「何通目か」を見て出し分けられます。

## プロパティ

### index \{#index}

```ts
readonly index: number;
```

定義: plugins/ai/src/render.ts:32

分割された何通目か(1始まり)。

***

### kind \{#kind}

```ts
readonly kind: AiReplyKind;
```

定義: plugins/ai/src/render.ts:30

応答の意味づけ(埋め込みの色に使われているもの)。

***

### streaming \{#streaming}

```ts
readonly streaming: boolean;
```

定義: plugins/ai/src/render.ts:36

途中経過か(あとで書き換わる送信なら `true`・最終の送信なら `false`)。

***

### total \{#total}

```ts
readonly total: number;
```

定義: plugins/ai/src/render.ts:34

分割された総通数。
