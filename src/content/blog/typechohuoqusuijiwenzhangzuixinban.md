---
title: "typecho获取随机文章（最新版）"
description: "最近在帮一个朋友做网站，发现提示错误database query erro。 于是我就打开了debug模式查看一下是哪里的问题。 将上面代码丢进config.inc.php页面，保存，刷新首页。提示随机文章报错。no such functi"
pubDate: 2019-03-09
tags: ['数据库', '前端']
draft: true
slug: typecho-random-posts
---
最近在帮一个朋友做网站，发现提示错误database query erro。

于是我就打开了debug模式查看一下是哪里的问题。



```
/**开启debug模式*/
define('__TYPECHO_DEBUG__', true);
```


将上面代码丢进config.inc.php页面，保存，刷新首页。提示随机文章报错。no such function:now in ......

于是打开function.php看一下随机文章的代码，再去网上搜了一下，发现没问题呀。可是就是执行不了。于是就在网上借鉴了另外一段代码。最终将原来的代码改为：



```
function getRandomPosts($random){
    $modified = $random->modified;
    $db = Typecho_Db::get();
    $adapterName = $db->getAdapterName();//兼容非MySQL数据库
    if($adapterName == 'pgsql' || $adapterName == 'Pdo_Pgsql' || $adapterName == 'Pdo_SQLite' || $adapterName == 'SQLite'){
        $order_by = 'RANDOM()';
    }else{
        $order_by = 'RAND()';
    }
    $sql = $db->select()->from('table.contents')
        ->where('status = ?','publish')
        ->where('table.contents.created <= ?', time())
        ->where('type = ?', 'post')
        ->limit(5)
        ->order($order_by);

$result = $db->fetchAll($sql);
if($result){
    foreach($result as $val){
        $obj = Typecho_Widget::widget('Widget_Abstract_Contents');
        $val = $obj->push($val);
        $post_title = htmlspecialchars($val['title']);
        $permalink = $val['permalink'];
        echo '<li><i class="fa fa-book"></i>
            <a href="'.$permalink.'">'.$post_title.'</a></li>';
    }
}
}
```


保存，刷新首页。灯等灯等，完美解决。

总结了一下，发现问题在于数据库上面。因为我用的是sqlite数据库，而网上流传的大部分代码都是用的mysql数据库。所以才会出错。而以上代码的优点在于可以兼容各种数据库！

完整使用方法： 1.将上面完整的随机文章代码丢进主题文件夹的function.php里面，保存； 2.在需要添加随机文章的地方加上代码：，保存； 3.刷新页面，搞定！
