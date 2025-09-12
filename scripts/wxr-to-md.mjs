#!/usr/bin/env node

import { parseString } from 'xml2js';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import * as cheerio from 'cheerio';
import slugify from 'slugify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
      case '--assets':
        options.assetsDir = value;
        break;
      case '--out':
        options.outDir = value;
        break;
      case '--images':
        options.imagesDir = value;
        break;
      case '--include':
        options.includePattern = value;
        break;
      case '--exclude':
        options.excludePattern = value;
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

// ファイル名から拡張子を除く
function getFileNameWithoutExt(filename) {
  return basename(filename, extname(filename));
}

// アセットファイルを検索
function findAssetFile(filename, assetsDir) {
  if (!existsSync(assetsDir)) {
    return null;
  }
  
  const files = readdirSync(assetsDir, { recursive: true });
  const targetName = getFileNameWithoutExt(filename);
  
  for (const file of files) {
    if (getFileNameWithoutExt(file) === targetName) {
      return join(assetsDir, file);
    }
  }
  
  return null;
}

// 重複するslugをチェックして連番を付ける
function generateUniqueSlug(baseSlug, existingSlugs) {
  let slug = baseSlug;
  let counter = 2;
  
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  existingSlugs.add(slug);
  return slug;
}

// HTMLから画像を処理
function processImages(html, slug, assetsDir, imagesDir) {
  const $ = cheerio.load(html);
  const images = $('img[src]');
  let processedCount = 0;
  
  images.each((i, img) => {
    const $img = $(img);
    const src = $img.attr('src');
    
    if (!src) return;
    
    // ファイル名を抽出
    const filename = basename(src);
    const assetPath = findAssetFile(filename, assetsDir);
    
    if (assetPath) {
      // 画像ディレクトリを作成
      const imageDir = join(imagesDir, slug);
      if (!existsSync(imageDir)) {
        mkdirSync(imageDir, { recursive: true });
      }
      
      // 画像をコピー
      const destPath = join(imageDir, filename);
      copyFileSync(assetPath, destPath);
      
      // HTMLのsrcを更新
      $img.attr('src', `/images/${slug}/${filename}`);
      processedCount++;
      
      log(`画像をコピー: ${filename} → /images/${slug}/`);
    } else {
      log(`アセットが見つかりません: ${filename} (元のURLを維持)`);
    }
  });
  
  return { html: $.html(), imageCount: processedCount };
}

// テキストからdescriptionを生成（160文字）
function generateDescription(html) {
  const $ = cheerio.load(html);
  const text = $.text().replace(/\s+/g, ' ').trim();
  
  if (text.length <= 160) {
    return text;
  }
  
  return text.substring(0, 160);
}

// canonical URLを生成
function generateCanonical(slug) {
  const siteUrl = process.env.PUBLIC_SITE_URL;
  if (siteUrl) {
    return `${siteUrl}/blog/${slug}/`;
  }
  return `/blog/${slug}/`;
}

// アイテムがフィルタ条件にマッチするかチェック
function matchesFilter(item, includePattern, excludePattern) {
  const title = item.title?.[0] || '';
  const postName = item['wp:post_name']?.[0] || '';
  const searchText = `${title} ${postName}`.toLowerCase();
  
  // 除外パターンが指定されている場合
  if (excludePattern) {
    const excludeRegex = new RegExp(excludePattern, 'i');
    if (excludeRegex.test(searchText)) {
      return false;
    }
  }
  
  // 包含パターンが指定されている場合
  if (includePattern) {
    const includeRegex = new RegExp(includePattern, 'i');
    return includeRegex.test(searchText);
  }
  
  // パターンが指定されていない場合は全てマッチ
  return true;
}

// メイン処理
async function main() {
  const options = parseArgs();
  
  // 引数チェック
  if (!options.xmlPath || !options.assetsDir || !options.outDir || !options.imagesDir) {
    console.error('必要な引数が不足しています:');
    console.error('--xml <path>     XMLファイルのパス');
    console.error('--assets <dir>   アセットディレクトリ');
    console.error('--out <dir>      出力ディレクトリ');
    console.error('--images <dir>   画像出力ディレクトリ');
    process.exit(1);
  }
  
  log('XML変換処理を開始します...');
  log(`XML: ${options.xmlPath}`);
  log(`アセット: ${options.assetsDir}`);
  log(`出力: ${options.outDir}`);
  log(`画像: ${options.imagesDir}`);
  
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
    log(`${items.length}個のアイテムが見つかりました`);
    
    // 出力ディレクトリを作成
    if (!existsSync(options.outDir)) {
      mkdirSync(options.outDir, { recursive: true });
    }
    
    // TurndownServiceを設定
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced'
    });
    turndownService.use(gfm);
    
    let processedCount = 0;
    let skippedCount = 0;
    let totalImageCount = 0;
    const existingSlugs = new Set();
    
    // 各アイテムを処理
    for (const item of items) {
      try {
        // メタデータを抽出
        const title = item.title?.[0] || '無題';
        const content = item['content:encoded']?.[0] || '';
        const postDate = item['wp:post_date']?.[0];
        const postName = item['wp:post_name']?.[0];
        const postId = item['wp:post_id']?.[0];
        const postType = item['wp:post_type']?.[0];
        const updatedDate = item['wp:post_modified']?.[0];
        
        // フィルタ条件をチェック
        if (!matchesFilter(item, options.includePattern, options.excludePattern)) {
          log(`スキップ: ${title} (フィルタ条件にマッチしません)`);
          skippedCount++;
          continue;
        }
        
        // カテゴリとタグを抽出
        const categories = item.category || [];
        const tags = categories
          .filter(cat => cat.$.domain === 'post_tag')
          .map(cat => cat._ || cat.$?.nicename || cat);
        const category = categories
          .find(cat => cat.$.domain === 'category')
          ?._ || categories
          .find(cat => cat.$.domain === 'category')
          ?.$?.nicename || '';
        
        // 投稿タイプがpostでない場合はスキップ（post_typeが不明な場合は処理）
        if (postType && postType !== 'post') {
          log(`スキップ: ${title} (type: ${postType})`);
          skippedCount++;
          continue;
        }
        
        // slugを生成
        let baseSlug;
        if (postName) {
          baseSlug = postName;
        } else {
          const titleSlug = slugify(title, { 
            lower: true, 
            strict: true,
            locale: 'ja'
          });
          if (titleSlug && titleSlug.length > 0) {
            baseSlug = titleSlug;
          } else {
            baseSlug = `post-${postId || Date.now()}`;
          }
        }
        
        // 重複チェックしてユニークなslugを生成
        const slug = generateUniqueSlug(baseSlug, existingSlugs);
        
        log(`処理中: ${title} (slug: ${slug})`);
        
        // 画像を処理
        const { html: processedHtml, imageCount } = processImages(content, slug, options.assetsDir, options.imagesDir);
        totalImageCount += imageCount;
        
        // HTMLをMarkdownに変換
        const markdown = turndownService.turndown(processedHtml);
        
        // descriptionを生成
        const description = generateDescription(processedHtml);
        
        // 日付をフォーマット
        const pubDate = postDate ? new Date(postDate).toISOString().split('T')[0] : undefined;
        const updatedDateFormatted = updatedDate ? new Date(updatedDate).toISOString().split('T')[0] : undefined;
        
        // canonical URLを生成
        const canonical = generateCanonical(slug);
        
        // Frontmatterを生成
        const frontmatter = {
          title: title,
          description: description,
          slug: slug,
          pubDate: pubDate,
          updatedDate: updatedDateFormatted,
          tags: tags.length > 0 ? tags : undefined,
          category: category || undefined,
          draft: false,
          canonical: canonical
        };
        
        // Frontmatterを文字列に変換
        const frontmatterStr = '---\n' + 
          Object.entries(frontmatter)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return `${key}:\n${value.map(v => `  - ${v}`).join('\n')}`;
              }
              return `${key}: ${value}`;
            })
            .join('\n') + 
          '\n---\n\n';
        
        // ファイルに保存
        const outputPath = join(options.outDir, `${slug}.md`);
        const contentStr = frontmatterStr + markdown;
        writeFileSync(outputPath, contentStr, 'utf-8');
        
        processedCount++;
        log(`保存完了: ${outputPath}`);
        
      } catch (error) {
        const itemTitle = item.title?.[0] || '無題';
        log(`エラー: ${itemTitle} - ${error.message}`, 'error');
        skippedCount++;
      }
    }
    
    log(`処理完了! 成功: ${processedCount}件, スキップ: ${skippedCount}件, 画像コピー: ${totalImageCount}枚`, 'success');
    
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
