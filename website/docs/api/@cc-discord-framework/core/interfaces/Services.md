# インターフェイス: Services

定義: [src/service/Service.ts:19](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/service/Service.ts#L19)

サービス名からインスタンスへの型マップ。`this.services.<名前>` の型は
このインターフェースで決まります。サービスを定義したら、同じファイルで
宣言マージしてください:

```ts
export class ConfigService extends Service { ... }

declare module "@cc-discord-framework/core" {
  interface Services {
    config: ConfigService;
  }
}
```
