import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

interface NoteLinkInfo {
  slug: string;
  noteUrl: string;
  title: string;
}

/**
 * HTMLファイルからnote URLを抽出し、CSV形式で出力するスクリプト
 */
function main() {
  const projectRoot = process.cwd();
  const files = fs.readdirSync(projectRoot);
  
  // 「n で始まり .html で終わる」ファイルを抽出
  const htmlFiles = files.filter(file => 
    file.startsWith('n') && file.endsWith('.html')
  );

  console.log(`対象ファイル数: ${htmlFiles.length}\n`);

  const noteLinks: NoteLinkInfo[] = [];

  for (const file of htmlFiles) {
    const filePath = path.join(projectRoot, file);
    const slug = file.replace('.html', '');
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // タイトルを取得
      const titleElement = document.querySelector('title') || document.querySelector('h1');
      const title = titleElement?.textContent?.trim() || 'タイトル不明';
      
      // note URLを抽出（aタグのhref属性から）
      const links = document.querySelectorAll('a[href*="note.com"]');
      let noteUrl = '';
      
      for (const link of Array.from(links)) {
        const href = link.getAttribute('href') || '';
        if (href.includes('note.com/ielts_consult/n/')) {
          noteUrl = href;
          break;
        }
      }
      
      // note URLが見つからない場合は、slugから推測
      if (!noteUrl) {
        noteUrl = `https://note.com/ielts_consult/n/${slug}`;
      }
      
      noteLinks.push({
        slug,
        noteUrl,
        title: title.substring(0, 100) // タイトルが長すぎる場合は切り詰め
      });
    } catch (error) {
      console.error(`❌ ${file}: エラーが発生しました`, error);
    }
  }

  // CSV形式で出力
  console.log('=== note URL一覧 (CSV形式) ===\n');
  console.log('slug,noteUrl,title');
  noteLinks.forEach(info => {
    // CSVのエスケープ処理
    const escapedTitle = info.title.replace(/"/g, '""');
    console.log(`"${info.slug}","${info.noteUrl}","${escapedTitle}"`);
  });

  // JSON形式でも出力（オプション）
  const outputPath = path.join(projectRoot, 'note-links.json');
  fs.writeFileSync(outputPath, JSON.stringify(noteLinks, null, 2), 'utf8');
  console.log(`\n✅ JSON形式の出力も保存しました: ${outputPath}`);
  console.log(`\n💡 このJSONファイルを確認し、有料記事のslugを config/paid-articles.ts に追加してください。`);
}

main();
