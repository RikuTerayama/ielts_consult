/**
 * assets/ と content/posts/ の参照整合性監査
 *
 * ① unused assets: assets/ に存在するが posts で参照されていない画像
 * ② missing assets: posts で参照されているが assets/ に存在しない画像
 * ③ case mismatch: 参照名と実ファイル名が大文字小文字で一致しない場合
 *
 * 実行: pnpm run audit:assets または npx tsx scripts/audit-assets.ts
 */

import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'assets');
const POSTS_DIR = path.join(process.cwd(), 'content/posts');
const REPORT_DIR = process.cwd();

const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
]);

// <img ... src="..."> の src を抽出（src の値は "/assets/xxx" または "assets/xxx" または "https://...assets/...")
const IMG_SRC_REGEX = /<img[^>]*\ssrc=["']([^"']+)["'][^>]*>/gi;

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    throw new Error(`ディレクトリが存在しません: ${dir}`);
  }
}

function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

/**
 * assets/ 配下の全画像ファイルを再帰的に取得（ファイル名のみ、パスは assets/ からの相対）
 */
function collectAssetFiles(dir: string, baseDir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      results.push(...collectAssetFiles(fullPath, baseDir));
    } else if (entry.isFile() && isImageFile(entry.name)) {
      results.push(relativePath.replace(/\\/g, '/'));
    }
  }

  return results;
}

/**
 * HTML から img src を抽出し、assets 配下の画像参照のみを正規化して返す
 * - /assets/xxx.png, assets/xxx.png を同一として扱う
 * - クエリ文字列を除去
 */
function extractImageRefsFromHtml(html: string): Set<string> {
  const refs = new Set<string>();

  let m: RegExpExecArray | null;
  IMG_SRC_REGEX.lastIndex = 0;
  while ((m = IMG_SRC_REGEX.exec(html)) !== null) {
    let src = m[1].trim();
    if (!src) continue;

    // クエリ文字列を除去
    const qIndex = src.indexOf('?');
    if (qIndex >= 0) src = src.slice(0, qIndex);

    // assets 配下の参照のみ
    if (src.startsWith('/assets/')) {
      refs.add(src.slice(8)); // "/assets/xxx" -> "xxx"
    } else if (src.startsWith('assets/')) {
      refs.add(src.slice(7)); // "assets/xxx" -> "xxx"
    }
    // サブディレクトリがある場合: assets/foo/bar.png -> foo/bar.png
  }

  return refs;
}

/**
 * content/posts 配下の全 .html から参照されている画像を抽出
 */
function collectReferencedImages(): Set<string> {
  const refs = new Set<string>();

  ensureDir(POSTS_DIR);
  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;

    const filePath = path.join(POSTS_DIR, entry.name);
    const html = fs.readFileSync(filePath, 'utf-8');
    const fileRefs = extractImageRefsFromHtml(html);
    for (const r of fileRefs) refs.add(r);
  }

  return refs;
}

/**
 * ファイル名のみを抽出（assets/ 直下ならそのまま、サブディレクトリなら assets/ からの相対パス）
 * 参照は "assets/xxx.png" や "xxx.png" の形式。assets 直下の場合は "xxx.png" 形式で参照される想定
 */
function normalizeRefToAssetPath(ref: string): string {
  if (ref.startsWith('assets/')) return ref.slice(7);
  return ref;
}

function main(): void {
  try {
    ensureDir(ASSETS_DIR);
  } catch (e) {
    console.error(`❌ ${(e as Error).message}`);
    process.exit(1);
  }

  const assetFiles = collectAssetFiles(ASSETS_DIR, ASSETS_DIR);
  const referencedRefs = collectReferencedImages();

  // 参照名を正規化（assets/ プレフィックス除去）
  const refsNormalized = new Set<string>();
  for (const r of referencedRefs) {
    refsNormalized.add(normalizeRefToAssetPath(r));
  }

  const assetSet = new Set(assetFiles);
  const assetLowerMap = new Map<string, string>(); // lower -> original
  for (const a of assetFiles) {
    const lower = a.toLowerCase();
    if (!assetLowerMap.has(lower)) assetLowerMap.set(lower, a);
  }

  const refLowerMap = new Map<string, string>(); // lower -> ref as used
  for (const r of refsNormalized) {
    const lower = r.toLowerCase();
    if (!refLowerMap.has(lower)) refLowerMap.set(lower, r);
  }

  // ① unused: assets にあるが参照されていない
  const unused: string[] = [];
  for (const a of assetFiles) {
    const lower = a.toLowerCase();
    if (!refLowerMap.has(lower)) {
      unused.push(a);
    }
  }
  unused.sort();

  // ② missing: 参照されているが assets にない
  const missing: string[] = [];
  for (const r of refsNormalized) {
    const lower = r.toLowerCase();
    if (!assetLowerMap.has(lower)) {
      missing.push(r);
    }
  }
  missing.sort();

  // ③ case mismatch: 参照名と実ファイル名が大文字小文字で異なる
  const caseMismatches: Array<{ asset: string; ref: string }> = [];
  for (const r of refsNormalized) {
    const lower = r.toLowerCase();
    const asset = assetLowerMap.get(lower);
    if (asset && asset !== r) {
      caseMismatches.push({ asset, ref: r });
    }
  }
  caseMismatches.sort((a, b) => a.asset.localeCompare(b.asset));

  // レポート生成
  const reportMd = `# assets / content/posts 参照整合性監査レポート

## サマリー

| 項目 | 数 |
|------|-----|
| assets 総数 | ${assetFiles.length} |
| posts で参照された画像ユニーク数 | ${refsNormalized.size} |
| ① unused assets（削除候補） | ${unused.length} |
| ② missing assets（不足） | ${missing.length} |
| ③ case mismatch | ${caseMismatches.length} |

## 詳細

### ① unused assets（削除候補）

${unused.length > 0 ? unused.map((f) => `- \`${f}\``).join('\n') : '（なし）'}

### ② missing assets（不足）

${missing.length > 0 ? missing.map((f) => `- \`${f}\``).join('\n') : '（なし）'}

### ③ case mismatch

${caseMismatches.length > 0 ? caseMismatches.map((c) => `- \`${c.asset}\` (assets) vs \`${c.ref}\` (posts)`).join('\n') : '（なし）'}
`;

  const unusedTxt = unused.join('\n') + (unused.length > 0 ? '\n' : '');
  const missingTxt = missing.join('\n') + (missing.length > 0 ? '\n' : '');

  fs.writeFileSync(path.join(REPORT_DIR, 'audit-assets-report.md'), reportMd, 'utf-8');
  fs.writeFileSync(path.join(REPORT_DIR, 'audit-unused-assets.txt'), unusedTxt, 'utf-8');
  fs.writeFileSync(path.join(REPORT_DIR, 'audit-missing-assets.txt'), missingTxt, 'utf-8');

  console.log('✅ 監査完了');
  console.log(`   - audit-assets-report.md`);
  console.log(`   - audit-unused-assets.txt (${unused.length} 件)`);
  console.log(`   - audit-missing-assets.txt (${missing.length} 件)`);
}

main();
