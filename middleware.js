/**
 * EdgeOne Makers 中间件：URL 规范化（不带斜杠 → 带斜杠 301）
 *
 * 背景：全站 canonical / og:url / sitemap 均为带尾斜杠形式
 * （astro.config.mjs: trailingSlash 'always'），但 EdgeOne 对 /path 与
 * /path/ 都返回 200，两种形式会被搜索引擎当成重复页面自行挑选规范网址
 * （obstimer 就曾因此被 Google 改选为不带斜杠的地址）。
 * canonical 只是建议、不是指令，本中间件用 301 强制统一到带斜杠形式。
 *
 * matcher 只匹配内容路径；静态资源（/_astro/*、/images/*、
 * /projects/<项目>/cover.png、favicon、rss.xml、sitemap 等）不进入函数，
 * 避免消耗 Edge Functions 配额。
 */
export function middleware(context) {
	const { request, redirect, next } = context;
	const url = new URL(request.url);
	const { pathname, search, origin } = url;

	// /index.html → /（首页唯一化）
	if (pathname === '/index.html') {
		return redirect(origin + '/' + search, 301);
	}

	// /path/index.html → /path/
	if (pathname.endsWith('/index.html')) {
		return redirect(origin + pathname.slice(0, -'index.html'.length) + search, 301);
	}

	// 带扩展名的是静态资源（.png/.css/.js/.xml/.svg/.txt/.html 等），放行
	if (/\.[^/]+$/.test(pathname)) {
		return next();
	}

	// 已带尾斜杠的规范形式，放行
	if (pathname.endsWith('/')) {
		return next();
	}

	// 其余内容路径：301 到带斜杠形式（保留查询串）
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
