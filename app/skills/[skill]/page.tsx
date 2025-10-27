import { getAllSkills, getPostsBySkill } from "@/lib/categories";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkillId } from "@/config/categories";

interface SkillPageProps {
  params: {
    skill: string;
  };
}

export async function generateStaticParams() {
  const skills = await getAllSkills();
  return skills.map((skill) => ({
    skill: skill.id,
  }));
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
        <p className="text-sm text-muted-foreground mt-2">{posts.length}件の記事</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          このスキルの記事は準備中です。
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
