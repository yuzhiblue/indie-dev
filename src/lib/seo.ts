/**
 * 结构化数据（JSON-LD）工厂。
 * 这里只负责产出纯对象，序列化与注入由 BaseLayout 统一处理。
 */

export const SITE_NAME = 'yuzhiblue';
export const SITE_URL = 'https://7tec.cn';
export const AUTHOR_NAME = 'yuzhiblue';
export const AUTHOR_TITLE = '独立开发者';

export const SOCIAL_PROFILES = [
  'https://github.com/yuzhiblue',
  'https://x.com/yuzhiblue',
];

export type JsonLd = Record<string, unknown>;

const resolveSite = (site?: URL) => site ?? new URL(SITE_URL);
const abs = (path: string, site?: URL) => new URL(path, resolveSite(site)).toString();

/** 站点级信息，用于首页 */
export function websiteSchema(site?: URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: abs('/', site),
    description: '独立开发者 yuzhiblue 的项目作品与开发笔记',
    inLanguage: 'zh-CN',
    publisher: { '@type': 'Person', name: AUTHOR_NAME },
  };
}

/** 作者信息 */
export function personSchema(site?: URL): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: AUTHOR_NAME,
    url: abs('/about', site),
    jobTitle: AUTHOR_TITLE,
    description: '专注 Windows 桌面自动化与直播定时工具开发',
    sameAs: SOCIAL_PROFILES,
  };
}

/** 博客文章 */
export function blogPostingSchema(
  post: {
    id: string;
    data: {
      title: string;
      description: string;
      pubDate: Date;
      updatedDate?: Date;
      tags: string[];
      coverImage?: string;
    };
  },
  site?: URL,
): JsonLd {
  const url = abs(`/blog/${post.id}`, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: post.data.pubDate.toISOString(),
    dateModified: (post.data.updatedDate ?? post.data.pubDate).toISOString(),
    inLanguage: 'zh-CN',
    keywords: post.data.tags.join(', '),
    author: { '@type': 'Person', name: AUTHOR_NAME, url: abs('/about', site) },
    publisher: { '@type': 'Person', name: AUTHOR_NAME },
    ...(post.data.coverImage ? { image: abs(post.data.coverImage, site) } : {}),
  };
}

/** 项目（软件应用） */
export function softwareApplicationSchema(
  project: {
    id: string;
    data: {
      title: string;
      description: string;
      tags: string[];
      coverImage?: string;
      download?: string;
    };
  },
  site?: URL,
): JsonLd {
  const url = abs(`/projects/${project.id}`, site);
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.data.title,
    description: project.data.description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Windows 10, Windows 11',
    inLanguage: 'zh-CN',
    author: { '@type': 'Person', name: AUTHOR_NAME, url: abs('/about', site) },
    ...(project.data.coverImage ? { image: abs(project.data.coverImage, site) } : {}),
    ...(project.data.download ? { downloadUrl: project.data.download } : {}),
  };
}

/** 列表 / 归档页 */
export function collectionSchema(
  opts: { name: string; description: string; path: string },
  site?: URL,
): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: abs(opts.path, site),
    inLanguage: 'zh-CN',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: abs('/', site) },
  };
}
