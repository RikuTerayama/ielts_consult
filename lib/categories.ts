import { getAllPosts, Post } from './posts';
import { getAllHtmlPosts } from './html-posts';
import { LEARNING_STEPS, SKILLS, LearningStepId, SkillId } from '@/config/categories';
import { getArticlesForSkill } from '@/config/skill-article-mapping';

export async function getPostsByStep(stepId: LearningStepId): Promise<Post[]> {
  const allPosts = await getAllHtmlPosts();
  return allPosts.filter((post) => post.categoryStep === stepId);
}

export async function getPostsBySkill(skillId: SkillId): Promise<Post[]> {
  const allPosts = await getAllPosts();
  const allowedSlugs = getArticlesForSkill(skillId);
  
  // 手動マッピングに基づいてフィルタリング
  const filteredPosts = allPosts.filter((post) => allowedSlugs.includes(post.slug));
  
  // orderフィールドでソート（orderがない場合は末尾に配置）
  return filteredPosts.sort((a, b) => {
    const orderA = a.order ?? 9999;
    const orderB = b.order ?? 9999;
    return orderA - orderB;
  });
}

export async function getAllSteps(): Promise<typeof LEARNING_STEPS> {
  return LEARNING_STEPS;
}

export async function getAllSkills(): Promise<typeof SKILLS> {
  return SKILLS;
}

