---
title: "代码实现Typecho文章有图片则显示缩略图，没有图片则不显示"
description: "网上大部分typecho缩略图功能一般分为两类。一类是文章有图片的会显示缩略图，没有图片的则显示随机图片。还有一类是有图片会显示缩略图，没有图片显示默认图片。 总而言之就是每一个文章都要有一个缩略图。这样有一个好处就是文章会很统一，很美观。"
pubDate: 2023-11-25
tags: ['前端']
draft: false
slug: typecho-conditional-thumbnail
---
网上大部分typecho缩略图功能一般分为两类。一类是文章有图片的会显示缩略图，没有图片的则显示随机图片。还有一类是有图片会显示缩略图，没有图片显示默认图片。

总而言之就是每一个文章都要有一个缩略图。这样有一个好处就是文章会很统一，很美观。但是如果有很多随机的缩略图或者默认图片，那么明显用户体验会很差。

今天给大家提供另外一种缩略图的方案：有图片则显示缩略图，没有图片则不显示。

下面我们看一下功能是怎么实现的，先把下面这段代码贴到functions.php里面去。



```php
    //获取文章缩略图
    function showThumbnail($widget)
    { 
    $attach = $widget->attachments(1)->attachment;
    $pattern = '/\<img.*?src\=\"(.*?)\"[^>]*>/i'; 
    if (preg_match_all($pattern, $widget->content, $thumbUrl)) {
         echo "<div class='post-thumb'> <img class='thumb' src='".$thumbUrl[1][0]."' /></div>";
    } elseif ($attach->isImage) {
      echo "<div class='post-thumb'> <img class='thumb' src='".$attach->url."' /></div>";
    } 
    }
```


这段代码的意思是，使用正则表达式扫描全文第一张图片，如果有就输出。如果没有再检查附件，如果有则输出。顺便提一句，网上有一些方案是只检查附件有没有图片，这种方案是明显存在漏洞的，你比如如果是外链图片，就会认为是没有图片。所以优先推荐带正则表达式的方案。

下一步要打开 index.php 或者 archive.php 将  这段代码贴到 

前面。

然后在style.css样式表里面添加缩略图样式。



```css
    .post-thumb {
    float: left;
    width: 200px;
    max-height: 150px;
    overflow: hidden;
    margin: 0 20px 10px 0;
    border-radius: 5px;
    }
    @media (max-width: 768px) {
    .post-thumb{width:100%!important;}
    }
```


保存，刷新页面，大功告成！
