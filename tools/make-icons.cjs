// アプリのアイコン（icon-192.png・icon-512.png）を作る。夜空の地に、環のある惑星と小さな太陽。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）。maskable でも欠けないよう、絵は真ん中の円（直径80%）に収める
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#14203a"/>
      <circle cx="30" cy="34" r="7" fill="#f2b43a"/>
      <circle cx="55" cy="56" r="16" fill="#c8aa6a"/>
      <ellipse cx="55" cy="56" rx="27" ry="7" fill="none" stroke="#f3eee2" stroke-width="3" transform="rotate(-18 55 56)"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
