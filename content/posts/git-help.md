---
title: git-help
date: '2025-12-24'
excerpt: Git常用命令速查表，涵盖分支操作、提交撤销、远程同步等高频场景，附中文注释。
tags:
  - Git
category: DevOps
---

# 🧭 Git 中文速查表

> 最常用的 Git 命令分类速查（含注释和示例）

---

## 🌿 基础操作

| 命令                                   | 说明             |
| -------------------------------------- | ---------------- |
| `git init`                             | 初始化本地仓库   |
| `git clone <url>`                      | 克隆远程仓库     |
| `git status`                           | 查看当前修改状态 |
| `git log --oneline --graph --decorate` | 简洁查看提交历史 |

---

## 🧩 分支操作

| 命令                                | 说明                     |
| ----------------------------------- | ------------------------ |
| `git branch`                        | 查看本地分支             |
| `git branch -a`                     | 查看本地+远程分支        |
| `git checkout <branch>`             | 切换分支                 |
| `git checkout -b dev origin/dev`    | 基于远程分支新建本地分支 |
| `git branch -d <branch>`            | 删除本地分支             |
| `git push origin --delete <branch>` | 删除远程分支             |

---

## 💾 提交与撤销

| 命令                      | 说明                           |
| ------------------------- | ------------------------------ |
| `git add .`               | 添加所有修改到暂存区           |
| `git commit -m "说明"`    | 提交修改                       |
| `git commit --amend`      | 修改上一次提交                 |
| `git reset --hard HEAD~1` | 回退上一次提交（危险操作）     |
| `git reflog`              | 查看所有操作历史（可用于找回） |

---

## 🚀 同步远程仓库

| 命令                     | 说明                           |
| ------------------------ | ------------------------------ |
| `git fetch origin`       | 拉取远程最新分支更新（不合并） |
| `git pull origin main`   | 拉取并合并远程 main            |
| `git push origin main`   | 推送本地 main                  |
| `git push -u origin dev` | 推送本地 dev 并建立追踪关系    |

---

## 🔄 放弃修改与同步远程

| 命令                                                         | 说明                             |
| ------------------------------------------------------------ | -------------------------------- |
| `git restore .`                                              | 放弃所有未提交修改               |
| `git reset --hard`                                           | 清空暂存区和工作区               |
| `git clean -fd`                                              | 删除未跟踪文件和目录             |
| `git fetch origin && git reset --hard origin/main && git clean -fd` | 强制同步远程状态（彻底覆盖本地） |

---

## 🧠 实用命令

| 命令                            | 说明             |
| ------------------------------- | ---------------- |
| `git diff`                      | 查看当前修改差异 |
| `git stash`                     | 暂存未提交修改   |
| `git stash pop`                 | 恢复暂存内容     |
| `git tag -a v1.0 -m "版本说明"` | 创建标签         |
| `git show v1.0`                 | 查看标签详情     |

---

## 🧰 高级技巧

- **只克隆指定分支：**
  
  ```bash
  git clone -b 分支名 仓库地址

* **修改远程仓库地址：**

  ```
  git remote set-url origin 新地址
  ```

* **查看当前仓库配置：**

  ```
  git remote -v
  git config -l
  ```

* **强制推送（危险）：**

  ```
  git push -f origin 分支名
  ```

  



