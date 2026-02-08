import type { Post } from './posts';
import { LEARNING_STEPS, SKILLS, LearningStepId, SkillId } from '@/config/categories';

export async function getPostsByStep(_stepId: LearningStepId): Promise<Post[]> {
  return [];
}

export async function getPostsBySkill(_skillId: SkillId): Promise<Post[]> {
  return [];
}

export async function getAllSteps(): Promise<typeof LEARNING_STEPS> {
  return LEARNING_STEPS;
}

export async function getAllSkills(): Promise<typeof SKILLS> {
  return SKILLS;
}
