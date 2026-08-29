---
title: "django网站添加sitemap以及如何自定义sitemap"
description: "django网站添加sitemap的方式网络上有现成的方法，百度上随便搜一下就能找到，难的是如何自定义sitemap，本人页摸索了好久，终于成功了，这篇文章做一下总结。 先说一下如何添加django网站如何添加sitemap，大致分为一下几"
pubDate: 2023-11-05
tags: ['Python', '数据库', '开发工具']
draft: false
slug: django-custom-sitemap
---
django网站添加sitemap的方式网络上有现成的方法，百度上随便搜一下就能找到，难的是如何自定义sitemap，本人页摸索了好久，终于成功了，这篇文章做一下总结。

先说一下如何添加django网站如何添加sitemap，大致分为一下几步：

1.安装第三方模块django-sitemap。



```bash
pip install django-sitemap
```


2.打开settings.py文件，将下面这句添加到INSTALL_APPS中。



```python
    'django.contrib.sitemaps',
```


3.在当前目录创建sitemap.py视图文件。



```python
from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from post.models import Post, Category, Page
from broker.models import CreCard

class StaticViewSitemap(Sitemap):
    priority = '1'
    changefreq = 'daily'
    protocol = 'https'

    def items(self):
        return ['post:index', ]

    def location(self, item):
        return reverse(item)

class PostSiteMap(Sitemap):
    changefreq = 'monthly'
    priority = '0.6'
    protocol = 'https'

    def items(self):
        return Post.objects.filter(is_publish = True).order_by("-modified_time")

    def lastmod(self, obj):
        return obj.create_time

    def location(self, obj):
        return '/detail/{}'.format(obj.id)


class CategorySiteMap(Sitemap):
    changefreq = 'Weekly'
    priority = '0.5'
    protocol = 'https'

    def items(self):
        return Category.objects.all()
    def location(self, obj):
        return '/category/{}'.format(obj.post_category)


class PageSiteMap(Sitemap):
    changefreq = 'Weekly'
    priority = '0.5'
    protocol = 'https'

    def items(self):
        return Page.objects.all()

    def lastmod(self, obj):
        return obj.create_time

    def location(self, obj):
        return '/page/{}'.format(obj.id)
class CardSiteMap(Sitemap):
    changefreq = 'monthly'
    priority = '0.6'
    protocol = 'https'

    def items(self):
        return CreCard.objects.filter(is_publish = True).order_by("-update_time")

    def lastmod(self, obj):
        return obj.update_time

    def location(self, obj):
        return '/cdetail/{}'.format(obj.id)

class CreCardSitemap(Sitemap):
    changefreq = 'Weekly'
    priority = '0.8'
    protocol = 'https'

    def items(self):
        return ['broker:crecard', ]

    def location(self, obj):
        return '/crecard'

sitemaps = {
    'staticview':StaticViewSitemap,
    'crecard':CreCardSitemap,
    'card':CardSiteMap,
    'post': PostSiteMap,
    'category': CategorySiteMap,
    'page': PageSiteMap,
}
```


4.设置URL，打开url.py将下面这句添加进去。



```python
from django.contrib.sitemaps.views import sitemap
...
path('sitemap.xml', sitemap, {'sitemaps':sitemaps},name='django.contrib.sitemaps.views.sitemap'),
```


保存之后重启服务器，到这里能显示出来就可以了。当你访问https://7tec.cn/sitemap.xml 时就已经能够显示出所有的网址了。

接下来说说最难的如何自定义sitemap，之所以想要自定义sitemap是因为在百度站长平台上面一段关于sitemap的介绍。大致意思是创建移动sitemap协议，更有利于网站收录。

仔细研究了一下，就两行内容不同。



```xml
<?xml version="1.0" encoding="UTF-8" ?> 
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:mobile="http://www.baidu.com/schemas/sitemap-mobile/1/"> 

<mobile:mobile/> ：移动网页
<mobile:mobile type="mobile"/> ：移动网页      
<mobile:mobile type="pc,mobile"/>：自适应网页
<mobile:mobile type="htmladapt"/>：代码适配
```


好了，开搞。网络上搜了个遍也找不到方法，后来还是看了关于django-sitemap第三方库的文档，https://www.osgeo.cn/django/ref/contrib/sitemaps.html 才找到了方法。

方法不难。

  1. 创建sitemap.xml文件到template文件夹中。
  2. 添加一下代码并保存即可。



```xml
<?xml version="1.0" encoding="UTF-8" ?> 
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
xmlns:mobile="http://www.baidu.com/schemas/sitemap-mobile/1/">
{% spaceless %}
{% for url in urlset %}
  <url>
    <loc>{{ url.location }}</loc>
    <mobile:mobile type="pc,mobile"/>
    {% if url.lastmod %}<lastmod>{{ url.lastmod|date:"Y-m-d" }}</lastmod>{% endif %}
    {% if url.changefreq %}<changefreq>{{ url.changefreq }}</changefreq>{% endif %}
    {% if url.priority %}<priority>{{ url.priority }}</priority>{% endif %}
   </url>
{% endfor %}
{% endspaceless %}
</urlset>
```


感兴趣的朋友可以直接复制拿走使用，今天的分享就到这里。
