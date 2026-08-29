/**
 * 博客内容治理第二阶段
 *   1. 二次下线非技术文章（写入 draft: true，覆盖已有的 draft: false）
 *   2. 为保留文章写入语义化英文 slug（frontmatter 字段，不改文件名）
 *   3. 生成 src/data/redirects.mjs（旧 id → 新 slug），保证已收录的旧链接不 404
 *
 * 用法：
 *   node scripts/apply-slugs.mjs            # 预演，只打印
 *   node scripts/apply-slugs.mjs --apply    # 落盘
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const APPLY = process.argv.includes('--apply');

/** 二次下线：非技术内容（企业建站营销 / SEO 营销 / 杂谈观点） */
const DRAFT_LIST = [
	'qiyeleiwangzhanneirongdezhongdianzainali.md',
	'qiyewangzhandeshouyegaifangnaxieneirong.md',
	'qiyeyingruhetongguohulianwangyingxiaotishengqiyejingzhengli.md',
	'ruhejianliqiyewangzhan.md',
	'ruhexuanzejianwangzhandegongsi.md',
	'tantanwangzhantuiguangzhongdewangzhanneirongjiegoujiguanjianzi.md',
	'tigaoqiyewangzhanshoululiangdefangfahejiqiao.md',
	'wangzhanjiansheshixiaoqiyezouxianghulianwangyingxiaodediyibu.md',
	'ruherangbaiduzhizhukuaisushoulunidewenzhang.md',
	'ruhezhuanxiexiyinsousuoyinqingdetesebiaoti.md',
	'wozhichidianshangpingtaijintuikuan.md',
	'xiewenzhangyongshenmezitigenghaokan.md',
	'yonghutiyandegaojijinjiexuehuijianggushi.md',
];

/** 语义化英文 slug 映射（文件名 → 新 slug） */
const SLUG_MAP = {
	'10he20xianchengcpushiyongdanxianchengyibudehuatongchangshezhibingfaliangduoshaoheshi.md': 'async-concurrency-limit-for-10c20t-cpu',
	'35dirbufenbugxiufuxiaojiqiao.md': '35dir-bug-fix-tips',
	'35dirmeiyousuolvetudiaoyongzhanwaisuolvetuxiugaifangfa.md': '35dir-external-thumbnail-fallback',
	'35dirruhezidingyishujutongjilan.md': '35dir-custom-stats-bar',
	'35dirweijingtaiguizemuluhewenjianxingmoshi.md': '35dir-pseudo-static-rules',
	'7tecjianjiezhuti2021nian3yue2rigengxinzengjialecebianlanbiaoqiangongneng.md': '7tec-theme-sidebar-tags-update',
	'bingfayuxianchengdequbiezainali.md': 'concurrency-vs-threading',
	'chuledllzhuruhaiyoumeiyouqitazhurufangan.md': 'dll-injection-alternatives',
	'cssdisplayflexshuxing.md': 'css-display-flex',
	'daimashixiantypechowenzhangyoutupianzexianshisuolvetumeiyoutupianzebuxianshi.md': 'typecho-conditional-thumbnail',
	'danxianchengyiburuhekongzhibingfaliangne.md': 'async-concurrency-control',
	'danxianchengyibuyuduoxianchengyibuzaixiazaidapiliangwenjianshixiaolvshibushiyiyangde.md': 'async-vs-multithread-bulk-download',
	'djangochuangjianforiegnkeydeshihouyidingyaomashangyigemorenzhidefault.md': 'django-foreignkey-default',
	'djangowangzhantianjiasitemapyijiruhezidingyisitemap.md': 'django-custom-sitemap',
	'dllzhurushishenmeyisi.md': 'what-is-dll-injection',
	'dockerjingxiangjiasuliebiaojiezhi2024nian9yuekeyong.md': 'docker-registry-mirrors-2024',
	'douyinkuaishouzhibobanlvdingshizhushougongjuyigengxin020725banben.md': 'doutimer-release-0-2-0725',
	'fenbushipachonggongzuojiedianzenmexie.md': 'scrapy-distributed-worker-node',
	'fenbushipachongshibushudaoduogediannaodema.md': 'distributed-crawler-multi-machine',
	'geidajiaanliyigegongzhonghaozhangfenchajianwechatfansfortypecho.md': 'typecho-wechatfans-plugin',
	'gitdejiandanyongfa.md': 'git-basics',
	'githubwangsutaimandabukaizenmeban.md': 'github-slow-connection-fix',
	'hello-world.md': 'astro-portfolio-site-setup',
	'kefoutongshishiyongyibuyuxiancheng.md': 'async-and-threads-together',
	'kuaishouzhibobanlvzuixinbanzanweishipeiqingwugengxin.md': 'kuaishou-partner-version-warning',
	'mubiaofuwuqiduidangeipdeqingqiusulvyouxianzhizhegeqingqiusulvshishenmezenmehengliang.md': 'http-request-rate-limit-basics',
	'na300zhaohe1000zhaokuandaililunxiazaisududagaiduoshao.md': '300mbps-vs-1000mbps-speed',
	'neicunzhururuhehuoqubingdiaoyongneicunzhongdeneibuhanshu.md': 'memory-injection-call-internal-function',
	'nuitkadabaochengexewenjianyudaounusedbutsetvariablecuowuzenmeban.md': 'nuitka-unused-but-set-variable',
	'obszhiboluzhishipindeshihoumeiyoushengyin.md': 'obs-recording-no-audio',
	'pdfcrawlerpipelinespdfpipeline300shishenmeyisi.md': 'scrapy-pipeline-priority-300',
	'playwrightdelaunchpersistentcontextaibianchengjukeng.md': 'playwright-launch-persistent-context-pitfalls',
	'pyside6yuanjiaochuangkouyushubiaotuodong.md': 'pyside6-rounded-window-drag',
	'pythonguiyinggaizenmexuanweishenmeyaoxuanzepyside6.md': 'why-pyside6-for-python-gui',
	'pythonjiaobendabaochengexekezhixingwenjianguochengzhongdeyixieyaodian.md': 'python-to-exe-packaging-tips',
	'pythonjiaobenzaiminglingxingkeyizhengquezhixingzaiwindowsrenwujihualiquewufazhixing.md': 'python-script-fails-in-task-scheduler',
	'pythonshixiandllzhurudejishushili.md': 'python-dll-injection-example',
	'pythonshiyongpachongzhuaquwangzhanshangdemeinvtupian.md': 'python-image-crawler-example',
	'qwindowscontextoleinitializefailedruhejiejue.md': 'qt-oleinitialize-failed-fix',
	'ranhouzhujiedianhegongzuojiedianruhetongxindene.md': 'distributed-crawler-node-communication',
	'ruguo1gewangzhanmeimiaoqingqiushuxianzhiwei100namewopachongdebingfaliangduoshaoheshi.md': 'crawler-concurrency-for-100-rps-limit',
	'ruhechakanwangzhandexiangyingtou.md': 'how-to-view-http-response-headers',
	'ruhedongtaidiaozhengbingfaliangne.md': 'dynamic-concurrency-tuning',
	'ruhehuodemubiaohanshudedizhi.md': 'get-target-function-address',
	'ruhekanqingqiusulvshiyimiaoweidanweihaishiyifenzhongweidanwei.md': 'request-rate-unit-seconds-or-minutes',
	'ruheshiyongasyncioheaiohttpshixiandapiliangpdfwenjiandepaqurenwubingkongzhibingfaliangwei200.md': 'asyncio-aiohttp-bulk-pdf-crawler',
	'ruhezaidianshishangbofangjialidiannaoshangdeshipin.md': 'play-pc-video-on-tv',
	'ruhexiazaidingdingzhibohuifang.md': 'download-dingtalk-live-replay',
	'rustxuexibijiyijiwodeyidianxiangfa.md': 'rust-learning-notes',
	'scrapydouyounaxiemingling.md': 'scrapy-commands-cheatsheet',
	'scrapyfenbushipachongzhujiedianzhixuyaoanzhuangredisma.md': 'scrapy-distributed-master-redis-setup',
	'scrapymeiyouzhongzhihezantingdeminglingma.md': 'scrapy-pause-and-stop',
	'shiyongbatminglingpiliangxiugaiwenjianmingzhongdeyibufen.md': 'bat-batch-rename-files',
	'shiyongyibutigaobingfashifouyiweizheshiyongdekubixuzhichiyibucaixingdrissionpagezhichiyibuma.md': 'async-library-support-drissionpage',
	'typechohuoqusuijiwenzhangzuixinban.md': 'typecho-random-posts',
	'typechojiangpingluntouxiangxiugaiweiqqtouxiang.md': 'typecho-qq-comment-avatar',
	'typechoruhegeiwangzhanzengjiayejianmoshi.md': 'typecho-dark-mode',
	'wangyetiaozhuandaoweixintianjiahaoyoudesanzhongdaimashixianfangan.md': 'web-redirect-to-wechat-contact',
	'warningwindowwriteeventvaluenothreadqueue.md': 'pysimplegui-write-event-value-thread-queue',
	'wei7teczhutitianjiacundangyemian.md': '7tec-theme-archive-page',
	'windowsxitongshutdownminglingzaiminglingxingzhongkeyiyunxingzaibatpichuliwenjianzhongquewufayunxing.md': 'windows-shutdown-fails-in-bat',
	'windowszidonghuaxuyaoduixitongzuonaxieshezhi.md': 'windows-automation-system-settings',
	'wodiannaoyou10hexin20xianchengzuidazhichiduoshaobingfaliang.md': 'max-concurrency-10c20t',
	'wordpressfeichajianzidingyipinglunkuangmoban.md': 'wordpress-custom-comment-form',
	'woyaopaqubingxiazaiwangyedepdfwenjianruheliyongfenbushipachongne.md': 'distributed-crawler-for-pdf-download',
	'woyaopaqubingxiazaiwangyedepdfwenjianyexuyaoyongshujukuma.md': 'pdf-crawler-database-need',
	'yiduanpythondaimashifanruhehuoqumokuaijizhizaijieheyizhipianyijisuanmubiaohanshudizhi.md': 'python-module-base-address-offset',
	'yinwangluojiediandiaozhengruoyujihuoyichangqingjishifankuiyibianzuochudiaozheng.md': 'activation-error-network-node-notice',
	'yongscrapyzenmexiefenbushipachongne.md': 'scrapy-distributed-crawler-guide',
	'zhibodingshizhushouzidongguanjigongnengshixiaodejiejuebanfa.md': 'live-timer-auto-shutdown-fix',
	'zhiyou1taidiannaoyongscrapyredishuitishengpaquxiaolvma.md': 'scrapy-redis-single-machine-benefit',
	'zhongxinxieleyixiayejianmoshidegongneng.md': 'dark-mode-rewrite',
	'zhongxinzidingyitypechotouxiang.md': 'typecho-custom-avatar',
	'zhuomianzidonghuapywinautopyautoguiyaobuyaotianjiaziyuanguanliqijiancezhongqi.md': 'pywinauto-explorer-restart-watchdog',
	'zixue5tianyongpythonbianxieleyigexiaogongju.md': 'python-tool-in-5-days',
};

/** 在 frontmatter 中设置字段：已存在则覆盖其值，不存在则新增到块末尾 */
function setFields(src, fields) {
	const lines = src.split(/\r?\n/);
	if (lines[0].trim() !== '---') return { src, added: [], updated: [], skipped: [] };
	const end = lines.indexOf('---', 1);
	if (end === -1) return { src, added: [], updated: [], skipped: [] };

	let added = [];
	let updated = [];
	for (const [k, v] of Object.entries(fields)) {
		let found = -1;
		for (let i = 1; i < end; i++) {
			if (lines[i].match(new RegExp(`^${k}\\s*:`))) {
				found = i;
				break;
			}
		}
		if (found === -1) {
			lines.splice(end, 0, `${k}: ${v}`);
			added.push(k);
		} else if (lines[found].replace(/\s+/g, '') !== `${k}:${v}`) {
			lines[found] = `${k}: ${v}`;
			updated.push(k);
		}
	}
	return { src: lines.join('\n'), added, updated, skipped: [] };
}

const allFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));

let draftCount = 0;
let slugCount = 0;
const redirects = [];
const problems = [];

for (const file of allFiles) {
	const full = path.join(BLOG_DIR, file);
	const original = fs.readFileSync(full, 'utf8');
	const fields = {};

	if (DRAFT_LIST.includes(file)) fields.draft = 'true';
	const newSlug = SLUG_MAP[file];
	if (newSlug) fields.slug = newSlug;

	if (Object.keys(fields).length === 0) continue;

	const result = setFields(original, fields);
	if (result.skipped.length) {
		problems.push(`${file}: ${result.skipped.join(', ')} 处理失败`);
		continue;
	}

	if (newSlug) {
		const oldId = file.replace(/\.mdx?$/, '');
		redirects.push({ from: `/blog/${oldId}`, to: `/blog/${newSlug}` });
	}
	if (result.added.includes('draft') || result.updated.includes('draft')) draftCount++;
	if (result.added.includes('slug') || result.updated.includes('slug')) slugCount++;
	if (APPLY) fs.writeFileSync(full, result.src, 'utf8');
}

// 校验：draft 与 slug 映射里的文件必须真实存在
for (const file of DRAFT_LIST) {
	if (!allFiles.includes(file)) problems.push(`${file}: DRAFT_LIST 中存在但文件不存在`);
}
for (const file of Object.keys(SLUG_MAP)) {
	if (!allFiles.includes(file)) problems.push(`${file}: SLUG_MAP 中存在但文件不存在`);
}
// 校验：不能同时被下线又改 slug
const overlap = DRAFT_LIST.filter((f) => SLUG_MAP[f]);
if (overlap.length) problems.push(`同时被下线又改 slug：${overlap.join(', ')}`);
// 校验 slug 唯一
const slugs = Object.values(SLUG_MAP);
const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dup.length) problems.push(`slug 重复：${[...new Set(dup)].join(', ')}`);

console.log(`模式：${APPLY ? '落盘' : '预演'}`);
console.log(`下线（draft: true）：${draftCount} / ${DRAFT_LIST.length}`);
console.log(`写入 slug：${slugCount} / ${Object.keys(SLUG_MAP).length}`);
console.log(`生成重定向：${redirects.length}`);

if (APPLY) {
	const outDir = path.resolve('src/data');
	fs.mkdirSync(outDir, { recursive: true });
	const body = [
		'/**',
		' * 由 scripts/apply-slugs.mjs 自动生成，请勿手改。',
		' * 保证博客 slug 重写前已被搜索引擎收录的旧链接不 404。',
		' */',
		`export const blogRedirects = ${JSON.stringify(redirects, null, '\t')};`,
		'export default blogRedirects;',
		'',
	].join('\n');
	fs.writeFileSync(path.join(outDir, 'redirects.mjs'), body, 'utf8');
	console.log('已写入 src/data/redirects.mjs');
} else {
	console.log('\n（预演模式未落盘。加 --apply 执行。）');
}

if (problems.length) {
	console.log('\n问题：');
	for (const p of problems) console.log('  - ' + p);
	process.exitCode = 1;
}
