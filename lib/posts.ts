/**
 * content/posts 配下の HTML 記事を読み込み、Post として供給する
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import type { CheerioAPI, Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";

// --- アフィリエイトリンクカード化 -----------------------------------------

/** href がカード化対象のアフィリエイトドメインか（amzn.to, amazon.co.jp, amazon.com, www.amazon.*） */
function isAffiliateTargetUrl(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    return (
      host === "amzn.to" ||
      host === "amazon.co.jp" ||
      host === "amazon.com" ||
      u.hostname.toLowerCase() === "www.amazon.co.jp" ||
      u.hostname.toLowerCase() === "www.amazon.com"
    );
  } catch {
    return false;
  }
}

/** p 要素が「URL単体行」（a が1つだけ、a.text が href と同一）か */
function isUrlSingleLine($: CheerioAPI, $p: Cheerio<AnyNode>): boolean {
  const children = $p.children();
  if (children.length !== 1) return false;
  const child = children.eq(0);
  const tagName = (child[0] as { tagName?: string } | undefined)?.tagName?.toLowerCase();
  if (tagName !== "a") return false;
  const href = child.attr("href")?.trim() ?? "";
  const text = child.text().trim();
  return href.length > 0 && text === href;
}

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 表示用の短い URL 文字列（amzn.to/xxx や amazon.co.jp 等） */
function getShortUrlDisplay(href: string): string {
  try {
    const u = new URL(href);
    if (u.hostname === "amzn.to") return `amzn.to${u.pathname}`;
    return u.hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

/** アフィリエイトカードの HTML を生成 */
function renderAffiliateCard(href: string): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  return `<a class="affiliate-card" href="${safeHref}" target="_blank" rel="noopener noreferrer" data-affiliate="amazon"><div class="affiliate-card__inner"><div class="affiliate-card__title">Amazonで商品を見る</div><div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">開く</div></div></a>`;
}

/** contentHtml 内の URL単体行（対象ドメイン）をカード HTML に置換 */
function replaceAffiliateLinksWithCards(contentHtml: string): string {
  if (!contentHtml || typeof contentHtml !== "string") return contentHtml;
  const $ = load(contentHtml);
  $("p.link").each((_, el) => {
    const $p = $(el);
    if (!isUrlSingleLine($, $p)) return;
    const $a = $p.find("a").first();
    const href = $a.attr("href")?.trim() ?? "";
    if (!isAffiliateTargetUrl(href)) return;
    $p.replaceWith(renderAffiliateCard(href));
  });
  return $("body").html() ?? contentHtml;
}

// --- Post 型・パース -----------------------------------------

export interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  hero?: string;
  content: string;
  readingTime: string;
  categoryStep?: string;
  categorySkill?: string;
  order?: number;
}

export interface PostAddition {
  slug: string;
  takeaways?: string[];
  practice?: string;
  commonMistakes?: string[];
  faq?: Array<{ question: string; answer: string }>;
  nextSteps?: Array<{ title: string; description: string; link?: string }>;
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "content/posts");

function getSlugFromFilename(filename: string): string {
  if (!filename.endsWith(".html")) return filename;
  return filename.slice(0, -5);
}

function parseHtmlPost(filePath: string, slug: string): Post | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const $ = load(raw);

    const title =
      $("title").first().text().trim() ||
      $("article h1").first().text().trim() ||
      $("h1").first().text().trim() ||
      slug;

    const description =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";

    let date = "";
    const timeEl = $("time[datetime]").first();
    if (timeEl.length) {
      date = timeEl.attr("datetime") || "";
    }
    if (!date) {
      const metaDate = $('meta[property="article:published_time"]').attr("content");
      if (metaDate) date = metaDate;
    }
    if (!date) {
      const stat = fs.statSync(filePath);
      date = stat.mtime.toISOString();
    }

    let contentHtml = "";
    const article = $("article");
    if (article.length) {
      const contentDiv = article.find(".content");
      if (contentDiv.length) {
        contentHtml = contentDiv.html() || "";
      } else {
        contentHtml = article.html() || "";
      }
    } else {
      contentHtml = $("body").html() || "";
    }

    const firstImg = $("article img, .content img, body img").first();
    const hero = firstImg.attr("src") || undefined;

    contentHtml = replaceAffiliateLinksWithCards(contentHtml);

    const plainText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = plainText.length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 400));
    const readingTime = `${readingMinutes} 分`;

    return {
      slug,
      title,
      date,
      description,
      tags: [],
      content: contentHtml,
      readingTime,
      hero,
    };
  } catch {
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const files = fs.readdirSync(POSTS_DIR);
  const posts: Post[] = [];

  for (const file of files) {
    if (!file.endsWith(".html")) continue;
    const slug = getSlugFromFilename(file);
    const filePath = path.join(POSTS_DIR, file);
    const post = parseHtmlPost(filePath, slug);
    if (post) posts.push(post);
  }

  posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const decodedSlug = decodeURIComponent(slug);
  const filePath = path.join(POSTS_DIR, `${decodedSlug}.html`);

  if (!fs.existsSync(filePath)) return null;
  return parseHtmlPost(filePath, decodedSlug);
}

export async function getPostAddition(_slug: string): Promise<PostAddition | null> {
  return null;
}

export async function getPostsByTag(_tag: string): Promise<Post[]> {
  return [];
}

export async function getAllTags(): Promise<string[]> {
  return [];
}
