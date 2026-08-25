# クラス: CommandStore

定義: [src/command/CommandStore.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L26)

[Command](Command.md) コンポーネントのストア。`commands/` を走査します。

コマンドのランタイムも担います: インタラクション / メッセージの
ディスパッチ、権限・Precondition ゲート、アプリケーションコマンド同期。

## 拡張

- [`ComponentStore`](ComponentStore.md)\<[`Command`](Command.md)\>

## コンストラクター

### コンストラクター \{#constructor}

```ts
new CommandStore(): CommandStore;
```

定義: [src/command/CommandStore.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L30)

#### 戻り値

`CommandStore`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`constructor`](ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<Command>;
```

定義: [src/component/ComponentStore.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L50)

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`base`](ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/ComponentStore.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L56)

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`container`](ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/ComponentStore.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L59)

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`logger`](ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/ComponentStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L47)

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`name`](ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: [src/component/ComponentStore.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L53)

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`suffix`](ComponentStore.md#suffix)

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(command, options): void;
```

定義: [src/command/CommandStore.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L39)

解決済みメタデータをインスタンスへ適用します — 種別固有フィールドの
割り当てと必須項目の検証はここで行います。ロード時に弾く場合は
([ComponentLoadError](ComponentLoadError.md) を推奨)例外を投げてください。

#### パラメータ

##### command

[`Command`](Command.md)

##### options

[`CommandOptions`](../interfaces/CommandOptions.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`applyOptions`](ComponentStore.md#applyoptions)

***

### bind() \{#bind}

```ts
protected bind(command): void;
```

定義: [src/command/CommandStore.ts:67](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L67)

ロード済みコンポーネントをランタイムへ配線します(例: リスナーの
イベント購読)。`onLoad` の後、ストアに追加された状態で呼ばれます。

#### パラメータ

##### command

[`Command`](Command.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`bind`](ComponentStore.md#bind)

***

### deriveName() \{#derivename}

```ts
protected deriveName(className): string;
```

定義: [src/component/ComponentStore.ts:229](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L229)

クラス名からコンポーネント名を導出します: 種別サフィックス
([ComponentStore.suffix](ComponentStore.md#suffix))を取り除き、ケバブケース化します
(`UserInfoCommand` → `user-info`)。
カスタム種別で慣例を変えたい場合はオーバーライドしてください。

#### パラメータ

##### className

`string`

#### 戻り値

`string`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`deriveName`](ComponentStore.md#derivename)

***

### dispatchAutocomplete() \{#dispatchautocomplete}

```ts
dispatchAutocomplete(interaction): Promise<void>;
```

定義: [src/command/CommandStore.ts:121](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L121)

autocomplete インタラクションを担当コマンドへルーティングします。

#### パラメータ

##### interaction

`AutocompleteInteraction`

#### 戻り値

`Promise`\<`void`\>

***

### dispatchChatInput() \{#dispatchchatinput}

```ts
dispatchChatInput(interaction): Promise<void>;
```

定義: [src/command/CommandStore.ts:104](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L104)

スラッシュコマンドのインタラクションを担当コマンドへルーティングします。

#### パラメータ

##### interaction

`ChatInputCommandInteraction`

#### 戻り値

`Promise`\<`void`\>

***

### dispatchMessage() \{#dispatchmessage}

```ts
dispatchMessage(message, prefixes): Promise<void>;
```

定義: [src/command/CommandStore.ts:140](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L140)

メッセージからプレフィックスコマンドを解析して実行します。解決済み
プレフィックスはクライアントが渡します。Bot と Webhook は無視されます。

#### パラメータ

##### message

`Message`

##### prefixes

readonly `string`[]

#### 戻り値

`Promise`\<`void`\>

***

### load() \{#load}

```ts
load(cls, location?): Promise<Command>;
```

定義: [src/component/ComponentStore.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L122)

単一のコンポーネントクラスを構築・初期化・追加します。
同じクラスの二重ロードは既存インスタンスを返すだけで無害です。
**別の** クラスが既存の名前に解決された場合は
[ComponentLoadError](ComponentLoadError.md) を投げます。

#### パラメータ

##### cls

[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Command`](Command.md)\>

##### location?

`string` \| `null`

#### 戻り値

`Promise`\<[`Command`](Command.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`load`](ComponentStore.md#load)

***

### loadAll() \{#loadall}

```ts
loadAll(baseDirectory): Promise<void>;
```

定義: [src/component/ComponentStore.ts:95](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L95)

この種別のすべてのコンポーネントをロードします: 先に明示登録分、
次に `<baseDirectory>/<name>` のファイル自動探索(baseDirectory 設定時)。
クライアント起動時にレジストリから呼ばれます。

#### パラメータ

##### baseDirectory

`string` \| `null`

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`loadAll`](ComponentStore.md#loadall)

***

### lookup() \{#lookup}

```ts
lookup(name): Command | undefined;
```

定義: [src/command/CommandStore.ts:35](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L35)

名前または別名でコマンドを検索します(大文字小文字を区別しません)。

#### パラメータ

##### name

`string`

#### 戻り値

[`Command`](Command.md) \| `undefined`

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: [src/component/ComponentStore.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L77)

コンポーネントクラスを明示登録します(ファイル自動探索の代替)。
[ComponentStore.loadAll](ComponentStore.md#loadall) 前ならキューに積まれ、後なら即座に
ロードされます(fire-and-forget — インスタンスを待つ場合は
[ComponentStore.load](ComponentStore.md#load) を使ってください)。

#### パラメータ

##### classes

...[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Command`](Command.md)\>[]

#### 戻り値

`this`

#### 継承元

[`ComponentStore`](ComponentStore.md).[`register`](ComponentStore.md#register)

***

### syncApplicationCommands() \{#syncapplicationcommands}

```ts
syncApplicationCommands(defaultGuildIds?): Promise<CommandsSyncedResult>;
```

定義: [src/command/CommandStore.ts:174](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L174)

すべてのスラッシュ対応コマンドを一括上書きで Discord に登録します。
`guildIds`(またはクライアント既定の `applicationGuildIds`)を持つ
コマンドはギルド毎に、それ以外はグローバルに登録されます。
無効化しない限り ready 時に自動実行されます。

#### パラメータ

##### defaultGuildIds?

readonly `string`[]

#### 戻り値

`Promise`\<[`CommandsSyncedResult`](../interfaces/CommandsSyncedResult.md)\>

***

### unbind() \{#unbind}

```ts
protected unbind(command): void;
```

定義: [src/command/CommandStore.ts:80](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L80)

[ComponentStore.bind](ComponentStore.md#bind) の逆操作。アンロード時に呼ばれます。

#### パラメータ

##### command

[`Command`](Command.md)

#### 戻り値

`void`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`unbind`](ComponentStore.md#unbind)

***

### unload() \{#unload}

```ts
unload(resolvable): Promise<Command>;
```

定義: [src/component/ComponentStore.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L200)

コンポーネントを取り除きます([ComponentStore.unbind](ComponentStore.md#unbind) と `onUnload` を実行)。

#### パラメータ

##### resolvable

`string` \| [`Command`](Command.md)

#### 戻り値

`Promise`\<[`Command`](Command.md)\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unload`](ComponentStore.md#unload)

***

### unloadAll() \{#unloadall}

```ts
unloadAll(): Promise<void>;
```

定義: [src/component/ComponentStore.ts:217](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/ComponentStore.ts#L217)

このストアのすべてのコンポーネントをアンロードします(クライアント終了時に使用)。

#### 戻り値

`Promise`\<`void`\>

#### 継承元

[`ComponentStore`](ComponentStore.md).[`unloadAll`](ComponentStore.md#unloadall)

***

### validateReferences() \{#validatereferences}

```ts
validateReferences(preconditions): void;
```

定義: [src/command/CommandStore.ts:90](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/command/CommandStore.ts#L90)

ロードされていない Precondition を参照するコマンドを起動時に検出します。
全ストアのロード完了後にクライアントが呼びます。

#### パラメータ

##### preconditions

[`PreconditionStore`](PreconditionStore.md)

#### 戻り値

`void`
