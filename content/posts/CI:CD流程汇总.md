---
title: 'CI:CD流程汇总'
date: '2025-11-07'
excerpt: 工作流程：
tags:
  - 'CI:CD'
category: Backend
---

## 工作流程：

```bash
本地开发 -> 推送到Gitee -> 仓库镜像同步到GitHub -> 出发GitHub Actions -> 构建并部署到服务器
```

### 阶段一：创建GitHub仓库（如果有则跳过）

1. 访问：https://github/com/new
2. 填写信息（不要勾选任何初始化选项，访问权限按需设置）

### 阶段二：配置Gitee 和 GitHub的同步

1. 访问https://github.com/settings/tokens/new，勾选repo和workflow，生成GitHub访问令牌并保存
2. 配置Gitee镜像仓库，进入**管理 -> 仓库镜像管理 -> 添加镜像**， 认证你的GitHub账号，随后选择镜像方式（Push），远程仓库名，填写GitHub的访问令牌

### 阶段三：创建CI/CD配置文件

1. 在项目根目录创建`.github/workflow/deploy.yml`
2. 编写工作流

### 阶段四：配置GitHub Secrets

1. 登陆DockerHub，访问https://hub.docker.com/并登陆自己的账号
2. 检查是否存在对应仓库，不存在则创建
3. 点击头像选择Account Settings，找到Personal access tokens创建访问令牌，并保存
4. 访问GitHub仓库，选择Settings -> Secrets and variables -> Actions 创建一个Scerets，将刚才生成的DockerHub访问命令填写进去
5. 检查本地是否存在密钥即：`ls ~/.ssh/`，如果没有这创建`ssh-keygen -t rsa -b 4096 -C "github-actions"` 一路回车不设置密码
6. 将公钥添加到服务器中`ssh-copy-id root@xxx.xxx.xxx.xxx` 若ssh-copy-id命令无法执行，则`cat ~/.ssh/id_rsa.pub | ssh root@xxx.xxx.xxx.xxx "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`
7. 在本地测试链接服务器，若不需要密码则链接成功
8. 接着获取私钥`cat ~/.ssh/id_rsa`，并将私钥添加到GitHub中，创建Secrets

### 阶段五：测试部署

1. 执行一次代码推送，在GitHub中查看构建

