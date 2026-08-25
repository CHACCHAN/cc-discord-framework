# インターフェイス: Embeds

定義: plugins/utils/src/embeds.ts:12

[createEmbeds](../functions/createEmbeds.md) が返す埋め込みファクトリ。

## プロパティ

### colors \{#colors}

```ts
readonly colors: ColorTheme;
```

定義: plugins/utils/src/embeds.ts:24

この埋め込みが使っている色。

## メソッド

### error() \{#error}

```ts
error(description?): EmbedBuilder;
```

定義: plugins/utils/src/embeds.ts:16

失敗。`Error` を渡すと `message` が説明文になります。

#### パラメータ

##### description?

`string` \| `Error`

#### 戻り値

`EmbedBuilder`

***

### info() \{#info}

```ts
info(description?): EmbedBuilder;
```

定義: plugins/utils/src/embeds.ts:20

情報。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`

***

### of() \{#of}

```ts
of(color, description?): EmbedBuilder;
```

定義: plugins/utils/src/embeds.ts:22

任意の色。テーマの色名(`"success"` など)か色コードを渡します。

#### パラメータ

##### color

`number` \| keyof ColorTheme

##### description?

`string` \| `Error`

#### 戻り値

`EmbedBuilder`

***

### success() \{#success}

```ts
success(description?): EmbedBuilder;
```

定義: plugins/utils/src/embeds.ts:14

成功。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`

***

### warning() \{#warning}

```ts
warning(description?): EmbedBuilder;
```

定義: plugins/utils/src/embeds.ts:18

警告。

#### パラメータ

##### description?

`string`

#### 戻り値

`EmbedBuilder`
