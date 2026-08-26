---
title: "wordpress非插件自定义评论框模板"
description: "最近一直在折腾Wordpress，感觉网上很多都是很老旧的知识了，wordpress已经更新到4.1版本，很多知识也需要更新一下了。我打算写一系列关于Wordpress的文章，为大家更新一下知识。当然，我不是PHP程序员，也不会编写程序，但"
pubDate: 2015-02-03
tags: ['技术']
draft: false
---
最近一直在折腾Wordpress，感觉网上很多都是很老旧的知识了，wordpress已经更新到4.1版本，很多知识也需要更新一下了。我打算写一系列关于Wordpress的文章，为大家更新一下知识。当然，我不是PHP程序员，也不会编写程序，但是时间长了慢慢的也就会用一些代码了。如果有什么错误也请大家留言指正。

今天先从自定义评论模板开始讲起，也就是主题里面的comments.php。本篇文章的前提是你要用官方自带主题里面的comments.php来替代你自定义的模板，否则有些代码是无效的。

comments.php最重要的两个函数wp_list_comments()和comment_form()。wp_list_comments()是评论列表函数，comment_form()是评论框函数。这里自定义评论框主要是自定义comment_form函数。你还在像以前一样写一大堆代码吗？就像这样：

别犯傻了，这种方法五年前就已经出现了，截至目前wordpress已经更新了那么多版本，而你还在用着过时的技术。其实你只需要一个comment_form()函数就可以搞定。以前能自定义的，现在都可以自定义，而且更方便。下面我们来介绍一下这个函数，如图：

**一、如何去除站点框？**

如果我们想要删除网址字段，只需要打开主题的 functions.php 文件，添加以下代码：



```
add_filter('comment_form_default_fields', 'mytheme_remove_url');
function mytheme_remove_url($arg) {
    $arg['url'] = '';
    return $arg;
}
```


保存后刷新页面，你就会看到“url”输入框已经不存在了。

**二、如何添加电话表单？**

假设我们要添加一个电话字段，同样在主题的 functions.php 添加下面的代码即可：



```
function my_fields($fields) {
    $fields['tel'] = '<p class="comment-form-tel">' . '<label for="tel">'.__('Tel').'</label> ' .
    '<input id="tel" name="tel" type="text" value="' . esc_attr( $commenter['comment_tel'] ) . '" size="30" /></p>';
    return $fields;
}
add_filter('comment_form_default_fields','my_fields');
```


刷新页面，即可看到新增的表单。

**三、如何添加验证码？**

将下面一段代码粘贴到function文件里即可。



```
/*验证码*/
function yanzhengma(){
if ( !$user->ID ) {
$a = trim($_POST[a]);
$b = trim($_POST[b]);
if((($a)!=$b)|| empty($a)){
wp_die( __('错误提示：请输入正确的验证码。') );
}
}
}
add_filter('pre_comment_on_post', 'yanzhengma');
//添加验证码
function my_yanzhengma($fields) {
  $b=rand(100,999);
    $fields['yzm'] = '<p class="comment-form-yzm"><label for="a">评论验证<span class="required"> * </span></label><input type="text" name="a" id="a"  size="3" value="" /><b style="color:#F00;font-size:16px; vertical-align:middle">'. $b .'</b><input type="hidden" name="b" value="'. $b . '"></p>';
    return $fields;
}
add_filter('comment_form_default_fields','my_yanzhengma');
```


**四、如何添加@功能？**

呵呵，如果你还是用以前自定义的模板，这个功能肯定用不了。同样，添加以下代码到function文件。



```
// 评论添加@，by Ludou
function comment_add_at( $comment_text, $comment = '') {
  if( $comment->comment_parent > 0) {
    $comment_text = '@<a href="#comment-' . $comment->comment_parent . '">'.get_comment_author( $comment->comment_parent ) . '</a> ' . $comment_text;
  }

  return $comment_text;
}
add_filter( 'comment_text' , 'comment_add_at', 20, 2);
```


**五、如何添加表情？**

首先，将一个名为smilies文件夹复制到你主题的目录下面； 其次，将smiley.php文件复制到你主题的目录下面； 最后，在function中写入以下代码：



```
    //替换表情路径
add_filter('smilies_src','custom_smilies_src',1,10);
function custom_smilies_src ($img_src, $img, $siteurl){
return get_bloginfo('template_directory').'/smilies/'.$img;
}
function my_smiley() {
  echo '<p class="comment-form-smiley">';
    include('smiley.php');
    echo '</p>';
}
// 在默认字段（前面说的姓名、邮箱和网址）的下面添加字段
add_filter('comment_form_after_fields', 'my_smiley');
// 在已登录下面添加字段（因为用户登录后，是没有默认上面三个字段的），所以要使用这个钩子插入内容
add_filter('comment_form_logged_in_after', 'my_smiley');
```


看一下截图效果：

哦对了，表情包文件大家可以从网上下载，也可以留言联系我索取。
