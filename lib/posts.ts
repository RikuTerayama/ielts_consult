/**
 * content/posts 配下の HTML 記事を読み込み、Post として供給する
 */

import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

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
    const $ = cheerio.load(raw);

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
