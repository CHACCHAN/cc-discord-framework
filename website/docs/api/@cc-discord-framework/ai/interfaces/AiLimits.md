# インターフェイス: AiLimits

定義: plugins/ai/src/config.ts:62

数量の上限。

## プロパティ

### cooldown \{#cooldown}

```ts
readonly cooldown: number | false;
```

定義: plugins/ai/src/config.ts:75

同じユーザーが続けて [AiService.reply](../classes/AiService.md#reply) を呼べるまでのミリ秒。
`false` で無制限。

**失敗した呼び出しは数えません**(モデル未設定やプロバイダー障害など
で本文を1文字も届けられなかった場合は払い戻されます)。途中まで
表示できた応答は数えます。

***

### maxPromptLength \{#maxpromptlength}

```ts
readonly maxPromptLength: number;
```

定義: plugins/ai/src/config.ts:64

受け付ける入力の最大文字数。

***

### maxResponseLength \{#maxresponselength}

```ts
readonly maxResponseLength: number | false;
```

定義: plugins/ai/src/config.ts:66

表示する応答の最大文字数。超えた分は切り詰めます。`false` で無制限。
