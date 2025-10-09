# ローカル開発環境のセットアップ

このドキュメントは、ローカル環境でプロジェクトを開発する際の Node.js バージョン管理について説明します。

## Node.js バージョン管理

### Netlify との違い

- **Netlify**: `netlify.toml` の `NODE_VERSION` で管理
- **ローカル**: 任意のバージョンマネージャーを使用可能

### ローカルでの推奨セットアップ

#### 1. nvm を使用する場合

プロジェクトルートで以下を実行：

```bash
# Node.js 20.x の最新版をインストール
nvm install 20
nvm use 20

# または、ローカルで .nvmrc を作成（Netlify にはコミットしない）
echo "20" > .nvmrc
nvm use
```

**注意**: `.nvmrc` はローカル開発用のみ。Git にコミットしないでください。

#### 2. nodenv を使用する場合

```bash
# .node-version を作成（ローカルのみ）
echo "20.11.0" > .node-version
nodenv install 20.11.0
```

#### 3. Volta を使用する場合

```bash
volta install node@20
```

Volta は `package.json` の `engines.node` フィールドを参照します。

### package.json での管理

`package.json` に既に以下が設定されています：

```json
{
  "engines": {
    "node": ">=20.0.0 <21"
  }
}
```

これにより、Node.js 20.x であることが保証されます。

## 開発フロー

### 1. 初回セットアップ

```bash
# Node.js 20.x がインストールされていることを確認
node -v  # v20.x.x と表示されるはず

# 依存パッケージのインストール
pnpm install
```

### 2. 記事のインポート

```bash
# 既存HTMLをMDX形式に変換
pnpm run import:note
```

### 3. 開発サーバー起動

```bash
pnpm run dev
```

http://localhost:3000 でサイトが表示されます。

### 4. ビルド確認

```bash
# 本番ビルド
pnpm run build

# ビルド結果の確認
pnpm run start
```

## トラブルシューティング

### Node.js バージョンが違う

```bash
# 現在のバージョン確認
node -v

# 20.x でない場合
nvm install 20
nvm use 20
# または
nodenv install 20.11.0
nodenv local 20.11.0
```

### pnpm がない

```bash
# Corepack を有効化（Node.js 16.9.0+）
corepack enable

# または、npm でインストール
npm install -g pnpm
```

### ビルドエラー

```bash
# キャッシュクリア
rm -rf .next node_modules
pnpm install
pnpm run build
```

## CI/CD との違い

| 項目 | ローカル | Netlify |
|------|---------|---------|
| Node.js 管理 | nvm/nodenv/Volta | `netlify.toml` |
| バージョン指定 | `.nvmrc` 可 | `NODE_VERSION` 環境変数 |
| pnpm | 手動 or Corepack | Corepack（自動） |

## ベストプラクティス

1. **ローカル開発**:
   - `.nvmrc` を作成して `.gitignore` に追加
   - または、グローバルに Node.js 20.x をインストール

2. **Netlify デプロイ**:
   - `netlify.toml` の `NODE_VERSION` のみ使用
   - `.nvmrc` はコミットしない

3. **チーム開発**:
   - `package.json` の `engines.node` を参照
   - README で推奨 Node.js バージョンを明記

---

開発中に問題が発生した場合は、`README.md` または `SETUP.md` も参照してください。

