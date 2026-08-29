# 関数: collectModuleFiles()

```ts
function collectModuleFiles(directory): Promise<string[]>;
```

定義: [src/discovery.ts:19](https://github.com/CHACCHAN/cc-discord-framework/blob/c8c1c5297ccf162fce0229ff77097e48ca75ab3e/src/discovery.ts#L19)

ディレクトリ配下から「モジュールとして読み込むファイル」を集めます。

フレームワークのディレクトリ規約(コンポーネント自動探索と設定
ディレクトリ)はどちらもこの規則の上に成り立っています。プラグインが
独自のディレクトリを走査するときも、同じ規則をそのまま使えます。

- `**/*.{ts,tsx,js,jsx}` を再帰的に走査(サブディレクトリも対象)
- パスの途中を含め、`_` で始まるファイル・ディレクトリはスキップ
- 型定義(`*.d.ts`)とテスト(`*.test.*` / `*.spec.*`)はスキップ
- 結果はパスの昇順にソート(ロード順を決定的にするため)

ディレクトリが存在しない場合は空配列を返します — 使っていない規約
ディレクトリを作らずに済ませるためです。

## パラメータ

### directory

`string`

## 戻り値

`Promise`\<`string`[]\>
