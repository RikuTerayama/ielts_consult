"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface AmazonProductCardProps {
  title: string;
  imageUrl?: string;
  description?: string;
  asin?: string;
  price?: string;
}

export function AmazonProductCard({
  title,
  imageUrl,
  description,
  asin,
  price,
}: AmazonProductCardProps) {
  const affiliateTag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || "{{affiliate_tag}}";
  const productUrl = asin
    ? `https://www.amazon.co.jp/dp/${asin}/?tag=${affiliateTag}`
    : "#";

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {price && <p className="font-bold text-lg mt-2">{price}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <a href={productUrl} target="_blank" rel="noopener noreferrer">
            Amazonで見る
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

