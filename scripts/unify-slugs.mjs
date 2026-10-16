/**
 * 统一博客 slug：拼音 → 简短英文（连字符风格，与既有英文 slug 一致）
 *
 * 背景：此前内容治理只给保留的技术文章写了英文 slug；草稿文章的 slug 是上一轮
 * 为固定 URL 而写入的旧拼音文件名。本脚本把剩余拼音 slug 全部替换为英文。
 * 这些文章均为 draft: true，从未生成公开页面，无需配 redirects。
 * 已发布的 21 篇（live）slug 不动，避免改变线上 URL。
 *
 * 用法：
 *   node scripts/unify-slugs.mjs            # 预演，只打印不落盘
 *   node scripts/unify-slugs.mjs --apply    # 落盘
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const APPLY = process.argv.includes('--apply');

/** 旧拼音 slug → 新英文 slug（依据文章标题/内容语义） */
const SLUG_MAP = {
	// —— 支付 / 电商 / 副业 ——
	'259zhihouzhenshangjuhezhifushigezhuanxingdehaosaidaoma': 'payment-259-career-switch',
	'zhifuxingye259haowenjiandeyingxiangdaodiyouduodaquanwangmeiyouyigejiangmingbaide': 'payment-259-file-impact',
	'haizaizuozhifuxingyedezhuyileposjijueduibushizhifuxingyedeweilai': 'pos-not-payment-future',
	'xinyongkafuyetuiguangfanyongpingtaiyidanzheng300yuanqibumeizai': 'credit-card-referral-income',
	'wozhichidianshangpingtaijintuikuan': 'support-refund-only-policy',
	'niyoumeiyoufaxianyuanlaihenduohefadegongsidoucaiyongzhezhongwangluochuanxiaodemoshizaikaizhanyewu': 'mlm-style-business-model',

	// —— 销售 / 管理 / 职场 ——
	'4zhaojiaoniruhejilixiaoshoutuandui': 'motivate-sales-team-tips',
	'yewuyuankuaisuziwotishengdesandayaosu': 'salesman-self-improvement-keys',
	'niweishenmezuobuhaoxiaoshou': 'why-bad-at-sales',
	'zuoxiaoshouyalitaidazenmeban': 'sales-pressure-relief',
	'zuoxiaoshoujiushiyaozao9wan10wanmingjiabanquannianwuxiu1zhaobangnidapozhegeguaiquan': 'break-sales-overtime-cycle',
	'woshiruhekuaisugaoxiaodizai3geyueneizhaodao180gexiaoshoude': 'hire-180-sales-in-3-months',
	'xiaoshouyinggaizenmezuo': 'how-to-do-sales',
	'ruheyouxiaodijinxingxiaoshoutuanduideguanli': 'effective-sales-team-management',
	'ruheguanlihuijixiaoshoutuandui': 'membership-sales-team-management',
	'zuohuijijingligaizenmequguanhaoshouxiaderen': 'fitness-manager-management',
	'jianshenguanlituanduipeihebushituizeren': 'gym-teamwork-no-blame',
	'xiashubutinghuadesigeyuanyinyuqigeduice': 'managing-disobedient-staff',
	'yuangongbufucongguanlizenmeban': 'employee-disobedience-solutions',
	'yuangongzhixinglichaxiaolvditailanruheguanli': 'lazy-employee-management',
	'yuangongyaolizhiruhewanliu': 'retain-resigning-employee',
	'raoluanjunxindeyuangongbunengliu': 'morale-damaging-employee',
	'fucongguanlishigongzuodejibenyaoqiu': 'obedience-at-work-basics',
	'guanlizheqingtingzhizuoxiashudebaomu': 'stop-being-employee-babysitter',
	'ruhejiliyuangongamibajingyingdeluodi': 'amoeba-management-motivation',
	'qiyeruhezuohaozhaopingongzuo': 'how-to-recruit-well',
	'juansiweiyichangzhichangrendejiaolv': 'workplace-crisis-anxiety',
	'gongzuotaianyimeiyouyaliganzenmeban': 'too-comfortable-at-work',
	'aimeizhichanglimianzuijihuidelianggezi': 'office-ambiguity-taboo',
	'xiegeizhichangxiaobaiyourendedifangjiuyoujianghu': 'workplace-rookie-guide',
	'weishenmehenduobiyeshengbuyuanyiquzuoxiaoshoushenzhigandaodiuren': 'why-graduates-avoid-sales',
	'jiranxiaoxuebiyededounengzuoxiaoshougongzuonaweishenmewomendaxuehaiyaoxuexishichangyingxiao': 'why-study-marketing',
	'chuangyeyinianhouwoxuanzezhongxinhuidaozhichang': 'back-to-work-after-startup',
	'lizhizhihouxiayibudedasuanyuguihua': 'plan-after-resignation',
	'nibunulinidelaobanyehuibizheninuli': 'boss-will-push-you',
	'nideshichangjiazhidaodishizenmesuanchulaide': 'your-market-value',
	'hekongzhiyuguoqiangderenxiangchuyaozuohaozhe5dian': 'deal-with-controlling-people',
	'zuotiangongzuozongjiehejintianyaozuodeshi': 'daily-work-summary-plan',

	// —— 创业 / 投资 / 股市 ——
	'ruguochuangyedeshourubishangbandinihaihuixuanzechuangyema': 'startup-vs-job-income',
	'zaizuoyigechuangyexiangmudanshiyizhidebudaojieguobuzhidaogaibugaijixujianchixiaquwoyinggaizenmeban': 'startup-no-results-persevere',
	'zheliangleirenbushihechuangyeyouqishihehuochuangye': 'who-shouldnt-start-business',
	'ruhekefuchuangyedekongjuxinli': 'overcome-startup-fear',
	'zhengliyixiachuangyekaidiandesilu': 'opening-a-shop-ideas',
	'yuandanzhijigerentouzizongjiefupan2020zhanwang2021': '2020-investment-review-2021',
	'gushidaigeiwodeqishi': 'stock-market-lessons',
	'gupiaoliangjiazhijiandeguanxixuehuilejiushidashi': 'price-volume-relationship',
	'chaoganggucaiguodenaxiekengxinshoubikan': 'hk-stock-trading-pitfalls',
	'suanyisuanchaoganggumeigudezhang': 'hk-us-stock-cost-accounting',
	'jiluyicitouziguwendetuixiaotaolu': 'investment-advisor-sales-tactics',
	'touzihuodongzhongyounaxiekengrendeguandian': 'misleading-investment-views',
	'ruhecainengbubeigejiucai': 'avoid-getting-scammed',
	'yidaiyangdaizenmezijiu': 'escape-debt-cycle',

	// —— 企业建站 / 网络营销 ——
	'qiyezuowangzhanzhuyishixiang': 'business-website-tips',
	'qiyejianzhandezhongdianbushimeiguan': 'website-function-over-beauty',
	'qiyexiangtongguoqiyewangzhanbangzhuyingliyaozuohaosandian': 'website-profit-3-points',
	'qiyeleiwangzhanneirongdezhongdianzainali': 'business-website-content-focus',
	'qiyewangzhanshangxianhousidianbuyaozuo': 'website-launch-4-donts',
	'qiyewangzhandeyaosushishenme': 'website-essential-elements',
	'qiyewangzhandeshouyegaifangnaxieneirong': 'website-homepage-content',
	'qiyewangluoyingxiaosibuzou': 'online-marketing-4-steps',
	'qiyeyingruhetongguohulianwangyingxiaotishengqiyejingzhengli': 'internet-marketing-competitiveness',
	'qiyexuanzewangzhanjianshegongsishizhuyishixiang': 'choosing-web-agency-tips',
	'zhongxiaoqiyewangzhanjiansheyounaxiewuqu': 'sme-website-mistakes',
	'ruhejianliqiyewangzhan': 'how-to-build-business-website',
	'zuowangzhanqianwanbuyaozhicongjiagekaolv': 'dont-choose-website-by-price',
	'ruhexuanzejianwangzhandegongsi': 'choose-website-company',
	'xinchenglidegongsiyinggaizuowangzhanma': 'should-startup-build-website',
	'wangzhanjianshe6dazouxianghelirenxinghuacaiyouweilai': 'website-building-6-trends',
	'wangzhanjiansheshixiaoqiyezouxianghulianwangyingxiaodediyibu': 'website-first-step-online-marketing',
	'sibudaoweirangfangkeyunidewangzhanyijianzhongqing': 'website-love-at-first-sight',
	'zhuyiwangzhanxijieguibijianzhanwuqu': 'website-details-and-mistakes',
	'tantanwangzhantuiguangzhongdewangzhanneirongjiegoujiguanjianzi': 'website-content-structure-keywords',
	'tigaoqiyewangzhanshoululiangdefangfahejiqiao': 'increase-website-indexing',
	'ruherangbaiduzhizhukuaisushoulunidewenzhang': 'baidu-spider-fast-indexing',
	'ruhezhuanxiexiyinsousuoyinqingdetesebiaoti': 'seo-title-writing-tips',
	'jiandanjiushizuihaodewangluotuiguangdefangfa': 'simplicity-best-promotion',
	'liuliangshizuochengyijianshidedicengluoji': 'traffic-as-core-logic',
	'qiantanqiyeyinggairuhequzuoquanwangyingxiao': 'enterprise-omni-marketing',
	'yonghutiyandegaojijinjiexuehuijianggushi': 'ux-storytelling-advanced',
	'qqyoujiandeyingxiaoshicaojingyanzongjie': 'qq-email-marketing-tips',

	// —— 成长 / 心态 / 杂谈 ——
	'99debuchenggongderendouquetongyizhongnenglikuajinzijinengliquandenengli': 'expand-competence-circle',
	'aihuizadiaogeshoumendetiefanwanma': 'will-ai-replace-singers',
	'deepseektiwenquanzhibaobaruheguihuashijianzuofuye': 'full-time-dad-side-business',
	'pythonshujufenxicesuanzichanshouyizuidahua': 'python-asset-return-analysis',
	'chaojirenmaiwangyoushenmemiaozhao': 'super-networker-tips',
	'yiweicanyinlaobanzishubeio2ohuyoudezhejinian': 'restaurant-owner-o2o-story',
	'buweishibaizhaojiekouzhiweichenggongzhaofangfa': 'no-excuses-only-solutions',
	'buchonghuiyuanbuyongwaiguaruherangnidebaiduwangpanquansuxiazaibuxiansu': 'baidu-netdisk-full-speed-download',
	'zhongniandashuyanzhongdeguochaofeng': 'guochao-trend-view',
	'weishenmenihuizuoshiyouyumeiyouzhujian': 'why-indecisive-no-opinion',
	'weishenmenihuixinggenuoruo': 'why-weak-personality',
	'weishenmechengguandequanlizhemedakeyiweisuoyuwei': 'city-management-power',
	'rendeqichangdaodiyouduozhongyao': 'charisma-importance',
	'renzheyibeizigairuhefanshen': 'how-to-turn-life-around',
	'niyouyubujuemeiyouzhujiandegenbenyuanyinshimeiyouziwo': 'root-cause-of-indecisiveness',
	'nibuaishejiaobushiyinweinineixiang': 'not-social-not-introverted',
	'guoqilingdaoyuyixingqianshoubeipaizhejianshinizenmekan': 'soe-leader-scandal-view',
	'zairenjijiaowangzhongniwuchuguoshenmedaoli': 'interpersonal-lessons-learned',
	'daduoshurenshizenyanghuihuozijitianfude': 'how-people-waste-talent',
	'tianqilengjiubuyongyundongma': 'exercise-in-cold-weather',
	'nvshengwoyaotucaoyixianimendexiaofeixiguan': 'girls-spending-habits',
	'ruhebangzhuxinxiaoshoudiaozhenghaoxintaixiaochuneixindemozhang': 'new-salesperson-mindset',
	'ruhekandaifengdahuifanbowangyouyaoqiuofotuihui199yuanyajindeguandian': 'ofo-deposit-refund-debate',
	'ruhexuanzecainengbugufuzijidenuli': 'choices-match-your-effort',
	'xuexibixuanchengshihexuanduixiangdouzhongyaochedanma': 'study-vs-city-spouse',
	'nianqingshihoudemaozedongconglaibujiaolv': 'young-mao-no-anxiety',
	'henrongyibeibierenshuodehuayingxiangxinqinggaizenmeban': 'easily-affected-by-words',
	'xinzhongturanchanshengyizhongweijigan': 'sudden-sense-of-crisis',
	'xinzhonglaoyouzanianzenmeban': 'get-rid-of-distractions',
	'xiangdetaiduozuodetaishaozenmeban': 'think-less-do-more',
	'woderigengjihua': 'daily-writing-plan',
	'shoucanghangzhoutianxiadiyicaishenmiaolingshunsijieqiandaquan': 'lingshun-temple-fortune-sticks',
	'meiyourenhuiyuanyifangqizijidemengxiangquchengquanbieren': 'no-one-gives-up-dreams-for-you',
	'dianziwendangxuyaoqianzinihaipidianpidiandipaoqudayin': 'digital-document-signing',
	'yiqingyizhibujieshuwomengaizenmeban': 'coping-with-endless-pandemic',
	'zhihu7wanzanhuidanisikaowentidefangshijuedinglenidecengci': 'thinking-style-determines-level',
	'zhihuyijuedashurennulichengduzhidigenbenmeiyouyaodaopintianfudedibuzhejuhuakexinma': 'effort-vs-talent-debate',
	'zhihuxinlianshiduiyigerendeyingxiangdaodiyouduoda': 'power-of-psychological-suggestion',
	'biezhuanglenizhishikanqilaihennuli': 'you-only-look-hardworking',
	'hetongzhapianhejingjijiufendequbieyijiruheyingdui': 'contract-fraud-vs-dispute',
	'14deshijianyonglaidizhiyuwangyoushenmeliqixuexi': 'desire-control-and-learning',
	'guanyuzhishiyuxuexifangfadeyixiesikao': 'knowledge-and-learning-method',
	'xiewenzhangyongshenmezitigenghaokan': 'best-font-for-writing',
	'gaoxiaogongzuofaliudianyouxiangongzuofameitianliechuliujianzuizhongyaodeshi': 'ivy-lee-method-6-tasks',
	'peibanshizhegeshidaizuishechideliwu': 'companionship-luxury-gift',
	'huangzijiaobaoliaodaxiaosxidu': 'huangzijiao-drug-allegations',
	'lunjuewuyuxinnian': 'on-awareness-and-belief',
	'yinchuanshaokaodianbaozhashigufansishikebaanquanfangzaidiyiwei': 'yinchuan-explosion-safety-lesson',
	'yongtangzhuansiweidazaozhuanqianjiqi': 'passive-income-money-machine',
	'qichang': 'charisma',
};

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const allFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const problems = [];
const usedSlugs = new Set();
const changes = [];

for (const file of allFiles) {
	const full = path.join(BLOG_DIR, file);
	const src = fs.readFileSync(full, 'utf8');
	const fmMatch = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!fmMatch) {
		problems.push(`${file}: 没有 frontmatter`);
		continue;
	}
	const slugLine = fmMatch[1].split(/\r?\n/).find((l) => /^slug\s*:/.test(l));
	const curSlug = slugLine ? slugLine.replace(/^slug\s*:\s*/, '').replace(/^["']|["']$/g, '') : '';
	if (curSlug) usedSlugs.add(curSlug);

	if (/^[a-z0-9]+$/.test(curSlug)) {
		// 拼音 slug → 查映射表
		const next = SLUG_MAP[curSlug];
		if (!next) {
			problems.push(`${file}: slug "${curSlug}" 不在映射表中`);
			continue;
		}
		if (!SLUG_RE.test(next)) {
			problems.push(`${file}: 新 slug "${next}" 格式不合法`);
			continue;
		}
		changes.push({ file, from: curSlug, to: next });
	}
}

// 唯一性校验（现有 slug + 新 slug 一起查重）
const seen = new Map();
for (const s of usedSlugs) seen.set(s, '现有 slug');
for (const c of changes) {
	if (seen.has(c.to)) problems.push(`slug 重复："${c.to}"（${c.file} 与 ${seen.get(c.to)}）`);
	seen.set(c.to, c.file);
}
// 映射表反向检查：表中每个键必须真实存在
for (const key of Object.keys(SLUG_MAP)) {
	if (!usedSlugs.has(key)) problems.push(`映射表键 "${key}" 不存在于任何文件`);
}

console.log(`模式：${APPLY ? '落盘' : '预演'}`);
console.log(`需改写的拼音 slug：${changes.length}\n`);
for (const c of changes) console.log(`  ${c.from}\n    → ${c.to}   [${c.file}]`);

if (problems.length) {
	console.log(`\n问题（${problems.length}）：`);
	for (const p of problems) console.log(`  - ${p}`);
}

if (!APPLY) {
	console.log('\n（预演模式未落盘。加 --apply 执行。）');
	process.exit(problems.length ? 1 : 0);
}

let updated = 0;
for (const c of changes) {
	const full = path.join(BLOG_DIR, c.file);
	const src = fs.readFileSync(full, 'utf8');
	const eol = src.includes('\r\n') ? '\r\n' : '\n';
	const lines = src.split(/\r?\n/);
	const idx = lines.findIndex((l) => /^slug\s*:/.test(l));
	if (idx === -1) throw new Error(`${c.file}: 找不到 slug 行`);
	lines[idx] = `slug: ${c.to}`;
	fs.writeFileSync(full, lines.join(eol), 'utf8');
	updated++;
}
console.log(`\n完成：更新 slug ${updated} 个`);
console.log('未提交，可用 git diff 复核。');
