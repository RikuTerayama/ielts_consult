export interface Heading {
  level: number;
  text: string;
  id: string;
  element: string;
}

export interface TableOfContentsProps {
  headings: Heading[];
  noteUrl?: string;
  cutoffPoint?: number; // 切り取りポイント（文字数）
  contentLength?: number; // 記事の総文字数
}

/**
 * 記事のMDXコンテンツから見出しを抽出する
 */
export function extractHeadings(content: string): Heading[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');

    headings.push({
      level,
      text,
      id,
      element: `h${level}`,
    });
  }

  return headings;
}

/**
 * 切り取りポイントを基準に目次を分類する
 */
export function categorizeHeadings(
  headings: Heading[],
  content: string,
  cutoffPoint?: number
): {
  visibleHeadings: Heading[];
  hiddenHeadings: Heading[];
  cutoffPosition: number;
} {
  if (!cutoffPoint) {
    return {
      visibleHeadings: headings,
      hiddenHeadings: [],
      cutoffPosition: content.length,
    };
  }

  // 切り取りポイントの位置を特定
  const cutoffPosition = Math.min(cutoffPoint, content.length);
  
  // 各見出しの位置を取得
  const headingsWithPosition = headings.map((heading) => {
    const regex = new RegExp(`^#{1,6}\\s+${heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm');
    const match = regex.exec(content);
    const position = match ? match.index : content.length;
    
    return {
      ...heading,
      position,
    };
  });

  // 切り取りポイントより前の見出しと後の見出しに分類
  const visibleHeadings = headingsWithPosition
    .filter((h) => h.position < cutoffPosition)
    .map(({ position, ...heading }) => heading);

  const hiddenHeadings = headingsWithPosition
    .filter((h) => h.position >= cutoffPosition)
    .map(({ position, ...heading }) => heading);

  return {
    visibleHeadings,
    hiddenHeadings,
    cutoffPosition,
  };
}
