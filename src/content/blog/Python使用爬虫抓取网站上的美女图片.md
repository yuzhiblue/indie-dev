---
title: "Python使用爬虫抓取网站上的美女图片"
description: "原谅我不单纯地学习Python。最近几年爬虫的概念一直很火。于是我也来研究了一下。 爬虫的大致思路很简单，就是通过一个网站的网址，通过正则表达式或者其他方式获取到网站图片的地址，然后再将图片下载下来。 虽然说起来很简单，但是在实践过程中你会"
pubDate: 2020-02-07
tags: ['Python', '爬虫']
draft: true
slug: python-image-crawler-example
---
原谅我不单纯地学习Python。最近几年爬虫的概念一直很火。于是我也来研究了一下。

爬虫的大致思路很简单，就是通过一个网站的网址，通过正则表达式或者其他方式获取到网站图片的地址，然后再将图片下载下来。

虽然说起来很简单，但是在实践过程中你会发现很多很多的问题。最常见的是timeout超时。于是你就要花时间不断的去优化细节代码。

通过本次实践，我算是基本上掌握了Python的大部分基础知识，还有一些编程的思想，比如面向过程和面向对象。还有函数和类。当然离大神还有很远的距离。

我发现在简单的代码下，面向过程是最简单的，也是最好理解，最容易看懂的。甚至连自定义函数都可以不用，100行以内直接就能写出来一个爬虫代码，简单直接，执行速度也最快。其次是自定义函数，将一些功能封装起来，方便重复调用，不过简单的爬虫也没有多少重复利用的函数吧，执行速度还算比较快。最后是大神比较推荐的类，这种方式好处就是方便维护。每一个对象一个类，方便代码扩充。可是缺点也很明显，就是执行速度很慢。

所以，还是那句话。写代码不能光追求牛逼，更重要的是要看执行效率。

我看到网上有人学习Python一年了居然都没有用过类，都不懂面向对象。一方面我暗自嘲笑他学的是个什么玩意儿，另一方面我也认为学习不能光盲从，别人说用什么牛逼你就去学，我就坚持不写自定义函数，不用对象怎么了？我就是要这么有个性。在这方面，我觉得编程的哲学思想是很宽容的，起码比现实社会要宽容。

扯得有点多。下面回到爬虫的编写上来。



```
#实战项目一
#抓取网站图片并保存到本地
#采用urllib和requests实现
#待解决问题，栏目分页没有写进去

#导入所需模块
import urllib.request
import re
import os

cat=['sexy','siwa','rihan','xiurenmote','model','belle','meinvtaotu']

for cat_item in cat:
    cat_url='http://www.ituba.cc/'+cat_item+'/'#构造分类栏目网址

    s=urllib.request.urlopen(cat_url)
    ss=s.read().decode('utf-8')
    sss=ss.replace(' ','')
    patternp=re.compile(r'(\d{2,4})</a>.*?a1')
    pagenum=patternp.findall(sss)#匹配并获取该栏目总页数

    for num in range(1,int(pagenum[0])+1):
        if num==1 :#栏目首页，直接获取文章id
            catp_url=cat_url
        else:
            catp_url=cat_url+'p%d.html'%num#通过栏目总页数生成所有分页

        s=urllib.request.urlopen(catp_url)
        ss=s.read().decode('utf-8')
        sss=ss.replace(' ','')
        pattern=re.compile(r'Pic">\n<ahref=.*?/(\d{1,5}).html')
        ssss=pattern.findall(sss)#匹配并获取栏目首页pageid
        pageid=ssss[:-10]#去掉正则表达式无法过滤掉的pageid

        for post_id in pageid:
            post_url=cat_url+post_id+'.html'#构造文章网址

            s=urllib.request.urlopen(post_url)
            ss=s.read().decode('utf-8')
            sss=ss.replace(' ','')
            pattern=re.compile(r'(\d{1,3})</a><ahref="http://www.ituba.cc/[a-zA-Z]{3,}/\d{1,5}_\d{1,3}.html"class="page-ch"')
            postnum=pattern.findall(sss)#匹配文章分页总数

            for post_num in range(1,int(postnum[0])+1):
                if post_num==1 :#文章首页
                    postp_url=post_url
                    print(postp_url)

                else:
                    postp_url=cat_url+post_id+'_%d.html'%post_num#构造分页网址

                s=urllib.request.urlopen(postp_url)
                ss=s.read().decode('utf-8')
                sss=ss.replace(' ','')
                pattern=re.compile(r'alt=.*?src="(.*?\.jpg)"')
                imageurl=pattern.findall(sss)#匹配图片地址
                print(imageurl[0])

                #创建文件夹保存目录
                if not os.path.exists(cat_item+'/'+post_id+'/'):
                    os.makedirs(cat_item+'/'+post_id+'/')

                image_url='http:'+imageurl[0]#构造图片地址
                image_name=image_url[37:58]
                response=urllib.request.urlopen(image_url)
                img=response.read()

                #将下载的图片保存到指定文件夹
                with open(cat_item+'/'+post_id+'/'+image_name,'wb') as f:
                     f.write(img)
                f.close()

                    #print('文章第几页：',post_num,'文章分页网址',postp_url)
                print('抓取完毕！')
```


上面是我编写的人生中第一个爬虫。功能就是抓取指定指定目录下的文章中的图片。

其实只要你把每一步思路全部想清楚之后，再去写代码实现就很简单了。



```
    '''
#实战项目一
#抓取网站图片并保存到本地
#思路：面向过程
'''
#导入所需模块
import urllib.request
import re
import os

def get_str(url):
    req = urllib.request.Request(url)
    req.add_header('User-Agent','Mozilla/5.0 (Windows NT 6.1; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0')
    s=urllib.request.urlopen(req,timeout=1000)
    ss=s.read().decode('utf-8')
    sss=ss.replace(' ','')
    return sss

def get_pagenum(cat_url):
    sss=get_str(cat_url)
    patternp=re.compile(r'(\d{2,4})</a>.*?a1')
    pagenum=patternp.findall(sss)#匹配并获取该栏目总页数
    return pagenum

def get_pageid(catp_url):
    sss=get_str(catp_url)
    pattern=re.compile(r'Pic">\n<ahref=.*?/(\d{1,5}).html')
    ssss=pattern.findall(sss)#匹配并获取栏目首页pageid
    pageid=ssss[:-10]#去掉正则表达式无法过滤掉的pageid
    return pageid

def get_postnum(post_url):
    sss=get_str(post_url)
    pattern=re.compile(r'(\d{1,3})</a><ahref="http://www.ituba.cc/[a-zA-Z]{3,}/\d{1,5}_\d{1,3}.html"class="page-ch"')
    postnum=pattern.findall(sss)#匹配文章分页总数
    return postnum

def get_imageurl(postp_url):
    sss=get_str(postp_url)
    pattern=re.compile(r'alt=.*?src="(.*?\.jpg)"')
    imageurl=pattern.findall(sss)#匹配图片地址
    print(imageurl[0])
    return imageurl
def mk_imagedir(cate_item,post_id):
    #创建文件夹保存目录
    if not os.path.exists(cat_item+'/'+post_id+'/'):
        os.makedirs(cat_item+'/'+post_id+'/')
def save_image(image_url):
    image_name=image_url[37:58]
    req = urllib.request.Request(image_url)
    req.add_header('User-Agent','Mozilla/5.0 (Windows NT 6.1; WOW64; rv:51.0) Gecko/20100101 Firefox/51.0')
    response=urllib.request.urlopen(req,timeout=1000)
    img=response.read()

    #将下载的图片保存到指定文件夹
    with open(cat_item+'/'+post_id+'/'+image_name,'wb') as f:
        f.write(img)
    f.close()

cat=['sexy','siwa','rihan','xiurenmote','model','belle','meinvtaotu']

for cat_item in cat:
    cat_url='http://www.ituba.cc/'+cat_item+'/'#构造分类栏目网址

    pagenum=get_pagenum(cat_url)

    for num in range(1,int(pagenum[0])+1):
        if num==1 :#栏目首页，直接获取文章id
            catp_url=cat_url
        else:
            catp_url=cat_url+'p%d.html'%num#通过栏目总页数生成所有分页

        pageid=get_pageid(catp_url)
        for post_id in pageid:
            post_url=cat_url+post_id+'.html'#构造文章网址   
            postnum=get_postnum(post_url)

            for post_num in range(1,int(postnum[0])+1):           
                if post_num==1 :#文章首页
                    postp_url=post_url
                    print(postp_url)
                else:
                    postp_url=cat_url+post_id+'_%d.html'%post_num#构造分页网址

                imageurl=get_imageurl(postp_url)
                mk_imagedir(cat_item,post_id)
                image_url='http:'+imageurl[0]#构造图片地址
                save_image(image_url)
                print('抓取完毕！')
```


上面是我写的另外一个爬虫，封装了很多自定义函数。同样是面向过程编写的。我总共写了三个爬虫，还有一个是用类写的，代码执行效率太慢，就不贴了。

一开始觉得写爬虫很简单，写着写着问题就都来了。你比如爬虫经常被屏蔽。这个时候就要给爬虫添加代理，添加header。然后你会发现每次抓到一半超时了，你重新运行爬虫发现又是从头抓取的，这个时候又要想到断点续传的问题。还有就是正则表达式，你应该怎么写，这些都是问题。

通过这次实践，我感觉收获还是很大的。实践是检验学习的唯一标准，看来我没有白学。

如果想下载学习，请关注我的公众号7TEC，就可以获取下载链接。

链接:https://pan.baidu.com/s/1z5NY_4pyouWyrSikDq_fGw 密码:gj2a
