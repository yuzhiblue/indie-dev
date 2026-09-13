#!/usr/bin/env python3
"""线上站点 SEO 体检：直接抓取真实 URL，校验状态码、canonical、OG、JSON-LD、RSS、robots、404、旧域跳转。

用法：
    python scripts/verify-live.py
    python scripts/verify-live.py --base https://7tec.cn
"""
from __future__ import annotations

import argparse
import json
import re
import urllib.error
import urllib.request
from urllib.parse import urljoin

DEFAULT_BASE = 'https://7tec.cn'
LD_RE = re.compile(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', re.S)
LOC_RE = re.compile(r'<loc>([^<]+)</loc>')
UA = 'Mozilla/5.0 (compatible; yuzhiblue-site-audit/1.0)'

failures: list[str] = []


class NoRedirect(urllib.request.HTTPRedirectHandler):
    """不自动跟随跳转，便于观察 301。"""

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


NO_REDIRECT_OPENER = urllib.request.build_opener(NoRedirect)


def check(label: str, ok: bool, detail: str = '') -> None:
    if ok:
        print(f'[PASS] {label}' + (f' ({detail})' if detail else ''))
    else:
        failures.append(label)
        print(f'[FAIL] {label}' + (f' -- {detail}' if detail else ''))


def info(label: str, detail: str = '') -> None:
    """仅提示，不计入通过 / 失败。"""
    print(f'[INFO] {label}' + (f' ({detail})' if detail else ''))


def fetch(url: str, timeout: int = 20, follow: bool = True):
    """返回 (status, body, headers)；网络层失败时 status 为 None。"""
    request = urllib.request.Request(url, headers={'User-Agent': UA})
    open_call = urllib.request.urlopen if follow else NO_REDIRECT_OPENER.open
    try:
        with open_call(request, timeout=timeout) as resp:
            return resp.status, resp.read().decode('utf-8', 'replace'), resp.headers
    except urllib.error.HTTPError as exc:
        try:
            body = exc.read().decode('utf-8', 'replace')
        except Exception:
            body = ''
        return exc.code, body, exc.headers
    except Exception as exc:
        return None, f'{type(exc).__name__}: {exc}', {}


def ld_types(html: str) -> list[str]:
    result = []
    for blob in LD_RE.findall(html):
        try:
            result.append(json.loads(blob).get('@type'))
        except Exception:
            result.append('INVALID_JSON')
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default=DEFAULT_BASE, help='站点根地址')
    args = parser.parse_args()
    base = args.base.rstrip('/') + '/'

    print(f'体检目标：{base}\n')

    # ---------- 首页 ----------
    status, home, _ = fetch(base)
    check('首页可访问', status == 200, f'HTTP {status}')
    canonical = re.findall(r'<link rel="canonical" href="([^"]+)"', home)
    check('首页 canonical 是主域绝对地址',
          bool(canonical) and canonical[0].rstrip('/') == base.rstrip('/'),
          str(canonical))
    check('首页 JSON-LD = WebSite + Person',
          set(ld_types(home)) == {'WebSite', 'Person'}, str(ld_types(home)))
    check('首页含 og:image', 'og:image' in home)
    check('首页无 dev.7tec.cn 残留', 'dev.7tec.cn' not in home)

    # ---------- 静态文件 ----------
    for path in ['robots.txt', 'ads.txt', 'favicon.svg', 'og-default.png']:
        code, _, _ = fetch(urljoin(base, path))
        check(f'/{path} 可访问', code == 200, f'HTTP {code}')

    _, robots, _ = fetch(urljoin(base, 'robots.txt'))
    check('robots.txt 声明主域 sitemap', 'https://7tec.cn/sitemap-index.xml' in robots)

    # ---------- sitemap ----------
    code, index_xml, _ = fetch(urljoin(base, 'sitemap-index.xml'))
    check('sitemap-index.xml 可访问', code == 200, f'HTTP {code}')
    urls: list[str] = []
    for loc in LOC_RE.findall(index_xml):
        _, sub_xml, _ = fetch(loc)
        urls += LOC_RE.findall(sub_xml)
    check('sitemap 含 URL', len(urls) > 10, f'{len(urls)} 条')
    wrong = [u for u in urls if not u.startswith('https://7tec.cn')]
    check('sitemap 全部指向主域', not wrong, str(wrong[:3]))
    check('sitemap 不含分页页 / 标签页',
          not any('/blog/page/' in u or '/blog/tag/' in u for u in urls))

    # ---------- RSS ----------
    code, rss, _ = fetch(urljoin(base, 'rss.xml'))
    check('rss.xml 可访问', code == 200, f'HTTP {code}')
    check('rss.xml 含 item', '<item>' in rss, f'{rss.count("<item>")} 条')
    check('rss.xml 使用主域', 'https://7tec.cn/' in rss)

    # ---------- 文章页 ----------
    post_url = next((u for u in urls if '/blog/' in u and u.rstrip('/').rsplit('/', 1)[-1] != 'blog'), None)
    if post_url:
        code, html, _ = fetch(post_url)
        check(f'文章页可访问', code == 200, f'{post_url} HTTP {code}')
        check('文章页 JSON-LD 含 BlogPosting', 'BlogPosting' in ld_types(html), str(ld_types(html)))
        check('文章页 canonical 指向自身',
              any(c.rstrip('/') == post_url.rstrip('/')
                  for c in re.findall(r'<link rel="canonical" href="([^"]+)"', html)))
        check('文章页含 og:image', 'og:image' in html)
    else:
        check('sitemap 中能找到文章 URL', False)

    # ---------- 项目页 ----------
    proj_url = next((u for u in urls if '/projects/' in u and 'page' not in u
                     and u.rstrip('/').rsplit('/', 1)[-1] != 'projects'), None)
    if proj_url:
        code, html, _ = fetch(proj_url)
        check('项目页可访问', code == 200, f'{proj_url} HTTP {code}')
        check('项目页 JSON-LD 含 SoftwareApplication',
              'SoftwareApplication' in ld_types(html), str(ld_types(html)))
        check('项目页含相关项目互链', 'class="related-item"' in html)
    else:
        check('sitemap 中能找到项目 URL', False)

    # ---------- 404 ----------
    code, _, _ = fetch(urljoin(base, 'this-page-should-not-exist-9f3a/'))
    check('不存在的路径返回 404', code == 404, f'HTTP {code}')

    # ---------- 旧域名 ----------
    code, _, headers = fetch('https://dev.7tec.cn/', follow=False)
    location = headers.get('Location', '') if headers else ''
    if code is None:
        print('[PASS] dev.7tec.cn 已不可访问（旧域已停用）')
    elif code in (301, 302, 307, 308):
        check('dev.7tec.cn 跳转到主域', '7tec.cn' in location, f'HTTP {code} -> {location}')
    else:
        check('dev.7tec.cn 应跳转或停用', False, f'HTTP {code}（仍是可访问副本，有重复内容风险）')

    # ---------- URL 规范化（建议项，不计入失败）----------
    print()
    print('URL 规范化检查（建议项）：')

    code, _, _ = fetch('http://7tec.cn/', follow=False)
    if code in (301, 302, 307, 308):
        info('HTTP 已跳转 HTTPS', f'HTTP {code}')
    elif code == 200:
        info('HTTP 未跳转 HTTPS', 'http://7tec.cn 直接返回 200，建议在托管平台开启强制 HTTPS')
    else:
        info('HTTP 访问结果', f'HTTP {code}')

    _, _, home_headers = fetch(base, follow=False)
    hsts = home_headers.get('Strict-Transport-Security', '') if home_headers else ''
    if hsts:
        info('已启用 HSTS', hsts)
    else:
        info('未启用 HSTS', '可选：HTTPS 稳定运行后再开，且首次应使用较短的 max-age')

    code, _, _ = fetch('https://www.7tec.cn/', follow=False)
    if code is None:
        info('www 子域未解析', '如需兼顾 www 访问，建议加 DNS 记录并 301 到裸域')
    else:
        info('www 子域响应', f'HTTP {code}')

    code, _, _ = fetch(base + 'blog/why-pyside6-for-python-gui', follow=False)
    if code == 200:
        info('无尾斜杠路径直接返回 200', '建议平台层 301 到带尾斜杠版本（canonical 已指向正确地址，风险低）')
    else:
        info('无尾斜杠路径', f'HTTP {code}')

    print()
    if failures:
        print(f'结果：{len(failures)} 项未通过')
        for item in failures:
            print(f'  - {item}')
    else:
        print('结果：全部通过')
    return 0 if not failures else 1


if __name__ == '__main__':
    raise SystemExit(main())
