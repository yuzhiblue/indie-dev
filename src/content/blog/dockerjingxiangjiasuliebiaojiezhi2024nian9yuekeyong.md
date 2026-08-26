---
title: "Docker 镜像加速列表 截止2024年9月可用"
description: "国内经常使用Docker的朋友，可能都会涉及到配置镜像源的操作，来加速自己的镜像拉取。然而这段时间陆续发现曾经常用的国内镜像站（各种云商和高校镜像站）现在已经不能用了，搜索一番之后，找到可用镜像站或者镜像加速地址，并测试后汇总如下，使用前请"
pubDate: 2024-09-22
tags: ['技术']
draft: false
---
国内经常使用Docker的朋友，可能都会涉及到配置镜像源的操作，来加速自己的镜像拉取。然而这段时间陆续发现曾经常用的国内镜像站（各种云商和高校镜像站）现在已经不能用了，搜索一番之后，找到可用镜像站或者镜像加速地址，并测试后汇总如下，使用前请自行斟酌。

注意有些镜像站仅包含基础镜像或白名单镜像，如果一个加速地址拉不到需要的镜像，可切换其他地址尝试。

DockerHub 镜像仓库 | 是否正常  
---|---  
docker.registry.cyou | 正常  
docker-cf.registry.cyou | 正常  
dockerpull.com | 正常  
dockerproxy.cn | 正常  
docker.1panel.live | 正常  
hub.rat.dev | 正常  
dockerhub.icu | 正常  
docker.awsl9527.cn | 正常  
dhub.kubesre.xyz | 正常  
docker.hlyun.org | 正常  
docker.kejilion.pro | 正常  
registry.dockermirror.com | 正常  
docker.mrxn.net | 正常  
docker.chenby.cn | 正常  
ccr.ccs.tencentyun.com | 正常  
hub.littlediary.cn | 正常  
hub.firefly.store | 正常  
docker.nat.tf | 正常  
dh.jiasu.in | 正常  
hub.yuzuha.cc | 正常  
hub.crdz.gq | 正常  
noohub.ru | 正常  
docker.nastool.de | 正常  
hub.docker-ttc.xyz | 正常  
freeno.xyz | 正常  
docker.fxxk.dedyn.io | 正常  
dislabaiot.xyz | 正常  
docker.wget.at | 正常  
ginger20240704.asia | 正常  
lynn520.xyz | 正常  
doublezonline.cloud | 正常  
  
### 配置方式1：临时使用

直接使用，直接拿镜像域名拼接上官方镜像名，例如要拉去镜像yidadaa/chatgpt-next-web，可以用下面写法



```bash
docker pull dockerpull.com/yidadaa/chatgpt-next-web
```


### 配置方式2：长久有效

Ubuntu 16.04+、Debian 8+、CentOS 7+ 修改文件 /etc/docker/daemon.json（如果不存在则需要创建创建，注意不要写入中文），并重启服务。



```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
    "registry-mirrors": [
        "https://dockerpull.com",
        "https://docker.anyhub.us.kg",
        "https://dockerhub.jobcher.com",
        "https://dockerhub.icu",
        "https://docker.awsl9527.cn"
    ]
}
EOF
sudo systemctl daemon-reload && sudo systemctl restart docker
```


可直接使用docker pull拉去镜像进行测试，或用以下命令检查是否生效：



```bash
docker info
```


本文转载自：知乎作者CoderJia https://zhuanlan.zhihu.com/p/713698864
