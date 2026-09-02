/**
 * content/posts 配下の HTML 記事を読み込み、Post として供給する
 */

import fs from "fs";
import path from "path";
import { load } from "cheerio/slim";
import type { CheerioAPI, Cheerio } from "cheerio/slim";
import type { AnyNode } from "domhandler";

import affiliateMeta from "@/content/affiliate-meta.json";
import externalLinkMeta from "@/content/external-link-meta.json";
import {
  AMAZON_PRODUCT_OVERRIDES,
  type AmazonProductOverride,
} from "@/config/amazon-product-overrides";
import { inferLearningStep, inferSkill } from "@/config/categories";
import { extractTags } from "@/lib/tagging";

// --- アフィリエイトメタ（リッチカード用） -----------------------------------------

export type AffiliateMetaItem = {
  title: string;
  subtitle?: string;
  image?: string;
  label?: string;
};

export type AffiliateMetaMap = Record<string, AffiliateMetaItem>;

const AFFILIATE_META = affiliateMeta as AffiliateMetaMap;

export type ExternalLinkMetaItem = {
  title?: string;
  description?: string;
  image?: string;
};

export type ExternalLinkMetaMap = Record<string, ExternalLinkMetaItem>;

const EXTERNAL_LINK_META = externalLinkMeta as ExternalLinkMetaMap;

type AffiliateContext = {
  title?: string;
  subtitle?: string;
};

/** http/https を吸収して https に統一、末尾スラッシュ除去 */
function normalizeUrl(href: string): string {
  try {
    const u = new URL(href);
    u.protocol = "https:";
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `https://${u.host}${pathname}${u.search}`;
  } catch {
    return href;
  }
}

/** クエリ文字列を除いた正規化URL（フォールバック参照用） */
function normalizeUrlWithoutQuery(href: string): string {
  try {
    const u = new URL(href);
    u.protocol = "https:";
    u.search = "";
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    return `https://${u.host}${pathname}`;
  } catch {
    return href;
  }
}

function getAffiliateMeta(href: string): AffiliateMetaItem | null {
  const key = normalizeUrl(href);
  const keyNoQuery = normalizeUrlWithoutQuery(href);
  const meta = AFFILIATE_META[key] ?? AFFILIATE_META[keyNoQuery] ?? null;
  const override: AmazonProductOverride | null =
    AMAZON_PRODUCT_OVERRIDES[key] ??
    AMAZON_PRODUCT_OVERRIDES[keyNoQuery] ??
    null;
  if (!override) return meta;

  return {
    title: override.title?.trim() || meta?.title || "",
    subtitle: override.subtitle?.trim() || meta?.subtitle,
    image: override.image?.trim() || meta?.image,
    label: meta?.label,
  };
}

function getExternalLinkMeta(href: string): ExternalLinkMetaItem | null {
  const key = normalizeUrl(href);
  let meta = EXTERNAL_LINK_META[key] ?? null;
  if (!meta) {
    const keyNoQuery = normalizeUrlWithoutQuery(href);
    meta = EXTERNAL_LINK_META[keyNoQuery] ?? null;
  }
  return meta;
}

/** カード化対象URLの種別。Amazon は affiliate-meta、note は external-link-meta を参照 */
function getUrlKind(href: string): "amazon" | "note" | "a8" | null {
  if (!href || typeof href !== "string") return null;
  try {
    const u = new URL(href);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    if (
      host === "amzn.to" ||
      host === "amazon.co.jp" ||
      host === "amazon.com" ||
      u.hostname.toLowerCase() === "www.amazon.co.jp" ||
      u.hostname.toLowerCase() === "www.amazon.com"
    )
      return "amazon";
    if (host === "note.com" || u.hostname.toLowerCase() === "www.note.com")
      return "note";
    if (host === "px.a8.net") return "a8";
    return null;
  } catch {
    return null;
  }
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

/** 表示用の短い URL 文字列（amzn.to/xxx、note.com、px.a8.net 等） */
function getShortUrlDisplay(href: string): string {
  try {
    const u = new URL(href);
    if (u.hostname === "amzn.to") return `amzn.to${u.pathname}`;
    const host = u.hostname.replace(/^www\./, "");
    if (host === "note.com" && u.pathname !== "/") return `note.com${u.pathname}`;
    if (host === "px.a8.net") return "px.a8.net";
    return host;
  } catch {
    return href;
  }
}

/** 外部リンクアイコン（インライン SVG） */
const EXTERNAL_LINK_ICON =
  '<span class="affiliate-card__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></span>';

function truncateText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1)}…`
    : normalized;
}

/** 本文直前の見出し・説明から、取得できる範囲で商品文脈を補う */
function getAffiliateContext(
  $: CheerioAPI,
  $p: Cheerio<AnyNode>
): AffiliateContext {
  let heading = "";
  let description = "";

  for (const element of $p.prevAll("h2, h3, h4, p").slice(0, 8).toArray()) {
    const $element = $(element);
    const tagName = (element as { tagName?: string }).tagName?.toLowerCase();
    const text = $element.text().replace(/\s+/g, " ").trim();
    if (!text) continue;
    if (!heading && tagName && /^h[2-4]$/.test(tagName)) heading = text;
    if (
      !description &&
      tagName === "p" &&
      !$element.hasClass("link") &&
      text.length >= 12
    ) {
      description = text;
    }
    if (heading && description) break;
  }

  const title = heading || (description ? truncateText(description, 54) : "");
  return {
    ...(title && { title }),
    ...(description && description !== title
      ? { subtitle: truncateText(description, 100) }
      : {}),
  };
}

/** Amazonカードの HTML を生成。商品名がない場合も本文文脈を保つ。 */
function renderRichAffiliateCard(
  href: string,
  meta: AffiliateMetaItem | null,
  context: AffiliateContext
): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const label = "PR・Amazonアソシエイト";
  const rawTitle = meta?.title?.trim() || context.title || "記事で紹介しているAmazon商品";
  const rawSubtitle =
    meta?.subtitle?.trim() ||
    context.subtitle ||
    "選び方や活用方法は本文で紹介しています。";
  const title = escapeHtml(rawTitle);
  const altText = escapeHtmlAttr(rawTitle);
  const subtitle = escapeHtml(rawSubtitle);
  const cta = "Amazon.co.jpで商品を見る";

  const configuredImage = meta?.image?.trim();
  const imgSrc =
    configuredImage && !configuredImage.endsWith("/placeholder.svg")
      ? configuredImage
      : "";
  const mediaHtml = imgSrc
    ? `<img src="${escapeHtmlAttr(imgSrc)}" alt="${altText}" width="200" height="200" loading="lazy" decoding="async" class="affiliate-card__img" />`
    : '<div class="affiliate-card__placeholder" aria-hidden="true"><span>Amazon</span></div>';

  return `<a class="affiliate-card affiliate-card--rich affiliate-card--amazon" href="${safeHref}" target="_blank" rel="noopener noreferrer nofollow sponsored" data-affiliate="amazon"><div class="affiliate-card__label">${label}</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div><div class="affiliate-card__subtitle">${subtitle}</div><div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">${cta}${EXTERNAL_LINK_ICON}</div></div></a>`;
}

function renderAffiliateCard(href: string, context: AffiliateContext): string {
  return renderRichAffiliateCard(href, getAffiliateMeta(href), context);
}

/** Note 用リッチカード（メタあり）の HTML を生成 */
function renderRichExternalLinkCard(href: string, meta: ExternalLinkMetaItem): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const label = "Note";
  const title = escapeHtml(meta.title || "Noteで見る");
  const altText = escapeHtmlAttr(meta.title || "Note");
  const description = meta.description ? escapeHtml(meta.description) : "";
  const cta = "開く";

  const imgSrc = meta.image && meta.image.trim();
  const mediaHtml = imgSrc
    ? `<img src="${escapeHtmlAttr(imgSrc)}" alt="${altText}" width="120" height="160" loading="lazy" decoding="async" class="affiliate-card__img" />`
    : '<div class="affiliate-card__placeholder"><span class="affiliate-card__placeholder-icon" aria-hidden="true">📝</span></div>';

  return `<a class="affiliate-card affiliate-card--rich affiliate-card--external" href="${safeHref}" target="_blank" rel="noopener noreferrer" data-link-type="note"><div class="affiliate-card__label">${label}</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div>${description ? `<div class="affiliate-card__subtitle">${description}</div>` : ""}<div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">${cta}${EXTERNAL_LINK_ICON}</div></div></a>`;
}

/** Note 用ミニマルカード（メタなし）の HTML を生成 */
function renderMinimalExternalLinkCard(href: string): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const label = "Note";
  const title = "Noteで見る";
  const cta = "開く";

  const mediaHtml =
    '<div class="affiliate-card__placeholder"><span class="affiliate-card__placeholder-icon" aria-hidden="true">📝</span></div>';

  return `<a class="affiliate-card affiliate-card--minimal affiliate-card--external" href="${safeHref}" target="_blank" rel="noopener noreferrer" data-link-type="note"><div class="affiliate-card__label">${label}</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div><div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">${cta}${EXTERNAL_LINK_ICON}</div></div></a>`;
}

/** 外部リンク（Note）カードの HTML を生成（メタあり: リッチ、なし: ミニマル） */
function renderExternalLinkCard(href: string): string {
  const meta = getExternalLinkMeta(href);
  if (meta && meta.title && meta.title.trim()) return renderRichExternalLinkCard(href, meta);
  return renderMinimalExternalLinkCard(href);
}

function getSingleTextLink(
  $: CheerioAPI,
  $element: Cheerio<AnyNode>,
  href: string
): string {
  if (!$element.length || $element[0]?.type !== "tag") return "";
  const links = $element.find("a[href]");
  if (links.length !== 1) return "";
  const $link = links.first();
  if (($link.attr("href")?.trim() ?? "") !== href) return "";
  const text = $link.text().replace(/\s+/g, " ").trim();
  return text && text !== href ? text : "";
}

function getA8Context(
  $: CheerioAPI,
  $p: Cheerio<AnyNode>,
  postTitle: string,
  linkedText = ""
): AffiliateContext {
  const baseContext = getAffiliateContext($, $p);
  const genericHeading = /^(?:まとめ|結論|向いている人|向いていない人|メリット|デメリット|特徴|料金|使い方|おすすめの人|公式情報)$/i;
  const contextualHeading = $p
    .prevAll("h2, h3, h4")
    .toArray()
    .map((element) => $(element).text().replace(/\s+/g, " ").trim())
    .find((text) => text && !genericHeading.test(text));
  const ownText = $p
    .clone()
    .find("a")
    .remove()
    .end()
    .text()
    .replace(/\s+/g, " ")
    .trim();

  return {
    title: truncateText(
      linkedText || contextualHeading || postTitle || "おすすめサービス",
      64
    ),
    subtitle: truncateText(
      ownText ||
        baseContext.subtitle ||
        "本文で紹介しているサービスの詳細を公式サイトで確認できます。",
      110
    ),
  };
}

function renderA8AffiliateCard(href: string, context: AffiliateContext): string {
  const safeHref = escapeHtmlAttr(href);
  const shortUrl = escapeHtmlAttr(getShortUrlDisplay(href));
  const title = escapeHtml(context.title || "おすすめサービス");
  const subtitle = escapeHtml(
    context.subtitle ||
      "本文で紹介しているサービスの詳細を公式サイトで確認できます。"
  );
  const mediaHtml =
    '<div class="affiliate-card__placeholder" aria-hidden="true"><span>PR</span></div>';

  return `<a class="affiliate-card affiliate-card--rich affiliate-card--a8" href="${safeHref}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-affiliate="a8"><div class="affiliate-card__label">PR</div><div class="affiliate-card__media">${mediaHtml}</div><div class="affiliate-card__body"><div class="affiliate-card__title">${title}</div><div class="affiliate-card__subtitle">${subtitle}</div><div class="affiliate-card__url">${shortUrl}</div><div class="affiliate-card__cta">公式サイトを見る${EXTERNAL_LINK_ICON}</div></div></a>`;
}

function replaceBareA8LinksWithCards($: CheerioAPI, postTitle: string): void {
  const rootSelector = "#__affiliate-root";
  const bareAnchors = $(`${rootSelector} a[href]`)
    .toArray()
    .filter((element) => {
      const $a = $(element);
      const href = $a.attr("href")?.trim() ?? "";
      return getUrlKind(href) === "a8" && $a.text().trim() === href;
    });

  for (const element of bareAnchors) {
    const $a = $(element);
    if (!$a.parent().length) continue;
    const href = $a.attr("href")?.trim() ?? "";
    const $p = $a.closest("p");
    if (!$p.length || $p.find("a[href]").length !== 1) continue;

    const $previous = $p.prev();
    const $next = $p.next();
    const previousText = getSingleTextLink($, $previous, href);
    const nextText = getSingleTextLink($, $next, href);
    const linkedText = previousText || nextText;
    const $contextElement = previousText ? $previous : $p;
    const context = getA8Context($, $contextElement, postTitle, linkedText);
    const card = renderA8AffiliateCard(href, context);

    if (previousText) {
      $previous.replaceWith(card);
      $p.remove();
    } else if (nextText) {
      $p.replaceWith(card);
      $next.remove();
    } else {
      $p.replaceWith(card);
    }
  }
}

function replaceWeakA8TextLinksWithCards(
  $: CheerioAPI,
  postTitle: string
): void {
  const weakCtaPattern = /(?:こちら|無料|登録|相談|見る|確認|詳細|試す|申し込)/;
  const links = $("#__affiliate-root a[href]").toArray();

  for (const element of links) {
    const $a = $(element);
    if ($a.closest("[data-affiliate]").length) continue;
    const href = $a.attr("href")?.trim() ?? "";
    const linkedText = $a.text().replace(/\s+/g, " ").trim();
    if (getUrlKind(href) !== "a8" || !weakCtaPattern.test(linkedText)) continue;

    const $p = $a.closest("p");
    if (!$p.length || $p.find("a[href]").length !== 1) continue;
    const context = getA8Context($, $p, postTitle, linkedText);
    $p.replaceWith(renderA8AffiliateCard(href, context));
  }
}

/** contentHtml 内の URL単体行（対象ドメイン）をカード HTML に置換 */
function replaceAffiliateLinksWithCards(
  contentHtml: string,
  postTitle: string
): string {
  if (!contentHtml || typeof contentHtml !== "string") return contentHtml;
  // cheerio はフラグメントを読み込むと body を生成しないため、div でラップして確実に取得する
  const wrapped = `<div id="__affiliate-root">${contentHtml}</div>`;
  const $ = load(wrapped);
  replaceBareA8LinksWithCards($, postTitle);
  replaceWeakA8TextLinksWithCards($, postTitle);
  $("#__affiliate-root p.link").each((_, el) => {
    const $p = $(el);
    if (!isUrlSingleLine($, $p)) return;
    const $a = $p.find("a").first();
    const href = $a.attr("href")?.trim() ?? "";
    const kind = getUrlKind(href);
    if (!kind) return;
    if (kind === "amazon") {
      $p.replaceWith(renderAffiliateCard(href, getAffiliateContext($, $p)));
    } else if (kind === "note") {
      $p.replaceWith(renderExternalLinkCard(href));
    }
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
  heroWidth?: number;
  heroHeight?: number;
  content: string;
  readingTime: string;
  categoryStep?: string;
  categorySkill?: string;
  order?: number;
  audioSrc?: string;
  noteGuid?: string;
}

/** public 配下の実ファイル存在を確認し、404 にならない hero src を返す（Node 環境のみ） */
export function resolveHeroSrc(hero: string | undefined): string {
  const fallback = "/og-image.png";
  if (!hero || !hero.startsWith("/")) return fallback;
  const publicPath = path.join(process.cwd(), "public", hero.slice(1));
  return fs.existsSync(publicPath) ? hero : fallback;
}

const AUDIO_POSTS_DIR = path.join(process.cwd(), "public", "audio", "posts");

function normalizeTitleLikeFileName(input: string): string {
  return input
    .replace(/\u3000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** タイトルから対応する音声ファイルを探し、存在する場合は src を返す（ビルド時・Node のみ） */
function resolveAudioSrcForPost(
  title: string,
  noteGuid?: string
): string | undefined {
  if (!title && !noteGuid) return undefined;
  try {
    if (!fs.existsSync(AUDIO_POSTS_DIR)) return undefined;
    const normalizedTitle = normalizeTitleLikeFileName(title);

    const files = fs.readdirSync(AUDIO_POSTS_DIR);
    if (noteGuid) {
      const guidFile = files.find((file) => {
        const extension = path.extname(file).toLowerCase();
        return [".m4a", ".mp3", ".wav", ".aac"].includes(extension) &&
          file.slice(0, -extension.length) === noteGuid;
      });
      if (guidFile) return `/audio/posts/${encodeURIComponent(guidFile)}`;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (![".m4a", ".mp3", ".wav", ".aac"].includes(ext)) continue;

      const base = file.slice(0, file.length - ext.length);
      const normalizedBase = normalizeTitleLikeFileName(base);

      if (normalizedBase === normalizedTitle) {
        return `/audio/posts/${encodeURIComponent(file)}`;
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
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
    const heroWidth = Number.parseInt(firstImg.attr("width") || "", 10) || undefined;
    const heroHeight = Number.parseInt(firstImg.attr("height") || "", 10) || undefined;
    const noteGuid = raw.match(/note\.com\/ielts_consult\/n\/([A-Za-z0-9]+)/)?.[1];

    contentHtml = replaceAffiliateLinksWithCards(contentHtml, title);

    const audioSrc = resolveAudioSrcForPost(title, noteGuid);
    if (audioSrc) {
      const audioBlock = `<div class="post-audio" role="region" aria-label="音声"><p class="post-audio__label">音声解説はこちら</p><p class="post-audio__hint">通勤中や作業中にも聴けます</p><audio controls preload="none" src="${audioSrc}"></audio></div>`;
      const wrapped = `<div id="__audio-root">${contentHtml}</div>`;
      const $aud = load(wrapped);
      const firstFigure = $aud("#__audio-root figure").first();
      if (firstFigure.length) {
        firstFigure.after(audioBlock);
      } else {
        $aud("#__audio-root").prepend(audioBlock);
      }
      contentHtml = $aud("#__audio-root").html() ?? contentHtml;
    }

    const plainText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = plainText.length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 400));
    const readingTime = `${readingMinutes} 分`;

    const tags = extractTags(title, plainText);

    return {
      slug,
      title,
      date,
      description,
      tags,
      content: contentHtml,
      readingTime,
      hero,
      ...(heroWidth && { heroWidth }),
      ...(heroHeight && { heroHeight }),
      ...(audioSrc && { audioSrc }),
      ...(noteGuid && { noteGuid }),
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

export type TagWithCount = { tag: string; count: number };

export async function getPostsByTag(tagParam: string): Promise<Post[]> {
  const tag = decodeURIComponent(tagParam);
  const posts = await getAllPosts();
  return posts.filter((p) => p.tags.includes(tag));
}

export async function getAllTags(posts?: Post[]): Promise<TagWithCount[]> {
  const targetPosts = posts ?? (await getAllPosts());
  const countMap = new Map<string, number>();

  for (const post of targetPosts) {
    for (const tag of post.tags) {
      countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
    }
  }

  return Array.from(countMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.tag.localeCompare(b.tag);
    });
}
