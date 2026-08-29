# クラス: CommandStore

定義: [src/command/CommandStore.ts:26](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L26)

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

定義: [src/command/CommandStore.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L33)

#### 戻り値

`CommandStore`

#### 上書き

[`ComponentStore`](ComponentStore.md).[`constructor`](ComponentStore.md#constructor)

## プロパティ

### base \{#base}

```ts
readonly base: AbstractComponentClass<Command>;
```

定義: [src/component/ComponentStore.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L50)

この種別のコンポーネントが継承する基底クラス。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`base`](ComponentStore.md#base)

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/ComponentStore.ts:56](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L56)

コンテナ。レジストリへの登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`container`](ComponentStore.md#container)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/ComponentStore.ts:59](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L59)

このストア用の子ロガー。登録時に割り当てられます。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`logger`](ComponentStore.md#logger)

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/ComponentStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L47)

ストア名(= 自動探索ディレクトリ名)。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`name`](ComponentStore.md#name)

***

### suffix \{#suffix}

```ts
readonly suffix: string;
```

定義: [src/component/ComponentStore.ts:53](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L53)

クラス名から取り除く接尾辞([ComponentStoreOptions.suffix](../interfaces/ComponentStoreOptions.md#suffix))。

#### 継承元

[`ComponentStore`](ComponentStore.md).[`suffix`](ComponentStore.md#suffix)

## アクセッサー

### hasMentionCommands \{#hasmentioncommands}

#### 署名を取得する

```ts
get hasMentionCommands(): boolean;
```

定義: [src/command/CommandStore.ts:43](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L43)

メンションで反応するコマンドが1つでもあるか。

##### 戻り値

`boolean`

## メソッド

### applyOptions() \{#applyoptions}

```ts
protected applyOptions(command, options): void;
```

定義: [src/command/CommandStore.ts:47](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L47)

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

定義: [src/command/CommandStore.ts:76](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L76)

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

定義: [src/component/ComponentStore.ts:229](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L229)

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

定義: [src/command/CommandStore.ts:142](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L142)

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

定義: [src/command/CommandStore.ts:125](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L125)

スラッシュコマンドのインタラクションを担当コマンドへルーティングします。

#### パラメータ

##### interaction

`ChatInputCommandInteraction`

#### 戻り値

`Promise`\<`void`\>

***

### dispatchMention() \{#dispatchmention}

```ts
dispatchMention(message): Promise<boolean>;
```

定義: [src/command/CommandStore.ts:197](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L197)

メッセージが対象へのメンションを含んでいれば、担当のメンションコマンドを
実行します。対象にマッチしたかを返します(拒否・実行失敗でも `true` =
そのメッセージはメンションコマンドが消費した、という意味です)。

複数のコマンドの対象にマッチした場合は、本文で **最初に現れた** 対象の
コマンドを1つだけ実行します。Bot と Webhook は無視されます。

#### パラメータ

##### message

`Message`

#### 戻り値

`Promise`\<`boolean`\>

***

### dispatchMessage() \{#dispatchmessage}

```ts
dispatchMessage(message, prefixes): Promise<void>;
```

定義: [src/command/CommandStore.ts:161](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L161)

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

定義: [src/component/ComponentStore.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L122)

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

定義: [src/component/ComponentStore.ts:95](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L95)

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

定義: [src/command/CommandStore.ts:38](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L38)

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

定義: [src/component/ComponentStore.ts:77](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L77)

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

定義: [src/command/CommandStore.ts:240](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L240)

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

定義: [src/command/CommandStore.ts:98](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L98)

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

定義: [src/component/ComponentStore.ts:200](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L200)

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

定義: [src/component/ComponentStore.ts:217](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/ComponentStore.ts#L217)

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

定義: [src/command/CommandStore.ts:111](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/CommandStore.ts#L111)

ロードされていない Precondition を参照するコマンドを起動時に検出します。
全ストアのロード完了後にクライアントが呼びます。

#### パラメータ

##### preconditions

[`PreconditionStore`](PreconditionStore.md)

#### 戻り値

`void`
