/**
 * 博客标签治理
 *   将原有 3 个巨型桶（杂记 / 技术 / 创业项目）重写为按主题的可导航标签。
 *   写入 frontmatter 的 `tags` 字段（覆盖旧值），不改文件名。
 *
 * 用法：
 *   node scripts/apply-tags.mjs            # 预演，打印标签分布
 *   node scripts/apply-tags.mjs --apply    # 落盘
 *
 * 评分：标题(×3) + description/tags(×2) + 正文前 3000 字(×1) 拼接后，
 * 对每个规范标签统计命中关键词的权重和；权重 >= 2 才采纳，单篇最多 3 个。
 * 强信号关键词（产品名 / 框架名，权重 2）命中即采纳；泛关键词需 2 个才采纳。
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const APPLY = process.argv.includes('--apply');

/** 规范标签 + 关键词权重表。w=2 为强信号，命中即采纳；w=1 为泛词，需累计到 2。 */
const TAXONOMY = [
	{
		name: '直播自动化',
		keywords: [
			['wxtimer', 2], ['doutimer', 2], ['kwaitimer', 2], ['obstimer', 2], ['直播伴侣', 2],
			['直播', 1], ['视频号', 1], ['抖音', 1], ['快手', 1], ['obs', 1], ['推流', 1],
			['开播', 1], ['回放', 1], ['直播间', 1], ['带货', 1], ['定时助手', 1],
		],
	},
	{
		name: 'Windows',
		keywords: [
			['pywinauto', 2], ['uia', 2],
			['windows', 1], ['任务计划', 1], ['注册表', 1], ['批处理', 1], ['bat', 1],
			['桌面', 1], ['右键', 1], ['资源管理器', 1], ['系统设置', 1], ['自动关机', 1], ['关机', 1],
		],
	},
	{
		name: 'PySide6',
		keywords: [
			['pyside', 2], ['qt', 2], ['qml', 2],
			['gui', 1], ['圆角', 1], ['控件', 1], ['信号槽', 1], ['窗口', 1], ['界面', 1], ['桌面应用', 1],
		],
	},
	{
		name: 'Nuitka',
		keywords: [
			['nuitka', 2], ['pyinstaller', 2],
			['打包', 1], ['编译', 1], ['加壳', 1], ['exe', 1],
		],
	},
	{
		name: 'Cloudflare',
		keywords: [
			['cloudflare', 2], ['workers', 2], ['wrangler', 2],
			['kv', 1], ['d1', 1], ['边缘', 1], ['serverless', 1], ['cdn', 1], ['网关', 1],
		],
	},
	{
		name: '支付',
		keywords: [
			['支付宝', 2], ['微信支付', 2], ['epay', 2], ['收款码', 2], ['收银码', 2],
			['支付', 1], ['费率', 1], ['商户', 1], ['银行卡', 1], ['pos', 1], ['信用卡', 1],
			['到账', 1], ['提现', 1], ['授权码', 1], ['聚合', 1], ['收银', 1],
		],
	},
	{
		name: 'Python',
		keywords: [
			['python', 2],
			['脚本', 1], ['装饰器', 1], ['模块', 1], ['函数', 1], ['数据结构', 1], ['正则', 1], ['pip', 1], ['虚拟环境', 1], ['语法', 1],
		],
	},
	{
		name: '并发编程',
		keywords: [
			['并发', 1], ['线程', 1], ['异步', 1], ['asyncio', 1], ['gil', 1], ['协程', 1],
			['进程', 1], ['线程池', 1], ['并行', 1], ['多进程', 1], ['多线程', 1],
		],
	},
	{
		name: '爬虫',
		keywords: [
			['scrapy', 2], ['playwright', 2], ['selenium', 2],
			['爬虫', 1], ['抓取', 1], ['采集', 1], ['分布式', 1], ['反爬', 1], ['网页抓取', 1],
		],
	},
	{
		name: '数据库',
		keywords: [
			['mysql', 2], ['redis', 2], ['sqlite', 2], ['postgres', 2], ['django', 2],
			['sql', 1], ['数据库', 1], ['orm', 1], ['索引', 1], ['查询', 1], ['缓存', 1],
		],
	},
	{
		name: '前端',
		keywords: [
			['astro', 2], ['vue', 2], ['react', 2], ['typecho', 2], ['wordpress', 2],
			['建站', 1], ['seo', 1], ['前端', 1], ['主题', 1], ['博客系统', 1], ['nginx', 1], ['静态', 1], ['网页', 1],
		],
	},
	{
		name: '开发工具',
		keywords: [
			['git', 2], ['github', 2], ['docker', 2], ['rust', 2], ['linux', 2], ['bash', 2], ['shell', 2],
			['终端', 1], ['命令行', 1], ['vscode', 1], ['curl', 1], ['命令', 1],
		],
	},
	{
		name: '职场随笔',
		keywords: [
			['销售', 1], ['管理', 1], ['团队', 1], ['职场', 1], ['创业', 1], ['营销', 1], ['心态', 1],
			['认知', 1], ['情感', 1], ['成长', 1], ['投资', 1], ['股票', 1], ['随笔', 1], ['思考', 1],
			['观点', 1], ['老板', 1], ['员工', 1], ['面试', 1], ['简历', 1], ['跳槽', 1], ['副业', 1], ['人脉', 1], ['沟通', 1],
		],
	},
];

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

function parseFrontmatter(src) {
	const lines = src.split(/\r?\n/);
	if (lines[0].trim() !== '---') return null;
	const end = lines.indexOf('---', 1);
	if (end === -1) return null;
	const fm = lines.slice(1, end).join('\n');
	const body = lines.slice(end + 1).join('\n');
	const get = (key) => {
		const m = fm.match(new RegExp(`^${key}\\s*:[\\s\\S]*?(?=\\n[A-Za-z]|$)`, 'm'));
		return m ? m[0].replace(new RegExp(`^${key}\\s*:\\s*`), '').trim() : '';
	};
	const title = get('title');
	const description = get('description');
	const draftRaw = get('draft');
	const draft = draftRaw === 'true';
	const tagsRaw = get('tags');
	const tags = tagsRaw.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
	return { title, description, draft, tags, body };
}

function assignTags(file, fm) {
	const haystack = [
		(fm.title + ' ').repeat(3),
		(fm.description + ' ').repeat(2),
		(fm.tags.join(' ') + ' ').repeat(2),
		fm.body.slice(0, 3000),
	].join(' ').toLowerCase();

	const scored = [];
	for (const tag of TAXONOMY) {
		let score = 0;
		for (const [kw, w] of tag.keywords) {
			if (haystack.includes(kw.toLowerCase())) score += w;
		}
		if (score >= 2) scored.push([tag.name, score]);
	}
	scored.sort((a, b) => b[1] - a[1]);

	let tags;
	if (scored.length > 0) {
		tags = scored.slice(0, 3).map((s) => s[0]);
	} else if (!fm.draft) {
		// 可见文章至少要有标签：退回单一最高分词，实在没有则归为「技术」
		tags = ['技术'];
	} else {
		tags = ['职场随笔'];
	}
	return tags;
}

const allFiles = fs.readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));

let changed = 0;
const distribution = {};
const visibleDistribution = {};
const problems = [];

for (const file of allFiles) {
	const full = path.join(BLOG_DIR, file);
	const original = fs.readFileSync(full, 'utf8');
	const fm = parseFrontmatter(original);
	if (!fm) {
		problems.push(`${file}: 无法解析 frontmatter`);
		continue;
	}
	const newTags = assignTags(file, fm);
	const value = '[' + newTags.map((t) => `'${t}'`).join(', ') + ']';
	const result = setFields(original, { tags: value });
	if (result.skipped.length) {
		problems.push(`${file}: ${result.skipped.join(', ')} 处理失败`);
		continue;
	}
	if (result.added.includes('tags') || result.updated.includes('tags')) {
		changed++;
		for (const t of newTags) distribution[t] = (distribution[t] || 0) + 1;
		if (!fm.draft) for (const t of newTags) visibleDistribution[t] = (visibleDistribution[t] || 0) + 1;
		if (APPLY) fs.writeFileSync(full, result.src, 'utf8');
	}
}

console.log(`模式：${APPLY ? '落盘' : '预演'}`);
console.log(`写入/更新 tags：${changed} / ${allFiles.length}`);
console.log('\n标签分布（命中文章数，含草稿）：');
const sorted = Object.entries(distribution).sort((a, b) => b[1] - a[1]);
for (const [tag, n] of sorted) console.log(`  ${tag.padEnd(8)} ${n}`);

console.log('\n可见文章（非 draft）标签分布 —— 决定导航栏：');
const visSorted = Object.entries(visibleDistribution).sort((a, b) => b[1] - a[1]);
if (visSorted.length === 0) console.log('  （无）');
for (const [tag, n] of visSorted) console.log(`  ${tag.padEnd(8)} ${n}`);

if (APPLY) {
	console.log('\n已落盘。');
} else {
	console.log('\n（预演模式未落盘。加 --apply 执行。）');
}

if (problems.length) {
	console.log('\n问题：');
	for (const p of problems) console.log('  - ' + p);
	process.exitCode = 1;
}
