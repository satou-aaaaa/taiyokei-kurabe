// 太陽系くらべ の問題（ブラウザと node の両方で使う）。
// 太陽系の8つの惑星（水星〜海王星）の、太陽からの並び・大きさ・重さ・1周にかかる時間・岩石/ガス/氷の分け方・環・特徴を当てる。
// 数字は NASA「Planetary Fact Sheet」、日本語の説明は JAXA 宇宙情報センターと日本天文学会「天文学辞典」、冥王星は国立天文台・IAU から（出どころは SRC）。
// 問題は決まった種から全部ここで作る（BANK）。1問は「種類|番号」の key を持ち、同じ key ならいつも同じ問題になる。
// 作り方を変えると、過去の日の問題も変わる。変えた PR に一言書く。QA は表を別に持って答えを確かめる。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ日なら、どの端末でも同じ問題になる。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];

  // 出どころ（短い名前と URL）
  const SRC = {
    nasa: ["NASA「Planetary Fact Sheet」（地球を1とした比）", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/planet_table_ratio.html"],
    jaxa: ["JAXA 宇宙情報センター「惑星」", "https://spaceinfo.jaxa.jp/ja/"],
    adic: ["日本天文学会「天文学辞典」", "https://astro-dic.jp/"],
    nao: ["国立天文台「惑星の定義とは？」", "https://www.nao.ac.jp/faq/a0508.html"],
    gal: ["NASA「Galilean Satellite Fact Table」（衛星の大きさ）", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/galileanfact_table.html"],
    moon: ["NASA「Moon Fact Sheet」", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html"],
    pluto: ["NASA「Pluto Fact Sheet」", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/plutofact.html"],
    sun: ["NASA「Sun Fact Sheet」", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html"],
    jov: ["NASA「Jovian Satellite Fact Sheet」", "https://nssdc.gsfc.nasa.gov/planetary/factsheet/joviansatfact.html"],
    nasamars: ["NASA Science「Mars: Facts」", "https://science.nasa.gov/mars/facts/"],
    naolist: ["国立天文台「惑星・準惑星一覧」", "https://www.nao.ac.jp/new-info/planet.html"],
  };

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const pickN = (R, arr, n) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

  // 惑星（太陽に近い順）。n 名前・d 太陽からの平均距離（地球=1＝天文単位）・r 赤道半径（地球=1）・m 質量（地球=1）
  // y 太陽を1周する時間（ことば）・t 分け方（岩石・ガス・氷）・ring 環があるか・back 自転が地球と逆向きか（どの出典でも逆と書く金星だけ）
  const P = (n, d, r, m, y, t, ring, back) => ({ n, d, r, m, y, t, ring, back });
  const PLANETS = [
    P("水星", 0.387, 0.383, 0.0553, "約88日", "岩石", false, false),
    P("金星", 0.723, 0.949, 0.815, "約225日", "岩石", false, true),
    P("地球", 1, 1, 1, "約1年（365日）", "岩石", false, false),
    P("火星", 1.52, 0.532, 0.107, "約1.9年（687日）", "岩石", false, false),
    P("木星", 5.20, 11.21, 317.8, "約12年", "ガス", true, false),
    P("土星", 9.57, 9.45, 95.2, "約29年", "ガス", true, false),
    P("天王星", 19.17, 4.01, 14.5, "約84年", "氷", true, false),
    P("海王星", 30.18, 3.88, 17.1, "約165年", "氷", true, false),
  ];
  const TYPE = { 岩石: "岩石の惑星", ガス: "ガスの惑星", 氷: "氷の惑星" };
  const YEARS = PLANETS.map((p) => p.y);
  // 特徴 → 惑星。[惑星の番号（-1 は冥王星）, 文, 出どころ]
  const FEATS = [
    [0, "太陽にいちばん近い惑星", ["adic", "nasa"]],
    [0, "昼は約400℃、夜明け前は約マイナス160℃と、昼と夜の温度の差がとても大きい", ["jaxa"]],
    [1, "厚い雲におおわれ、表面の温度がいちばん高い惑星（約470℃）", ["jaxa"]],
    [3, "表面が酸化鉄（赤さび）を多くふくむ岩石におおわれ、赤く見える", ["jaxa"]],
    [3, "太陽系でいちばん大きな火山、オリンポス山がある", ["jaxa"]],
    [4, "太陽系でいちばん大きな惑星で、大赤斑という大きなうずがある", ["jaxa", "nasa"]],
    [5, "平均の密度が水より小さい。小さな望遠鏡でも環が見える", ["jaxa", "adic"]],
    [6, "自転の軸が約98度かたむき、横だおしのまま太陽のまわりを回る", ["jaxa", "adic"]],
    [7, "位置が計算で予想され、1846年にガレが見つけた", ["jaxa"]],
    [7, "太陽からいちばん遠い惑星", ["nasa"]],
    [-1, "2006年の国際天文学連合（IAU）の総会で、惑星ではなく「準惑星」になった", ["nao"]],
  ];

  // 問題をためる。key は「種類|番号」。同じ種類の中で、文と選び肢が同じ問題は入れない
  const B = [], seen = new Set();
  function add(kind, id, q) {
    const sig = kind + "|" + q.scene.text + "|" + q.opts.slice().sort().join("/");
    if (seen.has(sig)) return false; seen.add(sig);
    if (!q.opts.includes(q.ans) || new Set(q.opts).size !== q.opts.length) throw new Error("bad question " + kind + id);
    B.push({ key: kind + "|" + id, kind, ...q }); return true;
  }
  const Q = (text) => ({ t: "q", text });
  const at = (...ps) => ps.map((p) => PLANETS.indexOf(p));
  const others = (p, f = () => true) => PLANETS.filter((x) => x !== p && f(x));
  const no = (p) => PLANETS.indexOf(p) + 1;
  const times = (p, v) => (p.n === "地球" ? "地球" : `地球の${v}倍`);
  // 「くらべる」問題（4つの惑星から1つ）を、決まった種で N 問作る。同じ組み合わせは add が外す
  function each(kind, n, fn) { let id = 0; for (let i = 0; id < n && i < n * 20; i++) { const R = rng(seedOf(`gen:${kind}:${i}`)), four = pickN(R, PLANETS, 4); if (fn(R, four, String(id))) id++; } }

  // ── やさしい ──
  // 太陽から何番目（同じ惑星でも、まちがいの選び肢の組をかえて3問）
  PLANETS.forEach((p, i) => { for (let v = 0; v < 3; v++) { const R = rng(seedOf(`gen:junban:${i}:${v}`)), ds = pickN(R, others(p), 3);
    add("junban", `${i}-${v}`, { scene: Q(`太陽から近い順に数えて、${i + 1}番目の惑星は？`), opts: [p.n, ...ds.map((d) => d.n)], ans: p.n, at: at(p), src: ["nasa"],
      why: `太陽に近い順に、水星・金星・地球・火星・木星・土星・天王星・海王星です。${p.n}は${i + 1}番目です。` }); } });
  // 惑星 → 何番目（選び肢は続いた4つ）
  PLANETS.forEach((p, i) => { const R = rng(seedOf("gen:junban:n" + i)); let st = i - Math.floor(R() * 4); st = Math.max(0, Math.min(PLANETS.length - 4, st));
    add("junban", "n" + i, { scene: Q(`${p.n}は、太陽から近い順に数えて何番目？`), opts: [0, 1, 2, 3].map((k) => `${st + k + 1}番目`), ans: `${i + 1}番目`, at: at(p), src: ["nasa"], fix: 1,
      why: `太陽に近い順に、水星・金星・地球・火星・木星・土星・天王星・海王星です。${p.n}は${i + 1}番目です。` }); });
  // 岩石・ガス・氷（3つ。並びはそのまま）
  const KATA_WHY = "水星・金星・地球・火星は岩石、木星・土星はガス、天王星・海王星は氷の惑星です（天王星・海王星をガスの惑星に入れる分け方もあります）。";
  PLANETS.forEach((p, i) => {
    add("kata", String(i), { scene: Q(`惑星を「岩石の惑星・ガスの惑星・氷の惑星」の3つに分けると、${p.n}はどれ？`), opts: ["岩石の惑星", "ガスの惑星", "氷の惑星"], ans: TYPE[p.t], at: at(p), src: ["adic"], fix: 1, why: KATA_WHY }); });
  // ○○の惑星はどれ（ほかの3つは別の分け方の惑星）
  for (let i = 0, id = 0; i < 400 && id < 24; i++) { const R = rng(seedOf("gen:kata:w" + i)), t = ["岩石", "ガス", "氷"][i % 3], p = pickN(R, PLANETS.filter((x) => x.t === t), 1)[0], ds = pickN(R, PLANETS.filter((x) => x.t !== t), 3);
    if (add("kata", "w" + id, { scene: Q(`3つに分けたとき、次のうち「${TYPE[t]}」はどれ？`), opts: [p.n, ...ds.map((d) => d.n)], ans: p.n, at: at(p, ...ds), src: ["adic"], why: KATA_WHY })) id++; }
  // 特徴 → 惑星（冥王星は惑星4つから選ぶ。まちがいの選び肢の組をかえて2問）
  FEATS.forEach(([pi, t, src], i) => { for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:tokucho:${i}:${v}`));
    if (pi < 0) { const ds = pickN(R, PLANETS, 3);
      add("tokucho", `${i}-${v}`, { scene: Q(`「${t}」。この天体は？`), opts: ["冥王星", ...ds.map((d) => d.n)], ans: "冥王星", at: [], src, why: "冥王星は2006年8月、国際天文学連合の決めた惑星の定義で、準惑星になりました。いまの惑星は8つです。" }); continue; }
    const p = PLANETS[pi], ds = pickN(R, others(p), 3);
    add("tokucho", `${i}-${v}`, { scene: Q(`「${t}」。この惑星は？`), opts: [p.n, ...ds.map((d) => d.n)], ans: p.n, at: at(p), src, why: `${p.n}です。${p.n}は太陽から${no(p)}番目の惑星です。` }); } });
  // 環がある・ない（組み合わせを種で選ぶ）
  for (let i = 0, id = 0; i < 400 && id < 30; i++) { const R = rng(seedOf("gen:wa:" + i)), want = i % 2 === 0, p = pickN(R, PLANETS.filter((x) => x.ring === want), 1)[0], ds = pickN(R, PLANETS.filter((x) => x.ring !== want), 3);
    if (add("wa", String(id), { scene: Q(want ? "次のうち、環（リング）がある惑星は？" : "次のうち、環（リング）がない惑星は？"), opts: [p.n, ...ds.map((d) => d.n)], ans: p.n, at: at(p, ...ds), src: ["nasa", "jaxa"],
      why: "環があるのは木星・土星・天王星・海王星の4つです。土星の環は小さな望遠鏡でも見えますが、ほかの3つの環は細く、探査機などで見つかりました。" })) id++; }

  // ── ふつう ──
  const big = (a) => a.reduce((x, y) => (y.r > x.r ? y : x)), near = (a) => a.reduce((x, y) => (y.d < x.d ? y : x));
  // いちばん大きい（赤道半径）
  each("ookii", 30, (R, four, id) => { const p = big(four);
    return add("ookii", id, { scene: Q("次のうち、いちばん大きい惑星は？"), opts: four.map((x) => x.n), ans: p.n, at: at(...four), src: ["nasa"],
      why: `大きい順に、木星・土星・天王星・海王星・地球・金星・火星・水星です。この中では${p.n}がいちばん大きい（${times(p, p.r)}）です。` }); });
  // 太陽にいちばん近い
  each("chikai", 30, (R, four, id) => { const p = near(four);
    return add("chikai", id, { scene: Q("次のうち、太陽にいちばん近い惑星は？"), opts: four.map((x) => x.n), ans: p.n, at: at(...four), src: ["nasa"],
      why: `太陽に近い順に、水星・金星・地球・火星・木星・土星・天王星・海王星です。この中では${p.n}（${no(p)}番目）がいちばん近いです。` }); });
  // となり（1つ外側・1つ内側。まちがいの選び肢の組をかえて2問）
  PLANETS.forEach((p, i) => { const nx = PLANETS[i + 1]; if (!nx) return; for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:tonari:o${i}:${v}`)), ds = pickN(R, others(nx, (x) => x !== p), 3);
    add("tonari", `o${i}-${v}`, { scene: Q(`${p.n}の1つ外側（太陽から遠い側）を回る惑星は？`), opts: [nx.n, ...ds.map((d) => d.n)], ans: nx.n, at: at(p, nx), src: ["nasa"], why: `${p.n}は${i + 1}番目、${nx.n}は${i + 2}番目です。` }); } });
  PLANETS.forEach((p, i) => { const pv = PLANETS[i - 1]; if (!pv) return; for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:tonari:i${i}:${v}`)), ds = pickN(R, others(pv, (x) => x !== p), 3);
    add("tonari", `i${i}-${v}`, { scene: Q(`${p.n}の1つ内側（太陽に近い側）を回る惑星は？`), opts: [pv.n, ...ds.map((d) => d.n)], ans: pv.n, at: at(p, pv), src: ["nasa"], why: `${pv.n}は${i}番目、${p.n}は${i + 1}番目です。` }); } });
  // 太陽を1周する時間（選び肢は近い順に続いた4つ）
  PLANETS.forEach((p, i) => { const R = rng(seedOf("gen:nensu:" + i)); let st = i - Math.floor(R() * 4); st = Math.max(0, Math.min(PLANETS.length - 4, st));
    add("nensu", String(i), { scene: Q(`${p.n}が太陽のまわりを1周するのに、かかる時間は？`), opts: YEARS.slice(st, st + 4), ans: p.y, at: at(p), src: ["nasa", "jaxa"], fix: 1,
      why: `${p.n}は${p.y}で1周します。太陽から遠い惑星ほど、1周に長くかかります。` }); });
  // 時間 → 惑星（まちがいの選び肢の組をかえて2問）
  PLANETS.forEach((p, i) => { for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:nensu:r${i}:${v}`)), ds = pickN(R, others(p), 3);
    add("nensu", `r${i}-${v}`, { scene: Q(`太陽のまわりを${p.y.replace(/（.*）/, "")}で1周する惑星は？`), opts: [p.n, ...ds.map((d) => d.n)], ans: p.n, at: at(p), src: ["nasa", "jaxa"],
      why: `${p.n}は${p.y}で1周します。太陽から遠い惑星ほど、1周に長くかかります。` }); } });

  // ── むずかしい ──
  const order = (a, f) => a.slice().sort((x, y) => f(x) - f(y)); // 並べ替えは数で（乱数は引かない）
  const perm3 = (a) => { const [a1, a2, a3] = a; return [[a1, a2, a3], [a3, a2, a1], [a2, a1, a3], [a1, a3, a2]]; };
  // 太陽から近い順に3つ
  each("narabe", 30, (R, four, id) => { const ok = order(four.slice(0, 3), (x) => x.d), [good, ...bad] = perm3(ok).map((w) => w.map((x) => x.n).join(" → "));
    return add("narabe", id, { scene: Q("太陽から近い順に、正しく並んでいるのは？"), opts: [good, ...bad], ans: good, at: at(...ok), src: ["nasa"],
      why: ok.map((x) => `${x.n}（${no(x)}番目）`).join("→") + " の順です。" }); });
  // 大きい順に3つ（赤道半径）
  each("okijun", 30, (R, four, id) => { const ok = order(four.slice(0, 3), (x) => -x.r), [good, ...bad] = perm3(ok).map((w) => w.map((x) => x.n).join(" → "));
    return add("okijun", id, { scene: Q("大きい（半径が大きい）順に、正しく並んでいるのは？"), opts: [good, ...bad], ans: good, at: at(...ok), src: ["nasa"],
      why: ok.map((x) => `${x.n}（${times(x, x.r)}）`).join("→") + " の順です。" }); });
  // いちばん重い（質量）
  each("omosa", 30, (R, four, id) => { const p = four.reduce((x, y) => (y.m > x.m ? y : x));
    return add("omosa", id, { scene: Q("次のうち、いちばん重い（質量が大きい）惑星は？"), opts: four.map((x) => x.n), ans: p.n, at: at(...four), src: ["nasa", "jaxa"],
      why: `重い順に、木星・土星・海王星・天王星・地球・金星・火星・水星です。海王星は天王星より小さいのに重い惑星です。この中では${p.n}（${times(p, p.m)}）です。` }); });
  // 自転の向きが逆（金星）
  for (let i = 0, id = 0; i < 200 && id < 20; i++) { const v = PLANETS[1], R = rng(seedOf("gen:jiten:" + i)), ds = pickN(R, others(v, (x) => x.n !== "天王星"), 3);
    if (add("jiten", String(id), { scene: Q("次のうち、自転（こまのように回る向き）が地球と逆向きの惑星は？"), opts: [v.n, ...ds.map((d) => d.n)], ans: v.n, at: at(v), src: ["jaxa", "adic"],
      why: "金星は、地球と反対の向きに、243日かけてゆっくり自転しています。" })) id++; }

  // ── 2026-11-08 から：衛星・準惑星・太陽と豆知識（v:2。2026-11-07 までの日の問題は変えない） ──
  // 衛星と冥王星。n 名前・p 回る相手・dm 直径（km。NASA の表。冥王星は資料で 2374/2376 と分かれるので、順番にだけ使う）
  const M = (n, p, dm, w) => ({ n, p, dm, w });
  const MOONS = [
    M("月", "地球", 3475, "地球のまわりを約27.3日で1周する"), M("イオ", "木星", 3643, "ガリレオ衛星でいちばん内側を回る"), M("エウロパ", "木星", 3122, "ガリレオ衛星でいちばん小さい"),
    M("ガニメデ", "木星", 5262, "木星の衛星で、水星より大きい"), M("カリスト", "木星", 4821, "ガリレオ衛星でいちばん外側を回る"),
    M("タイタン", "土星", 5150, "土星の衛星で、水星より大きい"), M("トリトン", "海王星", 2705, "海王星の衛星で、冥王星より大きい"), M("カロン", "冥王星", 1212, "冥王星の衛星で、冥王星の半分ほどの大きさ"),
  ];
  const SIZE = [...MOONS.map((x) => ({ n: x.n, dm: x.dm })), { n: "水星", dm: 4879 }, { n: "冥王星", dm: 2376 }];
  const CLOSE = [["水星", "カリスト"]]; // 差が約1%で近すぎる組（同じ問題に入れない）
  const PARENTS = ["地球", "火星", "木星", "土星", "天王星", "海王星", "冥王星"];
  const add2 = (kind, id, q) => { const ok = add(kind, id, q); if (ok) B[B.length - 1].v = 2; return ok; };
  // 衛星 → 回る相手（まちがいの選び肢の組をかえて3問）
  MOONS.forEach((x, i) => { for (let v = 0; v < 3; v++) { const ds = pickN(rng(seedOf(`gen:eisei:${i}:${v}`)), PARENTS.filter((p) => p !== x.p), 3);
    add2("eisei", `${i}-${v}`, { scene: Q(`「${x.n}」は、どの天体のまわりを回る衛星？`), opts: [x.p, ...ds], ans: x.p, at: PLANETS.some((p) => p.n === x.p) ? at(PLANETS.find((p) => p.n === x.p)) : [], src: [x.p === "地球" ? "moon" : x.p === "冥王星" ? "pluto" : "gal"],
      why: `${x.n}は${x.p}の衛星です。${x.w}（直径約${x.dm.toLocaleString("en-US")}km）。` }); } });
  // 衛星・水星・冥王星から、いちばん大きい
  for (let i = 0, id = 0; i < 600 && id < 30; i++) { const R = rng(seedOf("gen:eiseiookii:" + i)), four = pickN(R, SIZE, 4);
    if (CLOSE.some(([a, b]) => four.some((x) => x.n === a) && four.some((x) => x.n === b))) continue;
    const p = four.reduce((a, b) => (b.dm > a.dm ? b : a)), od = SIZE.slice().sort((a, b) => b.dm - a.dm).filter((x) => four.includes(x));
    if (add2("eiseiookii", String(id), { scene: Q("次のうち、いちばん大きい（直径が大きい）天体は？"), opts: four.map((x) => x.n), ans: p.n, at: p.n === "水星" ? at(PLANETS[0]) : [], src: ["gal", "pluto"],
      why: `大きい順に ${od.map((x) => x.n).join("＞")} です。${p.n}は直径約${p.dm.toLocaleString("en-US")}kmです。` })) id++; }
  // 水星より大きい衛星
  { const big = SIZE.filter((x) => x.dm > 4879 && x.n !== "水星"), small = MOONS.filter((x) => x.dm < 4879 && !CLOSE.some(([a, b]) => [a, b].includes(x.n)));
    let id = 0; big.forEach((b) => { for (let i = 0; i < 12; i++) { const ds = pickN(rng(seedOf(`gen:eiseiookii:m${b.n}:${i}`)), small, 3);
      if (add2("eiseiookii", "m" + id, { scene: Q("次のうち、惑星の水星（直径約4879km）より大きい衛星は？"), opts: [b.n, ...ds.map((d) => d.n)], ans: b.n, at: [], src: ["gal"],
        why: `${b.n}は直径約${b.dm.toLocaleString("en-US")}kmで、水星より大きい衛星です。ガニメデとタイタンは、水星より大きい衛星です。` })) id++; } }); }
  // 豆知識 → 天体。[答え, 文, 出どころ, 説明]。答えが惑星なら惑星4つ、衛星なら衛星4つから選ぶ
  const MAME = [
    ["水星", "夜明けから次の夜明けまでが、地球の約176日分もある", ["jaxa"], "水星は自転と公転の組み合わせで、1日（夜明けから次の夜明け）が地球の約176日分になります。"],
    ["水星", "太陽にいちばん近いのに、表面の温度は金星より低い", ["jaxa"], "金星は厚い大気で昼も夜も約470℃。太陽により近い水星よりも高い温度です。"],
    ["金星", "自転が逆向きなので、太陽が西から昇り東に沈む", ["jaxa"], "金星は自転の向きがほかの7つの惑星と反対で、太陽は西から昇り東に沈みます。"],
    ["金星", "厚い二酸化炭素の大気があり、地表の気圧は約90気圧", ["adic"], "金星の大気はほとんどが二酸化炭素で、地表では約90気圧にもなります。"],
    ["地球", "1日は24時間だが、星に対して1回転するのは約23.9時間", ["nasa"], "地球が星に対して1回転するのは約23時間56分。太陽が南に来てから次に来るまでが24時間です。"],
    ["火星", "長さ約3900kmの大きな峡谷、マリネリス峡谷がある", ["nasamars"], "マリネリス峡谷は長さ約3870km。太陽系でいちばん大きな峡谷の1つです。"],
    ["火星", "1日（自転）は約24時間37分で、地球とほぼ同じ", ["jaxa"], "火星の自転は約1.026日（24時間37分）。1日の長さは地球とほとんど同じです。"],
    ["木星", "とても淡く細い環があり、ボイジャー1号が見つけた", ["jaxa"], "木星の環はとても淡く細く、探査機ボイジャー1号によって確かめられました。"],
    ["天王星", "1781年にハーシェルが見つけた", ["naolist"], "天王星は1781年3月13日にハーシェルが見つけました。昔から知られていた惑星は土星までです。"],
    ["天王星", "環は1977年、星がかくされる様子の観測で見つかった", ["jaxa"], "天王星の環は1977年、天王星が恒星の前を通るとき（恒星食）の観測で見つかりました。"],
    ["月", "自転と公転が、どちらも約27.3日", ["moon"], "月は約27.3日で地球を1周し、同じ時間で1回自転します。"],
    ["月", "新月から次の新月まで約29.5日かかる衛星", ["moon"], "月の満ち欠けは約29.5日。地球を1周する27.3日より少し長くかかります。"],
    ["カロン", "公転の時間が、回る相手の自転と同じ約6.4日", ["pluto"], "カロンは約6.39日で冥王星を1周し、冥王星の自転も約6.39日（153時間）です。"],
    ["イオ", "木星をいちばん短い時間（約1.8日）で1周するガリレオ衛星", ["gal", "jov"], "ガリレオ衛星は内側から、イオ（約1.8日）・エウロパ・ガニメデ・カリスト（約16.7日）です。"],
    ["カリスト", "木星をいちばん長い時間（約16.7日）で1周するガリレオ衛星", ["gal", "jov"], "ガリレオ衛星は内側から、イオ（約1.8日）・エウロパ・ガニメデ・カリスト（約16.7日）です。"],
  ];
  const MNAMES = MOONS.map((x) => x.n), GALI = ["イオ", "エウロパ", "ガニメデ", "カリスト"];
  MAME.forEach(([a, t, src, why], i) => { const isM = MNAMES.includes(a); for (let v = 0; v < 2; v++) { const R = rng(seedOf(`gen:mame:${i}:${v}`));
    const pool = isM ? (GALI.includes(a) && /ガリレオ衛星/.test(t) ? GALI : MNAMES) : PLANETS.map((p) => p.n), ds = pickN(R, pool.filter((x) => x !== a), 3);
    const pa = PLANETS.find((p) => p.n === a);
    add2("mame", `${i}-${v}`, { scene: Q(`「${t}」。この天体は？`), opts: [a, ...ds], ans: a, at: pa ? at(pa) : [], src, why }); } });

  // 種類：id・難しさ・帳に出す名前・見るところ（ヒント1）
  const KINDS = [
    { id: "junban", lv: 0, name: "太陽から何番目", look: "「すいきんちかもくどてんかい」と、近い順に唱えてみましょう。" },
    { id: "kata", lv: 0, name: "岩石・ガス・氷", look: "太陽に近い4つは岩石、木星と土星はガス、遠い2つは氷の惑星です。" },
    { id: "tokucho", lv: 0, name: "惑星の特徴", look: "色・温度・大きさ・見つかった時など、その惑星だけの話を思い出しましょう。" },
    { id: "wa", lv: 0, name: "環がある惑星", look: "環があるのは、木星より外側の大きな4つの惑星です。" },
    { id: "ookii", lv: 1, name: "いちばん大きい", look: "木星がいちばん大きく、地球より小さいのは金星・火星・水星です。" },
    { id: "chikai", lv: 1, name: "いちばん近い", look: "「すいきんちかもくどてんかい」の、前にあるほど太陽に近い惑星です。" },
    { id: "tonari", lv: 1, name: "となりの惑星", look: "近い順の並びで、1つ前（内側）か1つ後ろ（外側）を探しましょう。" },
    { id: "nensu", lv: 1, name: "1周にかかる時間", look: "太陽から遠い惑星ほど、1周に長くかかります。地球は1年です。" },
    { id: "narabe", lv: 2, name: "近い順", look: "まず、いちばん太陽に近い惑星を決めましょう。" },
    { id: "okijun", lv: 2, name: "大きい順", look: "木星＞土星＞天王星＞海王星＞地球＞金星＞火星＞水星です。" },
    { id: "omosa", lv: 2, name: "いちばん重い", look: "大きさの順とほぼ同じですが、海王星は天王星より重い惑星です。" },
    { id: "jiten", lv: 2, name: "自転が逆向き", look: "とても厚い雲におおわれた、地球のとなりの惑星です。" },
    // 2026-11-08 から（v2）
    { id: "eisei", lv: 0, name: "どの星の衛星", look: "木星のまわりには、イオ・エウロパ・ガニメデ・カリストの4つが回ります。", v: 2 },
    { id: "eiseiookii", lv: 1, name: "衛星の大きさ", look: "ガニメデとタイタンは、惑星の水星より大きい衛星です。", v: 2 },
    { id: "mame", lv: 2, name: "天体の豆知識", look: "温度・1日の長さ・見つかった年など、その天体だけの話を思い出しましょう。", v: 2 },
  ];
  B.forEach((q) => { q.lv = KINDS.find((k) => k.id === q.kind).lv; });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  // 2026-11-07 までの日は、はじめの12種類だけで組む（過去の日の問題を変えない）
  const V2DAY = "2026-11-08";
  const kindsOn = (lv, date) => KINDS.filter((k) => k.lv === lv && (date >= V2DAY || !k.v)).map((k) => k.id);
  const BANK = Object.fromEntries(B.map((q) => [q.key, q]));
  const keysOf = (kind) => B.filter((q) => q.kind === kind).map((q) => q.key);
  // key から問題を作る（選び肢の並びは key の種で混ぜる。並びを決めてある種類はそのまま）
  function make(tag) {
    if (!Object.prototype.hasOwnProperty.call(BANK, tag)) return null; const q = BANK[tag];
    const k = BY[q.kind], opts = q.fix ? q.opts.slice() : pickN(rng(seedOf(tag)), q.opts, q.opts.length);
    return { tag, kind: q.kind, lv: k.lv, name: k.name, look: k.look, scene: q.scene, text: q.text || "", opts, ans: q.ans, why: q.why, at: q.at, src: q.src.map((s) => SRC[s]) };
  }
  const pickKey = (R, kind) => { const ks = keysOf(kind); return ks[Math.floor(R() * ks.length)]; };
  // 今日の5問：やさしい2・ふつう2・むずかしい1（種類は重ねない）。日付の種で決まり、だれでも同じ
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), e = pickN(R, kindsOn(0, date), 2), m = pickN(R, kindsOn(1, date), 2), h = pickN(R, kindsOn(2, date), 1);
    return [...e, ...m, ...h].map((k) => pickKey(R, k));
  }
  // 上級：むずかしい3問（今日のむずかしいと別の種類）
  function hardTags(date) {
    const dh = BANK[dailyTags(date)[4]].kind, R = rng(seedOf("hard:" + date)), h = pickN(R, kindsOn(2, date).filter((x) => x !== dh), 3);
    return h.map((k) => pickKey(R, k));
  }
  const G = { KINDS, BY, LV, SRC, PLANETS, FEATS, MOONS, SIZE, MAME, V2DAY, BANK, keysOf, kindsOf, seedOf, rng, make, dailyTags, hardTags, pickN };
  if (typeof module === "object" && module.exports) module.exports = G; else root.TAIYO = G;
})(typeof window !== "undefined" ? window : globalThis);
