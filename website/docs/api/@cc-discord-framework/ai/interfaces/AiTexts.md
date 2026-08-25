# インターフェイス: AiTexts

定義: plugins/ai/src/texts.ts:82

## プロパティ

### answerBody \{#answerbody}

```ts
answerBody: (parts, texts) => string;
```

定義: plugins/ai/src/texts.ts:122

応答の本文全体。断片の並べ方(見出し・空行・順序)まで ここで決まります。
`texts` には解決後のカタログが入るので、既定の見出しを流用できます。

既定の実装は「本文(+カーソル)」と「引用元」だけを出します。
使用ツールやトークン数も出したい場合は、この関数を差し替えてください
— 断片は常に計算されて渡っています。

**生成に失敗したときもここを通ります**([AiAnswerParts.failure](AiAnswerParts.md#failure)
にエラー文言が入り、`answer` には途中まで生成された本文が残ります)。

#### パラメータ

##### parts

[`AiAnswerParts`](AiAnswerParts.md)

##### texts

`AiTexts`

#### 戻り値

`string`

***

### apiCallFailed \{#apicallfailed}

```ts
apiCallFailed: (status, message) => string;
```

定義: plugins/ai/src/texts.ts:161

プロバイダーが HTTP エラーを返したときの言い換え。

`status` はステータスコード、`message` はプロバイダーが返した文言です。
ここを通した結果が [AiTexts.generationFailed](#generationfailed) へ渡ります
(状態を見て言い換えたい場合はここを差し替えてください —
例えば 401 だけ「APIキーを確認してください」にする)。

#### パラメータ

##### status

`number`

##### message

`string`

#### 戻り値

`string`

***

### apiKeyMissing \{#apikeymissing}

```ts
apiKeyMissing: (provider, variable) => string;
```

定義: plugins/ai/src/texts.ts:135

API キーが見つからない(`variable` は既定の環境変数名)。

#### パラメータ

##### provider

`string`

##### variable

`string`

#### 戻り値

`string`

***

### compatibleNotConfigured \{#compatiblenotconfigured}

```ts
compatibleNotConfigured: string;
```

定義: plugins/ai/src/texts.ts:137

`compatible` に `baseURL` / `name` が設定されていない。

***

### cooldown \{#cooldown}

```ts
cooldown: (remainingMs) => string;
```

定義: plugins/ai/src/texts.ts:145

クールダウン中。

#### パラメータ

##### remainingMs

`number`

#### 戻り値

`string`

***

### emptyResponse \{#emptyresponse}

```ts
emptyResponse: string;
```

定義: plugins/ai/src/texts.ts:88

モデルが空の応答を返した。

***

### generationFailed \{#generationfailed}

```ts
generationFailed: (message) => string;
```

定義: plugins/ai/src/texts.ts:166

生成そのものが失敗したときに、Discord の応答へ出す本文
([AiService.reply](../classes/AiService.md#reply) が使います)。

#### パラメータ

##### message

`string`

#### 戻り値

`string`

***

### modelIdInvalid \{#modelidinvalid}

```ts
modelIdInvalid: (id) => string;
```

定義: plugins/ai/src/texts.ts:129

モデル指定の書式が `"<provider>:<modelId>"` になっていない。

#### パラメータ

##### id

`string`

#### 戻り値

`string`

***

### modelNotConfigured \{#modelnotconfigured}

```ts
modelNotConfigured: string;
```

定義: plugins/ai/src/texts.ts:127

使うモデルが決まっていない。

***

### promptEmpty \{#promptempty}

```ts
promptEmpty: string;
```

定義: plugins/ai/src/texts.ts:139

入力が空だった。

***

### promptTooLong \{#prompttoolong}

```ts
promptTooLong: (length, max) => string;
```

定義: plugins/ai/src/texts.ts:141

入力が長すぎた。

#### パラメータ

##### length

`number`

##### max

`number`

#### 戻り値

`string`

***

### providerNotInstalled \{#providernotinstalled}

```ts
providerNotInstalled: (provider, packageName) => string;
```

定義: plugins/ai/src/texts.ts:133

プロバイダーのパッケージが入っていない。

#### パラメータ

##### provider

`string`

##### packageName

`string`

#### 戻り値

`string`

***

### providerUnknown \{#providerunknown}

```ts
providerUnknown: (provider, known) => string;
```

定義: plugins/ai/src/texts.ts:131

同梱リゾルバが知らないプロバイダー名だった。

#### パラメータ

##### provider

`string`

##### known

readonly `string`[]

#### 戻り値

`string`

***

### sourceLine \{#sourceline}

```ts
sourceLine: (position, title, url) => string;
```

定義: plugins/ai/src/texts.ts:97

引用元1件。`position` は1始まり、`title` は題名(無ければ URL)、
`url` は URL(文書ソースなど URL が無ければ `null`)。

#### パラメータ

##### position

`number`

##### title

`string`

##### url

`string` \| `null`

#### 戻り値

`string`

***

### sourcesHeader \{#sourcesheader}

```ts
sourcesHeader: string;
```

定義: plugins/ai/src/texts.ts:92

引用元の見出し。

***

### thinking \{#thinking}

```ts
thinking: string;
```

定義: plugins/ai/src/texts.ts:86

生成が始まる前・本文がまだ空のときの仮表示。

***

### timedOut \{#timedout}

```ts
timedOut: (ms) => string;
```

定義: plugins/ai/src/texts.ts:143

生成が制限時間を超えた。

#### パラメータ

##### ms

`number`

#### 戻り値

`string`

***

### toolFailed \{#toolfailed}

```ts
toolFailed: (tool, message) => string;
```

定義: plugins/ai/src/texts.ts:150

ツールの実行が失敗した。この文言は **AI へ返されます**
(会話全体を止めず、モデルが失敗を踏まえて続けられるようにするため)。

#### パラメータ

##### tool

`string`

##### message

`string`

#### 戻り値

`string`

***

### toolLine \{#toolline}

```ts
toolLine: (name) => string;
```

定義: plugins/ai/src/texts.ts:108

使用ツール1件。

#### パラメータ

##### name

`string`

#### 戻り値

`string`

***

### toolsHeader \{#toolsheader}

```ts
toolsHeader: string;
```

定義: plugins/ai/src/texts.ts:106

使用ツールの見出し。

**既定の [AiTexts.answerBody](#answerbody) では使われません** — 既定の本文は
回答と引用元だけを出すためです。使用ツールも見せたい場合は
`answerBody` を差し替えて、この見出しと [AiTexts.toolLine](#toolline) を
使ってください(断片は常に計算されて渡っています)。

***

### toolTimedOut \{#tooltimedout}

```ts
toolTimedOut: (tool, ms) => string;
```

定義: plugins/ai/src/texts.ts:152

ツールの実行が `tools.timeout` を超えた。

#### パラメータ

##### tool

`string`

##### ms

`number`

#### 戻り値

`string`

***

### truncated \{#truncated}

```ts
truncated: string;
```

定義: plugins/ai/src/texts.ts:90

`limits.maxResponseLength` で切り詰めたときに末尾へ付ける印。

***

### usageLine \{#usageline}

```ts
usageLine: (input, output, total) => string;
```

定義: plugins/ai/src/texts.ts:110

トークン数の行。判らない項目は `null` で渡ります。

#### パラメータ

##### input

`number` \| `null`

##### output

`number` \| `null`

##### total

`number` \| `null`

#### 戻り値

`string`
