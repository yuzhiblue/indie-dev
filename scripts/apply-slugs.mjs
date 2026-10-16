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
	'企业类网站内容的重点在哪里.md',
	'企业网站的首页该放那些内容.md',
	'企业应如何通过互联网营销提升企业竞争力.md',
	'如何建立企业网站.md',
	'如何选择建网站的公司？.md',
	'谈谈网站推广中的网站内容、结构及关键字.md',
	'提高企业网站收录量的方法和技巧.md',
	'网站建设是小企业走向互联网营销的第一步.md',
	'如何让百度蜘蛛快速收录你的文章.md',
	'如何撰写吸引搜索引擎的特色标题.md',
	'我支持电商平台仅退款.md',
	'写文章用什么字体更好看？.md',
	'用户体验的高级进阶：学会讲故事.md',
];

/** 语义化英文 slug 映射（文件名 → 新 slug） */
const SLUG_MAP = {
	'10核20线程cpu使用单线程异步的话通常设置并发量多少合适？.md': 'async-concurrency-limit-for-10c20t-cpu',
	'35dir部分bug修复小技巧.md': '35dir-bug-fix-tips',
	'35dir没有缩略图调用站外缩略图修改方法.md': '35dir-external-thumbnail-fallback',
	'35dir如何自定义数据统计栏？.md': '35dir-custom-stats-bar',
	'35dir伪静态规则：目录和文件型模式.md': '35dir-pseudo-static-rules',
	'7TEC简洁主题，2021年3月2日更新,增加了侧边栏标签功能…….md': '7tec-theme-sidebar-tags-update',
	'并发与线程的区别在哪里.md': 'concurrency-vs-threading',
	'除了DLL注入，还有没有其它注入方案？.md': 'dll-injection-alternatives',
	'css display：flex 属性.md': 'css-display-flex',
	'代码实现Typecho文章有图片则显示缩略图，没有图片则不显示.md': 'typecho-conditional-thumbnail',
	'单线程异步如何控制并发量呢？.md': 'async-concurrency-control',
	'单线程异步与多线程异步在下载大批量文件时效率是不是一样的？.md': 'async-vs-multithread-bulk-download',
	'django创建ForiegnKey的时候一定要马上一个默认值default.md': 'django-foreignkey-default',
	'django网站添加sitemap以及如何自定义sitemap.md': 'django-custom-sitemap',
	'dll注入是什么意思？.md': 'what-is-dll-injection',
	'Docker 镜像加速列表 截止2024年9月可用.md': 'docker-registry-mirrors-2024',
	'douyinkuaishouzhibobanlvdingshizhushougongjuyigengxin020725banben.md': 'doutimer-release-0-2-0725',
	'分布式爬虫工作节点怎么写？.md': 'scrapy-distributed-worker-node',
	'分布式爬虫是布曙到多个电脑的吗？.md': 'distributed-crawler-multi-machine',
	'给大家安利一个公众号涨粉插件：WeChatfans for Typecho.md': 'typecho-wechatfans-plugin',
	'git的简单用法.md': 'git-basics',
	'Github网速太慢打不开怎么办？.md': 'github-slow-connection-fix',
	'hello-world.md': 'astro-portfolio-site-setup',
	'可否同时使用异步与线程？.md': 'async-and-threads-together',
	'kuaishouzhibobanlvzuixinbanzanweishipeiqingwugengxin.md': 'kuaishou-partner-version-warning',
	'目标服务器对单个ip的请求速率有限制，这个请求速率是什么？怎么衡量？.md': 'http-request-rate-limit-basics',
	'那300兆和1000兆宽带理论下载速度大概多少？.md': '300mbps-vs-1000mbps-speed',
	'内存注入如何获取并调用内存中的内部函数？.md': 'memory-injection-call-internal-function',
	'Nuitka打包成exe文件，遇到unused-but-set-variable错误怎么办？.md': 'nuitka-unused-but-set-variable',
	'OBS直播录制视频的时候没有声音.md': 'obs-recording-no-audio',
	'pdf_crawler.pipelines.PdfPipeline'： 300是什么意思？.md': 'scrapy-pipeline-priority-300',
	'Playwright的launch_persistent_context，AI编程巨坑.md': 'playwright-launch-persistent-context-pitfalls',
	'pyside6圆角窗口与鼠标拖动.md': 'pyside6-rounded-window-drag',
	'Python GUI 应该怎么选？为什么要选择 PySide6？.md': 'why-pyside6-for-python-gui',
	'python脚本打包成exe可执行文件过程中的一些要点.md': 'python-to-exe-packaging-tips',
	'python脚本在命令行可以正确执行，在windows任务计划里却无法执行.md': 'python-script-fails-in-task-scheduler',
	'python实现dll注入的技术示例.md': 'python-dll-injection-example',
	'Python使用爬虫抓取网站上的美女图片.md': 'python-image-crawler-example',
	'QWindowsContext： OleInitialize() failed如何解决？.md': 'qt-oleinitialize-failed-fix',
	'然后主节点和工作节点如何通信的呢？.md': 'distributed-crawler-node-communication',
	'如果1个网站每秒请求数限制为100，那么我爬虫的并发量多少合适？.md': 'crawler-concurrency-for-100-rps-limit',
	'如何查看网站的响应头.md': 'how-to-view-http-response-headers',
	'如何动态调整并发量呢？.md': 'dynamic-concurrency-tuning',
	'如何获得目标函数的地址？.md': 'get-target-function-address',
	'如何看请求速率是以秒为单位还是以分钟为单位？.md': 'request-rate-unit-seconds-or-minutes',
	'如何使用asyncio和aiohttp实现大批量pdf文件的爬取任务？并控制并发量为200.md': 'asyncio-aiohttp-bulk-pdf-crawler',
	'如何在电视上播放家里电脑上的视频？.md': 'play-pc-video-on-tv',
	'如何下载钉钉直播回放？.md': 'download-dingtalk-live-replay',
	'Rust学习笔记以及我的一点想法.md': 'rust-learning-notes',
	'scrapy 都有哪些命令？.md': 'scrapy-commands-cheatsheet',
	'scrapy分布式爬虫主节点只需要安装redis吗？.md': 'scrapy-distributed-master-redis-setup',
	'scrapy没有终止和暂停的命令吗？.md': 'scrapy-pause-and-stop',
	'使用bat命令批量修改文件名中的一部分.md': 'bat-batch-rename-files',
	'使用异步提高并发，是否意味着使用的库必须支持异步才行？drissionpage支持异步吗？.md': 'async-library-support-drissionpage',
	'typecho获取随机文章（最新版）.md': 'typecho-random-posts',
	'Typecho将评论头像修改为QQ头像.md': 'typecho-qq-comment-avatar',
	'TYPECHO如何给网站增加夜间模式.md': 'typecho-dark-mode',
	'网页跳转到微信添加好友的三种代码实现方案.md': 'web-redirect-to-wechat-contact',
	'PySimpleGUI 报 no thread queue found 警告的解决办法.md': 'pysimplegui-write-event-value-thread-queue',
	'为7tec主题添加存档页面.md': '7tec-theme-archive-page',
	'windows系统shutdown命令在命令行中可以运行在bat批处理文件中却无法运行.md': 'windows-shutdown-fails-in-bat',
	'做 Windows 自动化，需要对系统做哪些设置.md': 'windows-automation-system-settings',
	'我电脑有10核心20线程，最大支持多少并发量？.md': 'max-concurrency-10c20t',
	'wordpress非插件自定义评论框模板.md': 'wordpress-custom-comment-form',
	'我要爬取并下载网页的pdf文件，如何利用分布式爬虫呢？.md': 'distributed-crawler-for-pdf-download',
	'我要爬取并下载网页的pdf文件，也需要用数据库吗？.md': 'pdf-crawler-database-need',
	'一段Python代码示范如何获取模块基址，再结合已知偏移计算目标函数地址.md': 'python-module-base-address-offset',
	'yinwangluojiediandiaozhengruoyujihuoyichangqingjishifankuiyibianzuochudiaozheng.md': 'activation-error-network-node-notice',
	'用Scrapy怎么写分布式爬虫呢？.md': 'scrapy-distributed-crawler-guide',
	'直播定时助手自动关机功能失效的解决办法.md': 'live-timer-auto-shutdown-fix',
	'只有1台电脑用scrapy+redis会提升爬取效率吗？.md': 'scrapy-redis-single-machine-benefit',
	'重新写了一下夜间模式的功能.md': 'dark-mode-rewrite',
	'重新自定义typecho头像.md': 'typecho-custom-avatar',
	'桌面自动化pywinauto-pyautogui要不要添加资源管理器检测+重启？.md': 'pywinauto-explorer-restart-watchdog',
	'自学5天，用Python编写了一个小工具.md': 'python-tool-in-5-days',
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
