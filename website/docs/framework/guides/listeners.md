---
sidebar_position: 2
---

# リスナー

`Listener` は1つのクライアントイベントを観測します。イベントはデコレータ
で宣言し、ジェネリクスにも同じものを指定します — ジェネリクスが `run` の
引数を型付けし、両者の不一致はコンパイルエラーになります。

```ts title="src/listeners/MessageLogListener.ts"
import { Events, Listener, type Message } from "cc-discord-framework";

@Listener.define({ event: Events.MessageCreate })
export class MessageLogListener extends Listener<Events.MessageCreate> {
  override run(message: Message) {
    this.logger.info({ author: message.author.tag }, "メッセージを受信しました");
  }
}
```

オプション:

| オプション | 意味 |
| --- | --- |
| `event` | `ClientEvents` の任意のキー — discord.js のイベント**と**フレームワークイベント |
| `once` | 初回の1回で購読解除 |
| `name` | 導出名の上書き |

`once` の例:

```ts title="src/listeners/ReadyListener.ts"
@Listener.define({ event: Events.ClientReady, once: true })
export class ReadyListener extends Listener<Events.ClientReady> {
  override run(client: Client<true>) {
    this.logger.info({ tag: client.user.tag }, "準備完了");
  }
}
```

## フレームワークイベントもただのイベント

フレームワークのイベント(`commandDenied`、`commandError`、
`componentLoaded` など —
[エラー処理](./error-handling.md)参照)は discord.js と同じエミッターに
乗るため、リスナーで完全な型付きのまま扱えます:

```ts
@Listener.define({ event: "commandDenied" })
export class CommandDeniedListener extends Listener<"commandDenied"> {
  override async run(error: UserError, payload: CommandRunPayload) {
    // 独自の拒否処理 — フレームワークの既定動作を置き換える
  }
}
```

プラグインが発火するイベントも同じです — たとえば公式 Music プラグインの
`musicError` も、同じ形のリスナーで購読できます(イベント名と引数は
各プラグインのドキュメントを参照してください)。

## エラーの隔離

リスナーが例外を投げても Bot は落ちません: エラーは `listenerError`
イベントとして発火し(誰も購読していなければログ)、同じイベントの
他のリスナーはそのまま動き続けます。

## ライフサイクル

購読はロード時、解除はアンロード時に行われます — `client.destroy()` で
すべて解除されます。
