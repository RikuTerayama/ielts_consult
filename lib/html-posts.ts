import fs from 'fs';
import path from 'path';
import { PUBLIC_POST_SET } from '@/config/content-gate';
import { PAID_POST_SLUG_SET } from '@/config/paid-articles';

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
    
    // ヒーロー画像を抽出（最初の画像を取得）
    const imgMatch = htmlContent.match(/<img[^>]+src="([^"]+)"/);
    const hero = imgMatch ? (imgMatch[1].startsWith('assets/') ? `/assets/${imgMatch[1].replace('assets/', '')}` : imgMatch[1]) : '';

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
    
    // 本文から最初のh1タグを削除（タイトルが重複表示されるのを防ぐ）
    let processedContent = htmlContent;
    if (h1Match) {
      // 最初のh1タグを削除
      processedContent = processedContent.replace(/<h1[^>]*>.*?<\/h1>/i, '');
    }
    
    // ステップマッピングから該当するステップを取得
    const { STEP_ARTICLE_MAPPINGS } = await import('@/config/step-article-mapping');
    let categoryStep: string | undefined = undefined;
    
    for (const [stepId, mappings] of Object.entries(STEP_ARTICLE_MAPPINGS)) {
      if (mappings.some(m => m.slug === slug)) {
        categoryStep = stepId;
        break;
      }
    }
    
    return {
      slug,
      title: finalTitle,
      date: new Date().toISOString(),
      description,
      tags,
      hero,
      content: processedContent,
      readingTime: '5分',
      categoryStep,
      categorySkill: undefined,
      order: undefined,
    };
  } catch (error) {
    console.error(`Error reading HTML file ${slug}:`, error);
    return null;
  }
}

/**
 * すべてのHTML記事を取得（公開記事のみ）
 */
export async function getAllHtmlPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  
  // HTMLファイルのリストを取得
  const files = fs.readdirSync(process.cwd());
  const htmlFiles = files.filter(file => file.startsWith('n') && file.endsWith('.html'));
  
  // PUBLIC_POST_SETが空の場合は、すべての記事を表示（フォールバック）
  const isPublicGateEnabled = PUBLIC_POST_SET.size > 0;
  
  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    // 有料記事は常に除外
    if (PAID_POST_SLUG_SET.has(slug)) {
      continue;
    }
    // PUBLIC_POST_SETが空の場合は、すべての記事を表示
    if (isPublicGateEnabled && !PUBLIC_POST_SET.has(slug)) {
      continue;
    }
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
 * タグ別に記事を取得（実際のHTMLファイルから抽出されたタグを使用）
 */
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllHtmlPosts();
  
  // 指定されたタグを含む記事をフィルタリング
  const filteredPosts = allPosts.filter(post => post.tags.includes(tag));
  
  return filteredPosts;
}

/**
 * 有効なタグのリストを取得
 */
export async function getAllValidTags(): Promise<string[]> {
  const { getValidTags } = await import('@/config/tag-article-mapping');
  return getValidTags();
}
