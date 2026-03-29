const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = path.join(__dirname, '../content/posts');

function fixExcerpt(excerpt) {
  if (!excerpt) return '技术笔记';

  // 移除 URL
  let fixed = excerpt.replace(/https?:\/\/[^\s]+/g, '');

  // 限制长度
  fixed = fixed.length > 100 ? fixed.substring(0, 100) : fixed;

  // 清理空白
  fixed = fixed.trim();

  return fixed || '技术笔记';
}

function processFile(filepath) {
  const filename = path.basename(filepath);
  const content = fs.readFileSync(filepath, 'utf8');

  try {
    const { data, content: body } = matter(content);

    // 修复 excerpt
    if (data.excerpt) {
      data.excerpt = fixExcerpt(data.excerpt);
    }

    // 重新生成文件
    const newContent = matter.stringify(body, data);
    fs.writeFileSync(filepath, newContent, 'utf8');

    console.log(`✅ 已修复: ${filename}`);
  } catch (e) {
    console.log(`❌ 错误: ${filename} - ${e.message}`);
  }
}

// 处理所有文件
const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith('.md'))
  .map(file => path.join(postsDir, file));

console.log(`找到 ${files.length} 个文件\n`);

files.forEach(processFile);

console.log(`\n✨ 完成！`);
