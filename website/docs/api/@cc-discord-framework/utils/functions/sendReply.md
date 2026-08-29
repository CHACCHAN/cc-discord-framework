# 関数: sendReply()

```ts
function sendReply(
   target, 
   payload, 
options?): Promise<SentReply>;
```

定義: [plugins/utils/src/reply.ts:28](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/reply.ts#L28)

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
