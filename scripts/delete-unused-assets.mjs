#!/usr/bin/env node
/**
 * audit-unused-assets.txt に載っている unused 画像を assets/ から削除する
 *
 * 実行手順:
 *   1. まず dry-run（削除せずログのみ）:
 *      npm run assets:delete-unused
 *   2. 問題なければ実際に削除:
 *      npm run assets:delete-unused:apply
 *
 * 入力: ./audit-unused-assets.txt（1行1ファイル名）
 * 出力: ./delete-unused-assets-report.md
 */

import fs from 'fs';
import path from 'path';

const AUDIT_FILE = path.join(process.cwd(), 'audit-unused-assets.txt');
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const REPORT_FILE = path.join(process.cwd(), 'delete-unused-assets-report.md');

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
]);

function main() {
  const apply = process.argv.includes('--apply');
  const mode = apply ? 'apply' : 'dry-run';

  if (!fs.existsSync(AUDIT_FILE)) {
    console.error(`❌ ファイルが見つかりません: ${AUDIT_FILE}`);
    console.error('   先に pnpm run audit:assets を実行してください。');
    process.exit(1);
  }

  const content = fs.readFileSync(AUDIT_FILE, 'utf-8');
  const lines = content
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const deleted = [];
  const failed = [];
  const skipped = [];

  let totalBytes = 0;

  for (const fileName of lines) {
    // パストラバーサル防止
    if (fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
      skipped.push({ file: fileName, reason: 'invalid name (path traversal risk)' });
      continue;
    }

    // 拡張子チェック
    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      skipped.push({ file: fileName, reason: 'invalid ext' });
      continue;
    }

    const filePath = path.join(ASSETS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      failed.push({ file: fileName, reason: 'not found' });
      continue;
    }

    let size = 0;
    try {
      const stat = fs.statSync(filePath);
      if (!stat.isFile()) {
        failed.push({ file: fileName, reason: 'not a file' });
        continue;
      }
      size = stat.size;
    } catch (err) {
      failed.push({ file: fileName, reason: `stat error: ${(err && err.message) || err}` });
      continue;
    }

    if (apply) {
      try {
        fs.unlinkSync(filePath);
        deleted.push({ file: fileName, size });
        totalBytes += size;
      } catch (err) {
        failed.push({ file: fileName, reason: `unlink error: ${(err && err.message) || err}` });
      }
    } else {
      deleted.push({ file: fileName, size });
      totalBytes += size;
    }
  }

  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  const report = `# delete-unused-assets レポート

## 実行モード

**${mode}**${apply ? '' : '（削除は実行されていません）'}

## サマリー

| 項目 | 数 |
|------|-----|
| 対象件数 | ${lines.length} |
| 削除成功 | ${deleted.length} |
| 失敗 | ${failed.length} |
| スキップ | ${skipped.length} |
| 削減サイズ | ${totalBytes.toLocaleString()} bytes (${totalMB} MB) |

## 削除したファイル一覧

${deleted.length > 0 ? deleted.map((d) => `- \`${d.file}\` (${d.size.toLocaleString()} bytes)`).join('\n') : '（なし）'}

## 失敗・スキップ一覧

${failed.length > 0 ? failed.map((f) => `- \`${f.file}\`: ${f.reason}`).join('\n') : '（なし）'}
${skipped.length > 0 ? '\n' + skipped.map((s) => `- \`${s.file}\`: ${s.reason}`).join('\n') : ''}
`;

  fs.writeFileSync(REPORT_FILE, report, 'utf-8');

  console.log(`✅ 完了 (${mode})`);
  console.log(`   対象: ${lines.length} / 削除: ${deleted.length} / 失敗: ${failed.length} / スキップ: ${skipped.length}`);
  console.log(`   削減サイズ: ${totalBytes.toLocaleString()} bytes (${totalMB} MB)`);
  console.log(`   レポート: ${REPORT_FILE}`);
}

main();
