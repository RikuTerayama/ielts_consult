/**
 * content/posts 配下の HTML 記事を読み込み、Post として供給する
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import type { CheerioAPI, Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";

import affiliateMeta from "@/content/affiliate-meta.json";
import { inferLearningStep, inferSkill } from "@/config/categories";

// --- アフィリエイトメタ（リッチカード用） -----------------------------------------

export type AffiliateMetaItem = {
  title: string;
  subtitle?: string;
  image?: string;
  label?: string;
};

export type AffiliateMetaMap = Record<string, AffiliateMetaItem>;

const AFFILIATE_META = affiliateMeta as AffiliateMetaMap;

const DEFAULT_LABEL = "PR";

/** http/https を吸収して https に統一、末尾スラッシュ除去 */
function normalizeUrl(href: string): string {
  try {
    const u = new URL(href);
    u.protocol = "https:";
    let pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `https://${u.host}${pathname}${u.search}`;
  } catch {
    return href;
  }
}

function getAffiliateMeta(href: string): AffiliateMetaItem | null {
  const key = normalizeUrl(href);
  return AFFILIATE_META[key] ?? null;
}

/** テキストノード用エスケープ（&, <, >, ", '） */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

/** 外部リンクアイコン（インライン SVG） */
const EXTERNAL_LINK_ICON =
  '<span class="affiliate-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>';

/** リッチカード（メタあり）の HTML を生成 */
function renderRichAffiliateCard(href: string, meta: AffiliateMetaItem): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const label = escapeHtml(meta.label ?? DEFAULT_LABEL);
  const title = escapeHtml(meta.title);
  const altText = escapeHtmlAttr(meta.title || "");
  const subtitle = meta.subtitle ? escapeHtml(meta.subtitle) : "";
  const cta = "Amazonで見る";

  const mediaHtml = meta.image
    ? `<img src="${escapeHtmlAttr(meta.image)}" alt="${altText}" width="120" height="160" loading="lazy" decoding="async" class="affiliate-card__img" />`
    : '<div class="affiliate-card__placeholder"><span class="affiliate-card__placeholder-icon" aria-hidden="true">📚</span></div>';

  return `<a class="affiliate-card affiliate-card--rich" href="${safeHref}" target="_blank" rel="noopener noreferrer sponsored" data-affiliate="amazon"><div class="affiliate-card__label">${label}</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div>${subtitle ? `<div class="affiliate-card__subtitle">${subtitle}</div>` : ""}<div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">${cta}${EXTERNAL_LINK_ICON}</div></div></a>`;
}

/** ミニマルカード（メタなし）の HTML を生成 */
function renderMinimalAffiliateCard(href: string): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const label = escapeHtml(DEFAULT_LABEL);
  const title = "Amazonで商品を見る";
  const cta = "開く";

  const mediaHtml =
    '<div class="affiliate-card__placeholder"><span class="affiliate-card__placeholder-icon" aria-hidden="true">📚</span></div>';

  return `<a class="affiliate-card" href="${safeHref}" target="_blank" rel="noopener noreferrer sponsored" data-affiliate="amazon"><div class="affiliate-card__label">${label}</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div><div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">${cta}${EXTERNAL_LINK_ICON}</div></div></a>`;
}

/** アフィリエイトカードの HTML を生成（メタあり: リッチ、なし: ミニマル） */
function renderAffiliateCard(href: string): string {
  const meta = getAffiliateMeta(href);
  if (meta) return renderRichAffiliateCard(href, meta);
  return renderMinimalAffiliateCard(href);
}

/** contentHtml 内の URL単体行（対象ドメイン）をカード HTML に置換 */
function replaceAffiliateLinksWithCards(contentHtml: string): string {
  if (!contentHtml || typeof contentHtml !== "string") return contentHtml;
  // cheerio はフラグメントを読み込むと body を生成しないため、div でラップして確実に取得する
  const wrapped = `<div id="__affiliate-root">${contentHtml}</div>`;
  const $ = load(wrapped);
  $("#__affiliate-root p.link").each((_, el) => {
    const $p = $(el);
    if (!isUrlSingleLine($, $p)) return;
    const $a = $p.find("a").first();
    const href = $a.attr("href")?.trim() ?? "";
    if (!isAffiliateTargetUrl(href)) return;
    $p.replaceWith(renderAffiliateCard(href));
  });
  return $("#__affiliate-root").html() ?? contentHtml;
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

/** public 配下の実ファイル存在を確認し、404 にならない hero src を返す（Node 環境のみ） */
export function resolveHeroSrc(hero: string | undefined): string {
  const fallback = "/og-image.png";
  if (!hero || !hero.startsWith("/")) return fallback;
  const publicPath = path.join(process.cwd(), "public", hero.slice(1));
  return fs.existsSync(publicPath) ? hero : fallback;
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

/** 関連記事を取得（タグ一致 → step/skill 一致 → 新着の順で最大4件） */
export function getRelatedPosts(currentSlug: string, allPosts: Post[], limit = 4): Post[] {
  const others = allPosts.filter((p) => p.slug !== currentSlug);
  if (others.length === 0) return [];

  const current = allPosts.find((p) => p.slug === currentSlug);
  const step = current ? inferLearningStep(current.title, current.tags) : null;
  const skill = current ? inferSkill(current.title, current.tags) : null;

  const byTag = others.filter((p) =>
    current?.tags.some((t) => p.tags.includes(t))
  );
  const byStepOrSkill = others.filter((p) => {
    const pStep = inferLearningStep(p.title, p.tags);
    const pSkill = inferSkill(p.title, p.tags);
    return (step && pStep === step) || (skill && pSkill === skill);
  });
  const byDate = others;

  const seen = new Set<string>();
  const result: Post[] = [];
  for (const post of [...byTag, ...byStepOrSkill, ...byDate]) {
    if (seen.has(post.slug)) continue;
    seen.add(post.slug);
    result.push(post);
    if (result.length >= limit) break;
  }
  return result;
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
