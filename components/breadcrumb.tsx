import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  // BreadcrumbListの構造化データを生成
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://ieltsconsult.netlify.app${item.href}`,
    })),
  };

  return (
    <>
      {/* JSON-LD構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* パンくずナビゲーション */}
      <nav aria-label="breadcrumb" className={className}>
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          <li>
            <Link 
              href="/" 
              className="hover:text-primary transition-colors flex items-center"
              aria-label="ホーム"
            >
              <Home className="h-4 w-4" />
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-2" />
              {index === items.length - 1 ? (
                <span aria-current="page" className="text-foreground font-medium">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href} 
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
