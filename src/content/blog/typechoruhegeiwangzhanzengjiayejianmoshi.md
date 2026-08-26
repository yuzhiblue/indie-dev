---
title: "TYPECHO如何给网站增加夜间模式"
description: "几个月以前就有网友提议说能否给网页增加夜间模式，其实一直以来这也是我的想法。很可惜的是大部分网页都没有这个功能，只能借助一些浏览器插件。最近几天就在网上搜索夜间模式功能实现的方法，果然被我找到了。 首先，我们需要用到别人开发的一个js库：D"
pubDate: 2019-08-22
tags: ['技术']
draft: false
---
几个月以前就有网友提议说能否给网页增加夜间模式，其实一直以来这也是我的想法。很可惜的是大部分网页都没有这个功能，只能借助一些浏览器插件。最近几天就在网上搜索夜间模式功能实现的方法，果然被我找到了。

首先，我们需要用到别人开发的一个js库：Darkmode.js 网址：https://darkmodejs.learn.uno

这是一个专门用来实现页面夜间模式的小插件。用法也很简单，只需要将下面的代码复制黏贴到网页底部footer的位置。



```
<script src="https://cdn.jsdelivr.net/npm/darkmode-js@1.4.0/lib/darkmode-js.min.js"></script>
<script>
   new Darkmode().showWidget();
</script>
```


这样就基本成功啦。在你网站的右下角会出现一个月亮一样的圆形图案，点击一下，页面就变成夜间模式了。

这个时候会有一些css样式的问题需要调整一下，这个插件也很贴心的在body标签上添加了一个 darkmode--activated的类。

如果不希望某个标签适应夜间模式，可以手动给这个标签添加darkmode-ignore这个类。或者你也可以在css样式表里面使用isolation: isolate;也可以使用mix-blend-mode: difference;让某个标签恢复到夜间模式。

因为我为了适应主题才使用的这个插件，所以里面的一些设置问题我就不多讲了，有兴趣的可以自己看文档。

为了适应本主题，我在右上角搜索框旁边增加了一个图标，点击上去网页就会变成夜间模式。

具体功能实现如下：

首先，在网页底部增加改造之后的代码。



```
<script src="https://cdn.jsdelivr.net/npm/darkmode-js@1.3.4/lib/darkmode-js.min.js"></script>
<script>
  $(document).ready(function(){
    const darkmode =  new Darkmode();
    $(".darkmode").click(function(){
      darkmode.toggle();
  });
});
</script>
```


其次，找到搜索框的那一端代码，在前面加一行。



```
  <i class="fa fa-adjust darkmode" aria-hidden="true"></i>
```


这个是用的FontAwesome图标，因为本站是基于bootstrap创建的，所以不用在此引用基础文件。

再次，修改css样式。到这一步其实已经完全实现的夜间模式的功能，只是有些css样式需要修改。



```
/*夜间模式*/
.darkmode{
    padding:5px 10px;
    cursor:pointer;
}
.darkmode--activated img,.darkmode--activated footer{
    mix-blend-mode: difference;
}
.darkmode-layer, .darkmode-toggle {
  z-index: 500;
}
/*夜间模式 End*/
```


另外，因为手机上一般浏览器带有夜间模式这个功能，所以网页上面就没必要再添加这个功能了。所以我们只要在手机端隐藏掉右上角那个按钮就可以了。



```
@media (max-width: 768px) {
.darkmode{display:none;}
}
```


到此，就基本上大功告成了。点击保存，刷新网页，点击夜间模式的按钮，试试看吧。

因为后面的修改是针对本主题的，所以会有点乱，有任何问题都请给我留言。
