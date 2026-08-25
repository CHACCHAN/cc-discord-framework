# 変数: FrameworkEvents

```ts
const FrameworkEvents: object;
```

定義: src/events.ts:14

フレームワークがクライアント上で発火するイベント。通常の discord.js
イベントシステムに乗るため、`client.on(...)` と `Listener` コンポーネント
のどちらからでも観測できます。

## 型宣言

### CommandDenied \{#commanddenied}

```ts
readonly CommandDenied: "commandDenied" = "commandDenied";
```

Precondition がコマンドを拒否: `(error, payload)`

### CommandError \{#commanderror}

```ts
readonly CommandError: "commandError" = "commandError";
```

コマンド(または autocomplete)が例外を投げた: `(error, payload)`

### CommandRun \{#commandrun}

```ts
readonly CommandRun: "commandRun" = "commandRun";
```

コマンド実行直前(Precondition 通過後): `(payload)`

### CommandsSynced \{#commandssynced}

```ts
readonly CommandsSynced: "commandsSynced" = "commandsSynced";
```

アプリケーションコマンドの Discord 同期完了: `(result)`

### ComponentLoaded \{#componentloaded}

```ts
readonly ComponentLoaded: "componentLoaded" = "componentLoaded";
```

コンポーネントのロード完了: `(component)`

### ComponentUnloaded \{#componentunloaded}

```ts
readonly ComponentUnloaded: "componentUnloaded" = "componentUnloaded";
```

コンポーネントのアンロード: `(component)`

### ListenerError \{#listenererror}

```ts
readonly ListenerError: "listenerError" = "listenerError";
```

リスナーコンポーネントが例外を投げた: `(error, listener)`
