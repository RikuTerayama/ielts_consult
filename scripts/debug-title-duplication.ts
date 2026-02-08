import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';

/**
 * タイトル重複と広告要素の残存問題をデバッグするスクリプト
 */

// sanitizeHtmlの設定（lib/posts.tsと同じ）
const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'figure',
    'figcaption',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height'],
    a: ['href', 'name', 'target', 'rel'],
    '*': ['id', 'name', 'class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  disallowedTagsMode: 'discard' as const,
};

function analyzeHtmlFile(slug: string) {
  const htmlPath = path.join(process.cwd(), `${slug}.html`);
  
  if (!fs.existsSync(htmlPath)) {
    console.error(`ファイルが見つかりません: ${htmlPath}`);
    return;
  }

  console.log(`\n=== ${slug}.html の分析 ===\n`);

  // 1. 元のHTMLファイルを読み込み
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  console.log('1. 元のHTMLファイル:');
  console.log(`   - ファイルサイズ: ${htmlContent.length} bytes`);
  console.log(`   - H1タグの数: ${(htmlContent.match(/<h1[^>]*>/gi) || []).length}`);
  console.log(`   - ad-containerの数: ${(htmlContent.match(/ad-container/gi) || []).length}`);
  console.log(`   - adsbygoogleの数: ${(htmlContent.match(/adsbygoogle/gi) || []).length}`);
  
  // H1タグの内容を抽出
  const h1Matches = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
  if (h1Matches) {
    console.log(`   - H1タグの内容:`);
    h1Matches.forEach((match, index) => {
      const text = match.replace(/<[^>]*>/g, '').trim();
      console.log(`     [${index + 1}] ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
    });
  }

  // 2. JSDOMでパース
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  const bodyElement = document.querySelector('body');
  
  console.log('\n2. JSDOMパース後:');
  const bodyH1s = document.querySelectorAll('body h1');
  console.log(`   - body内のH1タグの数: ${bodyH1s.length}`);
  if (bodyH1s.length > 0) {
    bodyH1s.forEach((h1, index) => {
      console.log(`     [${index + 1}] ${h1.textContent?.trim().substring(0, 50)}${(h1.textContent?.trim().length || 0) > 50 ? '...' : ''}`);
    });
  }

  // 3. H1削除処理（現在の実装）
  const firstH1 = document.querySelector('body h1');
  if (firstH1) {
    firstH1.remove();
  }
  
  let content = bodyElement?.innerHTML || '';
  console.log('\n3. JSDOMでH1削除後:');
  console.log(`   - contentの長さ: ${content.length} bytes`);
  console.log(`   - H1タグが含まれているか: ${content.includes('<h1')}`);
  
  // 4. 正規表現でH1削除
  const beforeRegex = content;
  content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  console.log('\n4. 正規表現でH1削除後:');
  console.log(`   - contentの長さ: ${content.length} bytes (削除前: ${beforeRegex.length} bytes)`);
  console.log(`   - H1タグが含まれているか: ${content.includes('<h1')}`);
  if (beforeRegex.length !== content.length) {
    console.log(`   - ✅ H1タグが削除されました (${beforeRegex.length - content.length} bytes削除)`);
  } else {
    console.log(`   - ❌ H1タグが削除されていません`);
  }

  // 5. 広告要素の削除
  const beforeAdRemoval = content;
  content = content.replace(/<div[^>]*class="[^"]*ad-container[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  content = content.replace(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, '');
  content = content.replace(/<div[^>]*class="[^"]*ad-slot[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
  console.log('\n5. 広告要素削除後:');
  console.log(`   - contentの長さ: ${content.length} bytes (削除前: ${beforeAdRemoval.length} bytes)`);
  console.log(`   - ad-containerが含まれているか: ${content.includes('ad-container')}`);
  console.log(`   - adsbygoogleが含まれているか: ${content.includes('adsbygoogle')}`);
  if (beforeAdRemoval.length !== content.length) {
    console.log(`   - ✅ 広告要素が削除されました (${beforeAdRemoval.length - content.length} bytes削除)`);
  } else {
    console.log(`   - ⚠️ 広告要素は見つかりませんでした（元のHTMLに含まれていない可能性）`);
  }

  // 6. sanitizeHtml処理
  const beforeSanitize = content;
  content = sanitizeHtml(content, sanitizeOptions);
  console.log('\n6. sanitizeHtml処理後:');
  console.log(`   - contentの長さ: ${content.length} bytes (処理前: ${beforeSanitize.length} bytes)`);
  console.log(`   - H1タグが含まれているか: ${content.includes('<h1')}`);
  
  // sanitizeHtmlでH1が復活していないか確認
  if (!beforeSanitize.includes('<h1') && content.includes('<h1')) {
    console.log(`   - ⚠️ sanitizeHtml処理でH1が復活しました！`);
  } else if (beforeSanitize.includes('<h1') && !content.includes('<h1')) {
    console.log(`   - ✅ sanitizeHtml処理でH1が削除されました`);
  } else if (!beforeSanitize.includes('<h1') && !content.includes('<h1')) {
    console.log(`   - ✅ H1は含まれていません`);
  } else {
    console.log(`   - ❌ H1がまだ含まれています`);
  }

  // 7. 最終的なH1削除処理
  const beforeFinal = content;
  content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  console.log('\n7. 最終的なH1削除処理後:');
  console.log(`   - contentの長さ: ${content.length} bytes (削除前: ${beforeFinal.length} bytes)`);
  console.log(`   - H1タグが含まれているか: ${content.includes('<h1')}`);
  if (beforeFinal.length !== content.length) {
    console.log(`   - ✅ H1タグが削除されました (${beforeFinal.length - content.length} bytes削除)`);
  } else {
    console.log(`   - ✅ H1タグは含まれていませんでした`);
  }

  // 8. 最終結果のサマリー
  console.log('\n=== 最終結果 ===');
  const finalH1Count = (content.match(/<h1[^>]*>/gi) || []).length;
  const finalAdContainerCount = (content.match(/ad-container/gi) || []).length;
  const finalAdsbygoogleCount = (content.match(/adsbygoogle/gi) || []).length;
  
  console.log(`H1タグの数: ${finalH1Count} ${finalH1Count === 0 ? '✅' : '❌'}`);
  console.log(`ad-containerの数: ${finalAdContainerCount} ${finalAdContainerCount === 0 ? '✅' : '❌'}`);
  console.log(`adsbygoogleの数: ${finalAdsbygoogleCount} ${finalAdsbygoogleCount === 0 ? '✅' : '❌'}`);
  
  // 9. コンテンツの先頭100文字を表示
  console.log('\n=== 最終コンテンツの先頭 ===');
  console.log(content.substring(0, 200).replace(/\n/g, '\\n'));
  
  // 10. 問題の特定
  console.log('\n=== 問題の特定 ===');
  if (finalH1Count > 0) {
    const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (h1Matches) {
      console.log('❌ H1タグが残っています:');
      h1Matches.forEach((match, index) => {
        const text = match.replace(/<[^>]*>/g, '').trim();
        console.log(`   [${index + 1}] ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
        console.log(`       完全なHTML: ${match.substring(0, 100)}${match.length > 100 ? '...' : ''}`);
      });
    }
  } else {
    console.log('✅ H1タグは削除されています');
  }
  
  if (finalAdContainerCount > 0 || finalAdsbygoogleCount > 0) {
    console.log('❌ 広告要素が残っています');
    if (finalAdContainerCount > 0) {
      const adMatches = content.match(/<div[^>]*class="[^"]*ad-container[^"]*"[^>]*>[\s\S]*?<\/div>/gi);
      if (adMatches) {
        console.log(`   ad-container: ${adMatches.length}個`);
        adMatches.forEach((match, index) => {
          console.log(`   [${index + 1}] ${match.substring(0, 100)}${match.length > 100 ? '...' : ''}`);
        });
      }
    }
  } else {
    console.log('✅ 広告要素は削除されています（または元々含まれていません）');
  }
}

// メイン処理
const testSlugs = ['n1a971fb03450', 'nc8f873763df6']; // テスト用のスラッグ

console.log('🔍 タイトル重複と広告要素の残存問題 - デバッグレポート\n');
console.log('='.repeat(60));

for (const slug of testSlugs) {
  try {
    analyzeHtmlFile(slug);
    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error(`エラー: ${slug} の分析中にエラーが発生しました:`, error);
  }
}
