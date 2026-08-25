# インターフェイス: MusicNetworkConfig

定義: [plugins/music/src/config.ts:46](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L46)

音源の取得まわり。

## プロパティ

### audioExtensions \{#audioextensions}

```ts
readonly audioExtensions: readonly string[];
```

定義: [plugins/music/src/config.ts:50](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L50)

音声ファイルとして扱う拡張子(小文字・ドットなし)。

***

### maxRedirects \{#maxredirects}

```ts
readonly maxRedirects: number;
```

定義: [plugins/music/src/config.ts:57](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L57)

HTTP 音源で追従するリダイレクトの上限。

***

### privateHostAllowlist \{#privatehostallowlist}

```ts
readonly privateHostAllowlist: readonly string[];
```

定義: [plugins/music/src/config.ts:63](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L63)

プライベート・ループバック・link-local などのアドレスへの接続を
明示的に許可するホスト名または IP アドレス。完全一致で比較します。
リダイレクト先は、そのホストも個別に許可する必要があります。

***

### requestTimeout \{#requesttimeout}

```ts
readonly requestTimeout: number;
```

定義: [plugins/music/src/config.ts:55](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L55)

HTTP 音源でレスポンスヘッダーを待つ上限(ミリ秒)。DNS 解決と
リダイレクトもこの時間に含みます。

***

### userAgent \{#useragent}

```ts
readonly userAgent: string;
```

定義: [plugins/music/src/config.ts:48](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/plugins/music/src/config.ts#L48)

このプラグインが外部へ出すリクエストの User-Agent(音源取得・メタデータ取得とも)。
