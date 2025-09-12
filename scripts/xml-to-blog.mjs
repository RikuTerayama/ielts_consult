import { parseString } from 'xml2js';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function main() {
  const xmlPath = 'input/note-ielts_consult-1.xml';
  const outputDir = 'src/content/blog';
  
  log('XMLファイルを読み込み中...');
  const xmlContent = readFileSync(xmlPath, 'utf-8');
  
  log('XMLをパース中...');
  const result = await new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  
  const items = result.rss?.channel?.[0]?.item || [];
  log(`${items.length}個のアイテムが見つかりました`);
  
  // 出力ディレクトリを作成
  mkdirSync(outputDir, { recursive: true });
  
  let successCount = 0;
  let errorCount = 0;
  const usedSlugs = new Set();
  
  for (const item of items) {
    try {
      const title = item.title?.[0] || '無題';
      const content = item['content:encoded']?.[0] || '';
      const link = item.link?.[0] || '';
      const pubDate = item.pubDate?.[0] || '';
      
      // 日付をフォーマット（文字列として）
      let formattedDate = '';
      if (pubDate) {
        try {
          const date = new Date(pubDate);
          formattedDate = `"${date.toISOString().split('T')[0]}"`;
        } catch (e) {
          log(`日付の解析に失敗: ${pubDate}`, 'error');
          formattedDate = '""';
        }
      } else {
        formattedDate = '""';
      }
      
      // slugを生成（重複を避ける）
      let baseSlug = slugify(title, { 
        lower: true, 
        strict: true,
        locale: 'ja'
      }) || 'untitled';
      
      let slug = baseSlug;
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      usedSlugs.add(slug);
      
      // 説明文を生成（HTMLタグを除去して最初の160文字）
      const description = content
        .replace(/<[^>]*>/g, '') // HTMLタグを除去
        .replace(/\s+/g, ' ') // 複数の空白を1つに
        .trim()
        .substring(0, 160);
      
      // Markdownファイルの内容を作成（slugフィールドを削除）
      const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
pubDate: ${formattedDate}
draft: false
canonical: ${link}
---

${content}
`;
      
      // ファイルを保存
      const filename = `${slug}.md`;
      const filepath = join(outputDir, filename);
      writeFileSync(filepath, frontmatter, 'utf-8');
      
      log(`作成: ${filename} - ${title}`);
      successCount++;
      
    } catch (error) {
      log(`エラー: ${error.message}`, 'error');
      errorCount++;
    }
  }
  
  log(`処理完了! 成功: ${successCount}件, エラー: ${errorCount}件`, 'success');
}

main().catch(error => {
  log(`実行エラー: ${error.message}`, 'error');
  process.exit(1);
});
