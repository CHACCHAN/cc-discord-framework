---
sidebar_position: 3
---

# Precondition

`Precondition` はコマンドの前に走る再利用可能なガードです。通過なら
`this.ok()`、ブロックなら `this.deny(理由)` を返します。

```ts title="src/preconditions/OwnerOnlyPrecondition.ts"
import {
  Precondition,
  type ChatInputCommandInteraction,
  type Message,
} from "cc-discord-framework";

export class OwnerOnlyPrecondition extends Precondition {
  override chatInputRun(interaction: ChatInputCommandInteraction) {
    return this.#check(interaction.user.id);
  }

  override messageRun(message: Message) {
    return this.#check(message.author.id);
  }

  #check(userId: string) {
    return this.services.config.ownerIds.includes(userId)
      ? this.ok()
      : this.deny("このコマンドはBotのオーナーのみ使用できます。");
  }
}

declare module "cc-discord-framework" {
  interface Preconditions {
    OwnerOnly: never;
  }
}
```

名前で取り付けます(名前はクラス名から `Precondition` サフィックスを
除いた形 — `OwnerOnlyPrecondition` → `OwnerOnly`):

```ts
@Command.define({ description: "...", preconditions: ["OwnerOnly"] })
```

## 型安全な名前

`Preconditions` インターフェースが `preconditions` 配列を型付けします。
宣言マージがない間は任意の文字列を受け付け、宣言した時点で宣言済みの
名前だけが型チェックを通ります。どちらの場合でも、**未知の名前は起動時
エラー**です — ロードされていない Precondition を参照するコマンドは
`client.load()` 中に `ComponentLoadError` を投げます。

## フローは一致していなければならない

コマンドがあるフロー(例: スラッシュ)をサポートするなら、そのコマンドを
ガードするすべての Precondition がそのフローの判定(`chatInputRun`)を
実装している必要があります。未実装はディスパッチ時のエラーです —
黙って通過するガードは存在しません。

## 拒否

`this.deny(理由)` は Precondition 名を `identifier` に持つ `UserError` を
生成します。フレームワークは `commandDenied` を発火し、既定動作は呼び出
した本人への返信(スラッシュはエフェメラル)です。自分の `commandDenied`
リスナーを登録すれば置き換わります([エラー処理](./error-handling.md))。

## 組み込みの権限チェック

日常的な権限ゲートにカスタム Precondition は不要です — コマンドの
メタデータで宣言してください:

```ts
@Command.define({
  requiredUserPermissions: "ManageGuild",
  requiredClientPermissions: ["SendMessages", "EmbedLinks"],
})
```

これらは名前付き Precondition より先に走り、同じ `commandDenied` フロー
になります(identifier は `userPermissions` / `clientPermissions`)。
拒否時にユーザーへ返る文言はクライアントの `texts` オプションで
差し替えられます([エラー処理](./error-handling.md))。
