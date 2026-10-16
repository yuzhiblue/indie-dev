/**
 * 博客文件改名：拼音文件名 → 汉字（依据文章 frontmatter 标题）
 *
 * 背景：站点 URL 规则（astro glob loader，generateIdDefault）
 *   - frontmatter 有 slug  → URL = slug
 *   - frontmatter 无 slug  → URL = githubSlug(文件名)
 * 因此对「无 slug」的文件，先把当前 URL（旧拼音文件名）固定进 slug 字段，再改文件名，
 * 保证已收录的线上链接 100% 不变；有 slug 的文件直接改名即可。
 *
 * 另外会把 scripts/apply-slugs.mjs 里的 SLUG_MAP / DRAFT_LIST 文件名同步为新名字，
 * 保持该历史脚本可重跑。
 *
 * 用法：
 *   node scripts/rename-blog-files.mjs            # 预演，只打印不落盘
 *   node scripts/rename-blog-files.mjs --apply    # 落盘
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const APPLY_SCRIPT = path.resolve('scripts/apply-slugs.mjs');
const APPLY = process.argv.includes('--apply');

/** 标题直译不合适、需结合正文人工斟酌的文件名覆盖 */
const NAME_OVERRIDES = {
	// 标题本身就是一句英文报错，结合正文（PySimpleGUI 加 finalize=True 解决）起中文名
	'warningwindowwriteeventvaluenothreadqueue.md': 'PySimpleGUI 报 no thread queue found 警告的解决办法',
	// 标题里的 “1/4” 含非法字符 /，按文意改写
	'14deshijianyonglaidizhiyuwangyoushenmeliqixuexi.md': '四分之一的时间用来抵制欲望，有什么力气学习',
};

/** Windows 文件名非法字符 → 替换表（其余情况直接删除） */
const CHAR_MAP = {
	':': '：',
	'?': '？',
	'/': '-',
	'\\': '-',
	'*': '',
	'"': '',
	'<': '',
	'>': '',
	'|': '',
};

function sanitize(name) {
	let out = '';
	for (const ch of name) {
		out += ch in CHAR_MAP ? CHAR_MAP[ch] : ch;
	}
	out = out.replace(/\s+/g, ' ').trim();
	out = out.replace(/[. ]+$/, ''); // Windows 不允许以点/空格结尾
	out = out.replace(/^['"`]+|['"`]+$/g, ''); // 去掉首尾直引号（标题自带引号时）
	return out;
}

function getFrontmatter(src) {
	const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	return m ? m[1] : null;
}

function pinSlug(src, slug) {
	// 在 frontmatter 结束行之前插入 slug 字段，保持原有行尾风格
	const eol = src.includes('\r\n') ? '\r\n' : '\n';
	const lines = src.split(/\r?\n/);
	if (lines[0].trim() !== '---') return { src, ok: false };
	const end = lines.indexOf('---', 1);
	if (end === -1) return { src, ok: false };
	lines.splice(end, 0, `slug: ${slug}`);
	return { src: lines.join(eol), ok: true };
}

const allFiles = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const kept = []; // 已是汉字名、不改的
const plan = []; // { oldFile, newFile, title, pinSlug }
const problems = [];
const usedNames = new Set(allFiles);

for (const file of allFiles) {
	// 只处理纯拼音/小写字母数字名；已是汉字或混合可读名的保持不动
	if (!/^[a-z0-9]+\.md$/.test(file)) {
		kept.push(file);
		continue;
	}
	const src = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
	const fm = getFrontmatter(src);
	if (fm === null) {
		problems.push(`${file}: 没有 frontmatter，跳过`);
		continue;
	}
	const titleLine = fm.split(/\r?\n/).find((l) => /^title\s*:/.test(l));
	if (!titleLine) {
		problems.push(`${file}: 没有 title，跳过`);
		continue;
	}
	const title = titleLine.replace(/^title\s*:\s*/, '').replace(/^["'“”]|["'“”]$/g, '').trim();
	if (!title) {
		problems.push(`${file}: title 为空，跳过`);
		continue;
	}
	const base = NAME_OVERRIDES[file] ?? sanitize(title);
	if (!base) {
		problems.push(`${file}: 标题清洗后为空，跳过`);
		continue;
	}
	if (!/[\u4e00-\u9fa5]/.test(base)) {
		problems.push(`${file}: 新名字不含汉字，请人工确认 → "${base}"`);
		continue;
	}
	let newFile = `${base}.md`;
	// 兜底去重（含已被占用的名字）
	if (usedNames.has(newFile) && newFile !== file) {
		let i = 2;
		while (usedNames.has(`${base}-${i}.md`)) i++;
		newFile = `${base}-${i}.md`;
		problems.push(`${file}: 名字冲突，改为 ${newFile}`);
	}
	usedNames.add(newFile);

	const hasSlug = /^slug\s*:/m.test(fm);
	plan.push({ oldFile: file, newFile, title, pinSlug: !hasSlug });
}

// 预演输出
console.log(`模式：${APPLY ? '落盘' : '预演'}`);
console.log(`保持不动的文件（已是汉字名）：${kept.length}`);
for (const f of kept) console.log(`  = ${f}`);
console.log(`\n计划改名：${plan.length}（其中需固定 slug 保 URL 不变：${plan.filter((p) => p.pinSlug).length}）\n`);
for (const p of plan) {
	console.log(`  ${p.oldFile}`);
	console.log(`    → ${p.newFile}${p.pinSlug ? `   [pin slug: ${p.oldFile.replace(/\.md$/, '')}]` : ''}`);
}

if (problems.length) {
	console.log(`\n问题（${problems.length}）：`);
	for (const p of problems) console.log(`  - ${p}`);
}

if (!APPLY) {
	console.log('\n（预演模式未落盘。加 --apply 执行。）');
	process.exit(problems.length ? 1 : 0);
}

// ---- 落盘 ----
let renamed = 0;
let pinned = 0;
for (const p of plan) {
	const oldPath = path.join(BLOG_DIR, p.oldFile);
	let src = fs.readFileSync(oldPath, 'utf8');
	if (p.pinSlug) {
		const r = pinSlug(src, p.oldFile.replace(/\.md$/, ''));
		if (!r.ok) throw new Error(`${p.oldFile}: slug 固定失败`);
		src = r.src;
		pinned++;
	}
	fs.writeFileSync(oldPath, src, 'utf8');
	fs.renameSync(oldPath, path.join(BLOG_DIR, p.newFile));
	renamed++;
}

// 同步 apply-slugs.mjs 中的文件名键
let scriptSrc = fs.readFileSync(APPLY_SCRIPT, 'utf8');
let keyUpdates = 0;
for (const p of plan) {
	const from = `'${p.oldFile}'`;
	const to = `'${p.newFile}'`;
	if (scriptSrc.includes(from)) {
		scriptSrc = scriptSrc.split(from).join(to);
		keyUpdates++;
	}
}
fs.writeFileSync(APPLY_SCRIPT, scriptSrc, 'utf8');

console.log(`\n完成：改名 ${renamed} 个，固定 slug ${pinned} 个，apply-slugs.mjs 同步文件名键 ${keyUpdates} 处`);
console.log('未提交，可用 git status / git diff 复核。');
