/**
 * EdgeOne Makers 中间件：URL 规范化 + 旧拼音地址真 301
 *
 * 背景一（斜杠）：全站 canonical / og:url / sitemap 均为带尾斜杠形式
 * （astro.config.mjs: trailingSlash 'always'），但 EdgeOne 对 /path 与
 * /path/ 都返回 200，两种形式会被搜索引擎当成重复页面自行挑选规范网址
 * （obstimer 就曾因此被 Google 改选为不带斜杠的地址）。
 * canonical 只是建议、不是指令，这里用 301 强制统一到带斜杠形式。
 *
 * 背景二（旧拼音）：博客早期 URL 是拼音文件名，后改为语义化英文 slug，
 * astro 的 redirects 配置只生成 meta 刷新 + noindex 的 stub 页（不是真 301），
 * 对百度等引擎不友好。这里把 /blog/<旧拼音> 升级为真 301，数据源为
 * src/data/redirects.mjs（apply-slugs.mjs 生成，保持单一数据源）。
 * stub 页保留作为中间件失效时的兜底。
 *
 * matcher 只匹配内容路径；静态资源（/_astro/*、/images/*、
 * /projects/<项目>/cover.png、favicon、rss.xml、sitemap 等）不进入函数，
 * 避免消耗 Edge Functions 配额。
 */
import { blogRedirects } from './src/data/redirects.mjs';

/** 旧拼音 URL → 新slug 的真 301 映射（同时兼容带/不带尾斜杠两种来源形式） */
const LEGACY_REDIRECTS = new Map();
for (const { from, to } of blogRedirects) {
	const dest = to.endsWith('/') ? to : `${to}/`;
	LEGACY_REDIRECTS.set(from, dest);
	LEGACY_REDIRECTS.set(`${from}/`, dest);
}

export function middleware(context) {
	const { request, redirect, next } = context;
	const url = new URL(request.url);
	const { pathname, search, origin } = url;

	// 1. 旧拼音 URL：真 301 到新地址（保留查询串）
	const legacy = LEGACY_REDIRECTS.get(pathname);
	if (legacy) {
		return redirect(origin + legacy + search, 301);
	}

	// 2. /index.html → /（首页唯一化）
	if (pathname === '/index.html') {
		return redirect(origin + '/' + search, 301);
	}

	// 3. /path/index.html → /path/
	if (pathname.endsWith('/index.html')) {
		return redirect(origin + pathname.slice(0, -'index.html'.length) + search, 301);
	}

	// 4. 带扩展名的是静态资源（.png/.css/.js/.xml/.svg/.txt/.html 等），放行
	if (/\.[^/]+$/.test(pathname)) {
		return next();
	}

	// 5. 已带尾斜杠的规范形式，放行
	if (pathname.endsWith('/')) {
		return next();
	}

	// 6. 其余内容路径：301 到带斜杠形式（保留查询串）
	return redirect(origin + pathname + '/' + search, 301);
}

export const config = {
	matcher: [
		'/blog/:path*',
		'/projects/:path*',
		'/about',
		'/about/:path*',
		'/privacy',
		'/privacy/:path*',
	],
};
