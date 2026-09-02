import fs from "node:fs";
import path from "node:path";
import { load } from "cheerio/slim";

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "out");
const postOutDir = path.join(outDir, "posts");
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};
const increment = (record, key) => {
  record[key] = (record[key] ?? 0) + 1;
};

const articleFiles = fs
  .readdirSync(postOutDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({
    slug: entry.name,
    filePath: path.join(postOutDir, entry.name, "index.html"),
  }))
  .filter((entry) => fs.existsSync(entry.filePath));

const desktopDistribution = {};
const mobileDistribution = {};
const inlineDistribution = {};
const amazonBuckets = {
  "0-2": { articles: 0, cap: 4, maxDesktop: 0 },
  "3-7": { articles: 0, cap: 3, maxDesktop: 0 },
  "8+": { articles: 0, cap: 2, maxDesktop: 0 },
};
const articleReports = [];
const amazonUrls = [];
let totalAmazonCards = 0;
let amazonImages = 0;
let amazonFallbacks = 0;
let sidebarAds = 0;
let inlineAds = 0;
let preFooterAds = 0;

for (const { slug, filePath } of articleFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const $ = load(html);
  const amazonCards = $('a.affiliate-card[data-affiliate="amazon"]');
  const a8AffiliateCards = $('a.affiliate-card[data-affiliate="a8"]');
  const slots = $("[data-a8-slot]")
    .toArray()
    .map((element) => $(element).attr("data-a8-slot") || "");
  const sidebarCount = slots.filter((slot) => slot === "article-sidebar").length;
  const inlineCount = slots.filter((slot) => /^article-\d+$/.test(slot)).length;
  const preFooterCount = slots.filter((slot) => slot === "article-pre-footer").length;
  const desktopCount = slots.length;
  const mobileCount = slots.filter((slot) => slot !== "article-sidebar").length;
  const amazonCount = amazonCards.length;
  const a8AffiliateCount = a8AffiliateCards.length;
  const amazonBucket = amazonCount >= 8 ? "8+" : amazonCount >= 3 ? "3-7" : "0-2";
  const amazonCap = amazonBuckets[amazonBucket].cap;
  const densityCap =
    a8AffiliateCount >= 8
      ? 1
      : a8AffiliateCount >= 4
        ? Math.min(2, amazonCap)
        : amazonCap;

  assert(sidebarCount === 1, `${slug}: desktop sidebar広告が${sidebarCount}件`);
  assert(inlineCount <= 2, `${slug}: inline広告が${inlineCount}件`);
  assert(preFooterCount <= 1, `${slug}: pre-footer広告が${preFooterCount}件`);
  assert(desktopCount <= densityCap, `${slug}: desktop広告${desktopCount} > cap${densityCap}`);
  assert(mobileCount <= Math.max(0, densityCap - 1), `${slug}: mobile広告${mobileCount} > cap${densityCap - 1}`);
  assert(
    preFooterCount === 0 || (amazonCount < 8 && a8AffiliateCount < 4),
    `${slug}: 高密度記事にpre-footer広告があります`
  );

  const $article = $("article").first();
  assert($article.hasClass("max-w-[800px]"), `${slug}: article幅800px指定なし`);
  const $layout = $article.parent();
  assert(
    ($layout.attr("class") || "").includes("336px"),
    `${slug}: sidebar幅336px指定なし`
  );
  const $sidebarSlot = $('[data-a8-slot="article-sidebar"]');
  assert(
    $sidebarSlot.parents(".sticky.top-24").length === 1,
    `${slug}: sidebar container sticky指定なし`
  );
  assert(
    $sidebarSlot.parents(".hidden.xl\\:block").length === 1,
    `${slug}: sidebar mobile非表示指定なし`
  );
  if (preFooterCount === 1 && $("#related-heading").length === 1) {
    assert(
      html.indexOf('data-a8-slot="article-pre-footer"') < html.indexOf('id="related-heading"'),
      `${slug}: pre-footer広告が関連記事より後ろです`
    );
  }

  amazonCards.each((_, element) => {
    const $card = $(element);
    amazonUrls.push($card.attr("href") || "");
    const imageCount = $card.find(".affiliate-card__media img").length;
    const fallbackCount = $card.find(".affiliate-card__placeholder").length;
    amazonImages += imageCount;
    amazonFallbacks += fallbackCount;
    assert(imageCount + fallbackCount === 1, `${slug}: Amazon mediaが一意ではありません`);
  });

  totalAmazonCards += amazonCount;
  sidebarAds += sidebarCount;
  inlineAds += inlineCount;
  preFooterAds += preFooterCount;
  increment(desktopDistribution, desktopCount);
  increment(mobileDistribution, mobileCount);
  increment(inlineDistribution, inlineCount);
  amazonBuckets[amazonBucket].articles += 1;
  amazonBuckets[amazonBucket].maxDesktop = Math.max(
    amazonBuckets[amazonBucket].maxDesktop,
    desktopCount
  );
  articleReports.push({
    slug,
    route: `/posts/${encodeURIComponent(slug)}/`,
    images: $("article .prose img").length,
    audioPlayers: $("article .post-audio audio").length,
    amazonCards: amazonCount,
    a8AffiliateCards: a8AffiliateCount,
    desktopAds: desktopCount,
    mobileAds: mobileCount,
    inlineAds: inlineCount,
    preFooterAds: preFooterCount,
  });
}

const homeHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8");
const $home = load(homeHtml);
const homeSlots = $home("[data-a8-slot]")
  .toArray()
  .map((element) => $home(element).attr("data-a8-slot"));
assert(
  ["home-between-sections", "home-sidebar", "home-pre-footer"].every((slot) =>
    homeSlots.includes(slot)
  ),
  `home広告枠不一致: ${homeSlots.join(",")}`
);
assert(
  $home('[data-a8-slot="home-sidebar"]').parents(".hidden.lg\\:block").length === 1,
  "home sidebar広告のmobile非表示指定なし"
);
assert(
  homeHtml.indexOf('data-a8-slot="home-pre-footer"') >
    homeHtml.indexOf('data-a8-slot="home-between-sections"'),
  "home pre-footer広告の順序不正"
);

const placementSource = fs.readFileSync(
  path.join(repoRoot, "lib", "post-ad-slots.ts"),
  "utf8"
);
assert(
  placementSource.includes("? [0.3, 0.65]") && placementSource.includes(": [0.3]"),
  "inline広告の30%/65% targetが維持されていません"
);

const representative = {
  imageRich: [...articleReports].sort((a, b) => b.images - a.images)[0],
  audio: articleReports.find((article) => article.audioPlayers > 0),
  amazonRich: [...articleReports].sort((a, b) => b.amazonCards - a.amazonCards)[0],
  preFooter: articleReports.find((article) => article.preFooterAds > 0),
};

const report = {
  articles: articleReports.length,
  desktopMaxAds: Math.max(...articleReports.map((article) => article.desktopAds)),
  mobileMaxAds: Math.max(...articleReports.map((article) => article.mobileAds)),
  sidebarAds,
  inlineAds,
  preFooterAds,
  desktopDistribution,
  mobileDistribution,
  inlineDistribution,
  amazonBuckets,
  amazonCards: totalAmazonCards,
  amazonUniqueAffiliateUrls: new Set(amazonUrls).size,
  amazonImages,
  amazonFallbacks,
  home: {
    desktopAds: homeSlots.length,
    mobileAds: homeSlots.filter((slot) => slot !== "home-sidebar").length,
    slots: homeSlots,
  },
  representative,
  failures: failures.length,
};

if (failures.length > 0) {
  console.error(JSON.stringify(report, null, 2));
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(JSON.stringify(report, null, 2));
