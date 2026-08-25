# インターフェイス: ClientTexts

定義: [src/texts.ts:16](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L16)

**フレームワークがユーザーへ返す文言**のカタログ。

ここにあるのは、コマンドランタイムが Discord 上のエンドユーザーへ
そのまま返信する文言だけです。開発者向けのログや例外の文言は
含まれません(それらは Discord へは送られません)。

ここにある文言は **すべて差し替えられます**。ハードコードされていて
変えられない文言は存在しません。

```ts
new Client({ texts: { guildOnly: "This command is server-only." } })
```

## プロパティ

### commandError \{#commanderror}

```ts
commandError: string;
```

定義: [src/texts.ts:30](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L30)

コマンドが予期しないエラーで失敗した。

***

### guildOnly \{#guildonly}

```ts
guildOnly: string;
```

定義: [src/texts.ts:18](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L18)

ギルド内が前提の権限チェックを持つコマンドがギルド外(DM など)から呼ばれた。

***

### missingClientPermissions \{#missingclientpermissions}

```ts
missingClientPermissions: (permissions) => string;
```

定義: [src/texts.ts:22](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L22)

Bot の権限が不足している(引数は不足している権限名の一覧)。

#### パラメータ

##### permissions

readonly `string`[]

#### 戻り値

`string`

***

### missingUserPermissions \{#missinguserpermissions}

```ts
missingUserPermissions: (permissions) => string;
```

定義: [src/texts.ts:20](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L20)

実行者の権限が不足している(引数は不足している権限名の一覧)。

#### パラメータ

##### permissions

readonly `string`[]

#### 戻り値

`string`

***

### unknownPermissions \{#unknownpermissions}

```ts
unknownPermissions: string;
```

定義: [src/texts.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/texts.ts#L28)

権限情報そのものを取得できなかった。権限名の代わりに
[ClientTexts.missingUserPermissions](#missinguserpermissions) /
[ClientTexts.missingClientPermissions](#missingclientpermissions) の一覧へ渡されます。
