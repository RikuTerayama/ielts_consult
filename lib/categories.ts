import { getAllPosts, Post } from './posts';
import { LEARNING_STEPS, SKILLS, LearningStepId, SkillId } from '@/config/categories';

export async function getPostsByStep(stepId: LearningStepId): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.categoryStep === stepId);
}

export async function getPostsBySkill(skillId: SkillId): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter((post) => post.categorySkill === skillId);
}

export async function getAllSteps(): Promise<typeof LEARNING_STEPS> {
  return LEARNING_STEPS;
}

export async function getAllSkills(): Promise<typeof SKILLS> {
  return SKILLS;
}

