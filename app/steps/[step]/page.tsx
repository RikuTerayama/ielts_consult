import { getAllSteps } from "@/lib/categories";
import { getPostsByStep } from "@/lib/html-posts";
import { PostCard } from "@/components/post-card";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningStepId } from "@/config/categories";

type StepPageProps = {
  params: { step: string };
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ step: string }>> {
  try {
    const steps = await getAllSteps();
    return steps.map((step) => ({ step: step.id }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: StepPageProps): Promise<Metadata> {
  const steps = await getAllSteps();
  const step = steps.find((s) => s.id === params.step);

  if (!step) {
    return {
      title: "学習ステップが見つかりません",
    };
  }

  return {
    title: `${step.label} | 学習ステップ`,
    description: step.description,
  };
}

export default async function StepPage({ params }: StepPageProps) {
  const steps = await getAllSteps();
  const step = steps.find((s) => s.id === params.step);

  if (!step) {
    notFound();
  }

  // HTMLファイルから記事を取得
  const posts = await getPostsByStep(params.step as LearningStepId);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{step.label}</h1>
        <p className="text-lg text-muted-foreground">{step.description}</p>
        <p className="text-sm text-muted-foreground mt-2">{posts.length}件の記事</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          この学習ステップの記事は準備中です。
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
