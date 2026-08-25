# 関数: defineOptions()

```ts
function defineOptions<T>(options): (_target, context) => void;
```

定義: [src/component/metadata.ts:51](https://github.com/CHACCHAN/cc-discord-framework/blob/c981e0102bdf422544ebe8652100f9e9fafb03c7/src/component/metadata.ts#L51)

`options` をコンポーネントメタデータとして記録するクラスデコレータを
生成します。

すべての `X.define(...)` デコレータ — プラグインが追加するカスタム種別の
ものも含めて — の唯一のプリミティブです:

```ts
export abstract class Task extends Component {
  static define(options: TaskOptions = {}) {
    return defineOptions<Task>(options);
  }
}
```

ジェネリクスにより、意図した基底クラスを継承していないクラスへの適用は
コンパイルエラーになります — `Listener<"clientReady">` のサブクラスに
`@Listener.define({ event: "messageCreate" })` は付けられません。

## 型パラメーター

### T

`T` *extends* [`Component`](../classes/Component.md)

## パラメータ

### options

`object`

## 戻り値

(`_target`, `context`) => `void`
