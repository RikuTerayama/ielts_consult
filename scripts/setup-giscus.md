# Giscusコメント機能の設定手順

## 1. GitHubリポジトリの設定

### 1.1 Discussions機能を有効化
1. GitHubリポジトリ（RikuTerayama/ielts_consult）にアクセス
2. Settings → General → Features
3. "Discussions" にチェックを入れて有効化

### 1.2 Giscusアプリをインストール
1. https://giscus.app/ にアクセス
2. リポジトリを選択: `RikuTerayama/ielts_consult`
3. 設定を完了して、生成されたコードを確認

## 2. 設定値の更新

生成されたコードから以下の値を取得し、`components/giscus-comments.tsx`を更新：

```typescript
// 例：
script.setAttribute("data-repo-id", "R_kgDOKjQzWQ"); // 実際の値に置き換え
script.setAttribute("data-category-id", "DIC_kwDOKjQzWc4CbQzK"); // 実際の値に置き換え
```

## 3. 動作確認

1. 記事ページにアクセス
2. ページ下部にコメント欄が表示されることを確認
3. GitHubアカウントでログインしてコメントをテスト

## 4. カスタマイズオプション

- テーマ: `data-theme` で変更可能
- 言語: `data-lang` で変更可能
- 位置: `data-input-position` で変更可能
- リアクション: `data-reactions-enabled` で有効/無効
