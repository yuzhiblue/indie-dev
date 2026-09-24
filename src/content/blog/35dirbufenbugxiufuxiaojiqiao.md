---
title: "35dir部分bug修复小技巧"
description: "在网上下载下来的源码肯定是有bug的，那么本篇文章主要就是介绍如何修改一些bug。 一、sitemap链接错误 打开新建好的分类目录网站首页，然后把鼠标放到最下面的站点地图链接上，你会发现地址上面多了一个斜杠，点击之后直接进入404页面。显"
pubDate: 2015-03-16
tags: ['技术']
draft: true
slug: 35dir-bug-fix-tips
---
在网上下载下来的源码肯定是有bug的，那么本篇文章主要就是介绍如何修改一些bug。

**一、sitemap链接错误**

打开新建好的分类目录网站首页，然后把鼠标放到最下面的站点地图链接上，你会发现地址上面多了一个斜杠，点击之后直接进入404页面。显然这里是不对的，怎么修改呢？

首先，打开source/moudle目录下的perlink.php文件； 其次，搜索`get_sitemap_url`这个函数； 最后，找到`$strurl = $options['site_root'].'sitemap/'.$module.'/';`这行，将最后面的斜杠删掉，保存即可。

**二、前台无法显示PR值图片和QQ咨询图片**

这个比较好修改，首先打开themes/default/weblink.html文件。然后搜索找到这两行代码：



```
   <td><img src="public/images/gpr/{#$item.web_grank#}.gif"></td>
   <td><img src="public/images/bpr/{#$item.web_brank#}.gif"></td>
```


然后在public前面加上../就可以了，是不是很简单呢？ QQ咨询图标不显示，直接去官网复制最新的代码替换下原来的代码即可。

**三、如何去掉QQ登陆**

可能很多人都注意到了，分类目录网站很难申请到QQ登陆权限的，因为QQ开放协议里面有一条，不允许网站强制所要用户QQ号，可是我们行业限制啊，不用QQ又不行，而且35dir的QQ登陆是半成品，每次都要重新验证权限，而且无法绑定账号，很麻烦。那么干脆我们去掉这个功能好了，毕竟我们网站注册本身也不怎么麻烦。

首先登陆网站分类目录后台，在注册设置里找到QQ一键登录选项，选择禁止，点击保存；

其次我们要去掉那个图标，要不然放在上面很难看的。打开moudle文件夹下的common.php文件，找到下面这行代码，注释掉就可以了：



```
<a href="'.$options['site_root'].'member/?mod=connect&oper=init"><img src="'.$options['site_root'].'public/images/qq_login.png" /></a> /
```


**四、修改文本广告**

我们发现文本广告开发并不完整，这里我进行了相应的修改。使用也比较方便了许多。

打开source/moudle找到adver.php文件。找到下面的函数：



```
/** text ads */
function get_adlinks() {
    $ads = get_adver(1);
    if (!empty($ads)) {
        return $ads;
    }
}
```


直接修改为：



```
/** text ads */
function get_adlinks($aid = 0) {
    $ads = get_adver(1);
    if (is_array($ads[$aid])) {
      $ad_name = $ads[$aid]['adver_name'];
      $ad_url = $ads[$aid]['adver_url'];
        $ad_tips = $ads[$aid]['adver_etips'];
        $ad_days = $ads[$aid]['adver_days'];
        $ad_date = $ads[$aid]['adver_date'];
        $ad_code ="<a href=".$ad_url." target='_blank'>".$ad_name."</a>";
        $endtime = $ad_date + $ad_days * 24 * 3600;
        if ($ad_days > 0) {
            return $endtime > $adver['adver_date'] ? $ad_code : $ad_tips;
        } else {
            return $ad_code;
        }
    }
}
```


如何调用？

在你需要文字广告的地方粘贴`{#get_adlinks(1)#}`代码。括号里面的数字是广告ID。

**五、修改相关查询链接**

这个也是比较简单的，打开themes文件夹下的siteinfo.php文件，直接修改相应代码就行了。
