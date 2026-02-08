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

export interface PostAddition {
  slug: string;
  takeaways?: string[];
  practice?: string;
  commonMistakes?: string[];
  faq?: Array<{ question: string; answer: string }>;
  nextSteps?: Array<{ title: string; description: string; link?: string }>;
  content: string;
}

export async function getAllPosts(): Promise<Post[]> {
  return [];
}

export async function getPostBySlug(_slug: string): Promise<Post | null> {
  return null;
}

export async function getPostAddition(_slug: string): Promise<PostAddition | null> {
  return null;
}

export async function getPostsByTag(_tag: string): Promise<Post[]> {
  return [];
}

export async function getAllTags(): Promise<string[]> {
  return [];
}
