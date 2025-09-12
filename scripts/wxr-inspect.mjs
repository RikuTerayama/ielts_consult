#!/usr/bin/env node

import { parseString } from 'xml2js';
import { readFileSync, statSync } from 'fs';
import { basename } from 'path';

// コマンドライン引数の解析
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--xml':
        options.xmlPath = value;
        break;
      default:
        console.warn(`Unknown option: ${key}`);
    }
  }
  
  return options;
}

// ログ関数
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substr(11, 8);
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// ファイルサイズを人間が読みやすい形式に変換
function formatFileSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// メイン処理
async function main() {
  const options = parseArgs();
  
  // 引数チェック
  if (!options.xmlPath) {
    console.error('必要な引数が不足しています:');
    console.error('--xml <path>     XMLファイルのパス');
    process.exit(1);
  }
  
  log('WXRファイル検査を開始します...');
  log(`XML: ${options.xmlPath}`);
  
  try {
    // ファイルサイズを取得
    const stats = statSync(options.xmlPath);
    const fileSize = formatFileSize(stats.size);
    log(`ファイルサイズ: ${fileSize}`);
    
    // XMLファイルを読み込み
    log('XMLファイルを読み込み中...');
    const xmlContent = readFileSync(options.xmlPath, 'utf-8');
    
    // XMLをパース
    log('XMLをパース中...');
    const result = await new Promise((resolve, reject) => {
      parseString(xmlContent, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    // アイテムを抽出
    const items = result.rss?.channel?.[0]?.item || [];
    const totalItems = items.length;
    
    // 投稿タイプ別にカウント
    const postTypes = {};
    const posts = [];
    const pages = [];
    const attachments = [];
    const others = [];
    
    items.forEach((item, index) => {
      const postType = item['wp:post_type']?.[0] || 'unknown';
      const title = item.title?.[0] || '無題';
      const postName = item['wp:post_name']?.[0] || '';
      
      postTypes[postType] = (postTypes[postType] || 0) + 1;
      
      // 最初の10件の詳細情報を記録
      if (index < 10) {
        const itemInfo = {
          index: index + 1,
          title: title,
          postType: postType,
          postName: postName
        };
        
        switch (postType) {
          case 'post':
            posts.push(itemInfo);
            break;
          case 'page':
            pages.push(itemInfo);
            break;
          case 'attachment':
            attachments.push(itemInfo);
            break;
          default:
            others.push(itemInfo);
        }
      }
    });
    
    // 結果を表示
    log(`=== WXRファイル検査結果 ===`);
    log(`総アイテム数: ${totalItems}`);
    log(`ファイルサイズ: ${fileSize}`);
    log('');
    
    log(`投稿タイプ別内訳:`);
    Object.entries(postTypes).forEach(([type, count]) => {
      log(`  ${type}: ${count}件`);
    });
    log('');
    
    if (posts.length > 0) {
      log(`最初の${Math.min(10, posts.length)}件の投稿:`);
      posts.forEach(item => {
        log(`  ${item.index}. ${item.title} (slug: ${item.postName || 'なし'})`);
      });
      log('');
    }
    
    if (pages.length > 0) {
      log(`最初の${Math.min(10, pages.length)}件のページ:`);
      pages.forEach(item => {
        log(`  ${item.index}. ${item.title} (slug: ${item.postName || 'なし'})`);
      });
      log('');
    }
    
    if (attachments.length > 0) {
      log(`最初の${Math.min(10, attachments.length)}件の添付ファイル:`);
      attachments.forEach(item => {
        log(`  ${item.index}. ${item.title} (slug: ${item.postName || 'なし'})`);
      });
      log('');
    }
    
    if (others.length > 0) {
      log(`その他の${others.length}件:`);
      others.forEach(item => {
        log(`  ${item.index}. ${item.title} (type: ${item.postType}, slug: ${item.postName || 'なし'})`);
      });
      log('');
    }
    
    // 結論と推奨事項
    log(`=== 結論と推奨事項 ===`);
    
    if (totalItems <= 1000 && stats.size < 50 * 1024 * 1024) { // 1000件未満かつ50MB未満
      log('✅ 通常、WXRは1ファイルで問題なし。MDへ分割変換されるため追加分割不要', 'success');
      log('📝 推奨: `npm run wxr:convert` でMarkdown変換を実行してください');
    } else {
      log('⚠️ アイテム数またはファイルサイズが大きいため、分割を検討してください', 'warning');
      log('📝 推奨: `npm run wxr:split` で分割後、各ファイルを個別に変換');
    }
    
    log('');
    log(`変換対象: 投稿 ${postTypes.post || 0}件、ページ ${postTypes.page || 0}件`);
    
  } catch (error) {
    log(`致命的エラー: ${error.message}`, 'error');
    process.exit(1);
  }
}

// スクリプト実行
main().catch(error => {
  log(`実行エラー: ${error.message}`, 'error');
  process.exit(1);
});
