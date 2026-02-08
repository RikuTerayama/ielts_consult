/**
 * 構造のみモード: 記事データは返さない（空配列・null）
 */
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

export async function getPostFromHtml(_slug: string): Promise<Post | null> {
  return null;
}

export async function getAllHtmlPosts(): Promise<Post[]> {
  return [];
}

export async function getAllValidTags(): Promise<string[]> {
  return [];
}

export async function getPostsByStep(_stepId: string): Promise<Post[]> {
  return [];
}

export async function getPostsByTag(_tag: string): Promise<Post[]> {
  return [];
}
