---
title: "重新写了一下夜间模式的功能"
description: "之前写过一篇添加网页夜间模式的文章。借用了国外的一个darkmode.js插件。 但是调试过程中我发现会出现各种各样的问题。调试起来太费劲，一气之下重新写了一个夜间模式的功能。 想预览功能，请直接点击网页右上方按钮。 我们分析一下功能。点击"
pubDate: 2019-12-22
tags: ['技术']
draft: false
---
之前写过一篇添加网页夜间模式的文章。借用了国外的一个darkmode.js插件。

但是调试过程中我发现会出现各种各样的问题。调试起来太费劲，一气之下重新写了一个夜间模式的功能。

想预览功能，请直接点击网页右上方按钮。

我们分析一下功能。点击右上角太阳按钮，页面就会变暗。再点一次就会变亮。而且切换网页同样有效。那么这里就需要使用到cookie功能。

我使用的是jq的cookie插件。所以，这里需要在footer里面引入一个javascript链接。



```
<script src="https://cdn.staticfile.org/jquery-cookie/1.4.1/jquery.cookie.min.js"></script>
```


将下面代码抛到页面底部：



```
<script type="text/javascript">
  $(document).ready(function(){
  //先判断是否存在cookie，如果存在则直接显示夜间模式,点击之后切换为白天模式；如果不存在，则显示白天模式，点击之后切换到夜间模式。
    if($.cookie('name')=='dmactived'){
      $("body").addClass("dmactived");
      $(".darkmode").click(function(){
        //如果有class=dmactived则删除，如果没有则添加
        if($("body").hasClass("dmactived")==true){
          $("body").removeClass("dmactived");
          $.removeCookie('name', 'dmactived', { path: '/' }); 
        }else{
          $("body").addClass("dmactived");
          $.cookie('name', 'dmactived', { path: '/' });
        }
      });
      }else{
        $("body").removeClass("dmactived");
        $(".darkmode").click(function(){
          //如果有class=dmactived则删除，如果没有则添加
          if($("body").hasClass("dmactived")==true){
            $("body").removeClass("dmactived");
            $.removeCookie('name', 'dmactived', { path: '/' }); 
          }else{
            $("body").addClass("dmactived");
            $.cookie('name', 'dmactived', { path: '/' });
          }
        });
       }

    });
 </script>
```


上面代码的意思是为Body元素创建一个class，然后为这个class添加css样式。



```
<style>
  .dmactived .body{background-color:#111;}
  .dmactived .header{background:#555;}
  .dmactived #s{opacity:0.2;}
  .dmactived .header a.nav-link{color:#333;}
  .dmactived .body .container{opacity:0.2;}
 </style>
```


功能已经基本完成了，我们发现网页切换的时候老是会闪一下。这个时候我们需要用php给body元素加一个判断。



```
 <body <?php if($_COOKIE['name'] == 'dmactived'){echo 'class="dmactived"';} ?>>
```


保存一下，刷新网页，大功告成！
