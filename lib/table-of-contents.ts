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
 * Markdown形式（# ## ###）とHTML形式（<h1> <h2> <h3>）の両方に対応
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  
  // Markdown形式の見出しを抽出
  const markdownRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = markdownRegex.exec(content)) !== null) {
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
  
  // HTML形式の見出しを抽出
  const htmlRegex = /<h([1-6])(?:\s+[^>]*)?(?:\s+id="([^"]*)")?[^>]*>(.*?)<\/h[1-6]>/gi;
  
  while ((match = htmlRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const existingId = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').trim(); // HTMLタグを除去
    
    // 既存のIDがある場合はそれを使用、なければテキストから生成
    const id = existingId || text
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

  // 重複を除去（同じテキストの見出しがある場合）
  const uniqueHeadings = headings.filter((heading, index, self) => 
    index === self.findIndex(h => h.text === heading.text)
  );

  return uniqueHeadings;
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
  
  // 各見出しの位置を取得（Markdown形式とHTML形式の両方に対応）
  const headingsWithPosition = headings.map((heading) => {
    // Markdown形式の見出しを検索
    let markdownRegex = new RegExp(`^#{1,6}\\s+${heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gm');
    let match = markdownRegex.exec(content);
    
    // Markdown形式で見つからない場合はHTML形式を検索
    if (!match) {
      const htmlRegex = new RegExp(`<h[1-6][^>]*>${heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h[1-6]>`, 'gi');
      match = htmlRegex.exec(content);
    }
    
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
