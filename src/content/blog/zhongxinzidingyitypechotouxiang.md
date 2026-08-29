---
title: "重新自定义typecho头像"
description: "今天休息，跑到网吧偷偷折腾网站来了。看看以前的QQ头像替代默认的Gavatar头像功能，感觉不是很理想。因为当访客使用QQ邮箱评论时会显示QQ头像，可是如果使用的不是QQ头像，就会显示一个QQ企鹅头像，这样子在我看来是不行的。于是又萌生了修"
pubDate: 2018-12-02
tags: ['前端']
draft: false
slug: typecho-custom-avatar
---
今天休息，跑到网吧偷偷折腾网站来了。看看以前的QQ头像替代默认的Gavatar头像功能，感觉不是很理想。因为当访客使用QQ邮箱评论时会显示QQ头像，可是如果使用的不是QQ头像，就会显示一个QQ企鹅头像，这样子在我看来是不行的。于是又萌生了修改的想法。

首先，将下面的代码丢到funtions.php文件当中。



```php
    //获取Gravatar头像 QQ邮箱取用qq头像
    function getGravatar($email, $s = 96, $d = 'mp', $r = 'g', $img = false, $atts = array())
    {
    preg_match_all('/((\d)*)@qq.com/', $email, $vai);
    if (empty($vai['1']['0'])) {
        $url = 'https://www.gravatar.com/avatar/';
        $url .= md5(strtolower(trim($email)));
        $url .= "?s=$s&d=$d&r=$r";
        if ($img) {
            $url = '<img src="' . $url . '"';
            foreach ($atts as $key => $val)
                $url .= ' ' . $key . '="' . $val . '"';
            $url .= ' />';
        }
    }else{
        $url = 'https://q2.qlogo.cn/headimg_dl?dst_uin='.$vai['1']['0'].'&spec=100';
    }
    return  $url;
    }
```


其次，再将下面的代码复制到需要放头像的页面，通常是comments.php页面和sidebar.php页面。



```php
    <?php $email=$comments->mail; $imgUrl = getGravatar($email);echo '<img src="'.$imgUrl.'" width="45px" height="45px" style="border-radius: 50%;" >'; ?>
```


大功告成！

该代码可以实现的功能：当客户评论时用的不是QQ邮箱，则显示gavatar头像，否则则显示QQ头像。完美！
