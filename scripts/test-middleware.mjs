/**
 * middleware.js（EdgeOne 斜杠规范化 301）的本地逻辑测试
 * 用法：node scripts/test-middleware.mjs
 */
import { middleware } from '../middleware.js';

const ORIGIN = 'https://7tec.cn';

function run(path) {
	const context = {
		request: { url: ORIGIN + path },
		redirect: (url, status) => ({ type: 'redirect', url, status }),
		next: () => ({ type: 'next' }),
	};
	return middleware(context);
}

const cases = [
	// [输入路径, 期望动作, 期望目标(仅 redirect)]
	['/blog/directx-repair-tools', 'redirect', 'https://7tec.cn/blog/directx-repair-tools/'],
	['/projects/obstimer', 'redirect', 'https://7tec.cn/projects/obstimer/'],
	['/about', 'redirect', 'https://7tec.cn/about/'],
	['/privacy', 'redirect', 'https://7tec.cn/privacy/'],
	['/blog', 'redirect', 'https://7tec.cn/blog/'],
	['/projects', 'redirect', 'https://7tec.cn/projects/'],
	['/blog/tag/Python', 'redirect', 'https://7tec.cn/blog/tag/Python/'],
	['/blog/page/2', 'redirect', 'https://7tec.cn/blog/page/2/'],
	['/projects/obstimer?from=zhihu', 'redirect', 'https://7tec.cn/projects/obstimer/?from=zhihu'],
	['/index.html', 'redirect', 'https://7tec.cn/'],
	['/blog/slug/index.html', 'redirect', 'https://7tec.cn/blog/slug/'],
	// 放行：规范形式 / 静态资源 / 首页 / 404 文档
	['/blog/directx-repair-tools/', 'next', null],
	['/projects/obstimer/', 'next', null],
	['/', 'next', null],
	['/rss.xml', 'next', null],
	['/sitemap-0.xml', 'next', null],
	['/favicon.ico', 'next', null],
	['/avatar.svg', 'next', null],
	['/og-default.png', 'next', null],
	['/projects/doutimer/cover.png', 'next', null],
	['/projects/doutimer/1.png', 'next', null],
	['/images/blog/xxx.png', 'next', null],
	['/_astro/abc123.css', 'next', null],
	['/404.html', 'next', null],
	// 旧拼音 URL：真 301 到新 slug（不带斜杠和带斜杠两种来源形式都要覆盖）
	['/blog/githubwangsutaimandabukaizenmeban', 'redirect', 'https://7tec.cn/blog/github-slow-connection-fix/'],
	['/blog/githubwangsutaimandabukaizenmeban/', 'redirect', 'https://7tec.cn/blog/github-slow-connection-fix/'],
	['/blog/cssdisplayflexshuxing', 'redirect', 'https://7tec.cn/blog/css-display-flex/'],
	['/blog/cssdisplayflexshuxing/', 'redirect', 'https://7tec.cn/blog/css-display-flex/'],
	['/blog/gitdejiandanyongfa?src=baidu', 'redirect', 'https://7tec.cn/blog/git-basics/?src=baidu'],
	// 目标文章已删除的旧链接：301 到博客列表
	['/blog/hello-world', 'redirect', 'https://7tec.cn/blog/'],
	['/blog/hello-world/', 'redirect', 'https://7tec.cn/blog/'],
];

let pass = 0;
let fail = 0;
for (const [path, wantType, wantUrl] of cases) {
	const r = run(path);
	const ok = r.type === wantType && (wantType === 'next' || (r.url === wantUrl && r.status === 301));
	if (ok) {
		pass++;
	} else {
		fail++;
		console.log(`FAIL ${path}\n  期望: ${wantType}${wantUrl ? ' ' + wantUrl : ''}\n  实际: ${r.type}${r.url ? ' ' + r.url + ' (' + r.status + ')' : ''}`);
	}
}
console.log(`\n${pass}/${cases.length} 通过${fail ? '，' + fail + ' 失败' : ''}`);
process.exit(fail ? 1 : 0);
