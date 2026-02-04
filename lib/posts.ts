import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { JSDOM } from 'jsdom';
import sanitizeHtml from 'sanitize-html';
import type { LearningStepId } from '@/config/categories';
import { PAID_POST_SLUG_SET } from '@/config/paid-articles';
import { PUBLIC_POST_SET } from '@/config/content-gate';

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  hero?: string;
  content: string;
  readingTime: string;
  categoryStep?: string;
  categorySkill?: string;
  order?: number; // スキル別ページでの表示順序
}

export interface PostAddition {
  slug: string;
  takeaways?: string[]; // この記事で得られること
  practice?: string; // 実践パート
  commonMistakes?: string[]; // よくある誤り
  faq?: Array<{ question: string; answer: string }>; // FAQ
  nextSteps?: Array<{ title: string; description: string; link?: string }>; // 次のステップ
  content: string; // MDXコンテンツ
}

const postsDirectory = path.join(process.cwd(), 'content/posts');
const additionsDirectory = path.join(process.cwd(), 'content/additions');

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

/**
 * HTMLファイルから記事情報を取得
 */
async function getPostFromHtml(slug: string): Promise<Post | null> {
  const htmlPath = path.join(process.cwd(), `${slug}.html`);
  
  if (!fs.existsSync(htmlPath)) {
    return null;
  }

  try {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // タイトルを取得
    const titleElement = document.querySelector('title') || document.querySelector('h1');
    const title = titleElement?.textContent?.trim() || '';

    if (!title) {
      return null;
    }

    // 本文を取得（bodyの内容）
    const bodyElement = document.querySelector('body');
    
    // 最初のh1タグを削除（タイトルが重複表示されるのを防ぐ）
    // JSDOMでDOM操作を行い、確実に削除
    const firstH1 = document.querySelector('body h1');
    if (firstH1) {
      firstH1.remove();
    }
    
    // H1削除後のinnerHTMLを取得
    let content = bodyElement?.innerHTML || '';
    
    // フォールバック: 正規表現でも確実に最初のh1タグを削除
    // [\s\S]を使用して改行を含むすべての文字にマッチ（.*?では改行にマッチしない場合がある）
    content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');
    
    // 広告関連の要素を削除（ad-container, adsbygoogle等）
    content = content.replace(/<div[^>]*class="[^"]*ad-container[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    content = content.replace(/<ins[^>]*class="[^"]*adsbygoogle[^"]*"[^>]*>[\s\S]*?<\/ins>/gi, '');
    content = content.replace(/<div[^>]*class="[^"]*ad-slot[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');
    
    // 画像パスを修正（assets/... → /assets/...）
    content = content.replace(/src="assets\//g, 'src="/assets/');
    
    // HTMLをサニタイズ
    content = sanitizeHtml(content, sanitizeOptions);
    
    // サニタイズ後もH1が残っている可能性があるため、再度削除
    content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>\s*/i, '');

    // 日付を取得（ファイルの更新日時を使用）
    const stats = fs.statSync(htmlPath);
    const date = stats.mtime.toISOString();

    // 説明文を抽出（最初の段落から、より詳細に）
    let description = '';
    const paragraphs = document.querySelectorAll('p');
    for (const p of Array.from(paragraphs)) {
      const text = p.textContent?.trim() || '';
      if (text.length > 50 && text.length < 300) {
        description = text.slice(0, 200);
        break;
      }
    }
    
    // 適切な説明が見つからない場合、複数の段落を結合
    if (!description || description.length < 50) {
      const firstFewParagraphs = Array.from(paragraphs).slice(0, 3)
        .map(p => p.textContent?.trim())
        .filter(Boolean)
        .join(' ')
        .slice(0, 200);
      description = firstFewParagraphs || `${title}。IELTS対策と実践的な英語学習ノウハウを提供します。`;
    }
    
    // 説明文が短すぎる場合は補足を追加
    if (description.length < 60) {
      description = `${description} IELTS対策、ビジネス英語、外資系コンサルで求められる実践的なノウハウを詳しく解説します。`;
    }

    // タグを抽出
    const tags = extractTags(title, content);

    // ヒーロー画像を取得（最初の画像）
    const firstImage = document.querySelector('img');
    const hero = firstImage?.getAttribute('src')?.replace('assets/', '/assets/') || '';

    // 学習ステップとスキルを推定
    const { inferLearningStep, inferSkill } = await import('@/config/categories');
    const { SKILL_ARTICLE_MAPPINGS } = await import('@/config/skill-article-mapping');
    const { STEP_ARTICLE_MAPPINGS } = await import('@/config/step-article-mapping');
    
    let categoryStep: LearningStepId | null = inferLearningStep(title, tags);
    let categorySkill: string | null = null;
    let order: number | null = null;

    // 手動マッピングからスキルと順序を取得
    for (const [skillId, mappings] of Object.entries(SKILL_ARTICLE_MAPPINGS)) {
      const mapping = mappings.find(m => m.slug === slug);
      if (mapping) {
        categorySkill = skillId;
        order = mapping.order;
        break;
      }
    }

    // 手動マッピングにない場合は自動推定
    if (!categorySkill) {
      categorySkill = inferSkill(title, tags);
    }

    // ステップマッピングから取得（型アサーションを使用）
    for (const [stepId, mappings] of Object.entries(STEP_ARTICLE_MAPPINGS)) {
      if (mappings.some(m => m.slug === slug)) {
        // stepIdはSTEP_ARTICLE_MAPPINGSのキーなので、LearningStepId型に安全にキャストできる
        categoryStep = stepId as LearningStepId;
        break;
      }
    }

    // 読書時間を計算（HTMLタグを除去したテキストから）
    const textContent = document.body?.textContent || content.replace(/<[^>]*>/g, '');
    const readingTimeText = readingTime(textContent).text;

    return {
      slug,
      title,
      date,
      description,
      tags,
      hero,
      content,
      readingTime: readingTimeText,
      categoryStep: categoryStep || undefined,
      categorySkill: categorySkill || undefined,
      order: order || undefined,
    };
  } catch (error) {
    console.error(`Error reading HTML file ${slug}:`, error);
    return null;
  }
}

/**
 * タグを抽出
 */
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
    'ビジネス英語': ['ビジネス英語', 'business english'],
    '語彙': ['語彙', 'vocabulary', '単語'],
    '文法': ['文法', 'grammar'],
    '表現': ['表現', 'expression', 'フレーズ'],
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

/**
 * すべてのHTML記事を取得
 */
async function getAllHtmlPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  
  // HTMLファイルのリストを取得
  const files = fs.readdirSync(process.cwd());
  const htmlFiles = files.filter(file => file.startsWith('n') && file.endsWith('.html'));
  
  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    // 有料記事を除外
    if (PAID_POST_SLUG_SET.has(slug)) {
      continue;
    }
    const post = await getPostFromHtml(slug);
    if (post) {
      posts.push(post);
    }
  }
  
  return posts;
}

export async function getAllPosts(): Promise<Post[]> {
  const allPosts: Post[] = [];
  
  // まず、content/posts/ からMDXファイルを読み込む
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory);
    const mdxFiles = fileNames.filter(
      (fileName) => (fileName.endsWith('.mdx') || fileName.endsWith('.md')) && !fileName.startsWith('.')
    );
    
    for (const fileName of mdxFiles) {
      try {
        const slug = fileName.replace(/\.(mdx|md)$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        allPosts.push({
          slug,
          title: data.title || '',
          date: data.date || new Date().toISOString(),
          description: data.description || '',
          tags: data.tags || [],
          hero: data.hero || '',
          content,
          readingTime: readingTime(content).text,
          categoryStep: data.categoryStep || undefined,
          categorySkill: data.categorySkill || undefined,
          order: data.order || undefined,
        });
      } catch (error) {
        console.error(`Error reading MDX file ${fileName}:`, error);
      }
    }
  }

  // HTMLファイルからも読み込む（MDXファイルにないもののみ）
  const htmlPosts = await getAllHtmlPosts();
  const existingSlugs = new Set(allPosts.map(p => p.slug));
  
  for (const htmlPost of htmlPosts) {
    if (!existingSlugs.has(htmlPost.slug)) {
      allPosts.push(htmlPost);
    }
  }

  // 有料記事と非公開記事を除外してから日付でソート
  // PUBLIC_POST_SETが空の場合は、すべての記事を表示する（フォールバック）
  const isPublicGateEnabled = PUBLIC_POST_SET.size > 0;
  
  const filteredPosts = allPosts.filter(post => {
    // 有料記事は常に除外
    if (PAID_POST_SLUG_SET.has(post.slug)) {
      return false;
    }
    // PUBLIC_POST_SETが空の場合は、すべての記事を表示
    if (!isPublicGateEnabled) {
      return true;
    }
    // PUBLIC_POST_SETが設定されている場合は、公開記事のみ表示
    return PUBLIC_POST_SET.has(post.slug);
  });
  
  return filteredPosts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // 新しい順
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  // 有料記事は常に除外
  if (PAID_POST_SLUG_SET.has(slug)) {
    return null;
  }
  // PUBLIC_POST_SETが空の場合は、すべての記事を表示（フォールバック）
  const isPublicGateEnabled = PUBLIC_POST_SET.size > 0;
  if (isPublicGateEnabled && !PUBLIC_POST_SET.has(slug)) {
    return null;
  }

  // まず、content/posts/ からMDXファイルを確認
  const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
  const mdPath = path.join(postsDirectory, `${slug}.md`);
  
  if (fs.existsSync(mdxPath) || fs.existsSync(mdPath)) {
    try {
      const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || '',
        date: data.date || new Date().toISOString(),
        description: data.description || '',
        tags: data.tags || [],
        hero: data.hero || '',
        content,
        readingTime: readingTime(content).text,
        categoryStep: data.categoryStep || undefined,
        categorySkill: data.categorySkill || undefined,
        order: data.order || undefined,
      };
    } catch (error) {
      console.error(`Error reading MDX file ${slug}:`, error);
    }
  }
  
  // MDXファイルがない場合は、HTMLファイルから読み込む
  return await getPostFromHtml(slug);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagsSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

/**
 * 記事の追加コンテンツ（オリジナル付加価値）を取得
 */
export async function getPostAddition(slug: string): Promise<PostAddition | null> {
  const additionPath = path.join(additionsDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(additionPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(additionPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      takeaways: data.takeaways || [],
      practice: data.practice || '',
      commonMistakes: data.commonMistakes || [],
      faq: data.faq || [],
      nextSteps: data.nextSteps || [],
      content,
    };
  } catch (error) {
    console.error(`Error reading addition file ${slug}:`, error);
    return null;
  }
}
