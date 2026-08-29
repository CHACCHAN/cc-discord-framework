# インターフェイス: ContainerValueDefinition\<T\>

定義: src/containerValues.ts:15

`container/` ディレクトリの1ファイルが定義する、コンテナへ登録する値。

Prisma クライアントや Redis 接続のような「プロジェクト全体で共有したい
インスタンス」の置き場を規約で決めるための仕組みです。ファイルを置くだけで
起動時に [Container](../classes/Container.md) へ登録され、どのコンポーネントからも
`this.container.<名前>` で参照できます。

## 型パラメーター

### T

`T` = `unknown`

## プロパティ

### create \{#create}

```ts
create: (container) => T | Promise<T>;
```

定義: src/containerValues.ts:26

値を作るファクトリ。async でもかまいません。クライアント毎に呼ばれる
ため、モジュールレベルでインスタンスを作らずに済みます(複数クライアント
構成やテストでも状態が混ざりません)。

#### パラメータ

##### container

[`Container`](../classes/Container.md)

#### 戻り値

`T` \| `Promise`\<`T`\>

***

### dispose? \{#dispose}

```ts
optional dispose?: (value, container) => unknown;
```

定義: src/containerValues.ts:31

`client.destroy()` 時の後始末(Prisma の `$disconnect()` など)。省略可。
読み込みの逆順で呼ばれます。

#### パラメータ

##### value

`T`

##### container

[`Container`](../classes/Container.md)

#### 戻り値

`unknown`

***

### name? \{#name}

```ts
optional name?: string;
```

定義: src/containerValues.ts:20

コンテナ上のプロパティ名。省略するとファイル名から導出されます
(`prisma.ts` → `prisma`、`my-db.ts` → `myDb`、`user_store.ts` → `userStore`)。
