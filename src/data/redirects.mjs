/**
 * 由 scripts/apply-slugs.mjs 自动生成，请勿手改。
 * 保证博客 slug 重写前已被搜索引擎收录的旧链接不 404。
 * 例外：2026-10-16 手工修正了 4 条目标文章已删除的条目（doutimer-release-0-2-0725 /
 * astro-portfolio-site-setup / kuaishou-partner-version-warning /
 * activation-error-network-node-notice），改为指向 /blog/；重新生成时需保留这些修正。
 * 该文件同时被 middleware.js（EdgeOne 真 301）和 astro.config.mjs（stub 兜底）消费。
 */
export const blogRedirects = [
	{
		"from": "/blog/10he20xianchengcpushiyongdanxianchengyibudehuatongchangshezhibingfaliangduoshaoheshi",
		"to": "/blog/async-concurrency-limit-for-10c20t-cpu"
	},
	{
		"from": "/blog/35dirbufenbugxiufuxiaojiqiao",
		"to": "/blog/35dir-bug-fix-tips"
	},
	{
		"from": "/blog/35dirmeiyousuolvetudiaoyongzhanwaisuolvetuxiugaifangfa",
		"to": "/blog/35dir-external-thumbnail-fallback"
	},
	{
		"from": "/blog/35dirruhezidingyishujutongjilan",
		"to": "/blog/35dir-custom-stats-bar"
	},
	{
		"from": "/blog/35dirweijingtaiguizemuluhewenjianxingmoshi",
		"to": "/blog/35dir-pseudo-static-rules"
	},
	{
		"from": "/blog/7tecjianjiezhuti2021nian3yue2rigengxinzengjialecebianlanbiaoqiangongneng",
		"to": "/blog/7tec-theme-sidebar-tags-update"
	},
	{
		"from": "/blog/bingfayuxianchengdequbiezainali",
		"to": "/blog/concurrency-vs-threading"
	},
	{
		"from": "/blog/chuledllzhuruhaiyoumeiyouqitazhurufangan",
		"to": "/blog/dll-injection-alternatives"
	},
	{
		"from": "/blog/cssdisplayflexshuxing",
		"to": "/blog/css-display-flex"
	},
	{
		"from": "/blog/daimashixiantypechowenzhangyoutupianzexianshisuolvetumeiyoutupianzebuxianshi",
		"to": "/blog/typecho-conditional-thumbnail"
	},
	{
		"from": "/blog/danxianchengyiburuhekongzhibingfaliangne",
		"to": "/blog/async-concurrency-control"
	},
	{
		"from": "/blog/danxianchengyibuyuduoxianchengyibuzaixiazaidapiliangwenjianshixiaolvshibushiyiyangde",
		"to": "/blog/async-vs-multithread-bulk-download"
	},
	{
		"from": "/blog/djangochuangjianforiegnkeydeshihouyidingyaomashangyigemorenzhidefault",
		"to": "/blog/django-foreignkey-default"
	},
	{
		"from": "/blog/djangowangzhantianjiasitemapyijiruhezidingyisitemap",
		"to": "/blog/django-custom-sitemap"
	},
	{
		"from": "/blog/dllzhurushishenmeyisi",
		"to": "/blog/what-is-dll-injection"
	},
	{
		"from": "/blog/dockerjingxiangjiasuliebiaojiezhi2024nian9yuekeyong",
		"to": "/blog/docker-registry-mirrors-2024"
	},
	{
		"from": "/blog/douyinkuaishouzhibobanlvdingshizhushougongjuyigengxin020725banben",
		"to": "/blog/"
	},
	{
		"from": "/blog/fenbushipachonggongzuojiedianzenmexie",
		"to": "/blog/scrapy-distributed-worker-node"
	},
	{
		"from": "/blog/fenbushipachongshibushudaoduogediannaodema",
		"to": "/blog/distributed-crawler-multi-machine"
	},
	{
		"from": "/blog/geidajiaanliyigegongzhonghaozhangfenchajianwechatfansfortypecho",
		"to": "/blog/typecho-wechatfans-plugin"
	},
	{
		"from": "/blog/gitdejiandanyongfa",
		"to": "/blog/git-basics"
	},
	{
		"from": "/blog/githubwangsutaimandabukaizenmeban",
		"to": "/blog/github-slow-connection-fix"
	},
	{
		"from": "/blog/hello-world",
		"to": "/blog/"
	},
	{
		"from": "/blog/kefoutongshishiyongyibuyuxiancheng",
		"to": "/blog/async-and-threads-together"
	},
	{
		"from": "/blog/kuaishouzhibobanlvzuixinbanzanweishipeiqingwugengxin",
		"to": "/blog/"
	},
	{
		"from": "/blog/mubiaofuwuqiduidangeipdeqingqiusulvyouxianzhizhegeqingqiusulvshishenmezenmehengliang",
		"to": "/blog/http-request-rate-limit-basics"
	},
	{
		"from": "/blog/na300zhaohe1000zhaokuandaililunxiazaisududagaiduoshao",
		"to": "/blog/300mbps-vs-1000mbps-speed"
	},
	{
		"from": "/blog/neicunzhururuhehuoqubingdiaoyongneicunzhongdeneibuhanshu",
		"to": "/blog/memory-injection-call-internal-function"
	},
	{
		"from": "/blog/nuitkadabaochengexewenjianyudaounusedbutsetvariablecuowuzenmeban",
		"to": "/blog/nuitka-unused-but-set-variable"
	},
	{
		"from": "/blog/obszhiboluzhishipindeshihoumeiyoushengyin",
		"to": "/blog/obs-recording-no-audio"
	},
	{
		"from": "/blog/pdfcrawlerpipelinespdfpipeline300shishenmeyisi",
		"to": "/blog/scrapy-pipeline-priority-300"
	},
	{
		"from": "/blog/playwrightdelaunchpersistentcontextaibianchengjukeng",
		"to": "/blog/playwright-launch-persistent-context-pitfalls"
	},
	{
		"from": "/blog/pyside6yuanjiaochuangkouyushubiaotuodong",
		"to": "/blog/pyside6-rounded-window-drag"
	},
	{
		"from": "/blog/pythonguiyinggaizenmexuanweishenmeyaoxuanzepyside6",
		"to": "/blog/why-pyside6-for-python-gui"
	},
	{
		"from": "/blog/pythonjiaobendabaochengexekezhixingwenjianguochengzhongdeyixieyaodian",
		"to": "/blog/python-to-exe-packaging-tips"
	},
	{
		"from": "/blog/pythonjiaobenzaiminglingxingkeyizhengquezhixingzaiwindowsrenwujihualiquewufazhixing",
		"to": "/blog/python-script-fails-in-task-scheduler"
	},
	{
		"from": "/blog/pythonshixiandllzhurudejishushili",
		"to": "/blog/python-dll-injection-example"
	},
	{
		"from": "/blog/pythonshiyongpachongzhuaquwangzhanshangdemeinvtupian",
		"to": "/blog/python-image-crawler-example"
	},
	{
		"from": "/blog/qwindowscontextoleinitializefailedruhejiejue",
		"to": "/blog/qt-oleinitialize-failed-fix"
	},
	{
		"from": "/blog/ranhouzhujiedianhegongzuojiedianruhetongxindene",
		"to": "/blog/distributed-crawler-node-communication"
	},
	{
		"from": "/blog/ruguo1gewangzhanmeimiaoqingqiushuxianzhiwei100namewopachongdebingfaliangduoshaoheshi",
		"to": "/blog/crawler-concurrency-for-100-rps-limit"
	},
	{
		"from": "/blog/ruhechakanwangzhandexiangyingtou",
		"to": "/blog/how-to-view-http-response-headers"
	},
	{
		"from": "/blog/ruhedongtaidiaozhengbingfaliangne",
		"to": "/blog/dynamic-concurrency-tuning"
	},
	{
		"from": "/blog/ruhehuodemubiaohanshudedizhi",
		"to": "/blog/get-target-function-address"
	},
	{
		"from": "/blog/ruhekanqingqiusulvshiyimiaoweidanweihaishiyifenzhongweidanwei",
		"to": "/blog/request-rate-unit-seconds-or-minutes"
	},
	{
		"from": "/blog/ruheshiyongasyncioheaiohttpshixiandapiliangpdfwenjiandepaqurenwubingkongzhibingfaliangwei200",
		"to": "/blog/asyncio-aiohttp-bulk-pdf-crawler"
	},
	{
		"from": "/blog/ruhexiazaidingdingzhibohuifang",
		"to": "/blog/download-dingtalk-live-replay"
	},
	{
		"from": "/blog/ruhezaidianshishangbofangjialidiannaoshangdeshipin",
		"to": "/blog/play-pc-video-on-tv"
	},
	{
		"from": "/blog/rustxuexibijiyijiwodeyidianxiangfa",
		"to": "/blog/rust-learning-notes"
	},
	{
		"from": "/blog/scrapydouyounaxiemingling",
		"to": "/blog/scrapy-commands-cheatsheet"
	},
	{
		"from": "/blog/scrapyfenbushipachongzhujiedianzhixuyaoanzhuangredisma",
		"to": "/blog/scrapy-distributed-master-redis-setup"
	},
	{
		"from": "/blog/scrapymeiyouzhongzhihezantingdeminglingma",
		"to": "/blog/scrapy-pause-and-stop"
	},
	{
		"from": "/blog/shiyongbatminglingpiliangxiugaiwenjianmingzhongdeyibufen",
		"to": "/blog/bat-batch-rename-files"
	},
	{
		"from": "/blog/shiyongyibutigaobingfashifouyiweizheshiyongdekubixuzhichiyibucaixingdrissionpagezhichiyibuma",
		"to": "/blog/async-library-support-drissionpage"
	},
	{
		"from": "/blog/typechohuoqusuijiwenzhangzuixinban",
		"to": "/blog/typecho-random-posts"
	},
	{
		"from": "/blog/typechojiangpingluntouxiangxiugaiweiqqtouxiang",
		"to": "/blog/typecho-qq-comment-avatar"
	},
	{
		"from": "/blog/typechoruhegeiwangzhanzengjiayejianmoshi",
		"to": "/blog/typecho-dark-mode"
	},
	{
		"from": "/blog/wangyetiaozhuandaoweixintianjiahaoyoudesanzhongdaimashixianfangan",
		"to": "/blog/web-redirect-to-wechat-contact"
	},
	{
		"from": "/blog/warningwindowwriteeventvaluenothreadqueue",
		"to": "/blog/pysimplegui-write-event-value-thread-queue"
	},
	{
		"from": "/blog/wei7teczhutitianjiacundangyemian",
		"to": "/blog/7tec-theme-archive-page"
	},
	{
		"from": "/blog/windowsxitongshutdownminglingzaiminglingxingzhongkeyiyunxingzaibatpichuliwenjianzhongquewufayunxing",
		"to": "/blog/windows-shutdown-fails-in-bat"
	},
	{
		"from": "/blog/windowszidonghuaxuyaoduixitongzuonaxieshezhi",
		"to": "/blog/windows-automation-system-settings"
	},
	{
		"from": "/blog/wodiannaoyou10hexin20xianchengzuidazhichiduoshaobingfaliang",
		"to": "/blog/max-concurrency-10c20t"
	},
	{
		"from": "/blog/wordpressfeichajianzidingyipinglunkuangmoban",
		"to": "/blog/wordpress-custom-comment-form"
	},
	{
		"from": "/blog/woyaopaqubingxiazaiwangyedepdfwenjianruheliyongfenbushipachongne",
		"to": "/blog/distributed-crawler-for-pdf-download"
	},
	{
		"from": "/blog/woyaopaqubingxiazaiwangyedepdfwenjianyexuyaoyongshujukuma",
		"to": "/blog/pdf-crawler-database-need"
	},
	{
		"from": "/blog/yiduanpythondaimashifanruhehuoqumokuaijizhizaijieheyizhipianyijisuanmubiaohanshudizhi",
		"to": "/blog/python-module-base-address-offset"
	},
	{
		"from": "/blog/yinwangluojiediandiaozhengruoyujihuoyichangqingjishifankuiyibianzuochudiaozheng",
		"to": "/blog/"
	},
	{
		"from": "/blog/yongscrapyzenmexiefenbushipachongne",
		"to": "/blog/scrapy-distributed-crawler-guide"
	},
	{
		"from": "/blog/zhibodingshizhushouzidongguanjigongnengshixiaodejiejuebanfa",
		"to": "/blog/live-timer-auto-shutdown-fix"
	},
	{
		"from": "/blog/zhiyou1taidiannaoyongscrapyredishuitishengpaquxiaolvma",
		"to": "/blog/scrapy-redis-single-machine-benefit"
	},
	{
		"from": "/blog/zhongxinxieleyixiayejianmoshidegongneng",
		"to": "/blog/dark-mode-rewrite"
	},
	{
		"from": "/blog/zhongxinzidingyitypechotouxiang",
		"to": "/blog/typecho-custom-avatar"
	},
	{
		"from": "/blog/zhuomianzidonghuapywinautopyautoguiyaobuyaotianjiaziyuanguanliqijiancezhongqi",
		"to": "/blog/pywinauto-explorer-restart-watchdog"
	},
	{
		"from": "/blog/zixue5tianyongpythonbianxieleyigexiaogongju",
		"to": "/blog/python-tool-in-5-days"
	}
];
export default blogRedirects;
