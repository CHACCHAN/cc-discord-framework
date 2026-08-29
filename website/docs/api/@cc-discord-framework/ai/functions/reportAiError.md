# 関数: reportAiError()

```ts
function reportAiError(
   client, 
   logger, 
   error, 
   info): void;
```

定義: [plugins/ai/src/events.ts:96](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/plugins/ai/src/events.ts#L96)

内部で処理したエラーを知らせます。

`aiError` を購読しているリスナーが1つでもいれば、そこへ渡すだけで
終わりです。**誰も購読していなければ**、既定動作としてログへ残します
(フレームワークの `commandError` と同じ形)。

ここを通るのは「握りつぶさずに続行した」エラー — ツールの失敗、
ストリーミング編集の失敗、履歴の読み書きの失敗 — だけです。
呼び出し元へ返すべきエラーはそのまま throw されます。

## パラメータ

### client

[`Client`](../../core/classes/Client.md)

### logger

`Logger`

### error

`unknown`

### info

[`AiErrorInfo`](../interfaces/AiErrorInfo.md)

## 戻り値

`void`
