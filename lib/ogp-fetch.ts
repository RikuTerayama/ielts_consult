/**
 * OGP メタ情報を外部URLから取得する（ビルド時のみ使用）
 * SSRF対策・ホワイトリスト・タイムアウト・サイズ上限を実装
 */

import { load } from "cheerio/slim";

/** 許可するホスト（小文字、www なし正規化）。将来拡張しやすい形 */
const ALLOWED_HOSTS = new Set(["note.com", "www.note.com"]);

/** プライベートIPの正規表現 */
const PRIVATE_IP =
  /^(?:10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.0\.0\.0|localhost|::1$)/i;

/** タイムアウト（ミリ秒） */
const TIMEOUT_MS = 5000;

/** レスポンスサイズ上限（バイト） */
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

/** User-Agent */
const USER_AGENT = "Mozilla/5.0 (compatible; ieltsconsult-bot/1.0)";

export type OgpMeta = {
  title?: string;
  description?: string;
  image?: string;
};

/**
 * URL が許可対象かチェック（SSRF対策）
 */
function isUrlAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const hostWithWww = `www.${host}`;
    if (!ALLOWED_HOSTS.has(host) && !ALLOWED_HOSTS.has(hostWithWww)) return false;
    if (PRIVATE_IP.test(u.hostname)) return false;
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * HTML から OGP メタを抽出
 */
function extractOgpFromHtml(html: string): OgpMeta | null {
  try {
    const $ = load(html);
    const getMeta = (name: string): string | undefined => {
      const val =
        $(`meta[property="${name}"]`).attr("content")?.trim() ||
        $(`meta[name="${name}"]`).attr("content")?.trim();
      return val || undefined;
    };

    const title =
      getMeta("og:title") ||
      $("title").first().text().trim() ||
      undefined;
    const description =
      getMeta("og:description") ||
      getMeta("description") ||
      undefined;
    const image = getMeta("og:image") || undefined;

    if (!title && !description && !image) return null;
    return { title, description, image };
  } catch {
    return null;
  }
}

/**
 * 外部 URL から OGP メタを取得する。
 * 失敗時は null を返す（throw しない）。
 */
export async function fetchOgpMeta(url: string): Promise<OgpMeta | null> {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (!isUrlAllowed(trimmed)) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(trimmed, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    const buffer = await res.arrayBuffer();
    const chunk = buffer.slice(0, MAX_BODY_SIZE);
    const text = new TextDecoder("utf-8").decode(chunk);
    return extractOgpFromHtml(text);
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
