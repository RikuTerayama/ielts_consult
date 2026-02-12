import { getAllSteps } from "@/lib/categories";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "学習ステップ一覧",
  description: "IELTS学習の段階別ステップ一覧。初心者から上級者まで、レベルに応じた学習コンテンツを提供します。",
  alternates: {
    canonical: "https://ieltsconsult.netlify.app/steps/",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StepsPage() {
  const steps = await getAllSteps();

  // CollectionPage構造化データ
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "IELTS学習ステップ一覧",
    "description": "IELTS学習の段階別ステップ一覧。初心者から上級者まで、レベルに応じた学習コンテンツを提供します。",
    "url": "https://ieltsconsult.netlify.app/steps/",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": steps.length,
      "itemListElement": steps.map((step, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": step.label,
        "url": `https://ieltsconsult.netlify.app/steps/${step.id}/`,
        "description": step.description
      }))
    }
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <div className="container mx-auto px-4 py-12">
      <Breadcrumb 
        items={[
          { label: "学習ステップ一覧", href: "/steps" }
        ]} 
        className="mb-8"
      />
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">IELTS学習ステップ一覧</h1>
        <p className="text-lg text-muted-foreground">
          あなたの現在のレベルに応じて、最適な学習ステップを選択してください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={`/steps/${step.id}`}
            className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{step.label}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}
