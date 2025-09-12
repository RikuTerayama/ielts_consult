# IELTS コンテンツサイト

AstroベースのIELTS Writing Task 2記事サイトです。

## セットアップ

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# 本番ビルド
npm run build
```

## WXRファイル変換

### 1. ファイル検査

まず、WXRファイルの内容を確認します：

```bash
npm run wxr:inspect
```

このコマンドで以下を確認できます：
- 総アイテム数とファイルサイズ
- 投稿タイプ別の内訳
- 最初の10件のタイトルとスラッグ
- 分割の必要性の判定

### 2. Markdown変換

検査結果で「問題なし」と表示された場合、以下のコマンドで変換を実行：

```bash
npm run wxr:convert
```

#### フィルタリングオプション

特定の記事のみを変換したい場合：

```bash
# タイトルに「IELTS」を含む記事のみ変換
npm run wxr:convert -- --include "IELTS"

# 「テスト」を含まない記事を変換
npm run wxr:convert -- --exclude "テスト"

# 複数条件（正規表現使用）
npm run wxr:convert -- --include "Writing|Speaking" --exclude "draft"
```

### 3. WXR分割（任意）

ファイルが大きすぎる場合や、部分的に変換したい場合：

```bash
# 10件ずつに分割
npm run wxr:split

# 5件ずつに分割
npm run wxr:split -- --per 5
```

分割後は各ファイルを個別に変換：

```bash
npm run wxr:convert -- --xml input/wxr-split/part01.xml
```

## 実行順のガイダンス

1. **`npm run wxr:inspect`** でWXRファイルを検査
2. **「問題なし」** と表示されたら **`npm run wxr:convert`** で変換実行
3. **分割推奨** と表示されたら **`npm run wxr:split`** で分割後、各ファイルを個別変換

## 環境変数

以下の環境変数を設定することで、追加機能が有効になります：

```env
PUBLIC_SITE_URL=https://your-site.netlify.app
PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxx
GSC_META=your-google-site-verification-code
BING_META=your-bing-verification-code
INDEXNOW_KEY=your-indexnow-key
```

## ファイル構成

```
src/
├── content/blog/          # 変換されたMarkdownファイル
├── layouts/               # レイアウトファイル
├── pages/                 # ページファイル
└── components/            # コンポーネント

public/
├── images/                # 記事画像（<slug>/ 配下）
└── robots.txt

scripts/
├── wxr-inspect.mjs       # WXR検査スクリプト
├── wxr-to-md.mjs         # 変換スクリプト
├── wxr-split.mjs         # 分割スクリプト
└── ensure-content.mjs    # プレースホルダー生成スクリプト
```

## ローカル運用の恒久対策

### 初回セットアップ
1. **WXRファイルとアセットを配置**:
   - `input/note-ielts_consult-1.xml` にWXRファイルを配置
   - `input/assets/` に画像アセットを配置

2. **記事を生成**:
   ```bash
   npm run wxr:convert
   ```
   これにより以下が生成されます：
   - `src/content/blog/*.md` - Markdown記事ファイル
   - `public/images/<slug>/` - 処理済み画像ファイル

3. **生成物をコミット**:
   ```bash
   git add src/content/blog public/images
   git commit -m "Add blog content and images"
   git push
   ```

### 継続運用
- **Netlify自動デプロイ**: コミット＆プッシュ後、Netlifyが自動でビルド・デプロイ
- **プレースホルダー機能**: 記事がない場合、`ensure-content.mjs`が一時記事を生成（本番導線は早めに実記事へ移行推奨）

### トラブルシューティング
- **記事が表示されない**: `src/content/blog/` に`.md`ファイルが存在するか確認
- **画像が表示されない**: `public/images/` に画像ファイルが存在するか確認
- **ビルドエラー**: `npm run build` でローカルビルドをテスト
