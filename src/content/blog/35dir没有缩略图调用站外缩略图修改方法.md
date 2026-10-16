---
title: "35dir没有缩略图调用站外缩略图修改方法"
description: "有缩略图显示本地 没有缩略图调用站外缩略图的修改方法 需要修改四个文件 请注意备份! 1.打开文件 source\\module\\prelink.php 搜索get_webthumb 找到以下代码 修改成以下代码 2.打开文件 source\\"
pubDate: 2015-02-05
tags: ['技术']
draft: true
slug: 35dir-external-thumbnail-fallback
---
有缩略图显示本地 没有缩略图调用站外缩略图的修改方法 需要修改四个文件 请注意备份!

1.打开文件 source\module\prelink.php 搜索`get_webthumb` 找到以下代码



```
/** thumbs */
function get_webthumb($web_pic) {
    global $options;
    if (!empty($web_pic)) {
        $strurl = $options['site_root'].$options['upload_dir'].'/'.$web_pic;
    } else {
        $strurl = $options['site_root'].'public/images/nopic.gif';
    }
    return $strurl;
}
```


修改成以下代码



```
/** thumbs */
function get_webthumb($web_pic,$web_url) {
global $options;
if (!empty($web_pic)) {
$strurl = $options['site_root'].$options['upload_dir'].'/'.$web_pic;
} else {
        //在这里选择不同的缩略图服务网站。
    //$strurl = $options['site_root'].'public/images/nopic.gif';
    //$strurl = 'http://y.searchpreview.de/preview?s='.$web_url;
    //$strurl = 'http://get.thumbshots.ru/?lang=en&size=s&url='.$web_url;
    //$strurl = 'http://webthumb.jd-app.com/webthumb.php?url='.$web_url;
    $strurl = 'http://api.webthumbnail.org/?width=160&height=100&screen=1024&url='.$web_url;
}
return $strurl;
}
```


2.打开文件 source\module\website.php 搜索`get_webthumb` 找到 `$web['web_pic'] = get_webthumb($web['web_pic']);` 需要替换两次 全部替换成 `$row['web_pic'] = get_webthumb($row['web_pic'],$row['web_url']);`

3.打开文件 module\siteinfo.php 搜索`get_webthumb` 找到 `$web['web_pic'] = get_webthumb($web['web_pic']);` 这行 替换成 `$web['web_pic'] = get_webthumb($web['web_pic'],$web['web_url']);`

4.打开文件 module\linkinfo.php 搜索`get_webthumb` 找到 `$link['web_pic'] = get_webthumb($link['web_pic']);` 这行 替换成 `$link['web_pic'] = get_webthumb($link['web_pic'],$link['web_url']);`

本文参考天狐博客，代码有修改。
