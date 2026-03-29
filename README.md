# Haerin Blog

A minimalist personal blog built with Next.js, featuring Apple-inspired design and smooth animations.

## Features

- 🎨 Refined minimalist design with editorial sophistication
- 🌓 Dark mode support with smooth transitions
- 📱 Fully responsive layout
- ✨ Subtle, performant animations
- 📝 Markdown-based blog posts
- 🚀 Static site generation for GitHub Pages
- ⚡ Optimized performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Typography**: Crimson Pro (serif) + SF Pro Display (sans-serif)
- **Content**: Markdown with gray-matter
- **Deployment**: GitHub Pages

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build for Production

```bash
npm run build
```

### Export Static Site

```bash
npm run export
```

This generates a static site in the `out` directory, ready for deployment to GitHub Pages.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Home page (blog list)
│   ├── about/              # About page
│   └── post/[slug]/        # Dynamic blog post pages
├── components/
│   ├── Navigation.tsx      # Header with scroll behavior
│   ├── Footer.tsx          # Site footer
│   ├── BlogCard.tsx        # Blog post card with animations
│   ├── ReadingProgress.tsx # Reading progress bar
│   ├── ThemeToggle.tsx     # Dark mode toggle
│   └── ThemeProvider.tsx   # Theme context
├── content/
│   └── posts/              # Markdown blog posts
├── lib/
│   └── posts.ts            # Post fetching utilities
└── public/                 # Static assets
```

## Adding Blog Posts

Create a new `.md` file in `content/posts/`:

```markdown
---
title: "Your Post Title"
date: "2024-03-15"
excerpt: "A brief description of your post"
tags: ["Tag1", "Tag2"]
---

Your content here...
```

## Customization

### Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #171717;
  /* ... */
}
```

### Typography

Change fonts in `tailwind.config.js`:

```javascript
fontFamily: {
  serif: ['Your Serif Font', 'serif'],
  sans: ['Your Sans Font', 'sans-serif'],
}
```

### Navigation

Update links in `components/Navigation.tsx`.

## Deployment to GitHub Pages

1. Update `next.config.js` with your repository name
2. Run `npm run export`
3. Deploy the `out` directory to GitHub Pages

Or use GitHub Actions for automatic deployment.

## Design Philosophy

This blog embodies refined minimalism—not sterile emptiness, but intentional simplicity. Every element serves a purpose. Typography creates hierarchy. White space provides breathing room. Animations feel natural, not decorative.

The design draws inspiration from Apple's attention to detail and high-end editorial design, creating an experience that's both functional and memorable.

## License

MIT