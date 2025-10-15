import fs from 'fs-extra';
import path from 'path';
import sanitizeHtml from 'sanitize-html';
import { JSDOM } from 'jsdom';
import { inferLearningStep, inferSkill } from '../config/categories';
import { SKILL_ARTICLE_MAPPINGS } from '../config/skill-article-mapping';

// HTMLファイルとassetsはプロジェクトルートに配置されている
const NOTE_POSTS_DIR = process.cwd(); // ルートディレクトリ
const CONTENT_DIR = path.join(process.cwd(), 'content/posts');
const PUBLIC_ASSETS_DIR = path.join(process.cwd(), 'public/assets');
const SOURCE_ASSETS_DIR = path.join(process.cwd(), 'assets');

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  hero: string;
  content: string;
  categoryStep: string | null;
  categorySkill: string | null;
  order: number | null;
}

// HTMLのサニタイズ設定
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

// 記事をインポート
async function importPosts() {
  console.log('📚 記事のインポートを開始します...');

  // ディレクトリの作成
  await fs.ensureDir(CONTENT_DIR);
  await fs.ensureDir(PUBLIC_ASSETS_DIR);

  // HTMLファイルのリストを取得
  const files = await fs.readdir(NOTE_POSTS_DIR);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));

  console.log(`✅ ${htmlFiles.length}個のHTMLファイルが見つかりました`);

  // assetsディレクトリのコピー
  if (await fs.pathExists(SOURCE_ASSETS_DIR)) {
    console.log('📁 assetsディレクトリをコピーしています...');
    await fs.copy(SOURCE_ASSETS_DIR, PUBLIC_ASSETS_DIR, { overwrite: true });
    console.log('✅ assetsディレクトリをコピーしました');
  }

  let processedCount = 0;

  for (const file of htmlFiles) {
    try {
      const slug = path.basename(file, '.html');
      const filePath = path.join(NOTE_POSTS_DIR, file);
      const htmlContent = await fs.readFile(filePath, 'utf-8');

      // HTMLをパース
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // タイトルを取得
      const titleElement =
        document.querySelector('title') || document.querySelector('h1');
      const title = titleElement?.textContent?.trim() || `記事 ${slug}`;

      // 本文を取得（bodyの内容）
      const bodyElement = document.querySelector('body');
      let content = bodyElement?.innerHTML || '';

      // 画像パスを修正（assets/... → /assets/...）
      content = content.replace(
        /src="assets\//g,
        'src="/assets/'
      );

      // HTMLをサニタイズ
      content = sanitizeHtml(content, sanitizeOptions);

      // 日付を取得（ファイルの更新日時を使用）
      const stats = await fs.stat(filePath);
      const date = stats.mtime.toISOString();

      // 説明文を抽出（最初の段落から）
      const firstParagraph = document.querySelector('p');
      const description =
        firstParagraph?.textContent?.trim().slice(0, 200) || '';

      // タグを推定（タイトルや内容から）
      const tags = extractTags(title, content);

      // ヒーロー画像を取得（最初の画像）
      const firstImage = document.querySelector('img');
      const hero = firstImage?.getAttribute('src')?.replace('assets/', '/assets/') || '';

      // 学習ステップとスキルを推定
      const categoryStep = inferLearningStep(title, tags);
      
      // 手動マッピングからスキルと順序を取得
      let categorySkill = null;
      let order = null;
      
      for (const [skillId, mappings] of Object.entries(SKILL_ARTICLE_MAPPINGS)) {
        const mapping = mappings.find(m => m.slug === slug);
        if (mapping) {
          categorySkill = skillId;
          order = mapping.order;
          break; // 最初に見つかったスキルを使用
        }
      }
      
      // 手動マッピングにない場合は自動推定
      if (!categorySkill) {
        categorySkill = inferSkill(title, tags);
      }

      // noteのURLと切り取りポイントを抽出

      // MDXファイルとして保存
      const post: Post = {
        slug,
        title,
        date,
        description,
        tags,
        hero,
        content,
        categoryStep,
        categorySkill,
        order,
      };

      await savePost(post);
      processedCount++;
      console.log(`✅ [${processedCount}/${htmlFiles.length}] ${title}`);
    } catch (error) {
      console.error(`❌ ${file}の処理中にエラーが発生しました:`, error);
    }
  }

  console.log(`\n🎉 ${processedCount}個の記事を正常にインポートしました！`);
}


// タグを抽出
function extractTags(title: string, content: string): string[] {
  const tags: string[] = [];
  const text = `${title} ${content}`.toLowerCase();

  // キーワードベースのタグ抽出
  const tagKeywords = {
    IELTS: ['ielts', 'アイエルツ'],
    Writing: ['writing', 'ライティング', '書き方'],
    Speaking: ['speaking', 'スピーキング', '話す'],
    Reading: ['reading', 'リーディング', '読解'],
    Listening: ['listening', 'リスニング', '聴解'],
    'Task 1': ['task 1', 'task1', 'タスク1'],
    'Task 2': ['task 2', 'task2', 'タスク2'],
    '外資系': ['外資系', 'コンサル', 'consulting'],
    '英語学習': ['英語学習', '勉強法', '学習法'],
    ビジネス英語: ['ビジネス英語', 'business english'],
    語彙: ['語彙', 'vocabulary', '単語'],
    文法: ['文法', 'grammar'],
    表現: ['表現', 'expression', 'フレーズ'],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('英語学習');
  }

  return [...new Set(tags)]; // 重複を除去
}

// 記事を保存
async function savePost(post: Post) {
  const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: "${post.date}"
description: "${post.description.replace(/"/g, '\\"')}"
tags: ${JSON.stringify(post.tags)}
hero: "${post.hero}"
slug: "${post.slug}"
${post.categoryStep ? `categoryStep: "${post.categoryStep}"` : ''}
${post.categorySkill ? `categorySkill: "${post.categorySkill}"` : ''}
${post.order !== null ? `order: ${post.order}` : ''}
---

`;

  const mdxContent = frontmatter + post.content;
  const outputPath = path.join(CONTENT_DIR, `${post.slug}.mdx`);
  await fs.writeFile(outputPath, mdxContent, 'utf-8');
}

// スクリプト実行
importPosts().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
