# インターフェイス: ClientOptions

定義: [src/client.ts:23](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L23)

## 拡張

- `ClientOptions`

## プロパティ

### applicationGuildIds? \{#applicationguildids}

```ts
optional applicationGuildIds?: readonly string[];
```

定義: [src/client.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L77)

スラッシュコマンドを登録する既定のギルド — 開発中に便利です
(ギルドコマンドは即時反映)。コマンド側の `guildIds` が優先され、
どちらもなければグローバル登録になります。

***

### baseDirectory? \{#basedirectory}

```ts
optional baseDirectory?: string | URL | null;
```

定義: [src/client.ts:32](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L32)

コンポーネント自動探索のルートディレクトリ。各ストアが
`<baseDirectory>/<ストア名>`(`services/`、`commands/`、`listeners/`、
`preconditions/`、...)を走査します。

既定はプロセスのエントリポイント(`Bun.main`)のあるディレクトリです。
`null` を渡すと自動探索を無効化し、明示登録のみになります。

***

### defaultPrefix? \{#defaultprefix}

```ts
optional defaultPrefix?: string | readonly string[] | null;
```

定義: [src/client.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L53)

メッセージ(プレフィックス)コマンドを有効にするプレフィックス。
省略(または `null`)でスラッシュコマンド専用の Bot になります。

***

### fetchPrefix? \{#fetchprefix}

```ts
optional fetchPrefix?: (message, container) => Awaitable<string | readonly string[] | null>;
```

定義: [src/client.ts:61](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L61)

メッセージ毎にプレフィックスを解決します(ギルド毎のプレフィックス等)。
`defaultPrefix` より優先され、`null` を返すとそのメッセージでは
メッセージコマンドが無効になります。コンテナが渡されるため、
クライアント変数を参照せずにサービスへ到達できます。

#### パラメータ

##### message

`Message`

##### container

[`Container`](../classes/Container.md)

#### 戻り値

`Awaitable`\<`string` \| readonly `string`[] \| `null`\>

***

### logger? \{#logger}

```ts
optional logger?: Logger | LoggerOptions<never, boolean>;
```

定義: [src/client.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L38)

フレームワークのロガー: 採用したい pino インスタンス、または pino に
渡すオプション。既定は `pino({ level: "info" })` です。

***

### plugins? \{#plugins}

```ts
optional plugins?: readonly Plugin[];
```

定義: [src/client.ts:41](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L41)

プラグイン。[Client.load](../classes/Client.md#load) の冒頭で配列順にインストールされます。

***

### syncApplicationCommands? \{#syncapplicationcommands}

```ts
optional syncApplicationCommands?: boolean;
```

定義: [src/client.ts:70](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L70)

クライアントの ready 時にスラッシュコマンドを Discord へ一括登録する。

#### Default

```ts
true
```

***

### texts? \{#texts}

```ts
optional texts?: Partial<ClientTexts>;
```

定義: [src/client.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L47)

フレームワークがユーザーへ返す文言。指定した項目だけが既定値
([defaultClientTexts](../variables/defaultClientTexts.md))を上書きします。
