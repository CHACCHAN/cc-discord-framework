# インターフェイス: CommandOptions

定義: src/command/Command.ts:17

`@Command.define({...})` で宣言するコマンドメタデータ。

## 拡張

- [`ComponentOptions`](ComponentOptions.md)

## プロパティ

### aliases? \{#aliases}

```ts
optional aliases?: string[];
```

定義: src/command/Command.ts:26

プレフィックス(メッセージ)形式での別名。

***

### defaultMemberPermissions? \{#defaultmemberpermissions}

```ts
optional defaultMemberPermissions?: PermissionResolvable;
```

定義: src/command/Command.ts:34

Discord 側のデフォルト権限ゲート(`default_member_permissions`)。

***

### description? \{#description}

```ts
optional description?: string;
```

定義: src/command/Command.ts:19

Discord に表示される説明。スラッシュコマンドでは必須です。

***

### descriptionLocalizations? \{#descriptionlocalizations}

```ts
optional descriptionLocalizations?: Partial<Record<Locale, string | null>>;
```

定義: src/command/Command.ts:43

説明のローカライズ。

***

### guildIds? \{#guildids}

```ts
optional guildIds?: string[];
```

定義: src/command/Command.ts:39

このスラッシュコマンドを登録するギルド。既定はクライアントの
`applicationGuildIds`。どちらも未設定ならグローバル登録になります。

***

### name? \{#name}

```ts
optional name?: string;
```

定義: src/component/Component.ts:13

ストア内で一意なコンポーネント名。
省略時はクラス名から導出されます(例: `PingCommand` → `ping`)。

#### 継承元

[`ComponentOptions`](ComponentOptions.md).[`name`](ComponentOptions.md#name)

***

### nameLocalizations? \{#namelocalizations}

```ts
optional nameLocalizations?: Partial<Record<Locale, string | null>>;
```

定義: src/command/Command.ts:41

コマンド名のローカライズ。

***

### options? \{#options}

```ts
optional options?: APIApplicationCommandOption[];
```

定義: src/command/Command.ts:24

スラッシュコマンドのオプション(引数)。discord.js / discord-api-types
が使う生の Discord API 形式そのままで、再抽象化はしません。

***

### preconditions? \{#preconditions}

```ts
optional preconditions?: string[];
```

定義: src/command/Command.ts:28

実行前に通過が必要な Precondition 名。

***

### requiredClientPermissions? \{#requiredclientpermissions}

```ts
optional requiredClientPermissions?: PermissionResolvable;
```

定義: src/command/Command.ts:32

Bot 自身にチャンネルで必要な権限(ギルド内で検査)。

***

### requiredUserPermissions? \{#requireduserpermissions}

```ts
optional requiredUserPermissions?: PermissionResolvable;
```

定義: src/command/Command.ts:30

呼び出しメンバーに必要な権限(ギルド内で検査)。
