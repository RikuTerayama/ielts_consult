/** @type {import('postcss-load-config').Config} */
/** Next.js 14.2.0 Windows: ESM URL エラー回避のため CJS を使用 (Netlify/Linux は影響なし) */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

module.exports = config;
