# Google URL検査・登録リクエスト候補

更新日: 2026-09-10

## 対象と検証条件

Git履歴上、`e7d4ddd9aa233b55eb2900e0d5467e9954cdd85c`（2026-09-01）で新規追加された28記事を対象とした。公開日は各記事の`time[datetime]`、URLは小文字・NFC・末尾スラッシュありのcanonical URLを使用している。

全28記事について、production build後の出力で次を確認済み。

- HTTP相当ステータス: 200（静的出力あり）
- robots: `index, follow`
- 自己参照canonical: 正常
- sitemap掲載: 28/28
- `/posts/`からのリンク: 28/28
- 他記事の関連記事欄からのリンク: 28/28
- BlogPosting / BreadcrumbList / datePublished / dateModified / OGP: 正常

Netlify production deploy `6aa2ace1ced89b000848d7bf`（commit `08ccb0df7e801286dd856fa6219df89a6fe89017`）後のHTTP監査でも、全28記事を含む全公開HTMLが200であることを確認済み。Search ConsoleではIndexing APIを使わず、下記canonical URLだけをURL検査へ投入する。

## Priority A

直近公開、検索意図が明確、または主要なIELTS・英語学習・転職コンテンツ。日次のURL検査上限に応じ、上から順にリクエストする。

| 記事タイトル | 公開日 | Canonical URL | Status | Sitemap | `/posts/` | 関連記事 | Index / canonical |
|---|---:|---|---:|---|---|---:|---|
| コンサル転職の面接官をしていて思う。「通る人」と「通らない人」の差は、ケースの答えではない | 2026-08-28 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E8%BB%A2%E8%81%B7%E3%81%AE%E9%9D%A2%E6%8E%A5%E5%AE%98%E3%82%92%E3%81%97%E3%81%A6%E3%81%84%E3%81%A6%E6%80%9D%E3%81%86%E3%80%82%E3%80%8C%E9%80%9A%E3%82%8B%E4%BA%BA%E3%80%8D%E3%81%A8%E3%80%8C%E9%80%9A%E3%82%89%E3%81%AA%E3%81%84%E4%BA%BA%E3%80%8D%E3%81%AE%E5%B7%AE%E3%81%AF%E3%80%81%E3%82%B1%E3%83%BC%E3%82%B9%E3%81%AE%E7%AD%94%E3%81%88%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%84/) | 200 | Yes | Yes | 51 | index / 一致 |
| 画像が重くて送れない・アップできない。ブラウザだけで画像を軽くする無料ツールを作りました | 2026-08-15 | [canonical](https://ieltsconsult.netlify.app/posts/%E7%94%BB%E5%83%8F%E3%81%8C%E9%87%8D%E3%81%8F%E3%81%A6%E9%80%81%E3%82%8C%E3%81%AA%E3%81%84%E3%83%BB%E3%82%A2%E3%83%83%E3%83%97%E3%81%A7%E3%81%8D%E3%81%AA%E3%81%84%E3%80%82%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A0%E3%81%91%E3%81%A7%E7%94%BB%E5%83%8F%E3%82%92%E8%BB%BD%E3%81%8F%E3%81%99%E3%82%8B%E7%84%A1%E6%96%99%E3%83%84%E3%83%BC%E3%83%AB%E3%82%92%E4%BD%9C%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F/) | 200 | Yes | Yes | 39 | index / 一致 |
| コンサル転職が決まったら最初に揃えたいアイテム | 2026-08-13 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E8%BB%A2%E8%81%B7%E3%81%8C%E6%B1%BA%E3%81%BE%E3%81%A3%E3%81%9F%E3%82%89%E6%9C%80%E5%88%9D%E3%81%AB%E6%8F%83%E3%81%88%E3%81%9F%E3%81%84%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0/) | 200 | Yes | Yes | 22 | index / 一致 |
| CSV・Excelの「ちょっと面倒」をブラウザだけで片づける無料ツールを作りました | 2026-08-12 | [canonical](https://ieltsconsult.netlify.app/posts/csv%E3%83%BBexcel%E3%81%AE%E3%80%8C%E3%81%A1%E3%82%87%E3%81%A3%E3%81%A8%E9%9D%A2%E5%80%92%E3%80%8D%E3%82%92%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A0%E3%81%91%E3%81%A7%E7%89%87%E3%81%A5%E3%81%91%E3%82%8B%E7%84%A1%E6%96%99%E3%83%84%E3%83%BC%E3%83%AB%E3%82%92%E4%BD%9C%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F/) | 200 | Yes | Yes | 21 | index / 一致 |
| 英語学習の挫折を防ぐ！Writingベース学習法の継続コツ | 2026-08-11 | [canonical](https://ieltsconsult.netlify.app/posts/%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E3%81%AE%E6%8C%AB%E6%8A%98%E3%82%92%E9%98%B2%E3%81%90%EF%BC%81writing%E3%83%99%E3%83%BC%E3%82%B9%E5%AD%A6%E7%BF%92%E6%B3%95%E3%81%AE%E7%B6%99%E7%B6%9A%E3%82%B3%E3%83%84/) | 200 | Yes | Yes | 31 | index / 一致 |
| コンコードエグゼクティブグループは評判どおり？戦略コンサル複数社に内定した私が強み・向いている人・活用法を解説 | 2026-08-07 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%82%B3%E3%83%B3%E3%82%B3%E3%83%BC%E3%83%89%E3%82%A8%E3%82%B0%E3%82%BC%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%82%B0%E3%83%AB%E3%83%BC%E3%83%97%E3%81%AF%E8%A9%95%E5%88%A4%E3%81%A9%E3%81%8A%E3%82%8A%EF%BC%9F%E6%88%A6%E7%95%A5%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E8%A4%87%E6%95%B0%E7%A4%BE%E3%81%AB%E5%86%85%E5%AE%9A%E3%81%97%E3%81%9F%E7%A7%81%E3%81%8C%E5%BC%B7%E3%81%BF%E3%83%BB%E5%90%91%E3%81%84%E3%81%A6%E3%81%84%E3%82%8B%E4%BA%BA%E3%83%BB%E6%B4%BB%E7%94%A8%E6%B3%95%E3%82%92%E8%A7%A3%E8%AA%AC/) | 200 | Yes | Yes | 19 | index / 一致 |
| MyVisionは未経験からのコンサル転職に向いている？特徴・メリット・使い方を戦略コンサルが解説 | 2026-08-05 | [canonical](https://ieltsconsult.netlify.app/posts/myvision%E3%81%AF%E6%9C%AA%E7%B5%8C%E9%A8%93%E3%81%8B%E3%82%89%E3%81%AE%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E8%BB%A2%E8%81%B7%E3%81%AB%E5%90%91%E3%81%84%E3%81%A6%E3%81%84%E3%82%8B%EF%BC%9F%E7%89%B9%E5%BE%B4%E3%83%BB%E3%83%A1%E3%83%AA%E3%83%83%E3%83%88%E3%83%BB%E4%BD%BF%E3%81%84%E6%96%B9%E3%82%92%E6%88%A6%E7%95%A5%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E3%81%8C%E8%A7%A3%E8%AA%AC/) | 200 | Yes | Yes | 1 | index / 一致 |
| PDF結合・分割・圧縮・画像変換をブラウザで。無料PDFツール「しごと道具箱」を作りました | 2026-07-22 | [canonical](https://ieltsconsult.netlify.app/posts/pdf%E7%B5%90%E5%90%88%E3%83%BB%E5%88%86%E5%89%B2%E3%83%BB%E5%9C%A7%E7%B8%AE%E3%83%BB%E7%94%BB%E5%83%8F%E5%A4%89%E6%8F%9B%E3%82%92%E3%83%96%E3%83%A9%E3%82%A6%E3%82%B6%E3%81%A7%E3%80%82%E7%84%A1%E6%96%99pdf%E3%83%84%E3%83%BC%E3%83%AB%E3%80%8C%E3%81%97%E3%81%94%E3%81%A8%E9%81%93%E5%85%B7%E7%AE%B1%E3%80%8D%E3%82%92%E4%BD%9C%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F/) | 200 | Yes | Yes | 12 | index / 一致 |
| 仕事の小さな面倒を片づける。無料ツール集「しごと道具箱」を作りました | 2026-07-19 | [canonical](https://ieltsconsult.netlify.app/posts/%E4%BB%95%E4%BA%8B%E3%81%AE%E5%B0%8F%E3%81%95%E3%81%AA%E9%9D%A2%E5%80%92%E3%82%92%E7%89%87%E3%81%A5%E3%81%91%E3%82%8B%E3%80%82%E7%84%A1%E6%96%99%E3%83%84%E3%83%BC%E3%83%AB%E9%9B%86%E3%80%8C%E3%81%97%E3%81%94%E3%81%A8%E9%81%93%E5%85%B7%E7%AE%B1%E3%80%8D%E3%82%92%E4%BD%9C%E3%82%8A%E3%81%BE%E3%81%97%E3%81%9F/) | 200 | Yes | Yes | 2 | index / 一致 |
| 上半期ベストバイ：外資コンサルが仕事・英語学習・健康のために買ってよかったもの | 2026-07-16 | [canonical](https://ieltsconsult.netlify.app/posts/%E4%B8%8A%E5%8D%8A%E6%9C%9F%E3%83%99%E3%82%B9%E3%83%88%E3%83%90%E3%82%A4%EF%BC%9A%E5%A4%96%E8%B3%87%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E3%81%8C%E4%BB%95%E4%BA%8B%E3%83%BB%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E3%83%BB%E5%81%A5%E5%BA%B7%E3%81%AE%E3%81%9F%E3%82%81%E3%81%AB%E8%B2%B7%E3%81%A3%E3%81%A6%E3%82%88%E3%81%8B%E3%81%A3%E3%81%9F%E3%82%82%E3%81%AE/) | 200 | Yes | Yes | 13 | index / 一致 |
| 未経験からのコンサル転職は「情報戦」と「受ける順番」で決まる｜戦略とおすすめエージェント7選 | 2026-06-07 | [canonical](https://ieltsconsult.netlify.app/posts/%E6%9C%AA%E7%B5%8C%E9%A8%93%E3%81%8B%E3%82%89%E3%81%AE%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E8%BB%A2%E8%81%B7%E3%81%AF%E3%80%8C%E6%83%85%E5%A0%B1%E6%88%A6%E3%80%8D%E3%81%A8%E3%80%8C%E5%8F%97%E3%81%91%E3%82%8B%E9%A0%86%E7%95%AA%E3%80%8D%E3%81%A7%E6%B1%BA%E3%81%BE%E3%82%8B%EF%BD%9C%E6%88%A6%E7%95%A5%E3%81%A8%E3%81%8A%E3%81%99%E3%81%99%E3%82%81%E3%82%A8%E3%83%BC%E3%82%B8%E3%82%A7%E3%83%B3%E3%83%887%E9%81%B8/) | 200 | Yes | Yes | 1 | index / 一致 |
| 【2026年最新版】本気で英語を話せるようになりたい社会人へ｜英語コーチング・スクール完全比較 | 2026-06-04 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%80%902026%E5%B9%B4%E6%9C%80%E6%96%B0%E7%89%88%E3%80%91%E6%9C%AC%E6%B0%97%E3%81%A7%E8%8B%B1%E8%AA%9E%E3%82%92%E8%A9%B1%E3%81%9B%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB%E3%81%AA%E3%82%8A%E3%81%9F%E3%81%84%E7%A4%BE%E4%BC%9A%E4%BA%BA%E3%81%B8%EF%BD%9C%E8%8B%B1%E8%AA%9E%E3%82%B3%E3%83%BC%E3%83%81%E3%83%B3%E3%82%B0%E3%83%BB%E3%82%B9%E3%82%AF%E3%83%BC%E3%83%AB%E5%AE%8C%E5%85%A8%E6%AF%94%E8%BC%83/) | 200 | Yes | Yes | 3 | index / 一致 |
| 【2026年版】本当に英語が話せるようになるアプリ5選｜社会人向け徹底比較 | 2026-06-01 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%80%902026%E5%B9%B4%E7%89%88%E3%80%91%E6%9C%AC%E5%BD%93%E3%81%AB%E8%8B%B1%E8%AA%9E%E3%81%8C%E8%A9%B1%E3%81%9B%E3%82%8B%E3%82%88%E3%81%86%E3%81%AB%E3%81%AA%E3%82%8B%E3%82%A2%E3%83%97%E3%83%AA5%E9%81%B8%EF%BD%9C%E7%A4%BE%E4%BC%9A%E4%BA%BA%E5%90%91%E3%81%91%E5%BE%B9%E5%BA%95%E6%AF%94%E8%BC%83/) | 200 | Yes | Yes | 2 | index / 一致 |
| IELTS Speakingで本気のスコアを取りに行くなら、Camblyは「必須投資」だと思う | 2026-05-29 | [canonical](https://ieltsconsult.netlify.app/posts/ielts-speaking%E3%81%A7%E6%9C%AC%E6%B0%97%E3%81%AE%E3%82%B9%E3%82%B3%E3%82%A2%E3%82%92%E5%8F%96%E3%82%8A%E3%81%AB%E8%A1%8C%E3%81%8F%E3%81%AA%E3%82%89%E3%80%81cambly%E3%81%AF-%E5%BF%85%E9%A0%88%E6%8A%95%E8%B3%87-%E3%81%A0%E3%81%A8%E6%80%9D%E3%81%86/) | 200 | Yes | Yes | 1 | index / 一致 |
| IELTS Speakingで伸び悩む人にこそ、QQ Englishを「もう一度」勧めたい理由 | 2026-05-28 | [canonical](https://ieltsconsult.netlify.app/posts/ielts-speaking%E3%81%A7%E4%BC%B8%E3%81%B3%E6%82%A9%E3%82%80%E4%BA%BA%E3%81%AB%E3%81%93%E3%81%9D%E3%80%81qq-english%E3%82%92-%E3%82%82%E3%81%86%E4%B8%80%E5%BA%A6-%E5%8B%A7%E3%82%81%E3%81%9F%E3%81%84%E7%90%86%E7%94%B1/) | 200 | Yes | Yes | 1 | index / 一致 |
| 【2026年版】IELTS対策に使える格安英語学習サービス比較｜無料体験ありのオンライン英会話を本音で検証 | 2026-03-24 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%80%902026%E5%B9%B4%E7%89%88%E3%80%91ielts%E5%AF%BE%E7%AD%96%E3%81%AB%E4%BD%BF%E3%81%88%E3%82%8B%E6%A0%BC%E5%AE%89%E8%8B%B1%E8%AA%9E%E5%AD%A6%E7%BF%92%E3%82%B5%E3%83%BC%E3%83%93%E3%82%B9%E6%AF%94%E8%BC%83%EF%BD%9C%E7%84%A1%E6%96%99%E4%BD%93%E9%A8%93%E3%81%82%E3%82%8A%E3%81%AE%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E8%8B%B1%E4%BC%9A%E8%A9%B1%E3%82%92%E6%9C%AC%E9%9F%B3%E3%81%A7%E6%A4%9C%E8%A8%BC/) | 200 | Yes | Yes | 1 | index / 一致 |

## Priority B

2026-09-01にサイトへ追加されたその他の記事。Priority A完了後、Search Consoleの上限に余裕がある日に順次リクエストする。

| 記事タイトル | 公開日 | Canonical URL | Status | Sitemap | `/posts/` | 関連記事 | Index / canonical |
|---|---:|---|---:|---|---|---:|---|
| 仕事の集中力が変わった。在宅ワーク環境で投資対効果が高かったもの | 2026-04-02 | [canonical](https://ieltsconsult.netlify.app/posts/%E4%BB%95%E4%BA%8B%E3%81%AE%E9%9B%86%E4%B8%AD%E5%8A%9B%E3%81%8C%E5%A4%89%E3%82%8F%E3%81%A3%E3%81%9F%E3%80%82%E5%9C%A8%E5%AE%85%E3%83%AF%E3%83%BC%E3%82%AF%E7%92%B0%E5%A2%83%E3%81%A7%E6%8A%95%E8%B3%87%E5%AF%BE%E5%8A%B9%E6%9E%9C%E3%81%8C%E9%AB%98%E3%81%8B%E3%81%A3%E3%81%9F%E3%82%82%E3%81%AE/) | 200 | Yes | Yes | 1 | index / 一致 |
| 長時間デスクワークでも消耗しにくい環境づくり。まず見直したいアイテム | 2026-04-01 | [canonical](https://ieltsconsult.netlify.app/posts/%E9%95%B7%E6%99%82%E9%96%93%E3%83%87%E3%82%B9%E3%82%AF%E3%83%AF%E3%83%BC%E3%82%AF%E3%81%A7%E3%82%82%E6%B6%88%E8%80%97%E3%81%97%E3%81%AB%E3%81%8F%E3%81%84%E7%92%B0%E5%A2%83%E3%81%A5%E3%81%8F%E3%82%8A%E3%80%82%E3%81%BE%E3%81%9A%E8%A6%8B%E7%9B%B4%E3%81%97%E3%81%9F%E3%81%84%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0/) | 200 | Yes | Yes | 1 | index / 一致 |
| 【明日から新入社員の皆様へ】新卒就活失敗しても挽回できる方法 | 2026-03-31 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%80%90%E6%98%8E%E6%97%A5%E3%81%8B%E3%82%89%E6%96%B0%E5%85%A5%E7%A4%BE%E5%93%A1%E3%81%AE%E7%9A%86%E6%A7%98%E3%81%B8%E3%80%91%E6%96%B0%E5%8D%92%E5%B0%B1%E6%B4%BB%E5%A4%B1%E6%95%97%E3%81%97%E3%81%A6%E3%82%82%E6%8C%BD%E5%9B%9E%E3%81%A7%E3%81%8D%E3%82%8B%E6%96%B9%E6%B3%95/) | 200 | Yes | Yes | 1 | index / 一致 |
| ④MECE（漏れなく・ダブりなく）の正しい使い所・作り方・崩し方 | 2026-03-30 | [canonical](https://ieltsconsult.netlify.app/posts/%E2%91%A3mece%EF%BC%88%E6%BC%8F%E3%82%8C%E3%81%AA%E3%81%8F%E3%83%BB%E3%83%80%E3%83%96%E3%82%8A%E3%81%AA%E3%81%8F%EF%BC%89%E3%81%AE%E6%AD%A3%E3%81%97%E3%81%84%E4%BD%BF%E3%81%84%E6%89%80%E3%83%BB%E4%BD%9C%E3%82%8A%E6%96%B9%E3%83%BB%E5%B4%A9%E3%81%97%E6%96%B9/) | 200 | Yes | Yes | 1 | index / 一致 |
| 在宅勤務と出社勤務、結局どちらが疲れるのか。働き方別の必需品を整理してみた | 2026-03-29 | [canonical](https://ieltsconsult.netlify.app/posts/%E5%9C%A8%E5%AE%85%E5%8B%A4%E5%8B%99%E3%81%A8%E5%87%BA%E7%A4%BE%E5%8B%A4%E5%8B%99%E3%80%81%E7%B5%90%E5%B1%80%E3%81%A9%E3%81%A1%E3%82%89%E3%81%8C%E7%96%B2%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%8B%E3%80%82%E5%83%8D%E3%81%8D%E6%96%B9%E5%88%A5%E3%81%AE%E5%BF%85%E9%9C%80%E5%93%81%E3%82%92%E6%95%B4%E7%90%86%E3%81%97%E3%81%A6%E3%81%BF%E3%81%9F/) | 200 | Yes | Yes | 1 | index / 一致 |
| ③イシューツリーを“意思決定”につなげる方法 | 2026-03-28 | [canonical](https://ieltsconsult.netlify.app/posts/%E2%91%A2%E3%82%A4%E3%82%B7%E3%83%A5%E3%83%BC%E3%83%84%E3%83%AA%E3%83%BC%E3%82%92%E2%80%9C%E6%84%8F%E6%80%9D%E6%B1%BA%E5%AE%9A%E2%80%9D%E3%81%AB%E3%81%A4%E3%81%AA%E3%81%92%E3%82%8B%E6%96%B9%E6%B3%95/) | 200 | Yes | Yes | 1 | index / 一致 |
| オフィス勤務に戻って気づいた、通勤生活をラクにする持ち物 | 2026-03-27 | [canonical](https://ieltsconsult.netlify.app/posts/%E3%82%AA%E3%83%95%E3%82%A3%E3%82%B9%E5%8B%A4%E5%8B%99%E3%81%AB%E6%88%BB%E3%81%A3%E3%81%A6%E6%B0%97%E3%81%A5%E3%81%84%E3%81%9F%E3%80%81%E9%80%9A%E5%8B%A4%E7%94%9F%E6%B4%BB%E3%82%92%E3%83%A9%E3%82%AF%E3%81%AB%E3%81%99%E3%82%8B%E6%8C%81%E3%81%A1%E7%89%A9/) | 200 | Yes | Yes | 1 | index / 一致 |
| ②KPI設計とゴールツリーで成果を動かす | 2026-03-26 | [canonical](https://ieltsconsult.netlify.app/posts/%E2%91%A1kpi%E8%A8%AD%E8%A8%88%E3%81%A8%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%84%E3%83%AA%E3%83%BC%E3%81%A7%E6%88%90%E6%9E%9C%E3%82%92%E5%8B%95%E3%81%8B%E3%81%99/) | 200 | Yes | Yes | 1 | index / 一致 |
| 在宅勤務がつらい人へ。仕事環境を整えるために本当に買ってよかったもの | 2026-03-25 | [canonical](https://ieltsconsult.netlify.app/posts/%E5%9C%A8%E5%AE%85%E5%8B%A4%E5%8B%99%E3%81%8C%E3%81%A4%E3%82%89%E3%81%84%E4%BA%BA%E3%81%B8%E3%80%82%E4%BB%95%E4%BA%8B%E7%92%B0%E5%A2%83%E3%82%92%E6%95%B4%E3%81%88%E3%82%8B%E3%81%9F%E3%82%81%E3%81%AB%E6%9C%AC%E5%BD%93%E3%81%AB%E8%B2%B7%E3%81%A3%E3%81%A6%E3%82%88%E3%81%8B%E3%81%A3%E3%81%9F%E3%82%82%E3%81%AE/) | 200 | Yes | Yes | 1 | index / 一致 |
| ①問題定義フレーム：会議の迷走を防ぐ最初の整理術 | 2026-03-23 | [canonical](https://ieltsconsult.netlify.app/posts/%E2%91%A0%E5%95%8F%E9%A1%8C%E5%AE%9A%E7%BE%A9%E3%83%95%E3%83%AC%E3%83%BC%E3%83%A0%EF%BC%9A%E4%BC%9A%E8%AD%B0%E3%81%AE%E8%BF%B7%E8%B5%B0%E3%82%92%E9%98%B2%E3%81%90%E6%9C%80%E5%88%9D%E3%81%AE%E6%95%B4%E7%90%86%E8%A1%93/) | 200 | Yes | Yes | 1 | index / 一致 |
| 新社会人向け 生産性向上アイテムでデスク環境を最速で整える | 2026-03-20 | [canonical](https://ieltsconsult.netlify.app/posts/%E6%96%B0%E7%A4%BE%E4%BC%9A%E4%BA%BA%E5%90%91%E3%81%91-%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0%E3%81%A7%E3%83%87%E3%82%B9%E3%82%AF%E7%92%B0%E5%A2%83%E3%82%92%E6%9C%80%E9%80%9F%E3%81%A7%E6%95%B4%E3%81%88%E3%82%8B/) | 200 | Yes | Yes | 1 | index / 一致 |
| 常駐が決まったコンサルタントが最初に買うべきアイテム15選 | 2026-03-18 | [canonical](https://ieltsconsult.netlify.app/posts/%E5%B8%B8%E9%A7%90%E3%81%8C%E6%B1%BA%E3%81%BE%E3%81%A3%E3%81%9F%E3%82%B3%E3%83%B3%E3%82%B5%E3%83%AB%E3%82%BF%E3%83%B3%E3%83%88%E3%81%8C%E6%9C%80%E5%88%9D%E3%81%AB%E8%B2%B7%E3%81%86%E3%81%B9%E3%81%8D%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A015%E9%81%B8/) | 200 | Yes | Yes | 1 | index / 一致 |

## Priority C

なし。Priority A/Bの28記事以外は、今回のGit履歴上「直近追加記事」ではないため、一括の登録リクエスト対象にしない。

## Search Consoleでの投入方法

1. まず`https://ieltsconsult.netlify.app/sitemap.xml`を再送信する。
2. Priority Aを上からURL検査し、「公開URLをテスト」後に「インデックス登録をリクエスト」を実行する。
3. 数日空けてPriority Bを順次実行する。リクエスト済みURLを短期間に繰り返し送信しない。
4. 1〜2週間後、ページのインデックス登録レポートと各URL検査結果を再確認する。

通常ブログ記事にGoogle Indexing APIは使用しない。Indexing APIの対象は`JobPosting`またはライブ配信の`BroadcastEvent`に限定されるため、本対応はsitemap・内部リンク・canonical・HTTPシグナルとSearch Consoleの手動URL検査で行う。

参考: [Google: Indexing API Quickstart](https://developers.google.com/search/apis/indexing-api/v3/quickstart)、[Google: サイトマップの作成と送信](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
