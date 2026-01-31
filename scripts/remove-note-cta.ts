import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';

/**
 * HTMLファイルから「続きはnoteで公開中」セクションとnote関連の注釈を削除するスクリプト
 */
function main() {
  const projectRoot = process.cwd();
  const files = fs.readdirSync(projectRoot);
  
  // 「n で始まり .html で終わる」ファイルを抽出
  const htmlFiles = files.filter(file => 
    file.startsWith('n') && file.endsWith('.html')
  );

  console.log(`対象ファイル数: ${htmlFiles.length}`);

  let updatedCount = 0;
  const updatedFiles: string[] = [];

  for (const file of htmlFiles) {
    const filePath = path.join(projectRoot, file);
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      const dom = new JSDOM(originalContent);
      const document = dom.window.document;
      const body = document.body;
      
      if (!body) {
        console.warn(`⚠️  ${file}: body要素が見つかりません`);
        continue;
      }

      let hasChanges = false;

      // 1. 「続きはnoteで公開中」を含む見出し要素とその後のブロックを削除
      const headings = body.querySelectorAll('h1, h2, h3, h4');
      for (const heading of Array.from(headings)) {
        const text = heading.textContent || '';
        if (text.includes('続きはnoteで公開中') || text.includes('続きはnoteで公開')) {
          // この見出しから次の見出し（または末尾）までの要素を削除
          let currentElement: Element | null = heading;
          const elementsToRemove: Element[] = [];
          
          while (currentElement) {
            elementsToRemove.push(currentElement);
            
            // 次の兄弟要素を取得
            const nextSibling: Element | null = currentElement.nextElementSibling;
            
            // 次の見出しに到達したら終了
            if (nextSibling && (nextSibling.tagName === 'H1' || nextSibling.tagName === 'H2' || 
                nextSibling.tagName === 'H3' || nextSibling.tagName === 'H4')) {
              // 次の見出しが「続きはnote」を含まない場合のみ終了
              const nextHeadingText = nextSibling.textContent || '';
              if (!nextHeadingText.includes('続きはnote')) {
                break;
              }
            }
            
            // 末尾に到達したら終了
            if (!nextSibling) {
              break;
            }
            
            currentElement = nextSibling;
          }
          
          // 要素を削除
          for (const element of elementsToRemove) {
            element.remove();
            hasChanges = true;
          }
        }
      }

      // 2. note関連の注釈を削除（p, li, blockquote要素内）
      const noteKeywords = [
        'noteで公開された記事を要約・転載',
        '要約版',
        '元のnote記事',
        'note記事でご覧',
        'note記事をご覧',
        'noteで公開中',
        'noteで続きを読む'
      ];

      const textElements = body.querySelectorAll('p, li, blockquote, div');
      for (const element of Array.from(textElements)) {
        const text = element.textContent || '';
        const hasNoteKeyword = noteKeywords.some(keyword => text.includes(keyword));
        const hasSummaryKeyword = text.includes('要約') && (text.includes('note') || text.includes('転載'));
        
        if (hasNoteKeyword || hasSummaryKeyword) {
          // 親要素が削除対象でないことを確認（誤爆防止）
          const parent = element.parentElement;
          if (parent && !parent.textContent?.includes('続きはnote')) {
            element.remove();
            hasChanges = true;
          }
        }
      }

      // 変更があった場合のみファイルを保存
      if (hasChanges) {
        const newContent = dom.serialize();
        fs.writeFileSync(filePath, newContent, 'utf8');
        updatedCount++;
        updatedFiles.push(file);
        console.log(`✅ ${file}: 更新しました`);
      } else {
        console.log(`⏭️  ${file}: 変更なし`);
      }
    } catch (error) {
      console.error(`❌ ${file}: エラーが発生しました`, error);
    }
  }

  console.log('\n=== 処理結果 ===');
  console.log(`対象ファイル数: ${htmlFiles.length}`);
  console.log(`更新ファイル数: ${updatedCount}`);
  if (updatedFiles.length > 0) {
    console.log('\n更新されたファイル:');
    updatedFiles.forEach(file => console.log(`  - ${file}`));
  }
}

main();
