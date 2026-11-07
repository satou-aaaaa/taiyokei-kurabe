// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、太陽と8つの惑星の並び（大きさは目安）だけ。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
const G = require("../gen.js");
const COL = ["#8a7f72", "#c9a24a", "#2f6fa8", "#b8402a", "#b07a4a", "#c8aa6a", "#5fa3a8", "#2f4f9a"];
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  let x = 110; const dots = G.PLANETS.map((pl, i) => { const r = Math.max(9, Math.sqrt(pl.r) * 15); x += r + 14; const cx = x; x += r + 14;
    const ring = pl.n === "土星" ? `<ellipse cx="${cx}" cy="80" rx="${r * 1.7}" ry="${r * 0.45}" fill="none" stroke="#e8d9a8" stroke-width="4"/>` : "";
    return `<circle cx="${cx}" cy="80" r="${r}" fill="${COL[i]}"/>${ring}`; }).join("");
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:56px 64px;background:#14203a;color:#f3eee2;display:flex;flex-direction:column;gap:36px;justify-content:center">
    <div>
      <div style="font-size:32px;color:#f2c46a;letter-spacing:.06em">太陽系の8つの惑星をくらべる1日5問</div>
      <div style="font-size:112px;font-weight:900;margin-top:4px;color:#fff;white-space:nowrap">太陽系<span style="color:#f2c46a">くらべ</span></div>
      <div style="font-size:30px;margin-top:8px;white-space:nowrap">並び・大きさ・重さ・1周の時間・特徴</div>
    </div>
    <svg width="1072" height="160" viewBox="0 0 1072 160"><circle cx="0" cy="80" r="100" fill="#f2b43a"/>${dots}</svg>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
