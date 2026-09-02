/**
 * Amazon Creators API またはユーザー所有素材から取得した正規の商品情報だけを登録する。
 * Amazon商品ページをスクレイピングした画像URLは登録しない。
 */
export type AmazonProductOverride = {
  title?: string;
  subtitle?: string;
  image?: string;
};

export const AMAZON_PRODUCT_OVERRIDES: Readonly<
  Record<string, AmazonProductOverride>
> = {};
