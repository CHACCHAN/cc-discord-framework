# 抽象 クラス: Command

定義: [src/command/Command.ts:76](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L76)

コマンド。必要なフローを1つ以上実装してください:

- [Command.chatInputRun](#chatinputrun) — スラッシュコマンド(`/ping`)
- [Command.messageRun](#messagerun) — プレフィックスコマンド(`!ping`、`defaultPrefix` が必要)
- [Command.mentionRun](#mentionrun) — メンションコマンド(`@Bot こんにちは`、既定は Bot 自身への
  メンションに反応。`mentions` オプションで任意のユーザー ID に変えられます)
- [Command.autocompleteRun](#autocompleterun) — スラッシュオプションの autocomplete

```ts
@Command.define({ description: "Pong! と返します。" })
export class PingCommand extends Command {
  override async chatInputRun(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong!");
  }
}
```

コマンド名はクラス名から `Command` サフィックスを除きケバブケース化した
形が既定です(`UserInfoCommand` → `user-info`)。

## 拡張

- [`Component`](Component.md)

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Command(): Command;
```

#### 戻り値

`Command`

#### 継承元

[`Component`](Component.md).[`constructor`](Component.md#constructor)

## プロパティ

### aliases \{#aliases}

```ts
readonly aliases: readonly string[];
```

定義: [src/command/Command.ts:84](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L84)

プレフィックスコマンドの別名。

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/component/Component.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L30)

フレームワーク共有サービスを持つコンテナ。

#### 継承元

[`Component`](Component.md).[`container`](Component.md#container)

***

### defaultMemberPermissions \{#defaultmemberpermissions}

```ts
readonly defaultMemberPermissions: PermissionResolvable | null;
```

定義: [src/command/Command.ts:96](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L96)

Discord 側のデフォルト権限ゲート。

***

### description \{#description}

```ts
readonly description: string;
```

定義: [src/command/Command.ts:78](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L78)

Discord に表示される説明(メッセージ専用コマンドでは空文字)。

***

### descriptionLocalizations \{#descriptionlocalizations}

```ts
readonly descriptionLocalizations: Partial<Record<Locale, string | null>> | null;
```

定義: [src/command/Command.ts:105](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L105)

説明のローカライズ。

***

### guildIds \{#guildids}

```ts
readonly guildIds: readonly string[] | null;
```

定義: [src/command/Command.ts:99](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L99)

このスラッシュコマンドの登録先ギルド(`null` = クライアント既定 / グローバル)。

***

### location \{#location}

```ts
readonly location: string | null;
```

定義: [src/component/Component.ts:39](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L39)

自動探索されたファイルの絶対パス。明示登録の場合は `null`。

#### 継承元

[`Component`](Component.md).[`location`](Component.md#location)

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/component/Component.ts:36](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L36)

このコンポーネント用の子ロガー(`{ store, component }` が付与済み)。

#### 継承元

[`Component`](Component.md).[`logger`](Component.md#logger)

***

### mentions \{#mentions}

```ts
readonly mentions: readonly string[] | null;
```

定義: [src/command/Command.ts:111](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L111)

反応するメンションの対象(`"self"` = Bot 自身、それ以外はユーザー ID)。
`null` ならメンションでは反応しません。

***

### name \{#name}

```ts
readonly name: string;
```

定義: [src/component/Component.ts:27](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L27)

ストア内で一意なコンポーネント名。

#### 継承元

[`Component`](Component.md).[`name`](Component.md#name)

***

### nameLocalizations \{#namelocalizations}

```ts
readonly nameLocalizations: Partial<Record<Locale, string | null>> | null;
```

定義: [src/command/Command.ts:102](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L102)

名前のローカライズ。

***

### options \{#options}

```ts
readonly options: readonly APIApplicationCommandOption[];
```

定義: [src/command/Command.ts:81](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L81)

スラッシュコマンドのオプション(生の Discord API データ)。

***

### preconditions \{#preconditions}

```ts
readonly preconditions: readonly string[];
```

定義: [src/command/Command.ts:87](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L87)

このコマンドをガードする Precondition 名。

***

### requiredClientPermissions \{#requiredclientpermissions}

```ts
readonly requiredClientPermissions: PermissionResolvable | null;
```

定義: [src/command/Command.ts:93](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L93)

Bot にチャンネルで要求される権限。

***

### requiredUserPermissions \{#requireduserpermissions}

```ts
readonly requiredUserPermissions: PermissionResolvable | null;
```

定義: [src/command/Command.ts:90](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L90)

呼び出しメンバーに要求される権限。

***

### store \{#store}

```ts
readonly store: ComponentStore<Component>;
```

定義: [src/component/Component.ts:33](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L33)

このコンポーネントが属するストア。

#### 継承元

[`Component`](Component.md).[`store`](Component.md#store)

## アクセッサー

### client \{#client}

#### 署名を取得する

```ts
get client(): Client;
```

定義: [src/component/Component.ts:42](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L42)

フレームワーククライアント。

##### 戻り値

[`Client`](Client.md)

#### 継承元

[`Component`](Component.md).[`client`](Component.md#client)

***

### services \{#services}

#### 署名を取得する

```ts
get services(): Services;
```

定義: [src/component/Component.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L50)

ロード済みサービスへのアクセス(`services/` から自動収束)。
import せずに `this.services.<名前>` で参照できます。

##### 戻り値

[`Services`](../interfaces/Services.md)

#### 継承元

[`Component`](Component.md).[`services`](Component.md#services)

***

### supportsChatInput \{#supportschatinput}

#### 署名を取得する

```ts
get supportsChatInput(): boolean;
```

定義: [src/command/Command.ts:139](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L139)

スラッシュコマンドとして公開されるかどうか。

##### 戻り値

`boolean`

***

### supportsMention \{#supportsmention}

#### 署名を取得する

```ts
get supportsMention(): boolean;
```

定義: [src/command/Command.ts:149](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L149)

メンションで呼び出せるかどうか。

##### 戻り値

`boolean`

***

### supportsMessage \{#supportsmessage}

#### 署名を取得する

```ts
get supportsMessage(): boolean;
```

定義: [src/command/Command.ts:144](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L144)

メッセージプレフィックスで呼び出せるかどうか。

##### 戻り値

`boolean`

## メソッド

### autocompleteRun()? \{#autocompleterun}

```ts
optional autocompleteRun(interaction): unknown;
```

定義: [src/command/Command.ts:136](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L136)

このコマンドのオプションに対する autocomplete ハンドラ。

#### パラメータ

##### interaction

`AutocompleteInteraction`

#### 戻り値

`unknown`

***

### chatInputRun()? \{#chatinputrun}

```ts
optional chatInputRun(interaction): unknown;
```

定義: [src/command/Command.ts:119](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L119)

スラッシュコマンドの実装。

#### パラメータ

##### interaction

`ChatInputCommandInteraction`

#### 戻り値

`unknown`

***

### mentionRun()? \{#mentionrun}

```ts
optional mentionRun(message, content): unknown;
```

定義: [src/command/Command.ts:133](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L133)

メンションコマンドの実装 — 対象([CommandOptions.mentions](../interfaces/CommandOptions.md#mentions)、既定は
Bot 自身)へのメンションを含むメッセージに反応します。`content` には
本文から対象のメンションを取り除いて trim した文字列が渡ります。

本文を読むため **MessageContent インテントが必要** です。リプライの
ピン(返信時の通知)は本文に現れないので誤発火しません。Bot と Webhook
の発言も無視されます。

#### パラメータ

##### message

`Message`

##### content

`string`

#### 戻り値

`unknown`

***

### messageRun()? \{#messagerun}

```ts
optional messageRun(message, args): unknown;
```

定義: [src/command/Command.ts:122](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L122)

プレフィックス(メッセージ)コマンドの実装。

#### パラメータ

##### message

`Message`

##### args

`string`[]

#### 戻り値

`unknown`

***

### onLoad()? \{#onload}

```ts
optional onLoad(): unknown;
```

定義: [src/component/Component.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L55)

初期化後・ストア追加前に呼ばれます。

#### 戻り値

`unknown`

#### 継承元

[`Component`](Component.md).[`onLoad`](Component.md#onload)

***

### onUnload()? \{#onunload}

```ts
optional onUnload(): unknown;
```

定義: [src/component/Component.ts:58](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/component/Component.ts#L58)

ストアから取り除かれるときに呼ばれます(クライアント終了時を含む)。

#### 戻り値

`unknown`

#### 継承元

[`Component`](Component.md).[`onUnload`](Component.md#onunload)

***

### toApplicationCommand() \{#toapplicationcommand}

```ts
toApplicationCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody;
```

定義: [src/command/Command.ts:159](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L159)

このスラッシュコマンドの登録に使う Discord API ペイロードを構築します。
メタデータが扱わないフィールド(contexts、integration types など)を
追加したい場合は、オーバーライドして `super.toApplicationCommand()` の
結果を拡張してください。

#### 戻り値

`RESTPostAPIChatInputApplicationCommandsJSONBody`

***

### define() \{#define}

```ts
static define(options?): (_target, context) => void;
```

定義: [src/command/Command.ts:114](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/command/Command.ts#L114)

コマンドのメタデータを宣言します。

#### パラメータ

##### options?

[`CommandOptions`](../interfaces/CommandOptions.md) = `{}`

#### 戻り値

(`_target`, `context`) => `void`
