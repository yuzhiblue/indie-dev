---
title: "网页跳转到微信添加好友的三种代码实现方案"
description: "写这篇文章是因为最近一直在玩抖音，无意间接触到一个小功能，叫抖音卡片。一个链接丢到私信窗口就会生成一个卡片。然后点击卡片就会自动跳转到微信添加好友。这么做的好处是有利于私域营销，而且还不容易封号，可谓是一举两得。 跳转功能其实很好实现，但凡"
pubDate: 2023-12-26
tags: ['技术']
draft: false
---
写这篇文章是因为最近一直在玩抖音，无意间接触到一个小功能，叫抖音卡片。一个链接丢到私信窗口就会生成一个卡片。然后点击卡片就会自动跳转到微信添加好友。这么做的好处是有利于私域营销，而且还不容易封号，可谓是一举两得。

跳转功能其实很好实现，但凡有点html基础自己都能做一个。但是要想使用抖音的API生成跳转链接就有一定的门槛了。

要说互联网挣钱呢，互联网行业是信息差最大的行业。因为对于哪些不会写代码的人来说，要想实现一个简单的功能太难了。还好我不是这一类人。我好歹也会搞点代码。于是我就想着将该功能移植到自己的网站上。

网上几乎搜了个遍，都是推销私信卡片的。想找一个技术贴真是太难了。不过经过不懈努力，还是找到了一些。这里我就分别用三种方案实现网页跳转到微信加好友的功能。

**方案一：官方方式：weixin://dl/business/t=XXX**



```html
<div class="page full">
    <div id="public-web-container" class="public-container">
            <div class="button-container open-btn">
                <a id="public-web-jump-button" href="weixin://dl/business/?t=TICKETS" class="default" style="">打开微信</a>
            </div>
    </div>
    <input type="hidden" value="weixin://dl/business/?t=TICKETS" id="urls">
    </div>
    
<script src="http://wailian.example.com/assets/api/js/qrcode.min.js"></script>
    <script type="text/javascript">
    //判断是否微信登陆
    function isWeiXin() {
        var ua = window.navigator.userAgent.toLowerCase();
        console.log(ua);//mozilla/5.0 (iphone; cpu iphone os 9_1 like mac os x) applewebkit/601.1.46 (khtml, like gecko)version/9.0 mobile/13b143 safari/601.1
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    }
    function isMobile() {
        var mobile_flag = true;
        if (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|XiaoMi|IEMobile)/i)) {
            mobile_flag = true;
        } else {
            mobile_flag = false;
        }
        var screen_width = window.screen.availWidth;
        if (screen_width < 700) {
            mobile_flag = true;
        }
        return mobile_flag;
    }
    if (!isMobile()) {
        new QRCode(document.getElementById("qrcodes"), {
            text: window.location.href,
            correctLevel: QRCode.CorrectLevel.H
        });
    } else {
        window.onload = function () {
            window.location.href = $("#urls").val();
        }
    }
</script>
```


这种方案是实现这个功能最简单的方案，也是最难的方案。为什么这么说，因为要申请小程序，而且是非个人类主体才可以，不然你拿不到tickets。如果你有企业营业执照，建议你这么搞。

**方案二：寻找第三方API**

我这个API是从一个朋友那边看到的，还挺好用。



```html
<p class="text-center fixed-bottom d-md-none">
    <a id="public-web-jump-button" href="" class="btn btn-success" >点击添加老板微信</a>
</p>

<script>
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }
    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    }
</script>
<script type="text/javascript">
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    var ua = window.navigator.userAgent.toLowerCase();
    $(document).ready(function () {
        q = 's5gObf'
        if (isMobile && ua.match(/micromessenger/i) != 'micromessenger') {
            let param = q + '-scheme'
            let scheme = getCookie(param)
            if (scheme && scheme != 'undefined') {
                $('#public-web-jump-button').attr('href', scheme)
                location.href = scheme;
            } else {
                $.get('https://www.example.com/api/v2/getScheme', {
                    code: q,
                    url_type: 'scheme'
                }, function (e) {
                    if (e.data && e.data.url) {
                        $('#public-web-jump-button').attr('href', e.data.url)
                        setCookie(param, e.data.url, 1)
                    } else {
                        alert('请手动添加老板微信：salesleads')
                    }
                })
            }
        }
    });
</script>
```


这种方式是最完美的方式，因为你不用营业执照也可以实现微信跳转功能，也不用找什么tickets，但是缺点也很明显，哪天朋友不让你用了，你也只能再想其他办法了。

**方案三：先复制微信号再调起微信**

如果前面两种没有条件实现，那么退而求其次，这种方案也是不错的选择。

这里我说一下思路：

首先你要做一个复制按钮，用户点击按钮复制微信号到剪切板。这个功能很好实现，你可以自己写JS代码，也可以用clipboard.js

其次点击完按钮，复制成功之后，调起微信就可以了。怎么做？只需要让



```html
location.href="weixin://"
```


这样就可以了。

这种方案实现起来最简单，但是只能说凑合能用，因为客户都是懒的，能不输文字就不输，能不记号码就不记。用起来没有前面两种丝滑。不过这种方案真的是完全免费。

以上，根据个人需求选择。今天的分享就到这里，有问题请随时留言。
