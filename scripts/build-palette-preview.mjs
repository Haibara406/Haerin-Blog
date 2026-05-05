import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const COLOR_COORDINATION_ROOT = '/Users/haibara/Documents/Else-Program/Color-Coordination'
const BLOG_ROOT = '/Users/haibara/Documents/Else-Program/Haerin-Blog'
const OUT_DIR = join(BLOG_ROOT, 'public', 'palette-preview')
const APP_SCRIPT_PATH = join(COLOR_COORDINATION_ROOT, 'assets', 'app.js')

const PHRASE_TRANSLATIONS = [
  ['Toggle palettes', '切换配色栏'],
  ['Toggle section colors', '切换色值区'],
  ['Curated colors in context.', '在真实语境里看配色。'],
  [
    'Not sure what colors to use in your designs or where to use them? Happy Hues is a color palette inspiration site that acts as a real world example as to how the colors could be used in your design projects.',
    '不知道设计里该怎么选颜色、又该把颜色放在哪里？这个页面会把 Happy Hues 的配色直接放进真实界面里，让你更直观地判断它适不适合你的博客。',
  ],
  ['Try changing the palette!', '试试切换配色'],
  ['This sections hues', '当前区域色值'],
  ['Click to copy the hex code to your clipboard', '点击复制十六进制色值'],
  ['Elements', '元素'],
  ['Illustration', '插画'],
  ['Icons', '图标'],
  ['Color terminology', '色彩术语'],
  ["Let’s learn the terminology of color. You can think of each of these as ‘levers’ that you pull to create different colors.", '先快速过一下色彩术语。你可以把它们理解成你在调色时不断拉动的几个控制杆。'],
  ['Hue is basically a fancy name for color... Sort of. Hue refers to the parent color, or rather the fully saturated color that doesn’t have any white (tint) or black (shade) added to it.', '色相本质上就是“颜色”这个词更专业一点的叫法。它指的是没有加白、也没有加黑的母色，也就是最原始、最饱和的那层颜色。'],
  ['A tint is created when you add white to a hue. When working in Figma, Sketch or any of the adobe programs, you can create a tint by lowering the saturation value of your hue.', '明色是在色相里加入白色之后得到的结果。放到 Figma、Sketch 或 Adobe 这些设计工具里理解，就是把色彩往更浅、更柔和的方向推。'],
  ['A shade is created when you add black to a hue. Again, when working in Figma, Sketch or any of the adobe programs, you can create a shade by lowering the brightness value of your hue.', '暗色是在色相里加入黑色之后得到的结果。放到设计工具里，就是把颜色往更深、更重的方向压下去。'],
  ["A tone is in between a tint and a shade. Basically you're adding grey, aka both white & black, to your hue.", '综合色调介于明色和暗色之间，本质上就是往原色里加入灰，也就是同时混入一点白和黑。'],
  ["Value refers to the measurement of brightness of a hue. Basically it's how light or dark the color is and how much light it emits.", '明度描述的是一个颜色到底有多亮、或者有多暗，你也可以把它理解成它看起来能反出多少光。'],
  ['Saturation refers to the purity of the color. High saturated colors are very vibrant and bright, while low saturated colors are kinda dull.', '饱和度描述的是颜色的纯度。高饱和的颜色会更鲜艳、更亮眼，低饱和的颜色则会更克制、更柔和。'],
  ['The psychology of color', '色彩心理'],
  ['Each color portrays a different feeling or emotion, and by understanding the psychology of color, you can choose a color that will resonate with your target audience and give off the vibe & emotion you want.', '每种颜色都会传达不同的情绪。理解这一点之后，你在给博客选色时，就更容易找到真正贴合气质的那一套。'],
  ['Each color portrays a different feeling or emotion, and by understanding the psychology of color, you can choose a color that will resonate with your target audience and give off the vibe &amp; emotion you want.', '每种颜色都会传达不同的情绪。理解这一点之后，你在给博客选色时，就更容易找到真正贴合气质的那一套。'],
  ['Red is a very emotionally & visually intense color that can actually have a physical effect on people by raising their metabolism, respiration, heart rate, as well as making them hungry. That combined by with the fact that red is very attention grabbing, you see red used in the branding of pretty much all fast food chains.', '红色在视觉和情绪上都很强烈，甚至会对人产生生理影响，比如提高代谢、呼吸频率和心率，也更容易唤起食欲。再加上它非常抓眼，所以你会在很多快餐品牌里看到它。'],
  ['Red is a very emotionally &amp; visually intense color that can actually have a physical effect on people by raising their metabolism, respiration, heart rate, as well as making them hungry. That combined by with the fact that red is very attention grabbing, you see red used in the branding of pretty much all fast food chains.', '红色在视觉和情绪上都很强烈，甚至会对人产生生理影响，比如提高代谢、呼吸频率和心率，也更容易唤起食欲。再加上它非常抓眼，所以你会在很多快餐品牌里看到它。'],
  ["It's all about the sun, baby! Yellow is a bright & energizing color that evokes feelings of happiness & positivity. It also grabs your attention, so it makes for a great call to action, and it's why you'll see it used as warning signs or combined with red in basically all fast food logos.", '黄色会让人直接联想到阳光。它明亮、轻快，天然带着快乐和积极的感觉，也很能吸引注意力，所以很适合拿来做强调按钮、提示信息，或者和红色一起出现在餐饮品牌里。'],
  ['It&#x27;s all about the sun, baby! Yellow is a bright &amp; energizing color that evokes feelings of happiness &amp; positivity. It also grabs your attention, so it makes for a great call to action, and it&#x27;s why you&#x27;ll see it used as warning signs or combined with red in basically all fast food logos.', '黄色会让人直接联想到阳光。它明亮、轻快，天然带着快乐和积极的感觉，也很能吸引注意力，所以很适合拿来做强调按钮、提示信息，或者和红色一起出现在餐饮品牌里。'],
  ["But just a heads up, studies have shown that the color yellow can trigger the anxiety centers of the brain, so don't go painting your walls a saturated yellow unless you want a short temper and crying babies.", '不过也要注意，研究里提到高饱和黄色可能会刺激大脑里的焦虑反应，所以它适合点缀，不太适合大面积铺满。'],
  ['But just a heads up, studies have shown that the color yellow can trigger the anxiety centers of the brain, so don&#x27;t go painting your walls a saturated yellow unless you want a short temper and crying babies. ', '不过也要注意，研究里提到高饱和黄色可能会刺激大脑里的焦虑反应，所以它适合点缀，不太适合大面积铺满。'],
  ["Blue is a very calming color and can actually slow your metabolism (notice how there's little to no food brands that use blue in their branding). It's a broadly appealing color, which is why global companies like Facebook & Twitter use it for their logos. Although it is a broadly appealing color, it tends to be favored by men, with over 50% of men studied saying blue was their favorite color.", '蓝色通常会让人感到平静，甚至可能降低代谢速度，所以你几乎看不到餐饮品牌大面积用蓝色。它又是一种接受度非常高的颜色，这也是为什么 Facebook、Twitter 这类全球化产品都喜欢用它。'],
  ['Blue is a very calming color and can actually slow your metabolism (notice how there&#x27;s little to no food brands that use blue in their branding). It&#x27;s a broadly appealing color, which is why global companies like Facebook &amp; Twitter use it for their logos. Although it is a broadly appealing color, it tends to be favored by men, with over 50% of men studied saying blue was their favorite color.', '蓝色通常会让人感到平静，甚至可能降低代谢速度，所以你几乎看不到餐饮品牌大面积用蓝色。它又是一种接受度非常高的颜色，这也是为什么 Facebook、Twitter 这类全球化产品都喜欢用它。'],
  ["Green is the color of nature. It's soothing on the eyes and can promote healing... Seriously, it can lower your blood pressure, calm your mind and also suppress your appetite. Green is a great choice is your brand is associated with nature, health or money.", '绿色天然会让人联想到自然，也更护眼、更放松。它常常和健康、治愈、安全、金钱这些关键词连在一起，所以如果你的气质偏自然、偏健康、偏稳定，绿色会是很稳的一类选择。'],
  ['Green is the color of nature. It&#x27;s soothing on the eyes and can promote healing... Seriously, it can lower your blood pressure, calm your mind and also suppress your appetite. Green is a great choice is your brand is associated with nature, health or money.', '绿色天然会让人联想到自然，也更护眼、更放松。它常常和健康、治愈、安全、金钱这些关键词连在一起，所以如果你的气质偏自然、偏健康、偏稳定，绿色会是很稳的一类选择。'],
  ["Orange is the less aggressive baby brother of red. It's highly visible (though less so than red) which is why you'll see it used in construction and safety hunting equipment. It makes for a great call to action.", '橙色可以看作是没有那么强攻击性的红色版本。它依旧醒目、依旧有行动感，但没有红色那么紧张，所以也很适合做强调按钮和高可见性的提示。'],
  ['Orange is the less aggressive baby brother of red. It&#x27;s highly visible (though less so than red) which is why you&#x27;ll see it used in construction and safety hunting equipment. It makes for a great call to action.', '橙色可以看作是没有那么强攻击性的红色版本。它依旧醒目、依旧有行动感，但没有红色那么紧张，所以也很适合做强调按钮和高可见性的提示。'],
  ["Purple thinks it's better than all the other peasant colors. Lol, jk ;) Purple just has a history of being the color of superiority, being used by royalty to flaunt their position & power. It's associated with power, nobility, prestige & luxury. Purple can fall on both the warm and the cool side of the color wheel depending on how much red vs blue is added.", '紫色一直带着一点高贵、神秘和奢华感，因为它在历史上常常被皇室和权力象征使用。它既可以偏暖，也可以偏冷，取决于里面红和蓝的比例。'],
  ['Purple thinks it&#x27;s better than all the other peasant colors. Lol, jk ;) Purple just has a history of being the color of superiority, being used by royalty to flaunt their position &amp; power. It&#x27;s associated with power, nobility, prestige &amp; luxury. Purple can fall on both the warm and the cool side of the color wheel depending on how much red vs blue is added.', '紫色一直带着一点高贵、神秘和奢华感，因为它在历史上常常被皇室和权力象征使用。它既可以偏暖，也可以偏冷，取决于里面红和蓝的比例。'],
  ["White is the blank canvas color that has all sorts of meanings to it. It's connected to cleanliness, virtue, purity, innocence... In North American cultures that is. In other parts of the world it can have an opposite meaning.", '白色像一张空白画布，经常和纯净、整洁、克制这些感觉连在一起。不过它在不同文化里含义并不完全一样，所以最好结合具体语境来看。'],
  ['White is the blank canvas color that has all sorts of meanings to it. It&#x27;s connected to cleanliness, virtue, purity, innocence... In North American cultures that is. In other parts of the world it can have an opposite meaning.', '白色像一张空白画布，经常和纯净、整洁、克制这些感觉连在一起。不过它在不同文化里含义并不完全一样，所以最好结合具体语境来看。'],
  ["White pairs great with basically any color on the spectrum. It has high contrast with pretty much all other colors and allows other colors to shine through, so it's a great choice for background colors.", '白色几乎可以和任何颜色搭配，而且能把别的颜色衬得更清楚，所以常常是背景色里的安全选项。'],
  ['White pairs great with basically any color on the spectrum. It has high contrast with pretty much all other colors and allows other colors to shine through, so it&#x27;s a great choice for background colors.', '白色几乎可以和任何颜色搭配，而且能把别的颜色衬得更清楚，所以常常是背景色里的安全选项。'],
  ["Black is a very powerful color... Well kind of. Black is the absence of color (ie light), which means it is not really a color itself. It has very high contrast, especially with white, so it's a popular color to use on the web.", '黑色通常会给人力量感、秩序感和高级感。它和白色的对比尤其强，所以在网页和界面设计里一直非常常见。'],
  ['Black is a very powerful color... Well kind of. Black is the absence of color (ie light), which means it is not really a color itself. It has very high contrast, especially with white, so it&#x27;s a popular color to use on the web. ', '黑色通常会给人力量感、秩序感和高级感。它和白色的对比尤其强，所以在网页和界面设计里一直非常常见。'],
  ['Button text', '按钮文字'],
  ['Sub headline', '副标题'],
  ['Card background', '卡片背景'],
  ['Card heading', '卡片标题'],
  ['Card paragraph', '卡片正文'],
  ['Card headline', '卡片标题'],
  ['Card tag background', '标签背景'],
  ['Card tag text', '标签文字'],
  ['Card highlight', '卡片强调色'],
  ['Primary color', '原色'],
  ['Secondary color', '间色'],
  ['Neutral color', '中性色'],
  ['Background', '背景'],
  ['Headline', '标题'],
  ['Paragraph', '正文'],
  ['Button', '按钮'],
  ['Stroke', '描边'],
  ['Main', '主色'],
  ['Highlight', '高光'],
  ['Secondary', '辅助色'],
  ['Tertiary', '第三色'],
]

const NODE_TEXT_TRANSLATIONS = [
  ['Hue', '色相'],
  ['Tint', '明色'],
  ['Shade', '暗色'],
  ['Tone', '综合色调'],
  ['Value', '明度'],
  ['Saturation', '饱和度'],
  ['Red', '红色'],
  ['Yellow', '黄色'],
  ['Blue', '蓝色'],
  ['Green', '绿色'],
  ['Orange', '橙色'],
  ['Purple', '紫色'],
  ['White', '白色'],
  ['Black', '黑色'],
  ['Often associated with', '常见联想'],
  ['Courage', '勇气'],
  ['Power', '力量'],
  ['Strength', '强度'],
  ['Danger', '危险'],
  ['Anger', '愤怒'],
  ['Love', '爱'],
  ['Elegance', '优雅'],
  ['Passion', '热情'],
  ['Romance', '浪漫'],
  ['Sunshine', '阳光'],
  ['Childish', '童真'],
  ['Fun', '趣味'],
  ['Happiness', '快乐'],
  ['Optimism', '乐观'],
  ['Positivity', '积极'],
  ['Caution', '警示'],
  ['Anxiety', '焦虑'],
  ['Cowardice', '怯懦'],
  ['Calmness', '平静'],
  ['Tranquility', '宁静'],
  ['Stability', '稳定'],
  ['Loyalty', '忠诚'],
  ['Faith', '信任'],
  ['Heaven', '天空'],
  ['Loneliness', '孤独'],
  ['Sadness', '忧郁'],
  ['Health', '健康'],
  ['Nature', '自然'],
  ['Environment', '环境'],
  ['Cleanliness', '洁净'],
  ['Safety', '安全'],
  ['Growth', '成长'],
  ['Money', '金钱'],
  ['Greed', '贪婪'],
  ['Envy', '嫉妒'],
  ['Friendliness', '友好'],
  ['Energy', '能量'],
  ['Adventure', '冒险'],
  ['Enthusiasm', '热忱'],
  ['Creativity', '创造力'],
  ['DIY', '动手感'],
  ['Royalty', '尊贵'],
  ['Luxury', '奢华'],
  ['Sophistication', '精致'],
  ['Magic', '神秘'],
  ['Spirituality', '灵性'],
  ['Moodiness', '情绪感'],
  ['Innocence', '纯真'],
  ['Purity', '纯净'],
  ['Virtue', '克制'],
  ['Sterile', '无菌感'],
  ['Plain', '朴素'],
  ['Empty', '留白'],
  ['Mystery', '神秘'],
  ['Fear', '恐惧'],
  ['Death', '死亡'],
  ['Evil', '危险感'],
]

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildRoute(id, language) {
  return `/palette-preview/${id}-${language}.html`
}

function localizeHtml(html, language) {
  if (language !== 'zh') {
    return html
  }

  let output = html

  for (const [source, target] of PHRASE_TRANSLATIONS) {
    output = output.split(source).join(target)
  }

  for (const [source, target] of NODE_TEXT_TRANSLATIONS) {
    output = output.replace(new RegExp(`>${escapeRegExp(source)}<`, 'g'), `>${target}<`)
  }

  return output
}

function injectControlStyles(html, id, language) {
  const heroButtonMatch = html.match(/style="background-color:([^;]+);color:([^;]+);[^"]*"[^>]*class="button hero-button w-button"/)
  const headerLinkMatch = html.match(/style="color:([^";]+)"[^>]*class="header-nav__link"/)
  const pageBackgroundMatch = html.match(/data-clipboard-text="(#[0-9a-fA-F]{6}|black)" class="section-hues-row">[\s\S]*?<div class="hue-title"[^>]*>(?:背景|Background)<\/div>/)

  const buttonBackground = heroButtonMatch?.[1] ?? '#ff6e6c'
  const buttonText = heroButtonMatch?.[2] ?? '#1f1135'
  const headline = headerLinkMatch?.[1] ?? '#1f1135'
  const background = pageBackgroundMatch?.[1] === 'black' ? '#000000' : pageBackgroundMatch?.[1] ?? '#ffffff'
  const applyLabel = language === 'zh' ? '确认应用' : 'Apply to blog'

  const controls = `
<style>
  .blog-sync-apply {
    position: fixed;
    z-index: 1000002;
    font-family: proxima-nova, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .blog-sync-apply {
    right: 24px;
    bottom: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 184px;
    min-height: 52px;
    border: 1px solid ${headline};
    border-radius: 999px;
    background: ${buttonBackground};
    color: ${buttonText};
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 767px) {
    .blog-sync-apply {
      right: 14px;
      left: 14px;
      bottom: 14px;
      min-width: 0;
    }
  }
</style>
<button id="blog-sync-apply" class="blog-sync-apply" type="button">${applyLabel}</button>
`

  return html.replace('</body>', `${controls}</body>`)
}

function rewriteDocument(html, id, language, appScript) {
  let output = html.replace(/\/assets\//g, '/happy-hues-assets/')

  output = output.replace(/href="\/palettes\/(\d+)"/g, (_, targetId) => {
    return `href="${buildRoute(targetId, language)}"`
  })

  output = output.replace(/href="\/"/g, `href="${buildRoute(id, language)}"`)
  output = output.replace(/data-route="\/palettes\/\d+"/, `data-route="${buildRoute(id, language)}"`)
  output = output.replace(/href="#" class="header-nav__link">([^<]+)<\/a>/, 'href="#" data-sync-action="toggle-palettes" class="header-nav__link">$1</a>')
  output = output.replace(/href="#" class="header-nav__link">([^<]+)<\/a>/, 'href="#" data-sync-action="toggle-hues" class="header-nav__link">$1</a>')
  output = output.replace(/<script src="\/happy-hues-assets\/app\.js" defer><\/script>/, `<script>${appScript}</script>`)

  output = localizeHtml(output, language)
  output = injectControlStyles(output, id, language)

  const bridgeScript = `
<script>
  window.__happyHuesBridge = {
    paletteId: '${id}',
    language: '${language}'
  };

  function buildPreviewRoute(paletteId, language) {
    return '/palette-preview/' + paletteId + '-' + language + '.html';
  }

  function updateApplyButtonText() {
    var applyButton = document.getElementById('blog-sync-apply');
    if (!applyButton) return;
    applyButton.textContent = window.__happyHuesBridge.language === 'zh' ? '确认应用' : 'Apply to blog';
  }

  function notifyParent() {
    window.parent.postMessage({
      type: 'happy-hues-loaded',
      paletteId: window.__happyHuesBridge.paletteId,
      language: window.__happyHuesBridge.language,
      backgroundColor: window.getComputedStyle(document.body).backgroundColor
    }, window.location.origin);
  }

  async function swapPreview(paletteId, language) {
    var route = buildPreviewRoute(paletteId, language);
    if (route === window.location.pathname) {
      window.__happyHuesBridge.paletteId = paletteId;
      window.__happyHuesBridge.language = language;
      updateApplyButtonText();
      notifyParent();
      return;
    }

    var response = await fetch(route, { cache: 'no-store' });
    var nextHtml = await response.text();
    var parser = new DOMParser();
    var nextDocument = parser.parseFromString(nextHtml, 'text/html');
    var nextOuter = nextDocument.querySelector('.outer-wrap');
    var currentOuter = document.querySelector('.outer-wrap');

    if (!nextOuter || !currentOuter) return;

    currentOuter.innerHTML = nextOuter.innerHTML;
    document.title = nextDocument.title;
    document.body.dataset.route = nextDocument.body.dataset.route || document.body.dataset.route || '';
    window.__happyHuesBridge.paletteId = paletteId;
    window.__happyHuesBridge.language = language;
    window.history.replaceState({}, '', route);
    updateApplyButtonText();
    if (typeof window.__initHappyHuesPreview === 'function') {
      requestAnimationFrame(function () {
        window.__initHappyHuesPreview();
      });
    }
    requestAnimationFrame(function () {
      notifyParent();
    });
  }

  window.addEventListener('load', function () {
    document.addEventListener('click', function (event) {
      var paletteLink = event.target && event.target.closest ? event.target.closest('.palette-wrap') : null;
      if (paletteLink) {
        event.preventDefault();
        var href = paletteLink.getAttribute('href') || '';
        var match = href.match(/\\/palette-preview\\/(\\d+)-(en|zh)\\.html/);
        if (match) {
          swapPreview(match[1], match[2]);
        }
        return;
      }
    });

    window.addEventListener('message', function (event) {
      if (event.origin !== window.location.origin || !event.data || typeof event.data !== 'object') {
        return;
      }
      if (event.data.type === 'happy-hues-sync-language' && (event.data.language === 'zh' || event.data.language === 'en')) {
        swapPreview(window.__happyHuesBridge.paletteId, event.data.language);
      }
    });

    updateApplyButtonText();
    notifyParent();
    var applyButton = document.getElementById('blog-sync-apply');
    if (applyButton) {
      applyButton.addEventListener('click', function () {
        window.parent.postMessage({ type: 'happy-hues-apply', paletteId: window.__happyHuesBridge.paletteId }, window.location.origin);
      });
    }
  });
</script>
`

  return output.replace('</body>', `${bridgeScript}</body>`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const appScriptSource = await readFile(APP_SCRIPT_PATH, 'utf8')
  const appScript = appScriptSource
    .replace('(function () {', 'window.__initHappyHuesPreview = function () {')
    .replace(/\}\)\(\);\s*$/, '}; window.__initHappyHuesPreview();')
    .replace('const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;', 'const prefersReducedMotion = true;')
    .replace('const paletteToggle = findNavLink("Toggle palettes");', 'const paletteToggle = document.querySelector(\'[data-sync-action="toggle-palettes"]\') || findNavLink("Toggle palettes");')
    .replace('const huesToggle = findNavLink("Toggle section colors");', 'const huesToggle = document.querySelector(\'[data-sync-action="toggle-hues"]\') || findNavLink("Toggle section colors");')

  for (const language of ['en', 'zh']) {
    for (let index = 1; index <= 17; index += 1) {
      const id = String(index)
      const html = await readFile(join(COLOR_COORDINATION_ROOT, 'palettes', id, 'index.html'), 'utf8')
      const documentHtml = rewriteDocument(html, id, language, appScript)
      await writeFile(join(OUT_DIR, `${id}-${language}.html`), documentHtml)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
