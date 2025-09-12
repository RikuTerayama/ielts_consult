#!/usr/bin/env node

import { parseString, Builder } from 'xml2js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

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
      case '--out':
        options.outDir = value;
        break;
      case '--per':
        options.perFile = parseInt(value) || 10;
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
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// WXRテンプレートを生成
function createWxrTemplate() {
  return {
    rss: {
      $: {
        'version': '2.0',
        'xmlns:excerpt': 'http://wordpress.org/export/1.2/excerpt/',
        'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
        'xmlns:wfw': 'http://wellformedweb.org/CommentAPI/',
        'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
        'xmlns:wp': 'http://wordpress.org/export/1.2/'
      },
      channel: [{
        title: [''],
        link: [''],
        description: [''],
        pubDate: [''],
        language: [''],
        'wp:wxr_version': ['1.2'],
        'wp:base_site_url': [''],
        'wp:base_blog_url': [''],
        'wp:author': [],
        'wp:category': [],
        'wp:tag': [],
        'wp:term': [],
        'wp:post': [],
        item: []
      }]
    }
  };
}

// メイン処理
async function main() {
  const options = parseArgs();
  
  // 引数チェック
  if (!options.xmlPath || !options.outDir) {
    console.error('必要な引数が不足しています:');
    console.error('--xml <path>     XMLファイルのパス');
    console.error('--out <dir>      出力ディレクトリ');
    console.error('--per <number>   1ファイルあたりのアイテム数 (デフォルト: 10)');
    process.exit(1);
  }
  
  log('WXRファイル分割を開始します...');
  log(`XML: ${options.xmlPath}`);
  log(`出力: ${options.outDir}`);
  log(`1ファイルあたり: ${options.perFile}件`);
  
  try {
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
    
    log(`${totalItems}個のアイテムが見つかりました`);
    
    if (totalItems === 0) {
      log('分割するアイテムがありません', 'error');
      process.exit(1);
    }
    
    // 出力ディレクトリを作成
    if (!existsSync(options.outDir)) {
      mkdirSync(options.outDir, { recursive: true });
    }
    
    // 元のWXRのメタデータを取得
    const channel = result.rss?.channel?.[0];
    const baseFileName = basename(options.xmlPath, extname(options.xmlPath));
    
    // アイテムを分割
    const chunks = [];
    for (let i = 0; i < items.length; i += options.perFile) {
      chunks.push(items.slice(i, i + options.perFile));
    }
    
    log(`${chunks.length}個のファイルに分割します`);
    
    // XMLビルダーを初期化
    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '  ', newline: '\n' }
    });
    
    // 各チャンクをファイルに保存
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNumber = i + 1;
      const fileName = `${baseFileName}-part${chunkNumber.toString().padStart(2, '0')}.xml`;
      const filePath = join(options.outDir, fileName);
      
      // WXRテンプレートを作成
      const wxrTemplate = createWxrTemplate();
      
      // 元のメタデータをコピー
      wxrTemplate.rss.channel[0].title = channel.title || [''];
      wxrTemplate.rss.channel[0].link = channel.link || [''];
      wxrTemplate.rss.channel[0].description = channel.description || [''];
      wxrTemplate.rss.channel[0].pubDate = channel.pubDate || [''];
      wxrTemplate.rss.channel[0].language = channel.language || [''];
      wxrTemplate.rss.channel[0]['wp:wxr_version'] = channel['wp:wxr_version'] || ['1.2'];
      wxrTemplate.rss.channel[0]['wp:base_site_url'] = channel['wp:base_site_url'] || [''];
      wxrTemplate.rss.channel[0]['wp:base_blog_url'] = channel['wp:base_blog_url'] || [''];
      
      // メタデータをコピー
      wxrTemplate.rss.channel[0]['wp:author'] = channel['wp:author'] || [];
      wxrTemplate.rss.channel[0]['wp:category'] = channel['wp:category'] || [];
      wxrTemplate.rss.channel[0]['wp:tag'] = channel['wp:tag'] || [];
      wxrTemplate.rss.channel[0]['wp:term'] = channel['wp:term'] || [];
      wxrTemplate.rss.channel[0]['wp:post'] = channel['wp:post'] || [];
      
      // アイテムを設定
      wxrTemplate.rss.channel[0].item = chunk;
      
      // XMLを生成
      const xml = builder.buildObject(wxrTemplate);
      
      // ファイルに保存
      writeFileSync(filePath, xml, 'utf-8');
      
      log(`保存完了: ${fileName} (${chunk.length}件)`);
    }
    
    log(`分割完了! ${chunks.length}個のファイルを生成しました`, 'success');
    log('');
    log('⚠️ 通常は不要。変換が重い/Git運用の都合で分けたい場合のみ使用');
    log('📝 各ファイルを個別に変換: npm run wxr:convert -- --xml input/wxr-split/part01.xml');
    
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
