/**
 * 博客内容治理：按「技术词 vs 无关词」加权打分判定
 *
 * 判定范围：标题(权重3) > 摘要(权重2) > 正文前 3000 字(权重1)
 * 命中去重后按权重累加，不按出现次数累加（避免长文刷分）
 *
 *   dropScore > keepScore  → 下线（写入 draft: true）
 *   keepScore > dropScore  → 保留
 *   两者相等或均为 0      → 存疑，默认保留并在报告中单列
 *
 * 用法：
 *   node scripts/classify-blog.mjs [报告路径]        预演，只出报告
 *   node scripts/classify-blog.mjs --apply           写入 draft: true
 *   node scripts/classify-blog.mjs --apply --review  写入，并把「存疑」也一并下线
 *
 * 回滚：git checkout -- src/content/blog/
 */
import fs from 'node:fs';
import path from 'node:path';

const BLOG_DIR = path.resolve('src/content/blog');
const BODY_SCAN = 3000; // 正文只扫开头，足以定主题

const apply = process.argv.includes('--apply');
const dropReview = process.argv.includes('--review');

/** 保留：与本站点定位（Windows 桌面自动化 / 直播工具 / Web 全栈）相关 */
const KEEP = [
  // 本厂产品
  '定时助手', '直播伴侣', 'wxtimer', 'doutimer', 'kwaitimer', 'obstimer',
  'obs', '直播', '开播', '下播', '推流', '录制', '视频号', '快手', '抖音',
  'obs studio', 'rtmp', '码率', '分辨率', 'ffmpeg',
  // 桌面 / Windows 自动化
  'windows', 'win32', 'win11', 'win10', '注册表', '批处理', 'bat', 'cmd',
  'uia', '自动化', '按键', '模拟', '鼠标', '键盘', '句柄', '窗口', '置顶',
  'hook', '注入', 'dll', 'api', 'sdk', 'nuitka', '打包', 'pyinstaller',
  'pyside', 'pyqt', 'qt', 'tkinter', 'pywinauto', 'uiautomation', 'selenium',
  // 语言 / 并发
  'python', 'django', 'flask', 'fastapi', 'requests', 'asyncio', '协程',
  '并发', '线程', '多线程', '单线程', '异步', '进程', '多进程', '线程池',
  '锁', 'gil', '队列', 'cpu', '内存', '垃圾回收',
  'javascript', 'typescript', 'node', 'npm', 'yarn', 'pnpm', 'vite', 'webpack',
  'vue', 'react', 'astro', 'svelte', '前端', 'css', 'html', 'dom', 'sass',
  // 后端 / 基础设施
  'linux', 'ubuntu', 'centos', 'debian', 'nginx', 'apache', 'docker', '容器',
  'mysql', 'postgres', 'redis', 'sqlite', 'mongodb', 'sql', '数据库', '索引',
  '缓存', '队列', '服务器', '宝塔', '面板', 'ssh', 'ftp',
  'git', 'github', 'gitlab', 'webhook', 'ci', 'cd',
  'cloudflare', 'workers', 'kv', 'd1', 'serverless', '域名', 'dns', '备案',
  'ssl', 'https', 'cdn', 'nginx', '反向代理',
  // Web 建站（历史 Typecho / WP / 35dir 类内容属于技术资产）
  'php', 'typecho', 'wordpress', 'zblog', 'emlog', '主题', '插件', '伪静态',
  '缩略图', '模板', 'seo', 'sitemap', 'robots', 'markdown', 'mdx',
  // 通用技术
  '爬虫', 'xpath', '正则', 'json', 'xml', '算法', '数据结构', '代码', '编程',
  '开发', '调试', '编译', '部署', '报错', '异常', 'bug', '性能优化',
  '命令行', '终端', 'shell', 'bash', '脚本', '函数', '变量', '类', '接口',
];

/** 下线：与站点定位无关的历史内容 */
const DROP = [
  // 支付 / 收单（历史主业残留）
  'pos机', 'pos', 'mpos', '支付', '收款码', '聚合', '费率', '259号文', '259',
  '259文件', '信贷', '借条', '信用卡', '刷卡', '养卡', '提额', '银联', '银行',
  '收银', '扫码', '钱包', '金融', '收单', '商户', '结算', '跳码', '一机一码',
  '瑞升达', '大趋', '拉卡拉', '通联', '嘉联', '海科', '快钱', '付临门',
  // 投资 / 理财
  '理财', '基金', '股票', '股市', '港股', '美股', 'a股', '打新', '券商',
  '入金', '出金', '杠杆', '估值', '市值', '套牢', '割韭菜', '期货', '外汇',
  '比特币', '虚拟币', '币圈', '挖矿', '网贷', '征信', '黑中介', '手续费',
  '投资', '开户', '牛市', '熊市', '大盘', '涨停', '跌停', '炒币',
  // 保险 / 贷款
  '保险', '贷款', '套现', '分期', '还款', '抵押', '按揭', '保单', '理赔',
  // 职场 / 管理
  '职场', '人脉', '下属', '领导', '老板', '同事', '员工', '管理', '打工',
  '加班', '简历', '面试', '裁员', '薪资', '月薪', '底薪', '升职', '跳槽',
  '绩效', 'kpi', '汇报', '述职', '五险一金', '劳动合同', '劳动仲裁',
  // 自媒体 / 营销 / 网赚
  '副业', '变现', '涨粉', '自媒体', '流量主', '广告主', '私域', '裂变',
  '引流', '获客', '网赚', '薅羊毛', '推广', '裂变', '粉丝', '爆款', 'ip',
  '公众号运营', '短视频运营', '带货', '佣金', '分润',
  // 情感 / 心理 / 鸡汤
  '相处', '心情', '情绪', '控制欲', '压力感', '内耗', '自卑', '孤独', '抑郁',
  '亲密关系', '讨好型', '暧昧', '表白', '分手', '婚姻', '相亲', '恋爱',
  '欲望', '天赋', '焦虑', '觉悟', '信念', '鸡汤', '感悟', '启示', '人生',
  '心态', '思维', '认知', '格局', '习惯', '自律', '努力', '坚持', '成功',
  '财富', '自由', '逆袭', '阶层', '穷人', '富人', '清醒', '通透', '内卷',
  // 娱乐八卦
  '爆料', '吸毒', '明星', '八卦', '综艺', '网红', '离婚', '绯闻', '塌房',
  '歌手', '演员', '演唱会', '追星', '饭圈',
  // 网盘 / 破解 / 资源
  '百度网盘', '不限速', '网盘', '破解', '激活码', '注册机', '序列号', '绿化',
  '会员', '白嫖', '蹭网',
  // 创业 / 经商（非技术向）
  '创业', '代理商', '代理', '签单', '业绩', '客户', '销售', '推销', '套路',
  '招商', '加盟', '项目方', '盘口', '资金盘',
  // 法律 / 生活杂项
  '合同诈骗', '经济纠纷', '诈骗', '骗子', '报案', '律师', '法院',
  '打印', '签字', '电子文档', '搬家', '租房', '装修',
];

/** 短 ASCII 关键词必须按词边界匹配，避免子串误伤（position 含 pos 等） */
function matches(hay, kw) {
  if (/^[a-z0-9]+$/.test(kw) && kw.length <= 4) {
    return new RegExp(`\\b${kw}\\b`).test(hay);
  }
  return hay.includes(kw);
}

function hitSet(hay, list) {
  return list.filter((k) => matches(hay, k));
}

function parse(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = m[1];
  const get = (key) => {
    const r = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return r ? r[1].trim().replace(/^['"]|['"]$/g, '') : '';
  };
  const body = raw.slice(m[0].length, m[0].length + BODY_SCAN);
  return {
    title: get('title'),
    description: get('description'),
    tags: get('tags'),
    pubDate: get('pubDate'),
    body: body.toLowerCase(),
  };
}

const rows = [];
for (const file of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'))) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8');
  const meta = parse(raw);
  if (!meta) continue;
  if (/^draft:\s*true/m.test(raw)) continue; // 已下线的跳过

  const t = (meta.title + ' ' + file).toLowerCase();
  const d = (meta.description + ' ' + meta.tags).toLowerCase();
  const b = meta.body;

  const keepScore = hitSet(t, KEEP).length * 3 + hitSet(d, KEEP).length * 2 + hitSet(b, KEEP).length;
  const dropScore = hitSet(t, DROP).length * 3 + hitSet(d, DROP).length * 2 + hitSet(b, DROP).length;

  let verdict, reason;
  if (dropScore > keepScore) {
    verdict = 'drop';
    reason = `${dropScore} : ${keepScore}`;
  } else if (keepScore > dropScore) {
    verdict = 'keep';
    reason = `${keepScore} : ${dropScore}`;
  } else {
    verdict = 'review';
    reason = keepScore === 0 ? '无信号' : `平票 ${keepScore} : ${dropScore}`;
  }

  rows.push({
    file,
    title: meta.title,
    pubDate: meta.pubDate,
    verdict,
    reason,
    detail: `K[${hitSet(t, KEEP).slice(0, 2).join('/')}] D[${hitSet(t, DROP).slice(0, 2).join('/')}]`,
  });
}

const drops = rows.filter((r) => r.verdict === 'drop');
const keeps = rows.filter((r) => r.verdict === 'keep');
const reviews = rows.filter((r) => r.verdict === 'review');
const toDrop = dropReview ? [...drops, ...reviews] : drops;

if (apply) {
  let n = 0;
  for (const r of toDrop) {
    const full = path.join(BLOG_DIR, r.file);
    const raw = fs.readFileSync(full, 'utf8');
    if (/^draft:/m.test(raw)) {
      fs.writeFileSync(full, raw.replace(/^draft:.*$/m, 'draft: true'), 'utf8');
    } else {
      fs.writeFileSync(full, raw.replace(/^---\r?\n([\s\S]*?)\r?\n---/, (m, fm) => `---\n${fm}\ndraft: true\n---`), 'utf8');
    }
    n++;
  }
  console.log(`已写入 draft: true → ${n} 篇（下线 ${drops.length} + 存疑 ${dropReview ? reviews.length : 0}）`);
  console.log(`保留 ${keeps.length} 篇`);
} else {
  const table = (list, note) => [
    `## ${note}（${list.length}）`,
    '',
    '| # | 年份 | 标题 | 技术分:无关分 | 标题命中 |',
    '|---|---|---|---|---|',
    ...list.map((r, i) =>
      `| ${i + 1} | ${r.pubDate.slice(0, 4)} | ${r.title.replace(/\|/g, '\\|')} | ${r.reason} | ${r.detail} |`
    ),
    '',
  ];

  const out = [
    '# 博客内容治理判定清单',
    '',
    `扫描：${rows.length} 篇 ｜ 建议下线：${drops.length} ｜ 保留：${keeps.length} ｜ 存疑：${reviews.length}`,
    '',
    '判定范围：标题 ×3 + 摘要/标签 ×2 + 正文前 3000 字 ×1，命中去重后累加（不按出现次数，避免长文刷分）。',
    '',
    ...table(drops, '建议下线'),
    ...table(reviews, '存疑（默认保留，--review 可一并下线）'),
    ...table(keeps, '保留'),
  ].join('\n');

  const outPath = process.argv[2] || 'blog-classify-report.md';
  fs.writeFileSync(outPath, out, 'utf8');
  console.log(`清单已输出：${outPath}`);
  console.log(`下线 ${drops.length} / 存疑 ${reviews.length} / 保留 ${keeps.length} / 共 ${rows.length}`);
}
