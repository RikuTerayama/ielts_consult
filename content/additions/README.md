# 記事のオリジナル付加価値（Additions）

このディレクトリには、各記事のオリジナル付加価値を追加するMDXファイルを配置します。

## ファイル名

`[slug].mdx` 形式で保存してください。
例: `n019aaecea296.mdx`

## 必須項目

各additionsファイルには以下のfrontmatterが必要です：

- `takeaways`: この記事で得られること（3-5個の文字列配列）
- `practice`: 実践パート（MDX形式の文字列）
- `commonMistakes`: よくある誤り（2-5個の文字列配列）
- `faq`: よくある質問（3つ以上のオブジェクト配列、各オブジェクトは `question` と `answer` を持つ）
- `nextSteps`: 次のステップ（3つ以上のオブジェクト配列、各オブジェクトは `title`, `description`, `link`（任意）を持つ）

## テンプレート

`.template.mdx` を参考に、各記事用のadditionsファイルを作成してください。

## 注意事項

- すべての記事で同じ構成文を使い回さないこと
- 記事本文を言い換えただけの追記は禁止
- 新しい説明、練習、判断基準、具体例を追加すること
- 実体験を断定する一人称の誇張は避ける

## 公開条件

`additions/[slug].mdx` が存在しない記事は、`config/content-gate.ts` の `PUBLIC_POST_SLUGS` に追加できません。
