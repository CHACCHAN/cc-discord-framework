# インターフェイス: SentReply

定義: [plugins/utils/src/reply.ts:15](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/reply.ts#L15)

送信済みメッセージと、その正しい書き換え方の組。

## プロパティ

### message \{#message}

```ts
readonly message: Message;
```

定義: [plugins/utils/src/reply.ts:17](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/reply.ts#L17)

送信されたメッセージ(コレクターを張る対象)。

## メソッド

### edit() \{#edit}

```ts
edit(payload): Promise<Message<boolean>>;
```

定義: [plugins/utils/src/reply.ts:19](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/utils/src/reply.ts#L19)

送信元に応じた方法で内容を差し替えます。

#### パラメータ

##### payload

`BaseMessageOptions`

#### 戻り値

`Promise`\<`Message`\<`boolean`\>\>
