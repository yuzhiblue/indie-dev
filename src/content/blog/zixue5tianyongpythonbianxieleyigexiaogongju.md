---
title: "自学5天，用Python编写了一个小工具"
description: "一直听说Python是一门很容易学的语言。不仅好学，而且特别强大，能做好多工作。于是就抱着试试看的态度看了一遍入门教程。感觉所有程序语言都是大同小异。 你比如： 都有常量和变量 都有函数 都有各种运算 都支持数据库 都用相似的文件读写方式"
pubDate: 2019-12-10
tags: ['支付', 'Python']
draft: false
slug: python-tool-in-5-days
---
一直听说Python是一门很容易学的语言。不仅好学，而且特别强大，能做好多工作。于是就抱着试试看的态度看了一遍入门教程。感觉所有程序语言都是大同小异。 你比如： 都有常量和变量 都有函数 都有各种运算 都支持数据库 都用相似的文件读写方式 都可以创建类 都是用相似的条件控制语句 ……

还有很多就不一一列举了，大家可以多总结，触类旁通。只要你学会一门语言，再学习第二种简直就是毛毛雨啊。就像作图软件你学会ps，其它基本也会了，你学会audition，其它音频软件也都会了。你学会会声会影，其它视频软件也都学会了。你会发现他们只是工具。只要能达到我想要的目的，用哪个工具都是无所谓的。

唯一每种语言不一样的就是一些细枝末节。比如变量怎么声明，函数需要添加哪几个字母。有哪些需要特别注意的。至于深层次的工作原理的不同，我们没有必要去知道，我们只要能使用工具达到我们的目的就可以了。

我的语言基础并不好。php自学了好多年，还从来没有独立编程过。每次都是在自己网站上面折腾来折腾去。甚至一个功能要研究好几天。

但是我用Python，只用来一上午就做出来了自己想要的功能。我能夸一下我自己吗，哈哈。

闲言少叙，我们直接上代码：



```
#使用类的方法构建投资模型
class Touzi:
   wsdrate=0.0005#网商贷利率为万五
   mrrate=0.0015#支付宝基金买入费率为0.15%
   txrate=0.0065#套现费率为0.65%
   def __init__(self,time,money):
       self.t=time
       self.m=money

   def wsd(self):#网商贷方案
       cydate=self.t-3#假设基金赎回有3天时间，是不计算收益的。
       #根据时间计算基金赎回费率
       if (0<=cydate<7):
           shrate=0.015
       elif(7<=cydate<30):
           shrate=0.0075
       elif(30<=cydate<365):
           shrate=0.005
       elif(365<=cydate<730):
           shrate=0.0025
       elif(730<=cydate):
           shrate=0  
       jjrate=self.mrrate+shrate#基金总费率
       wsdcb=self.m*self.wsdrate*self.t#网商贷成本
       jjmmcb=self.m*jjrate#基金总成本
       wsdcost=wsdcb+jjmmcb
       return wsdcost

   def tx(self):#信用卡套现方案
       cydate=self.t-3#假设基金赎回有3天时间，是不计算收益的。
       #根据时间计算基金赎回费率
       if (0<=cydate<7):
           shrate=0.015
       elif(7<=cydate<30):
           shrate=0.0075
       elif(30<=cydate<365):
           shrate=0.005
       elif(365<=cydate<730):
           shrate=0.0025
       elif(730<=cydate):
           shrate=0  
       jjrate=self.mrrate+shrate#基金总费率
       txcb=self.txrate*self.m
       jjmmcb=self.m*(1-self.txrate)*jjrate
       txcost=txcb+jjmmcb
       return txcost

i=1
while i==1:
   print("=====================================")
   print("为了更好的为您提供投资方案，请您输入以下信息！")
   print("=====================================")
   ts=int(input("请输入投资天数："))
   if (ts<=3):
       print("基金赎回期需要3天，请输入大于3的天数。")
       continue
   else:
       if (ts>45):
           print("请注意，信用卡还款期一般不超过45天，超过45天将会产生很大误差！") 
       je=int(input("请输入投资金额："))
       fa=Touzi(ts,je)#实例化方案
       w=fa.wsd()
       x=fa.tx()
       print("网商贷方案成本为：",w,"，信用卡套现成本为：",x)
       if(w<x):
           print("综上，应该选择网商贷方案！")
       else:
           print("综上，应该选择信用卡套现方案！")
```


简单介绍一下这个小工具。 如果你也喜欢买基金，想用钱生钱。但是你本钱却不够。这个时候没办法你只能借钱。找谁借？最简单的有两种方式，找支付宝借，或者信用卡套现！

大家支付宝打开，里面有个蚂蚁借呗，我的支付宝只有网商贷，其实差不多的。费率一般是万五，可以一次性付清。（千万不要找只能分期还款的）信用卡套现就是找个pos机，把现金刷出来。这两种不论哪一种方式都有费率。所以，我们要根据投资时间长短，投资金额的多少来选择合适的借款方式。这就是这个小工具的功能。

可能很多人看不太懂，没关系，改天用php开发一个web版的。
