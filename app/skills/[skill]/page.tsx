import { getAllSkills, getPostsBySkill } from "@/lib/categories";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkillId } from "@/config/categories";

type SkillPageProps = {
  params: { skill: string };
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ skill: string }>> {
  try {
    const skills = await getAllSkills();
    return skills.map((skill) => ({ skill: skill.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const skills = await getAllSkills();
  const skill = skills.find((s) => s.id === params.skill);

  if (!skill) {
    return {
      title: "スキルが見つかりません",
    };
  }

  return {
    title: `${skill.label} | 技能別`,
    description: skill.description,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  const skills = await getAllSkills();
  const skill = skills.find((s) => s.id === params.skill);

  if (!skill) {
    notFound();
  }

  const posts = await getPostsBySkill(params.skill as SkillId);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-5xl">{skill.icon}</span>
          <h1 className="text-4xl font-bold">{skill.label}</h1>
        </div>
        <p className="text-lg text-muted-foreground">{skill.description}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {posts.length}件の記事
        </p>
      </div>
      <div className="text-center py-12 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20">
        <p className="text-muted-foreground">
          このスキルの記事は準備中です。
        </p>
      </div>
    </div>
  );
}
