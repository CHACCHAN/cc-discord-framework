# インターフェイス: EnvReader

定義: src/env.ts:60

環境変数の読み手。[createEnv](../functions/createEnv.md) が作ります。

## プロパティ

### warnings \{#warnings}

```ts
readonly warnings: readonly string[];
```

定義: src/env.ts:98

ここまでの読み出しで見つかった問題。起動時にまとめてログへ
流すことを想定しています(ライブビューです — 以後の読み出しで
増えます)。

## メソッド

### flag() \{#flag}

```ts
flag(name, fallback): boolean;
```

定義: src/env.ts:85

真偽値。未設定・空なら `fallback` を返します。解釈できない値は
`fallback` のまま [EnvReader.warnings](#warnings) に積みます — 綴りを
間違えたときに、黙って既定と逆の意味になるのを避けるためです。

#### パラメータ

##### name

`string`

##### fallback

`boolean`

#### 戻り値

`boolean`

***

### list() \{#list}

```ts
list(name): readonly string[];
```

定義: src/env.ts:78

区切り文字(既定はカンマ)で分けた一覧。前後の空白と空要素は
落とします。未設定なら空配列です。

#### パラメータ

##### name

`string`

#### 戻り値

readonly `string`[]

***

### number() \{#number}

```ts
number(name, fallback): number;
```

定義: src/env.ts:91

数値。未設定・空なら `fallback` を返します。数値として解釈できない
値は `fallback` のまま [EnvReader.warnings](#warnings) に積みます。

#### パラメータ

##### name

`string`

##### fallback

`number`

#### 戻り値

`number`

***

### required() \{#required}

```ts
required(name): string;
```

定義: src/env.ts:72

必須の文字列。未設定・空なら [ConfigLoadError](../classes/ConfigLoadError.md) を投げます。
無いと機能ごと動かない値(トークンなど)にだけ使ってください。

#### パラメータ

##### name

`string`

#### 戻り値

`string`

***

### text() \{#text}

```ts
text(name): string | null;
```

定義: src/env.ts:66

単一の文字列。未設定と空文字はどちらも `null` に寄せます —
`.env` では「書いてあるが空」がふつうに起きるので、区別しても
意味がないためです。前後の空白は落とします。

#### パラメータ

##### name

`string`

#### 戻り値

`string` \| `null`
