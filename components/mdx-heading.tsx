import { ReactNode } from "react";

interface HeadingProps {
  children: ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export function MDXHeading({ children, level }: HeadingProps) {
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // 見出しテキストからIDを生成
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const text = typeof children === 'string' ? children : '';
  const id = generateId(text);

  return (
    <HeadingTag id={id} className="scroll-mt-8">
      {children}
    </HeadingTag>
  );
}
