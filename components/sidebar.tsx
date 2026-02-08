import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingAppCTA } from "@/components/training-app-cta";
import { LEARNING_STEPS, SKILLS } from "@/config/categories";

export function Sidebar() {
  return (
    <div className="space-y-6">
      <TrainingAppCTA variant="sidebar" />

      <Card>
        <CardHeader>
          <CardTitle>学習ステップ</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {LEARNING_STEPS.map((step) => (
              <li key={step.id}>
                <Link
                  href={`/steps/${step.id}`}
                  className="text-sm hover:text-primary transition-colors block"
                >
                  <span className="font-medium">{step.label}</span>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>技能別</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {SKILLS.map((skill) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="flex flex-col items-center p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                <span className="text-2xl mb-1">{skill.icon}</span>
                <span className="text-sm font-medium">{skill.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>新着記事</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            準備中です。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>人気タグ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            準備中です。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
