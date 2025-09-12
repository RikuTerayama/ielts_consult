import fs from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = 'src/content/blog';

async function ensureDir(p){ await fs.mkdir(p, { recursive: true }); }

async function hasMarkdown(dir){
  try {
    const files = await fs.readdir(dir);
    return files.some(f => f.endsWith('.md') || f.endsWith('.mdx'));
  } catch {
    return false;
  }
}

async function main(){
  const has = await hasMarkdown(BLOG_DIR);
  if (has) {
    console.log('[ensure-content] blog markdowns found. skip placeholder.');
    return;
  }
  console.warn('[ensure-content] no markdown found in src/content/blog. creating a temporary placeholder post for build.');

  await ensureDir(BLOG_DIR);
  const now = new Date().toISOString().slice(0,10);
  const md = `---
title: "ようこそ（暫定）"
description: "まだ変換済み記事がコミットされていません。ローカルで npm run wxr:convert を実行し、生成物をコミットしてください。"
pubDate: "${now}"
updatedDate: "${now}"
tags: ["setup"]
category: "setup"
draft: false
---

本番表示用の一時記事です。  
ローカルで **npm run wxr:convert** を実行し、生成された **src/content/blog** と **public/images** をコミット＆プッシュすると、ここが実記事に置き換わります。
`;
  await fs.writeFile(path.join(BLOG_DIR, 'welcome-temp.md'), md, 'utf8');
}

main().catch(e => { console.error(e); process.exit(0); });
