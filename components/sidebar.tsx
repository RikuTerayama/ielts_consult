import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrainingAppCTA } from "@/components/training-app-cta";

export function Sidebar() {
  return (
    <div className="space-y-6">
      <TrainingAppCTA variant="sidebar" />

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
