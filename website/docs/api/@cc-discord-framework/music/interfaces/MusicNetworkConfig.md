# インターフェイス: MusicNetworkConfig

定義: plugins/music/src/config.ts:46

音源の取得まわり。

## プロパティ

### audioExtensions \{#audioextensions}

```ts
readonly audioExtensions: readonly string[];
```

定義: plugins/music/src/config.ts:50

音声ファイルとして扱う拡張子(小文字・ドットなし)。

***

### maxRedirects \{#maxredirects}

```ts
readonly maxRedirects: number;
```

定義: plugins/music/src/config.ts:57

HTTP 音源で追従するリダイレクトの上限。

***

### privateHostAllowlist \{#privatehostallowlist}

```ts
readonly privateHostAllowlist: readonly string[];
```

定義: plugins/music/src/config.ts:63

プライベート・ループバック・link-local などのアドレスへの接続を
明示的に許可するホスト名または IP アドレス。完全一致で比較します。
リダイレクト先は、そのホストも個別に許可する必要があります。

***

### requestTimeout \{#requesttimeout}

```ts
readonly requestTimeout: number;
```

定義: plugins/music/src/config.ts:55

HTTP 音源でレスポンスヘッダーを待つ上限(ミリ秒)。DNS 解決と
リダイレクトもこの時間に含みます。

***

### userAgent \{#useragent}

```ts
readonly userAgent: string;
```

定義: plugins/music/src/config.ts:48

このプラグインが外部へ出すリクエストの User-Agent(音源取得・メタデータ取得とも)。
