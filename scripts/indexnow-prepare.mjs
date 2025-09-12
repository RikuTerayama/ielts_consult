import fs from 'node:fs/promises';
import path from 'node:path';

const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.log('INDEXNOW_KEY not set, skip prepare.');
  process.exit(0);
}
// キーファイルを public 配下に作成（/YOUR_KEY.txt でアクセス可能）
const p = path.join('public', `${key}.txt`);
await fs.writeFile(p, key, 'utf8');
console.log('IndexNow key file written:', p);
