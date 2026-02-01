# デザイン変更に必要なファイル一覧

Google Geminiにデザイン変更を依頼する際に編集が必要なファイルをまとめました。

## 📋 デザイン変更の影響範囲

### 1. **グローバルスタイル（全ページ共通）**

#### `app/globals.css`
- **役割**: サイト全体のCSS変数、カラーテーマ、基本スタイル
- **変更内容**: 
  - カラーパレット（`--primary`, `--background`, `--foreground`など）
  - ダークモードの色設定
  - フォント設定
  - アニメーション（`@keyframes`）
  - レスポンシブ対応のメディアクエリ

#### `tailwind.config.ts`
- **役割**: Tailwind CSSの設定（カラー、フォント、スペーシングなど）
- **変更内容**:
  - カラーパレットの拡張
  - カスタムアニメーション
  - タイポグラフィ設定

#### `app/layout.tsx`
- **役割**: 全ページ共通のレイアウト構造
- **変更内容**:
  - ヘッダー/フッターの配置
  - メインコンテンツエリアの構造
  - テーマプロバイダーの設定

---

### 2. **共通コンポーネント（複数ページで使用）**

#### `components/header.tsx`
- **役割**: サイトヘッダー（ナビゲーション、ロゴ、検索）
- **変更内容**:
  - ヘッダーのレイアウト
  - ナビゲーションメニューのスタイル
  - モバイルメニューのデザイン

#### `components/footer.tsx`
- **役割**: サイトフッター（リンク、コピーライト）
- **変更内容**:
  - フッターのレイアウト
  - リンクの配置とスタイル

#### `components/post-card.tsx`
- **役割**: 記事カード（一覧ページで使用）
- **変更内容**:
  - カードのレイアウト
  - 画像の表示方法
  - タイトル・説明文のスタイル

#### `components/ui/` ディレクトリ
- **役割**: 再利用可能なUIコンポーネント
- **主要ファイル**:
  - `button.tsx` - ボタンのスタイル
  - `card.tsx` - カードコンテナのスタイル
  - `badge.tsx` - バッジ/タグのスタイル
  - `input.tsx` - 入力フィールドのスタイル

---

### 3. **ページ固有のデザイン**

#### `app/page.tsx` (トップページ)
- **役割**: ホームページのレイアウト
- **変更内容**:
  - 記事一覧のグリッドレイアウト
  - セクションの配置

#### `app/posts/page.tsx` (記事一覧ページ)
- **役割**: 全記事の一覧表示
- **変更内容**:
  - 一覧のレイアウト
  - フィルター/ソート機能のデザイン

#### `app/posts/[slug]/page.tsx` (記事詳細ページ)
- **役割**: 個別記事の表示
- **変更内容**:
  - 記事本文のレイアウト
  - メタ情報（日付、タグ、読了時間）の表示
  - 関連記事の表示方法

#### `app/tags/[tag]/page.tsx` (タグ別ページ)
- **役割**: タグ別記事一覧
- **変更内容**:
  - タグページのレイアウト

#### `components/hero-section.tsx`
- **役割**: トップページのヒーローセクション
- **変更内容**:
  - ヒーローセクションのデザイン

#### `components/sidebar.tsx`
- **役割**: サイドバーコンテンツ
- **変更内容**:
  - サイドバーのレイアウト

---

### 4. **特殊コンポーネント**

#### `components/post-addition.tsx`
- **役割**: 記事の追加コンテンツ（実践パート、FAQ等）
- **変更内容**:
  - 各セクション（実践、よくある誤り、FAQ、次のステップ）のデザイン

#### `components/author-box.tsx`
- **役割**: 筆者情報ボックス
- **変更内容**:
  - 筆者情報の表示スタイル

#### `components/reading-progress.tsx`
- **役割**: 読書進捗バー
- **変更内容**:
  - プログレスバーのデザイン（`globals.css`の`.reading-progress`も関連）

---

## 🎨 デザイン変更の優先度

### **高優先度（全体的なデザイン変更）**
1. `app/globals.css` - カラーパレット、基本スタイル
2. `tailwind.config.ts` - テーマ設定
3. `components/header.tsx` - ヘッダー
4. `components/footer.tsx` - フッター
5. `components/post-card.tsx` - 記事カード

### **中優先度（ページ固有の変更）**
6. `app/page.tsx` - トップページ
7. `app/posts/[slug]/page.tsx` - 記事詳細ページ
8. `app/posts/page.tsx` - 記事一覧ページ

### **低優先度（細かい調整）**
9. `components/ui/*` - UIコンポーネント
10. `components/post-addition.tsx` - 追加コンテンツ
11. `components/author-box.tsx` - 筆者情報

---

## 📝 Google Geminiへの依頼例

```
以下のNext.js 14 App Routerプロジェクトのデザインを変更したいです。

【技術スタック】
- Next.js 14.2.0 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui ベースのコンポーネント

【編集が必要なファイル】
1. app/globals.css - カラーパレット、基本スタイル
2. tailwind.config.ts - Tailwind設定
3. components/header.tsx - ヘッダー
4. components/footer.tsx - フッター
5. components/post-card.tsx - 記事カード
6. app/page.tsx - トップページ
7. app/posts/[slug]/page.tsx - 記事詳細ページ

【現在のデザイン】
- カラーパレット: indigo-500をアクセントカラーに使用
- レイアウト: ミニマルな白ベース
- ダークモード対応あり

【変更したい内容】
[ここに具体的な変更内容を記述]
```

---

## ⚠️ 注意事項

1. **カラー変更**: `app/globals.css`のCSS変数を変更すると、サイト全体の色が変わります
2. **レイアウト変更**: `app/layout.tsx`を変更すると、全ページの構造が変わります
3. **コンポーネント変更**: `components/`内のファイルを変更すると、そのコンポーネントを使用している全ページに影響します
4. **Tailwind設定**: `tailwind.config.ts`を変更した後は、ビルドが必要です
