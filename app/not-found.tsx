import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-6">ページが見つかりません</h2>
        <p className="text-muted-foreground mb-8">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Button asChild size="lg">
          <Link href="/">トップページに戻る</Link>
        </Button>
      </div>
    </div>
  );
}
