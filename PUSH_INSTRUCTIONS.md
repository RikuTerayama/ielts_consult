# プッシュ手順

## 📦 準備完了

すべての変更が13個のコミットにまとまっています：

```
8c2dc38 docs: add final implementation summary
4247f34 feat(ui): change share buttons to icon format and add SEO checklist
a51b1d8 docs: add comprehensive changes summary
bdfad04 fix(assets): allow asset images to be committed to Git for Netlify
4103dce feat(ui): improve header navigation and post list display
0ecb034 docs: add deployment notes for UI improvements
4d08923 feat(ui): enhance post cards and article images
7c6fc82 fix(import): correct source paths to project root
93cf09c fix(build): ensure public/assets directory exists
1dbbd81 fix(build): ensure content/posts directory exists for import script
cc83448 fix(build): import note posts before building for static export
c5137bf fix(build): resolve TypeScript errors for Netlify build
22635d7 fix(ci): normalize Node version and line endings for Netlify
```

## 🚀 プッシュコマンド

以下のいずれかの方法でGitHubにプッシュしてください：

### 方法1: GitHub Desktop（推奨）

1. GitHub Desktop を開く
2. 左側でリポジトリを選択
3. 上部の「Push origin」ボタンをクリック

### 方法2: コマンドライン（SSH）

```bash
# SSH URLに変更
git remote set-url origin git@github.com:RikuTerayama/ielts_consult.git

# プッシュ
git push -u origin main --force
```

### 方法3: コマンドライン（Personal Access Token）

```bash
# プッシュ（認証ダイアログが表示される）
git push -u origin main --force

# ユーザー名: RikuTerayama
# パスワード: ghp_xxxxx（Personal Access Token）
```

### 方法4: VS Code の Git拡張

1. VS Code の左側メニューで「ソース管理」を選択
2. 「...」メニューから「プッシュ」→「プッシュ（強制）」を選択

## 📊 プッシュ後にNetlifyで起こること

```
1. ✅ Gitコミット検知
   Netlifyが新しいコミットを検知

2. ✅ ビルド開始
   - Node.js 20 インストール
   - pnpm 9.10.0 でパッケージインストール

3. ✅ 記事インポート
   - pnpm run import:note 実行
   - *.html → content/posts/*.mdx 変換
   - assets/ → public/assets/ コピー
   - 41記事が処理される

4. ✅ サイトマップ・RSS生成
   - sitemap.xml 自動生成
   - rss.xml 自動生成

5. ✅ Next.js ビルド
   - 静的ページ生成
   - out/ ディレクトリに出力

6. ✅ デプロイ
   - CDNにファイル配信
   - サイトが更新される

7. 🎉 デプロイ完了！
```

## 🔍 デプロイ後の確認事項

### 必須確認

1. **トップページ**
   ```
   https://ieltsconsult.netlify.app/
   ```
   - ヒーローセクションが表示される
   - 最新記事が表示される
   - サイドバーが表示される

2. **記事一覧ページ**
   ```
   https://ieltsconsult.netlify.app/posts/
   ```
   - 41件の記事がグリッド表示される
   - 各カードにヒーロー画像が表示される

3. **記事詳細ページ（テスト）**
   ```
   https://ieltsconsult.netlify.app/posts/ne9d8203dd045/
   https://ieltsconsult.netlify.app/posts/n987573e43820/
   https://ieltsconsult.netlify.app/posts/n5e563cd04240/
   ```
   - ヒーロー画像が表示される
   - 本文中の画像が中央揃えで表示される
   - シェアボタンがアイコン形式で表示される

4. **画像の直接アクセス**
   ```
   https://ieltsconsult.netlify.app/assets/ne9d8203dd045_a2c53016fcfde8a69363abee45a22a35.png
   https://ieltsconsult.netlify.app/assets/n987573e43820_6c497a9a64338b3e1efa5257f431f4df.png
   ```
   - 画像が正常に表示される（200 OK）

5. **ヘッダーナビゲーション**
   - 順番: 🔍検索 → ホーム → 記事一覧 → タグ → About → 🌙モード切替
   - すべてのリンクが動作する

6. **SEOファイル**
   ```
   https://ieltsconsult.netlify.app/sitemap.xml
   https://ieltsconsult.netlify.app/rss.xml
   https://ieltsconsult.netlify.app/robots.txt
   ```
   - すべてアクセス可能

### オプション確認

7. **ダークモード**
   - トグルボタンで切り替わる
   - システム設定に追従する

8. **検索機能**
   ```
   https://ieltsconsult.netlify.app/search/
   ```
   - 記事検索が動作する

9. **レスポンシブデザイン**
   - モバイルで正常に表示される
   - タブレットで正常に表示される

## 🐛 もし問題が発生したら

### Netlify ビルドエラー

**確認場所**: Netlify ダッシュボード → Deploys → ビルドログ

**よくあるエラー**:
- TypeScript型エラー → コミット `c5137bf` で修正済み
- 画像が見つからない → assetsをGitに追加済み
- generateStaticParams エラー → import:noteで解決済み

### 画像が表示されない

**確認**:
1. Netlifyビルドログで「assetsディレクトリをコピーしました」が表示されるか
2. ブラウザDevTools（F12）→ Networkタブで画像リクエストを確認
3. 404エラーの場合 → assetsがGitに含まれているか確認

### 記事一覧が404

**確認**:
1. `next.config.mjs` に `skipTrailingSlashRedirect: true` があるか
2. Netlifyで記事がインポートされているか（ビルドログ確認）

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. **Netlifyビルドログ** - エラーメッセージ
2. **ブラウザConsole** - JavaScriptエラー
3. **Network Tab** - 404や503エラー

---

**準備完了です！GitHubにプッシュしてください。** 🚀

