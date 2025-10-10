# SEO チェックリスト

## ✅ 検索エンジンへの表示状況

### 現在の実装状況

#### 1. robots.txt ✅
**ファイル**: `public/robots.txt`

```txt
User-agent: *
Allow: /

Sitemap: https://ielts-consult.netlify.app/sitemap.xml
```

**状態**: ✅ 正しく設定済み
- すべてのクローラーを許可
- サイトマップURLを指定

#### 2. sitemap.xml ✅
**ファイル**: `public/sitemap.xml`

**状態**: ✅ 生成済み（`pnpm run generate:sitemap` で自動生成）
- 全ページのURL、変更頻度、優先度を含む
- ビルド時に自動更新

#### 3. RSS Feed ✅
**ファイル**: `public/rss.xml`

**状態**: ✅ 生成済み（`pnpm run generate:rss` で自動生成）
- 最新20件の記事を含む
- ビルド時に自動更新

#### 4. メタタグ ✅
**ファイル**: `app/layout.tsx`、各ページの `page.tsx`

**実装内容**:
- `<title>`: 各ページで適切に設定
- `<meta name="description">`: 各ページで設定
- Open Graph タグ（OGP）: SNSシェア最適化
- Twitter Card: Twitter共有時の表示最適化
- Canonical URL: 重複コンテンツ防止

#### 5. 構造化データ ✅
**予定**: BlogPosting スキーマを追加（次のステップ）

---

## 🔍 Google検索への登録状況

### 現在の状態

**登録状況**: ❓ 未確認

Netlifyにデプロイ後、以下の手順で確認・登録が必要です。

### Google Search Console への登録手順

#### ステップ1: サイトの所有権確認

1. [Google Search Console](https://search.google.com/search-console) にアクセス
2. プロパティを追加: `https://ielts-consult.netlify.app`
3. 所有権の確認方法を選択:
   - **推奨**: HTMLファイル（Netlifyにアップロード）
   - または DNS レコード
   - または HTMLタグ（`app/layout.tsx` に追加）

#### ステップ2: サイトマップの送信

1. Google Search Console のダッシュボード
2. 「サイトマップ」セクションに移動
3. サイトマップURLを追加: `https://ielts-consult.netlify.app/sitemap.xml`
4. 送信

#### ステップ3: インデックス登録のリクエスト

1. 「URL検査」ツールを使用
2. トップページのURLを入力
3. 「インデックス登録をリクエスト」をクリック

---

## 📊 SEO対策の完了状況

| 項目 | 状態 | 説明 |
|------|------|------|
| robots.txt | ✅ | すべてのクローラーを許可 |
| sitemap.xml | ✅ | 自動生成（ビルド時） |
| RSS Feed | ✅ | 最新記事を配信 |
| メタタグ | ✅ | title, description設定済み |
| OGP | ✅ | SNS共有最適化 |
| Twitter Card | ✅ | Twitter共有最適化 |
| Canonical URL | ✅ | 重複防止 |
| 構造化データ | 🔄 | 今後追加予定 |
| Google Search Console | ❓ | 手動登録が必要 |
| Google Analytics | ⏸️ | 環境変数で設定可能 |

---

## 🚀 インデックス登録を早める方法

### 1. Google Search Console に登録（最重要）

上記の手順に従って登録してください。

### 2. 外部リンクを増やす

- noteの記事からブログへリンク
- SNSでブログURLを共有
- 関連サイトで紹介してもらう

### 3. 定期的な更新

- 新しい記事を定期的に追加
- 既存記事を更新
- sitemap.xmlが自動更新される

### 4. ソーシャルシグナル

- TwitterでブログURLをシェア
- Facebookで共有
- noteからリンク

---

## 📈 インデックス状況の確認方法

### 方法1: Google検索

```
site:ielts-consult.netlify.app
```

このクエリで検索し、サイトのページがヒットするか確認。

### 方法2: Google Search Console

「カバレッジ」レポートでインデックス状況を確認。

### 方法3: URL検査ツール

個別のページがインデックスされているか確認。

---

## ⏰ インデックスされるまでの時間

- **通常**: 数日〜2週間
- **Search Console登録後**: 1〜3日
- **サイトマップ送信後**: 早ければ数時間

---

## 💡 SEOを強化する今後のステップ

### 短期（1週間以内）

- [ ] Google Search Console に登録
- [ ] サイトマップを送信
- [ ] トップページのインデックスをリクエスト

### 中期（1ヶ月以内）

- [ ] 構造化データ（BlogPosting）を実装
- [ ] Google Analytics を設定
- [ ] 記事に内部リンクを追加

### 長期（継続的）

- [ ] 定期的な記事更新
- [ ] 外部からの被リンク獲得
- [ ] ページ速度の最適化
- [ ] モバイルフレンドリーの維持

---

## 🔗 参考リンク

- [Google Search Console](https://search.google.com/search-console)
- [Googleサイトマップについて](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [構造化データテストツール](https://developers.google.com/search/docs/appearance/structured-data)

---

**現状**: サイトは検索エンジンに表示される準備ができています。Google Search Console への登録が次のステップです。

