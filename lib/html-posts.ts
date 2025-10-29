import fs from 'fs';
import path from 'path';

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
  order?: number;
}

/**
 * HTMLファイルから記事情報を取得
 */
export async function getPostFromHtml(slug: string): Promise<Post | null> {
  const htmlPath = path.join(process.cwd(), `${slug}.html`);
  
  if (!fs.existsSync(htmlPath)) {
    return null;
  }

  try {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // タイトルを抽出
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : '';
    
    // H1からタイトルを抽出（fallback）
    const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/);
    const h1Title = h1Match ? h1Match[1].replace(/<[^>]*>/g, '') : '';
    
    // 最終的なタイトルを決定
    const finalTitle = title || h1Title || '';
    
    // 説明文を生成（タイトルベース）
    const description = finalTitle ? `${finalTitle}の詳細な解説と実践的なノウハウを提供します。` : '';
    
    // タグを推定（タイトルベース）
    const tags: string[] = [];
    if (finalTitle.includes('IELTS')) tags.push('IELTS');
    if (finalTitle.includes('ライティング') || finalTitle.includes('Writing')) tags.push('Writing');
    if (finalTitle.includes('スピーキング') || finalTitle.includes('Speaking')) tags.push('Speaking');
    if (finalTitle.includes('リーディング') || finalTitle.includes('Reading')) tags.push('Reading');
    if (finalTitle.includes('リスニング') || finalTitle.includes('Listening')) tags.push('Listening');
    if (finalTitle.includes('対策')) tags.push('対策');
    if (finalTitle.includes('表現')) tags.push('表現');
    if (finalTitle.includes('ガイド')) tags.push('ガイド');
    
    return {
      slug,
      title: finalTitle,
      date: new Date().toISOString(),
      description,
      tags,
      hero: '',
      content: htmlContent,
      readingTime: '5分',
      categoryStep: undefined,
      categorySkill: undefined,
      order: undefined,
    };
  } catch (error) {
    console.error(`Error reading HTML file ${slug}:`, error);
    return null;
  }
}

/**
 * すべてのHTML記事を取得
 */
export async function getAllHtmlPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  
  // HTMLファイルのリストを取得
  const files = fs.readdirSync(process.cwd());
  const htmlFiles = files.filter(file => file.startsWith('n') && file.endsWith('.html'));
  
  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    const post = await getPostFromHtml(slug);
    if (post) {
      posts.push(post);
    }
  }
  
  return posts.sort((a, b) => {
    if (new Date(a.date) < new Date(b.date)) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * ステップ別に記事を取得
 */
export async function getPostsByStep(stepId: string): Promise<Post[]> {
  const { getArticlesForStep } = await import('@/config/step-article-mapping');
  const articleSlugs = getArticlesForStep(stepId);
  
  const posts: Post[] = [];
  
  for (const slug of articleSlugs) {
    const post = await getPostFromHtml(slug);
    if (post) {
      // ステップ別の順序を設定
      const { getArticleOrder } = await import('@/config/step-article-mapping');
      post.order = getArticleOrder(stepId, slug);
      posts.push(post);
    }
  }
  
  // 順序でソート
  return posts.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * タグ別に記事を取得
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const { getArticlesForTag } = await import('@/config/tag-article-mapping');
  const articleSlugs = getArticlesForTag(tag);
  
  const posts: Post[] = [];
  
  for (const slug of articleSlugs) {
    const post = await getPostFromHtml(slug);
    if (post) {
      // タグ別の順序を設定
      const { getArticleOrder } = await import('@/config/tag-article-mapping');
      post.order = getArticleOrder(tag, slug);
      posts.push(post);
    }
  }
  
  // 順序でソート
  return posts.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * 有効なタグのリストを取得
 */
export async function getAllValidTags(): Promise<string[]> {
  const { getValidTags } = await import('@/config/tag-article-mapping');
  return getValidTags();
}
