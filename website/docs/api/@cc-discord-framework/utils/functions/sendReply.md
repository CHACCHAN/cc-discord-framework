# 関数: sendReply()

```ts
function sendReply(
   target, 
   payload, 
options?): Promise<SentReply>;
```

定義: plugins/utils/src/reply.ts:28

送信元の作法に合わせて送信し、書き換え口とともに返します。

## パラメータ

### target

[`ReplyTarget`](../type-aliases/ReplyTarget.md)

### payload

`BaseMessageOptions`

### options?

#### ephemeral?

`boolean`

## 戻り値

`Promise`\<[`SentReply`](../interfaces/SentReply.md)\>
