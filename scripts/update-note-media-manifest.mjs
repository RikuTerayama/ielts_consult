import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "content", "note-media-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

let audioOutputBytes = 0;
let audioFiles = 0;
for (const article of manifest.articles) {
  if (!article.audio?.publicPath) continue;
  const outputPath = path.join(
    repoRoot,
    "public",
    article.audio.publicPath.replace(/^\//, "").replace(/^audio[\\/]/, "audio/")
  );
  const stat = fs.statSync(outputPath);
  article.audio.outputBytes = stat.size;
  audioOutputBytes += stat.size;
  audioFiles += 1;
}

if (audioFiles !== manifest.totals.audioFiles) {
  throw new Error(
    `音声件数が一致しません: manifest=${manifest.totals.audioFiles}, files=${audioFiles}`
  );
}

manifest.totals.audioOutputBytes = audioOutputBytes;
manifest.audioOptimization = {
  format: "AAC in M4A",
  bitrate: 64000,
  channels: 1,
  sampleRate: 44100,
  preload: "none",
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(
  JSON.stringify(
    {
      audioFiles,
      audioSourceBytes: manifest.totals.audioSourceBytes,
      audioOutputBytes,
      reductionPercent: Number(
        (
          (1 - audioOutputBytes / manifest.totals.audioSourceBytes) *
          100
        ).toFixed(1)
      ),
    },
    null,
    2
  )
);
