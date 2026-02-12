/**
 * WordPress Export 形式の item XML から、公開用 HTML 記事ファイルを生成する
 *
 * 実行方法:
 *   1. ファイルから読み込む場合:
 *      echo '<item>...</item>' > item.xml
 *      pnpm run convert:single item.xml
 *
 *   2. 標準入力から読み込む場合:
 *      pnpm run convert:single < item.xml
 *
 *   3. 完全版の item XML を使う場合:
 *      貼り付けた <item>...</item> 全文を UTF-8 で scripts/item-ielts8.xml 等に保存し、
 *      pnpm run convert:single scripts/item-ielts8.xml で実行
 *
 *   4. スクリプト内でテスト用に item を渡す場合:
 *      convertItemToHtml(itemXmlString)
 *
 * 出力: content/posts/<slug>.html
 */

import fs from 'fs-extra';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import * as cheerio from 'cheerio';

const CONTENT_POSTS_DIR = path.join(process.cwd(), 'content/posts');

const ALLOWED_TAGS = new Set([
  'p',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'br',
  'hr',
  'figure',
  'img',
  'figcaption',
  'a',
]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_REGEX.test(value);
}

function extractText(html: string): string {
  const $ = cheerio.load(html, { decodeEntities: false });
  return $.text().trim();
}

function sanitizeContent(html: string, articleTitle: string): string {
  // b を strong に統一（許可タグに strong があるため）
  let normalized = html.replace(/<b\b/gi, '<strong').replace(/<\/b>/gi, '</strong>');
  const $ = cheerio.load(normalized, { decodeEntities: false });

  // 許可タグ以外はテキストのみ残してタグを剥がす（内側から処理するため逆順）
  // cheerio が html/head/body でラップするため、これらはスキップ（body の中身を返すため）
  const SKIP_TAGS = new Set(['html', 'head', 'body']);
  const elements = $('*').toArray();
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const tagName = (el as cheerio.Element).tagName?.toLowerCase();
    if (
      tagName &&
      !ALLOWED_TAGS.has(tagName) &&
      !SKIP_TAGS.has(tagName)
    ) {
      const $el = $(el);
      const text = $el.text();
      $el.replaceWith(text);
    }
  }

  // name, id 属性を削除（UUID っぽいものは削除、有用な id は残す）
  $('[name], [id]').each((_, el) => {
    const $el = $(el);
    const name = $el.attr('name');
    const id = $el.attr('id');
    if (name) $el.removeAttr('name');
    if (id && isUuidLike(id)) $el.removeAttr('id');
  });

  // img の整形
  $('img').each((_, el) => {
    const $el = $(el);
    $el.attr('loading', 'lazy');
    $el.attr('decoding', 'async');
    const alt = $el.attr('alt');
    if (!alt || alt.trim() === '') {
      $el.attr('alt', articleTitle);
    }
    // 余計な属性を除去
    $el.removeAttr('contenteditable');
    $el.removeAttr('draggable');
    // width, height は見た目に影響するので残す
  });

  // 空の figcaption を削除
  $('figcaption').each((_, el) => {
    const $el = $(el);
    if (!extractText($el.html() || '').trim()) {
      $el.remove();
    }
  });

  // a タグ: target を削除、必要なら rel="nofollow noopener"
  $('a').each((_, el) => {
    const $el = $(el);
    $el.removeAttr('target');
    // 外部リンクは rel="noopener noreferrer" を付与（安全のため）
    const href = $el.attr('href') || '';
    if (href.startsWith('http://') || href.startsWith('https://')) {
      const existingRel = $el.attr('rel') || '';
      const relSet = new Set(existingRel.split(/\s+/).filter(Boolean));
      relSet.add('noopener');
      relSet.add('noreferrer');
      $el.attr('rel', Array.from(relSet).join(' '));
    }
  });

  // 連続する hr を 1 つに畳む
  let prevWasHr = false;
  $('body')
    .children()
    .each((_, el) => {
      const tagName = (el as cheerio.Element).tagName?.toLowerCase();
      const isHr = tagName === 'hr';
      if (isHr && prevWasHr) {
        $(el).remove();
      }
      prevWasHr = isHr;
    });

  // p の中にリンク URL だけがある場合は class="link" を付ける
  $('p').each((_, el) => {
    const $el = $(el);
    const html = $el.html() || '';
    const $inner = cheerio.load(html, { decodeEntities: false });
    const children = $inner('body').children();
    if (children.length === 1) {
      const child = children.eq(0);
      const childTag = (child[0] as cheerio.Element)?.tagName?.toLowerCase();
      if (childTag === 'a') {
        const href = child.attr('href') || '';
        const text = extractText(child.html() || '').trim();
        // href と表示テキストが同じ（URL だけのリンク）の場合
        if (href && text === href) {
          $el.addClass('link');
        }
      }
    }
  });

  return $('body').html() || '';
}

function toIsoDate(dateStr: string): string {
  if (!dateStr) return '';
  // "2025-06-18 11:10:36" -> "2025-06-18T11:10:36+09:00"
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (m) {
    return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}+09:00`;
  }
  return dateStr;
}

function getFirstImageSrc(html: string): string | null {
  const $ = cheerio.load(html, { decodeEntities: false });
  const img = $('img').first();
  return img.attr('src') || null;
}

function truncateForDescription(text: string, maxLen: number = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return normalized;
  return normalized.slice(0, maxLen) + '…';
}

export interface ParsedItem {
  title: string;
  link: string;
  guid: string;
  contentEncoded: string;
  postName: string;
  postDate: string;
}

function extractTagContent(xml: string, tagName: string): string {
  const regex = new RegExp(
    `<${tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>([\\s\\S]*?)</${tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}>`,
    'i'
  );
  const m = xml.match(regex);
  return m ? m[1].trim() : '';
}

function extractGuid(xml: string): string {
  const m = xml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
  if (!m) return '';
  const inner = m[1].trim();
  // <guid isPermaLink="false">n5e73e4f2ba08</guid> -> text only
  return inner;
}

export function parseItemXml(xmlString: string): ParsedItem | null {
  let xml = xmlString.trim();
  if (xml.startsWith('<?xml')) {
    const end = xml.indexOf('?>');
    if (end >= 0) xml = xml.slice(end + 2).trim();
  }
  if (!xml.includes('<item') && !xml.includes('<title>')) return null;

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // content:encoded 内の HTML をパースしない（生文字列で取得するため正規表現で抽出）
    ignoreDeclaration: true,
  });

  // content:encoded は正規表現で抽出（内部 HTML がパースされないように）
  const contentEncoded = extractTagContent(xml, 'content:encoded');
  const postName = extractTagContent(xml, 'wp:post_name');
  const postDate = extractTagContent(xml, 'wp:post_date');

  // その他は fast-xml-parser で取得（ content:encoded を除いた簡易 XML で解析）
  const wrapped = xml.startsWith('<item') ? `<root>${xml}</root>` : xml;
  let parsed: Record<string, unknown>;
  try {
    parsed = parser.parse(wrapped) as Record<string, unknown>;
  } catch {
    return null;
  }

  const item = (parsed.root as Record<string, unknown>)?.item ?? parsed.item;
  if (!item || typeof item !== 'object') return null;

  const getStr = (obj: unknown, ...keys: string[]): string => {
    if (typeof obj !== 'object' || obj === null) return '';
    const o = obj as Record<string, unknown>;
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string') return v;
      if (v && typeof v === 'object' && '#text' in (v as object)) {
        return String((v as Record<string, unknown>)['#text'] ?? '');
      }
    }
    return '';
  };

  const guid = extractGuid(xml) || getStr(item, 'guid');

  return {
    title: getStr(item, 'title') || '',
    link: getStr(item, 'link') || '',
    guid,
    contentEncoded,
    postName,
    postDate,
  };
}

export function convertItemToHtml(
  xmlString: string,
  outDir: string = CONTENT_POSTS_DIR
): { slug: string; filePath: string } | null {
  const parsed = parseItemXml(xmlString);
  if (!parsed) return null;

  const { title, link, contentEncoded, postName, guid, postDate } = parsed;

  let slug = '';
  if (postName) {
    try {
      // URL の + はスペースを表す
      slug = decodeURIComponent(postName.replace(/\+/g, '%20'));
    } catch {
      slug = postName;
    }
  }
  if (!slug) slug = guid || 'untitled';

  // ファイル名用にサニタイズ（スラッシュ等进行を除去）
  const safeSlug = slug.replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '-');

  const sanitizedBody = sanitizeContent(contentEncoded, title);
  const firstImgSrc = getFirstImageSrc(contentEncoded);
  const plainText = extractText(contentEncoded);
  const description = truncateForDescription(plainText);
  const isoDate = toIsoDate(postDate);

  const displayDate = postDate ? postDate.replace(/\s+\d{2}:\d{2}:\d{2}$/, '') : '';

  const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(link)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(link)}">
  <meta property="article:published_time" content="${escapeHtml(isoDate)}">
${firstImgSrc ? `  <meta property="og:image" content="${escapeHtml(resolveOgImage(link, firstImgSrc))}">` : ''}
</head>
<body>
  <main>
    <article>
      <header>
        <h1>${escapeHtml(title)}</h1>
        ${displayDate ? `<time datetime="${escapeHtml(isoDate)}">${escapeHtml(displayDate)}</time>` : ''}
      </header>
      <div class="content">
${indentHtml(sanitizedBody)}
      </div>
    </article>
  </main>
</body>
</html>
`;

  const filePath = path.join(outDir, `${safeSlug}.html`);
  fs.ensureDirSync(outDir);
  fs.writeFileSync(filePath, html, 'utf-8');

  return { slug: safeSlug, filePath };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveOgImage(link: string, src: string): string {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  if (src.startsWith('/')) {
    try {
      const u = new URL(link);
      return `${u.origin}${src}`;
    } catch {
      return src;
    }
  }
  return src;
}

function indentHtml(html: string): string {
  return html
    .split('\n')
    .map((line) => '        ' + line)
    .join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  let xmlString: string;

  if (args.length > 0) {
    const filePath = path.resolve(process.cwd(), args[0]);
    if (!(await fs.pathExists(filePath))) {
      console.error(`ファイルが見つかりません: ${filePath}`);
      process.exit(1);
    }
    xmlString = await fs.readFile(filePath, 'utf-8');
  } else {
    // 標準入力から読み込み
    xmlString = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = [];
      process.stdin.on('data', (chunk) => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      process.stdin.on('error', reject);
    });
  }

  const result = convertItemToHtml(xmlString);
  if (!result) {
    console.error('item XML の解析に失敗しました。');
    process.exit(1);
  }

  console.log(`✅ 生成しました: ${result.filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
