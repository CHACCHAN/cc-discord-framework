# クラス: Client\<Ready\>

定義: [src/client.ts:99](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L99)

フレームワーククライアント — コンテナ・コンポーネントストア・コマンド
ランタイムを備えた discord.js の `Client` です。

決められたディレクトリ(`services/` `commands/` `listeners/`
`preconditions/` ...)にクラスを置くだけで、フレームワークが自動で
インポートして制御します。エントリポイントは最小で済みます:

```ts
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});
await client.login(); // DISCORD_TOKEN 環境変数を自動使用
```

ライフサイクル: `login()` → プラグイン install → ストアのロード
(明示登録 + ファイル自動探索)→ ディスパッチャ接続 → ゲートウェイ接続
→ ready 後にスラッシュコマンド同期。

## 拡張

- `Client`\<`Ready`\>

## 型パラメーター

### Ready

`Ready` *extends* `boolean` = `boolean`

## コンストラクター

### コンストラクター \{#constructor}

```ts
new Client<Ready>(options): Client<Ready>;
```

定義: [src/client.ts:132](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L132)

#### パラメータ

##### options

[`ClientOptions`](../interfaces/ClientOptions.md)

#### 戻り値

`Client`\<`Ready`\>

#### 上書き

```ts
DiscordClient<Ready>.constructor
```

## プロパティ

### baseDirectory \{#basedirectory}

```ts
readonly baseDirectory: string | null;
```

定義: [src/client.ts:110](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L110)

解決済みの自動探索ルート(`null` = 自動探索なし)。

***

### container \{#container}

```ts
readonly container: Container;
```

定義: [src/client.ts:101](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L101)

フレームワーク共有サービス。

***

### logger \{#logger}

```ts
readonly logger: Logger;
```

定義: [src/client.ts:104](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L104)

ルートの pino ロガー。

***

### stores \{#stores}

```ts
readonly stores: StoreRegistry;
```

定義: [src/client.ts:107](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L107)

すべてのコンポーネントストア。

## メソッド

### destroy() \{#destroy}

```ts
destroy(): Promise<void>;
```

定義: [src/client.ts:201](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L201)

全コンポーネントをアンロード(`onUnload` 実行)してから接続を破棄します。

#### 戻り値

`Promise`\<`void`\>

#### 上書き

```ts
DiscordClient.destroy
```

***

### load() \{#load}

```ts
load(): Promise<void>;
```

定義: [src/client.ts:189](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L189)

Discord に接続せずにフレームワークを起動します: プラグインの
インストール、全コンポーネントのロード、ディスパッチャの接続。
冪等で、`login()` から自動的に呼ばれます。テストや起動スモーク
チェックに便利です。

#### 戻り値

`Promise`\<`void`\>

***

### login() \{#login}

```ts
login(token?): Promise<string>;
```

定義: [src/client.ts:195](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L195)

フレームワークをロードし、Discord ゲートウェイへ接続します。

#### パラメータ

##### token?

`string`

#### 戻り値

`Promise`\<`string`\>

#### 上書き

```ts
DiscordClient.login
```

***

### register() \{#register}

```ts
register(...classes): this;
```

定義: [src/client.ts:172](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/client.ts#L172)

コンポーネントクラスを明示登録します。担当ストアは各クラスの基底
(Command / Listener / Precondition / Service / プラグイン追加種別)
から自動で推論されます。

`load()` 前の呼び出しはキューに積まれ、プラグインの install 後に
解決されるため、プラグイン種別のコンポーネントも呼び出し順を
気にせず登録できます。`load()` 開始後(= プラグインの install 中)の
呼び出しは、**何番目のプラグインからでも** 同じようにその場で
ストアへ渡されます。

#### パラメータ

##### classes

...[`ComponentClass`](../type-aliases/ComponentClass.md)\<[`Component`](Component.md)\>[]

#### 戻り値

`this`
