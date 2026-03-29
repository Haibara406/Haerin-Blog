const fs = require('fs');
const path = require('path');

const noteDir = '/Users/haibara/Documents/note';

// 分类关键词映射
const categoryKeywords = {
  'Backend': ['后端', '服务', 'spring', 'bean', 'aop', 'redis', 'mysql', '数据库', '缓存', 'api', '接口'],
  'Frontend': ['前端', '小程序', 'vue', 'react', 'css', 'html', 'javascript'],
  'Algorithm': ['算法', '二分', '排序', '搜索', '动态规划', 'leetcode'],
  'Network': ['网络', 'tcp', 'http', 'udp', '协议', 'socket'],
  'System': ['操作系统', '进程', '线程', '内存', '虚拟地址', '物理地址', '用户态', '内核态'],
  'MessageQueue': ['消息队列', 'kafka', 'rabbitmq', 'mq', '消息'],
  'Interview': ['面经', '八股', '面试'],
  'Project': ['项目', '技术点', '汇报', '需求分析'],
  'AI': ['agent', 'ai', '人工智能', '机器学习'],
};

// 标签关键词映射
const tagKeywords = {
  'Java': ['java', 'jvm', 'spring', 'bean'],
  'Spring': ['spring', 'aop', 'bean', 'ioc'],
  'Database': ['数据库', 'mysql', 'redis', 'sql'],
  'Redis': ['redis', '缓存'],
  'MySQL': ['mysql', 'sql'],
  'Network': ['网络', 'tcp', 'http', 'udp'],
  'Algorithm': ['算法', '二分', '排序'],
  'Thread': ['线程', '并发', '锁', '同步'],
  'Process': ['进程', '线程'],
  'MessageQueue': ['消息队列', 'kafka', 'mq'],
  'Interview': ['面经', '面试'],
  'System': ['操作系统', '内核'],
  'AI': ['agent', 'ai'],
};

function inferCategory(filename, content) {
  const text = (filename + ' ' + content).toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }

  return 'Notes';
}

function inferTags(filename, content) {
  const text = (filename + ' ' + content).toLowerCase();
  const tags = [];

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags.slice(0, 5) : ['Notes'];
}

function generateExcerpt(content) {
  // 移除 frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '');

  // 移除标题标记
  const withoutHeaders = withoutFrontmatter.replace(/^#+\s+/gm, '');

  // 获取第一段非空内容
  const lines = withoutHeaders.split('\n').filter(line => line.trim().length > 0);
  const excerpt = lines[0] || '';

  // 限制长度
  return excerpt.length > 150 ? excerpt.substring(0, 150) + '...' : excerpt;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractTitle(filename) {
  return filename.replace(/\.md$/, '').replace(/-TODO$/, '');
}

function hasFrontmatter(content) {
  return content.startsWith('---\n');
}

function processFile(filepath) {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf8');

  // 如果已经有 frontmatter，跳过
  if (hasFrontmatter(content)) {
    console.log(`⏭️  跳过（已有 frontmatter）: ${filename}`);
    return;
  }

  const stats = fs.statSync(filepath);
  const date = formatDate(stats.mtime); // 使用修改时间
  const title = extractTitle(filename);
  const category = inferCategory(filename, content);
  const tags = inferTags(filename, content);
  const excerpt = generateExcerpt(content);

  const frontmatter = `---
title: "${title}"
date: "${date}"
excerpt: "${excerpt}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
category: "${category}"
---

`;

  const newContent = frontmatter + content;
  fs.writeFileSync(filepath, newContent, 'utf8');

  console.log(`✅ 已处理: ${filename}`);
  console.log(`   分类: ${category}`);
  console.log(`   标签: ${tags.join(', ')}`);
  console.log(`   日期: ${date}`);
  console.log('');
}

// 主函数
function main() {
  const files = fs.readdirSync(noteDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(noteDir, file));

  console.log(`找到 ${files.length} 个 markdown 文件\n`);

  files.forEach(processFile);

  console.log(`\n✨ 完成！共处理 ${files.length} 个文件`);
}

main();
